import { ArchiveRecord } from '../types';
import imgArchiveEditorial from '../assets/images/archive_retro_future_1790281640353.jpg';
import imgQuantumJacket from '../assets/images/product_quantum_jacket_1790281596738.jpg';
import imgHeroCyber from '../assets/images/hero_fashion_cyber_1790281582176.jpg';
import imgChromeRunner from '../assets/images/product_chrome_runner_1790281613168.jpg';
import imgVectorWatch from '../assets/images/product_vector_watch_1790281681974.jpg';

export const ARCHIVE_RECORDS: ArchiveRecord[] = [
  {
    year: '1970',
    title: 'CHRONO-DOME MONOLITH',
    collectionId: 'ARC-70-ALPHA',
    style: 'Analog Synthesist Uniforms',
    status: 'DECLASSIFIED ARCHIVE',
    description: 'First experiments in brutalist tailoring for subterranean research facilities. Heavy structured wools, dry-touch cottons, and high-frequency analog audio operator silhouettes.',
    image: imgArchiveEditorial,
    materials: 'Organic Heavy Gabardine, Unwashed Brass Rivets'
  },
  {
    year: '1984',
    title: 'CASSETTE FUTURE // PROTO-CYBER',
    collectionId: 'ARC-84-SYNTH',
    style: 'Sub-Orbital Technical Outerwear',
    status: 'RESTORED RESTOCK',
    description: 'Inspired by CRT monitors, magnetic tape, and early telemetry systems. Oversized architectural shoulders, reflective warning typography, and raw industrial seams.',
    image: imgHeroCyber,
    materials: 'Micro-Ripstop Polyamide, Heat-Bonded Reflectives'
  },
  {
    year: '1999',
    title: 'Y2K SILICON MATRIX',
    collectionId: 'ARC-99-VELOCITY',
    style: 'Aerodynamic Chrome Streetwear',
    status: 'LIMITED RE-ISSUE',
    description: 'The turn of the millennium that imagined a cybernetic reality. Vacuum-formed electroplated plastics, sculpted kinetic silhouettes, and ergonomic high-speed footwear.',
    image: imgChromeRunner,
    materials: 'Vacuum Thermoplastic, Conductive Silver Weave'
  },
  {
    year: '2026',
    title: 'QUANTUM HARVEST // CURRENT ERA',
    collectionId: 'ARC-26-ACTIVE',
    style: 'Thermo-Reactive Adaptive Wear',
    status: 'PRIMARY DISPATCH',
    description: 'Present-day manifestation of the speculative future. Modular closures, FIDLOCK® magnetic docking, and barometric thermal regulating membranes designed for volatile climates.',
    image: imgQuantumJacket,
    materials: 'Ballistic Polyamide, Carbon Fiber Ribbing'
  },
  {
    year: '2091',
    title: 'NEO-SOLAR NOMAD PROTOCOL',
    collectionId: 'ARC-91-PROTOTYPE',
    style: 'Deep Orbital Protective Gear',
    status: 'SPECULATIVE BLUEPRINT',
    description: 'Conceptual apparel designed for human expeditions across radiation-drenched lunar colonies. Radiation-deflective weaves, titanium utility locks, and self-repairing poly-elastomers.',
    image: imgVectorWatch,
    materials: 'Titanium Grade 5, Graphene Weave Membrane'
  }
];
