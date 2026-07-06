/* =============================================================
 *  config.js  —  Verdal: A Tamer's Journey
 *  Global constants, the customizable palette used by the artwork,
 *  and shared fonts. Loaded before everything else.
 * ============================================================= */

const VIEW_W = 1000;
const VIEW_H = 600;

// Tile map geometry (the overworld exactly fills the canvas).
const TILE = 40;
const MAP_COLS = 25; // 25 * 40 = 1000
const MAP_ROWS = 15; // 15 * 40 = 600

// Scene identifiers for the state machine (see game.js / sketch.js).
const SCENE = {
  TITLE: 'title',
  CUSTOMIZE: 'customize',
  STARTER: 'starter',
  OVERWORLD: 'overworld',
  BATTLE: 'battle',
  TEAM: 'team',
  DEX: 'dex',
};

// A calm palette for UI panels (kept separate from the art palette).
const UI = {
  panel: '#10285f',
  panelLite: '#1c3f8a',
  accent: '#ffcc00',
  accent2: '#0075be',
  cream: '#fdf6e3',
  ink: '#0b1b3a',
  good: '#3fae5a',
  bad: '#d94a4a',
  mid: '#e8a13a',
};

// ---- Customizable art palette --------------------------------
// The trainer/face artwork reads these globals directly. They are
// declared here and given defaults in initPalette() (called in setup).
let kaiHatC, kaiShirt1C, kaiShirt2C, kaiShoesC, kaiPantsC, kaiHairC;
let rexBagC, rexHatC, rexShoesC, rexPantsC, rexShirtC, rexHairC;
let miraHatC, miraHairC, miraShirtC, miraPantsC, miraSkirtC, miraBagC, miraShoesC;
let skinC;
let rexFace, kaiFace, miraFace;   // 0-neutral(default),1-happy,2-neutral,3-worried,4-surprised,5-fainted
let rexOrb, kaiOrb, miraOrb;

// Fonts (loaded from Google Fonts in index.html; fall back gracefully).
const FONT_TITLE = 'Courgette';
const FONT_UI = 'Andada Pro';

function initPalette() {
  skinC = color(255, 233, 220);

  kaiHatC = color(204, 0, 0);
  kaiShirt1C = 50;
  kaiShirt2C = color(26, 26, 255);
  kaiShoesC = color(210, 80, 68);
  kaiPantsC = color(93, 173, 236);
  kaiHairC = 0;

  rexBagC = color(229, 255, 102);
  rexHatC = color(255, 41, 55);
  rexShoesC = 0;
  rexPantsC = color(0, 252, 252);
  rexShirtC = color(255, 41, 55);
  rexHairC = 0;

  miraHatC = color(232, 2, 68);
  miraHairC = color(98, 52, 18);
  miraShirtC = color(232, 2, 68);
  miraPantsC = color(15, 48, 91);
  miraSkirtC = 255;
  miraBagC = color(255, 209, 26);
  miraShoesC = color(255, 209, 26);

  rexOrb = 'red';
  kaiOrb = 'red';
  miraOrb = 'red';

  rexFace = 0;
  kaiFace = 0;
  miraFace = 0;
}
