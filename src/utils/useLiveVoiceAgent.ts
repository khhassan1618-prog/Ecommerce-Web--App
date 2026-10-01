import { useState, useRef, useEffect, useCallback } from 'react';
import { soundEngine } from './audioEngine';

// Clean text for natural speech synthesis
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\[.*?\]/g, '') // remove bracketed system tags
    .replace(/https?:\/\/\S+/g, '') // remove URLs
    .replace(/[#*_~`]/g, '') // remove markdown characters
    .replace(/[➔●•—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface UseLiveVoiceAgentOptions {
  autoStart?: boolean;
  onSpeechFinal?: (text: string) => void;
}

export function useLiveVoiceAgent(options: UseLiveVoiceAgentOptions = {}) {
  const { onSpeechFinal } = options;

  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('MICROPHONE STANDBY // CLICK TO ACTIVATE');
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [autoMicEnabled, setAutoMicEnabled] = useState<boolean>(true);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // References
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isMicActiveRef = useRef<boolean>(false);
  const onSpeechFinalRef = useRef(onSpeechFinal);

  onSpeechFinalRef.current = onSpeechFinal;
  isSpeakingRef.current = isSpeaking;
  isMicActiveRef.current = isMicActive;

  // Initialize Speech Recognition (Web Speech API)
  const initRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[VOICE] Browser does not support SpeechRecognition');
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('[SPEECH RECOGNITION] Engine active');
        setIsListening(true);
        setIsMicActive(true);
        isMicActiveRef.current = true;
        setMicPermission('granted');
        setErrorMessage('');
        setStatusText('AUTOMATIC MICROPHONE ACTIVE // SPEAK FREELY');
      };

      recognition.onresult = (event: any) => {
        // Do not process audio while agent is speaking
        if (isSpeakingRef.current) return;

        let interimStr = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            finalStr += text;
          } else {
            interimStr += text;
          }
        }

        const currentSaid = (finalStr || interimStr).trim();
        if (currentSaid) {
          setTranscript(currentSaid);
          setStatusText(`HEARING: "${currentSaid}"`);

          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          if (finalStr.trim().length > 0) {
            const toSend = finalStr.trim();
            setTranscript('');
            setStatusText('TRANSMITTING INQUIRY TO AGENT...');
            if (onSpeechFinalRef.current) {
              onSpeechFinalRef.current(toSend);
            }
          } else {
            // Debounce silence ~1000ms
            silenceTimerRef.current = setTimeout(() => {
              if (interimStr.trim().length > 1 && !isSpeakingRef.current) {
                const toSend = interimStr.trim();
                setTranscript('');
                setStatusText('TRANSMITTING INQUIRY TO AGENT...');
                if (onSpeechFinalRef.current) {
                  onSpeechFinalRef.current(toSend);
                }
              }
            }, 1000);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[SPEECH RECOGNITION EVENT]', event.error);
        if (event.error === 'not-allowed') {
          setMicPermission('denied');
          setErrorMessage('Microphone access denied in browser. Please allow microphone in the browser address bar.');
          setStatusText('MIC PERMISSION DENIED // ALLOW IN BROWSER');
          setIsMicActive(false);
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          if (isMicActiveRef.current && !isSpeakingRef.current) {
            setStatusText('AUTOMATIC MICROPHONE ACTIVE // AGENT LISTENING');
          }
        } else if (event.error === 'network') {
          // Keep active
          if (isMicActiveRef.current && !isSpeakingRef.current) {
            setStatusText('MIC ONLINE // SPEAK YOUR QUESTION');
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // If mic is still active and agent is not speaking, automatically restart listening!
        if (isMicActiveRef.current && !isSpeakingRef.current) {
          try {
            recognition.start();
          } catch {
            // restart attempted
          }
        }
      };

      recognitionRef.current = recognition;
      return recognition;
    } catch (e) {
      console.warn('[RECOGNITION INIT EXCEPTION]', e);
      return null;
    }
  }, []);

  // Web Audio API volume visualizer
  const startVolumeAnalyser = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setVolumeLevel(normalized);

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn('[AUDIO ANALYSER NOTICE]', e);
    }
  }, []);

  // Primary Start Microphone Function (invoked via direct user gesture)
  const startMic = useCallback(async () => {
    setErrorMessage('');
    setStatusText('REQUESTING MICROPHONE PERMISSION...');

    let gotStream = false;

    // 1. Try requesting browser getUserMedia stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        mediaStreamRef.current = stream;
        gotStream = true;
        setMicPermission('granted');
        setIsMicActive(true);
        isMicActiveRef.current = true;
        startVolumeAnalyser(stream);
        console.log('[MIC] getUserMedia stream successfully acquired');
      } catch (err: any) {
        console.warn('[MIC] getUserMedia failed or blocked:', err.name, err.message);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage('Microphone access blocked. Click the lock/tune icon in your browser address bar to allow microphone.');
          setMicPermission('denied');
        }
      }
    }

    // 2. Start Speech Recognition
    let recognition = recognitionRef.current;
    if (!recognition) {
      recognition = initRecognition();
    }

    if (recognition) {
      try {
        recognition.start();
        setIsMicActive(true);
        isMicActiveRef.current = true;
        setMicPermission('granted');
        console.log('[MIC] SpeechRecognition started');
      } catch (e) {
        // Recognition might already be running
        console.log('[MIC] SpeechRecognition already active or restart handled');
      }
    }

    if (gotStream || recognition) {
      soundEngine.playTelemetryChime();
      setStatusText('AUTOMATIC MICROPHONE ACTIVE // SPEAK FREELY');
    } else {
      setStatusText('CLICK TO ENABLE MICROPHONE');
    }
  }, [initRecognition, startVolumeAnalyser]);

  // Stop Microphone
  const stopMic = useCallback(() => {
    isMicActiveRef.current = false;
    setIsMicActive(false);
    setIsListening(false);
    setVolumeLevel(0);
    setTranscript('');

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    setStatusText('MICROPHONE MUTED // CLICK MIC TO TALK');
  }, []);

  // Toggle Microphone
  const toggleMic = useCallback(() => {
    if (isMicActive) {
      stopMic();
    } else {
      startMic();
    }
  }, [isMicActive, startMic, stopMic]);

  // Agent Voice Synthesis (Text-to-Speech)
  const speakText = useCallback(
    (rawText: string, onEnd?: () => void) => {
      if (!voiceOutputEnabled) {
        onEnd?.();
        return;
      }

      if (!('speechSynthesis' in window)) {
        onEnd?.();
        return;
      }

      const cleanText = cleanTextForSpeech(rawText);
      if (!cleanText) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();

      // Temporarily pause recognition so agent voice is not heard by the microphone
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setStatusText('AGENT TRANSMITTING VOICE...');

      soundEngine.playTelemetryChime();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.02;
      utterance.pitch = 0.96;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        onEnd?.();

        // Automatically resume speech recognition after speaking finishes
        if (isMicActiveRef.current && autoMicEnabled) {
          setStatusText('AUTOMATIC MICROPHONE ACTIVE // SPEAK FREELY');
          setTimeout(() => {
            if (isMicActiveRef.current && !isSpeakingRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                setIsListening(true);
              } catch {
                // already running
              }
            }
          }, 300);
        } else {
          setStatusText('TERMINAL READY');
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        onEnd?.();

        if (isMicActiveRef.current && autoMicEnabled && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {
            // ignore
          }
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [autoMicEnabled, voiceOutputEnabled]
  );

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;

    if (isMicActiveRef.current && autoMicEnabled && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // ignore
      }
    }
  }, [autoMicEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMic();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopMic]);

  return {
    isMicActive,
    isListening,
    isSpeaking,
    volumeLevel,
    transcript,
    statusText,
    micPermission,
    errorMessage,
    autoMicEnabled,
    setAutoMicEnabled,
    voiceOutputEnabled,
    setVoiceOutputEnabled,
    startMic,
    stopMic,
    toggleMic,
    speakText,
    stopSpeaking
  };
}
