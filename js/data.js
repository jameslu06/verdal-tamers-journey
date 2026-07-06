/* =============================================================
 *  data.js  —  Verdal: A Tamer's Journey
 *  Original game data: creature species, moves, and the type
 *  triangle. All names and numbers here are original to this
 *  project (inspired by the monster-taming genre, not copied).
 * ============================================================= */

// ---- Type chart ------------------------------------------------
// Original triangle: Ember > Leaf > Tide > Ember. Spark answers Tide.
const TYPES = ['Ember', 'Tide', 'Leaf', 'Spark', 'Normal'];

const TYPE_COLOR = {
  Ember: '#e2582b',
  Tide: '#3aa0e0',
  Leaf: '#4caf50',
  Spark: '#f2c522',
  Normal: '#9aa0a6',
};

// multiplier[attacker][defender]
const TYPE_CHART = {
  Ember:  { Leaf: 2, Tide: 0.5, Ember: 0.5, Spark: 1, Normal: 1 },
  Tide:   { Ember: 2, Leaf: 0.5, Tide: 0.5, Spark: 1, Normal: 1 },
  Leaf:   { Tide: 2, Ember: 0.5, Leaf: 0.5, Spark: 1, Normal: 1 },
  Spark:  { Tide: 2, Leaf: 0.5, Spark: 0.5, Ember: 1, Normal: 1 },
  Normal: { Ember: 1, Tide: 1, Leaf: 1, Spark: 1, Normal: 1 },
};

function typeMultiplier(atkType, defType) {
  const row = TYPE_CHART[atkType];
  if (!row) return 1;
  return row[defType] !== undefined ? row[defType] : 1;
}

// ---- Moves -----------------------------------------------------
// category: 'physical' deals damage; 'status' applies a stat stage.
const MOVES = {
  bash:       { name: 'Bash',        type: 'Normal', power: 35, acc: 100, pp: 25, category: 'physical' },
  quickjab:   { name: 'Quick Jab',   type: 'Normal', power: 25, acc: 100, pp: 30, category: 'physical', priority: 1 },
  focus:      { name: 'Focus',       type: 'Normal', power: 0,  acc: 100, pp: 15, category: 'status', stat: 'atk', stage: 1, target: 'self' },
  guardup:    { name: 'Guard Up',    type: 'Normal', power: 0,  acc: 100, pp: 15, category: 'status', stat: 'def', stage: 1, target: 'self' },

  cinderspit: { name: 'Cinder Spit', type: 'Ember',  power: 40, acc: 100, pp: 25, category: 'physical' },
  flarerush:  { name: 'Flare Rush',  type: 'Ember',  power: 60, acc: 95,  pp: 12, category: 'physical' },

  bubbleburst:{ name: 'Bubble Burst',type: 'Tide',   power: 40, acc: 100, pp: 25, category: 'physical' },
  aquaslam:   { name: 'Aqua Slam',   type: 'Tide',   power: 60, acc: 95,  pp: 12, category: 'physical' },

  leafdart:   { name: 'Leaf Dart',   type: 'Leaf',   power: 40, acc: 100, pp: 25, category: 'physical' },
  vinelash:   { name: 'Vine Lash',   type: 'Leaf',   power: 60, acc: 95,  pp: 12, category: 'physical' },

  zap:        { name: 'Zap',         type: 'Spark',  power: 40, acc: 100, pp: 25, category: 'physical' },
  voltsnap:   { name: 'Volt Snap',   type: 'Spark',  power: 60, acc: 95,  pp: 12, category: 'physical' },
};

// ---- Species ---------------------------------------------------
// art  -> key into CREATURE_ART (the hand-drawn vector art)
// base -> base stats used to derive per-level stats
// learnset -> [{lvl, move}] moves learned as the creature levels
// catchRate -> higher = easier to catch (0..1 scaling factor)
const SPECIES = {
  emberlit: {
    id: 'emberlit', name: 'Emberlit', type: 'Ember', art: 'emberlit',
    dexNo: 1, catchRate: 0.45,
    blurb: 'A spirited lizard whose tail-flame burns brighter when it is happy.',
    base: { hp: 39, atk: 52, def: 43, spd: 65 },
    learnset: [
      { lvl: 1, move: 'bash' }, { lvl: 1, move: 'cinderspit' },
      { lvl: 6, move: 'quickjab' }, { lvl: 10, move: 'focus' },
      { lvl: 14, move: 'flarerush' },
    ],
  },
  aquashell: {
    id: 'aquashell', name: 'Aquashell', type: 'Tide', art: 'aquashell',
    dexNo: 2, catchRate: 0.45,
    blurb: 'A calm turtle-kin that tucks into its shell and rides the tide.',
    base: { hp: 44, atk: 48, def: 65, spd: 43 },
    learnset: [
      { lvl: 1, move: 'bash' }, { lvl: 1, move: 'bubbleburst' },
      { lvl: 6, move: 'guardup' }, { lvl: 10, move: 'quickjab' },
      { lvl: 14, move: 'aquaslam' },
    ],
  },
  sproutle: {
    id: 'sproutle', name: 'Sproutle', type: 'Leaf', art: 'sproutle',
    dexNo: 3, catchRate: 0.45,
    blurb: 'Carries a seed on its back that drinks sunlight and grows all season.',
    base: { hp: 45, atk: 49, def: 49, spd: 45 },
    learnset: [
      { lvl: 1, move: 'bash' }, { lvl: 1, move: 'leafdart' },
      { lvl: 6, move: 'focus' }, { lvl: 10, move: 'guardup' },
      { lvl: 14, move: 'vinelash' },
    ],
  },
  voltpip: {
    id: 'voltpip', name: 'Voltpip', type: 'Spark', art: 'voltpip',
    dexNo: 4, catchRate: 0.4,
    blurb: 'A quick, curious critter that stores static in its cheeks.',
    base: { hp: 35, atk: 55, def: 40, spd: 90 },
    learnset: [
      { lvl: 1, move: 'quickjab' }, { lvl: 1, move: 'zap' },
      { lvl: 6, move: 'focus' }, { lvl: 10, move: 'bash' },
      { lvl: 14, move: 'voltsnap' },
    ],
  },
};

// The three starters offered at the lab.
const STARTERS = ['emberlit', 'aquashell', 'sproutle'];

// Which species appear in the wild, and their level band.
const WILD_TABLE = [
  { species: 'voltpip', weight: 4, min: 2, max: 5 },
  { species: 'sproutle', weight: 3, min: 2, max: 5 },
  { species: 'emberlit', weight: 2, min: 3, max: 6 },
  { species: 'aquashell', weight: 2, min: 3, max: 6 },
];

// ---- Tamer profiles (playable + rival) -------------------------
const TAMERS = {
  rex:  { key: 'rex',  name: 'Rex',  art: 'rex',  blurb: 'Bold and headstrong. Never met a dare it did not take.' },
  kai:  { key: 'kai',  name: 'Kai',  art: 'kai',  blurb: 'Easygoing traveller who befriends every critter on the road.' },
  mira: { key: 'mira', name: 'Mira', art: 'mira', blurb: 'Sharp and studious. Reads the tide before it turns.' },
};
