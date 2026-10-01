import { Product } from '../types';

import imgQuantumJacket from '../assets/images/product_quantum_jacket_1790281596738.jpg';
import imgChromeRunner from '../assets/images/product_chrome_runner_1790281613168.jpg';
import imgSignalHoodie from '../assets/images/product_signal_hoodie_1790281627465.jpg';
import imgOrbitTee from '../assets/images/product_orbit_tee_1790281654399.jpg';
import imgArchiveBag from '../assets/images/product_archive_bag_1790281666096.jpg';
import imgVectorWatch from '../assets/images/product_vector_watch_1790281681974.jpg';
import imgArchiveEditorial from '../assets/images/archive_retro_future_1790281640353.jpg';

export const PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: '01 — QUANTUM JACKET',
    sku: 'NR-JKT-0199',
    price: 48500,
    category: 'Outerwear',
    collection: 'SYSTEM 01 // ORBITAL DEPLOYMENT',
    era: '2026',
    tagline: 'Thermo-reactive membrane tailored for speculative winter.',
    description: 'An avant-garde outerwear silhouette engineered with micro-ripstop ballistic nylon, modular storm collar, and magnetic FIDLOCK® hardware. Embedded with thermal insulating weave designed to adapt to rapid barometric shifts.',
    details: [
      'Dual magnetic storm storm-flap with concealed YKK AquaGuard® zippers',
      'Deployable modular hood with integrated micro-mesh face visor',
      'Articulated raglan sleeves with laser-cut ventilation baffles',
      'Three interior waterproof utility pockets with laser-etched ID stamp'
    ],
    materials: ['3-Layer Ballistic Polyamide', 'Thermo-Conductive Membrane', 'Anodized Titanium Hardware'],
    images: [imgQuantumJacket, imgArchiveEditorial],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Basalt Obsidian', hex: '#161616' },
      { name: 'Cyber Rust', hex: '#FD8A46' }
    ],
    inStock: true,
    stockCount: 7,
    featured: true
  },
  {
    id: 'prod-02',
    name: '02 — CHROME RUNNER',
    sku: 'NR-FTR-0248',
    price: 34900,
    category: 'Footwear',
    collection: 'CHRONO MATRIX // SUB-LEVEL VELOCITY',
    era: '1999',
    tagline: 'Sculptural chrome chassis sneaker with rebound telemetry.',
    description: 'Designed at the intersection of late 90s speculative aerodynamics and 2090 biomechanics. Features a vacuum-formed chrome heel stabilizer, dual-density memory elastomer cushioning, and high-traction directional tread.',
    details: [
      'Electroplated chrome thermoplastic heel counter',
      'Breathable engineered micro-knit upper with TPU overlays',
      'Speed-lacing quick-pull cord lock mechanism',
      'Non-marking shock absorption kinetic outsole'
    ],
    materials: ['Brushed Chrome TPU', 'Technical Fly-Weave', 'High-Density Vibram Compound'],
    images: [imgChromeRunner],
    sizes: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'],
    colors: [
      { name: 'Brushed Chrome & Carbon', hex: '#26282B' },
      { name: 'Solar Amber', hex: '#FD8A46' }
    ],
    inStock: true,
    stockCount: 12,
    featured: true
  },
  {
    id: 'prod-03',
    name: '03 — SIGNAL HOODIE',
    sku: 'NR-HD-0312',
    price: 22800,
    category: 'Hoodies',
    collection: 'FREQUENCY 84 // ANALOG WAVE',
    era: '1984',
    tagline: 'Heavyweight 550 GSM French terry with architectural drape.',
    description: 'A monumentally heavy cotton jersey crafted from double-twisted combed yarns. Features an exaggerated drop shoulder, double-layered hood without standard cords, and an orange technical woven label at the hem.',
    details: [
      '550 GSM double-face combed loopback French terry',
      'Seamless kangaroo pouch with reinforced blind-stitched corners',
      'Subtle tonal silicone typographic print across spine',
      'Pre-shrunk vintage wash with hand-distressed ribbed cuffs'
    ],
    materials: ['100% Organic Heavy Cotton', 'Silicon Heat-Transfer Inks'],
    images: [imgSignalHoodie],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Deep Basalt', hex: '#1E1E1E' },
      { name: 'Sand Archive', hex: '#F3EDD8' }
    ],
    inStock: true,
    stockCount: 18,
    featured: true
  },
  {
    id: 'prod-04',
    name: '04 — ORBIT TEE',
    sku: 'NR-TEE-0471',
    price: 14500,
    category: 'Tops',
    collection: 'CHRONO-DOME // WAVE 70',
    era: '1970',
    tagline: 'Relaxed boxy silhouette with technical celestial geometry.',
    description: 'Cut with a wider chest and cropped boxy torso reminiscent of 1970s laboratory uniforms. Crafted with 300 GSM dry-touch jersey and finished with a thick 3cm ribbed collar that holds shape forever.',
    details: [
      '300 GSM heavyweight open-end dry cotton',
      'High-density 1x1 micro-rib collar with twin-needle finish',
      'Reflective geometric coordinate print on rear collar',
      'Reinforced side vents with contrast bar-tack stitching'
    ],
    materials: ['300 GSM Heavyweight Cotton Jersey', 'Reflective Mineral Pigment'],
    images: [imgOrbitTee],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Washed Charcoal', hex: '#222325' },
      { name: 'Raw Off-White', hex: '#F3EDD8' }
    ],
    inStock: true,
    stockCount: 24,
    featured: false
  },
  {
    id: 'prod-05',
    name: '05 — NEON ARCHIVE BAG',
    sku: 'NR-ACC-0520',
    price: 28000,
    category: 'Bags',
    collection: 'NEO-SOLAR // PROTOCOL 2091',
    era: '2091',
    tagline: 'Modular weatherproof crossbody messenger for planetary archives.',
    description: 'Constructed from indestructible 1000D Cordura® ballistic nylon with heat-welded seams. Designed to expand or compress using anodized orange tension hooks, with a padded compartment for tablets and data drives.',
    details: [
      'Weatherproof roll-top access with Fidlock® magnetic closure',
      'Modular webbing daisy-chain system for auxiliary pouches',
      'Padded aerospace EVA back panel with anti-abrasion mesh',
      'Custom milled orange aluminum hardware and carabiners'
    ],
    materials: ['1000D Ballistic Cordura®', 'Hypalon Reinforcements', 'CNC-Milled Aluminum'],
    images: [imgArchiveBag],
    sizes: ['ONE SIZE (18L EXPANDABLE)'],
    colors: [
      { name: 'Stealth Black & Orange', hex: '#111213' }
    ],
    inStock: true,
    stockCount: 9,
    featured: true
  },
  {
    id: 'prod-06',
    name: '06 — VECTOR WATCH',
    sku: 'NR-WTC-0604',
    price: 56000,
    category: 'Accessories',
    collection: 'CHRONO HOROLOGY // HORIZON 2026',
    era: '2026',
    tagline: 'Titanium chassis timepiece with dual mechanical-digital readout.',
    description: 'A conceptual horological instrument forged from Grade 5 aerospace titanium. Houses a high-frequency quartz movement alongside an inverted amber LED telemetry display that illuminates on wrist flick.',
    details: [
      'Grade 5 brushed titanium case with DLC black coating',
      'Dual-layer sapphire crystal with anti-reflective fluorite coating',
      'Integrated fluorocarbon rubber strap with titanium deployant clasp',
      '100M water resistance with screw-down crown and orange accents'
    ],
    materials: ['Grade 5 Titanium', 'Sapphire Crystal', 'FKM Fluoroelastomer'],
    images: [imgVectorWatch],
    sizes: ['42MM CHASSIS'],
    colors: [
      { name: 'Titanium Graphite', hex: '#2A2D30' },
      { name: 'Burnt Horizon', hex: '#FD8A46' }
    ],
    inStock: true,
    stockCount: 4,
    featured: true
  }
];
