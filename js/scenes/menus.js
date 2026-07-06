/* =====================================================================
 *  menus.js  —  the non-battle, non-overworld scenes
 *  --------------------------------------------------------------------
 *  TITLE      : start screen (New Journey / Continue)
 *  CUSTOMIZE  : the v1 "dress-up" studio, polished — pick a tamer and
 *               restyle their outfit + expression before setting out
 *  STARTER    : the professor hands you your first companion
 *  TEAM       : review your party (reachable from overworld or battle)
 *  DEX        : the "Tamer's Log" of creatures seen and caught
 * ===================================================================== */

/* ---------- a small shared swatch palette for the studio ---------- */
const SWATCHES = [
  [255, 41, 55], [232, 2, 68], [255, 122, 0], [255, 204, 0],
  [140, 200, 60], [63, 174, 90], [0, 200, 180], [0, 117, 190],
  [93, 173, 236], [120, 90, 210], [40, 40, 46], [250, 250, 250],
  [120, 78, 40], [180, 140, 90], [255, 160, 190], [150, 150, 160],
];

/* Which outfit parts are editable per tamer. Each slot exposes a
 * getter/setter pair so we can poke the palette globals by reference. */
function tamerSlots(key) {
  if (key === 'rex') return [
    { label: 'Cap',   get: () => rexHatC,   set: c => rexHatC = c },
    { label: 'Shirt', get: () => rexShirtC, set: c => rexShirtC = c },
    { label: 'Pants', get: () => rexPantsC, set: c => rexPantsC = c },
    { label: 'Hair',  get: () => rexHairC,  set: c => rexHairC = c },
    { label: 'Bag',   get: () => rexBagC,   set: c => rexBagC = c },
  ];
  if (key === 'mira') return [
    { label: 'Cap',   get: () => miraHatC,   set: c => miraHatC = c },
    { label: 'Shirt', get: () => miraShirtC, set: c => miraShirtC = c },
    { label: 'Skirt', get: () => miraSkirtC, set: c => miraSkirtC = c },
    { label: 'Hair',  get: () => miraHairC,  set: c => miraHairC = c },
    { label: 'Bag',   get: () => miraBagC,   set: c => miraBagC = c },
  ];
  return [
    { label: 'Cap',   get: () => kaiHatC,    set: c => kaiHatC = c },
    { label: 'Shirt', get: () => kaiShirt2C, set: c => kaiShirt2C = c },
    { label: 'Pants', get: () => kaiPantsC,  set: c => kaiPantsC = c },
    { label: 'Hair',  get: () => kaiHairC,   set: c => kaiHairC = c },
    { label: 'Shoes', get: () => kaiShoesC,  set: c => kaiShoesC = c },
  ];
}

const FACE_OPTS = [
  { label: 'Happy', v: 1 }, { label: 'Calm', v: 0 },
  { label: 'Worried', v: 3 }, { label: 'Wow', v: 4 },
];

function faceGet(key) {
  if (key === 'rex') return rexFace; if (key === 'mira') return miraFace; return kaiFace;
}
function faceSet(key, v) {
  if (key === 'rex') rexFace = v; else if (key === 'mira') miraFace = v; else kaiFace = v;
}

/* studio state: which slot row is "active" for recolouring */
const studio = { slot: 0 };

/* ===================================================================
 *  TITLE
 * =================================================================== */
function drawTitle() {
  // soft sky backdrop
  for (let y = 0; y < VIEW_H; y++) {
    const t = y / VIEW_H;
    stroke(lerpColor(color(120, 200, 255), color(224, 245, 255), t));
    line(0, y, VIEW_W, y);
  }
  noStroke();
  // rolling hills
  fill(150, 210, 120); ellipse(220, 640, 900, 500);
  fill(120, 190, 100); ellipse(780, 660, 1000, 520);

  // a couple of the player's own critters lounging on the title
  drawCreatureArt('emberlit', 300, 430, 0.9, false);
  drawCreatureArt('aquashell', 470, 452, 0.8, true);
  drawCreatureArt('voltpip', 690, 440, 0.85, false);

  // title card
  push();
  textAlign(CENTER, CENTER);
  fill(UI.ink); textFont(FONT_TITLE); textSize(66);
  text('Verdal', VIEW_W / 2 + 3, 133); // shadow
  fill(UI.accent); text('Verdal', VIEW_W / 2, 130);
  fill(UI.panel); textFont(FONT_UI); textSize(26);
  text('A Tamer\u2019s Journey', VIEW_W / 2, 188);
  pop();

  const bx = VIEW_W / 2 - 120, bw = 240;
  button(bx, 250, bw, 52, 'New Journey', false, 24);
  const canContinue = hasSave();
  push();
  if (!canContinue) { /* dim */ }
  button(bx, 316, bw, 52, canContinue ? 'Continue' : 'Continue (no save)', false, canContinue ? 24 : 16);
  pop();

  push();
  textAlign(CENTER, CENTER); textFont(FONT_UI); textSize(15); fill(UI.panel);
  text('Arrow keys / WASD to walk  \u2022  Space to interact  \u2022  T team  \u2022  X log', VIEW_W / 2, 560);
  pop();
}

function titleMouse() {
  const bx = VIEW_W / 2 - 120, bw = 240;
  if (inside(bx, 250, bw, 52)) {
    Audio.select();
    resetNewGame();
    initPalette();
    studio.slot = 0;
    G.scene = SCENE.CUSTOMIZE;
  } else if (inside(bx, 316, bw, 52) && hasSave()) {
    Audio.select();
    if (loadGame()) enterOverworld();
  }
}

function titleKey(k) {
  if (k === 'Enter' || k === ' ') {
    Audio.select(); resetNewGame(); initPalette(); studio.slot = 0; G.scene = SCENE.CUSTOMIZE;
  }
}

/* ===================================================================
 *  CUSTOMIZE  (the dress-up studio)
 * =================================================================== */
function drawCustomize() {
  background(238, 244, 252);
  // display area
  push();
  noStroke(); fill(215, 232, 250); rect(0, 0, 600, VIEW_H);
  // little stage
  fill(196, 220, 246); ellipse(300, 470, 360, 90);
  pop();

  const t = TAMERS[G.tamer];
  drawTrainerArt(t.art, 300, 470, 0.82, false);

  push();
  textAlign(CENTER, TOP); fill(UI.panel); textFont(FONT_TITLE); textSize(30);
  text(t.name, 300, 30);
  textFont(FONT_UI); textSize(16); fill(70, 90, 130);
  text(t.blurb, 40, 74, 520, 60);
  pop();

  // ---- right control panel ----
  panel(612, 12, 376, 576, UI.panel, UI.accent, 14, 4);
  push();
  fill(UI.accent); textFont(FONT_TITLE); textSize(24); textAlign(LEFT, TOP);
  text('Style Studio', 634, 30);
  pop();

  // tamer tabs
  const keys = ['rex', 'kai', 'mira'];
  keys.forEach((k, i) => {
    const x = 634 + i * 116;
    button(x, 70, 104, 40, TAMERS[k].name, G.tamer === k, 18);
  });

  // face row
  uiText('Expression', 634, 128, 16, UI.accent);
  FACE_OPTS.forEach((f, i) => {
    const x = 634 + i * 88;
    button(x, 150, 80, 38, f.label, faceGet(G.tamer) === f.v, 15);
  });

  // slot selector
  uiText('Recolour', 634, 210, 16, UI.accent);
  const slots = tamerSlots(G.tamer);
  slots.forEach((s, i) => {
    const x = 634 + (i % 3) * 116;
    const y = 232 + floor(i / 3) * 46;
    const hot = studio.slot === i;
    button(x, y, 104, 38, s.label, hot, 16);
    // show a little chip of the current colour
    push(); noStroke(); fill(s.get()); rect(x + 8, y + 12, 14, 14, 3); pop();
  });

  // swatch grid for the active slot
  uiText('Colour', 634, 336, 16, UI.accent);
  const cols = 8;
  SWATCHES.forEach((rgb, i) => {
    const x = 634 + (i % cols) * 44;
    const y = 358 + floor(i / cols) * 44;
    push();
    stroke(UI.accent2); strokeWeight(2);
    fill(rgb[0], rgb[1], rgb[2]);
    rect(x, y, 36, 36, 6);
    pop();
  });

  // done + random
  button(634, 470, 168, 48, 'Surprise Me', false, 18);
  button(816, 470, 158, 48, 'Set Out \u2192', false, 20);

  push();
  textAlign(LEFT, TOP); textFont(FONT_UI); textSize(13); fill(200, 214, 240);
  text('Tip: pick a part, then tap a colour. Your look is saved with you.', 634, 534, 340, 50);
  pop();
}

function customizeMouse() {
  const keys = ['rex', 'kai', 'mira'];
  for (let i = 0; i < keys.length; i++) {
    if (inside(634 + i * 116, 70, 104, 40)) { Audio.blip(); G.tamer = keys[i]; studio.slot = 0; return; }
  }
  for (let i = 0; i < FACE_OPTS.length; i++) {
    if (inside(634 + i * 88, 150, 80, 38)) { Audio.blip(); faceSet(G.tamer, FACE_OPTS[i].v); return; }
  }
  const slots = tamerSlots(G.tamer);
  for (let i = 0; i < slots.length; i++) {
    const x = 634 + (i % 3) * 116, y = 232 + floor(i / 3) * 46;
    if (inside(x, y, 104, 38)) { Audio.blip(); studio.slot = i; return; }
  }
  const cols = 8;
  for (let i = 0; i < SWATCHES.length; i++) {
    const x = 634 + (i % cols) * 44, y = 358 + floor(i / cols) * 44;
    if (inside(x, y, 36, 36)) {
      Audio.select();
      const rgb = SWATCHES[i];
      slots[studio.slot].set(color(rgb[0], rgb[1], rgb[2]));
      return;
    }
  }
  if (inside(634, 470, 168, 48)) { // surprise me
    Audio.select();
    slots.forEach(s => { const rgb = pick(SWATCHES); s.set(color(rgb[0], rgb[1], rgb[2])); });
    faceSet(G.tamer, pick(FACE_OPTS).v);
    return;
  }
  if (inside(816, 470, 158, 48)) { // set out
    Audio.select();
    enterStarter();
    return;
  }
}

/* ===================================================================
 *  STARTER  (professor gives you a companion)
 * =================================================================== */
const starterScene = { intro: false, chosen: null };

function enterStarter() {
  G.scene = SCENE.STARTER;
  starterScene.intro = true;
  starterScene.chosen = null;
  Dialog.start([
    'Prof. Rowan: Ah, ' + TAMERS[G.tamer].name + '! Right on time.',
    'Verdal Isle is bursting with wild creatures called Kith.',
    'Every tamer needs a first partner. Go on \u2014 choose!',
  ], () => { starterScene.intro = false; });
}

function drawStarter() {
  // warm lab backdrop
  for (let y = 0; y < VIEW_H; y++) {
    const t = y / VIEW_H;
    stroke(lerpColor(color(60, 74, 120), color(30, 40, 74), t));
    line(0, y, VIEW_W, y);
  }
  noStroke();
  push();
  textAlign(CENTER, TOP); fill(UI.accent); textFont(FONT_TITLE); textSize(30);
  text('Choose Your First Kith', VIEW_W / 2, 26);
  pop();

  const cardW = 260, gap = 30;
  const totalW = STARTERS.length * cardW + (STARTERS.length - 1) * gap;
  let x0 = (VIEW_W - totalW) / 2;

  STARTERS.forEach((id, i) => {
    const sp = SPECIES[id];
    const x = x0 + i * (cardW + gap), y = 92, h = 360;
    const hover = inside(x, y, cardW, h) && !starterScene.intro;
    panel(x, y, cardW, h, hover ? UI.panelLite : UI.panel, UI.accent, 14, 4);
    // art
    drawCreatureArt(sp.art, x + cardW / 2, y + 150, 0.86, false);
    push();
    textAlign(CENTER, TOP);
    fill(UI.cream); textFont(FONT_TITLE); textSize(24);
    text(sp.name, x + cardW / 2, y + 214);
    pop();
    typeBadge(x + cardW / 2 - 34, y + 250, sp.type);
    push();
    textAlign(CENTER, TOP); fill(210, 222, 246); textFont(FONT_UI); textSize(14);
    text(sp.blurb, x + 18, y + 286, cardW - 36, 70);
    pop();
  });

  if (starterScene.intro || Dialog.active) {
    Dialog.draw(40, VIEW_H - 132, VIEW_W - 80, 108);
  } else {
    push();
    textAlign(CENTER, BOTTOM); fill(UI.cream); textFont(FONT_UI); textSize(16);
    text('Click a Kith to make it your partner.', VIEW_W / 2, VIEW_H - 24);
    pop();
  }
}

function starterMouse() {
  if (Dialog.active) { Dialog.advance(); return; }
  const cardW = 260, gap = 30;
  const totalW = STARTERS.length * cardW + (STARTERS.length - 1) * gap;
  let x0 = (VIEW_W - totalW) / 2;
  for (let i = 0; i < STARTERS.length; i++) {
    const x = x0 + i * (cardW + gap), y = 92, h = 360;
    if (inside(x, y, cardW, h)) {
      const id = STARTERS[i];
      Audio.caught();
      const c = makeCreature(id, 5);
      G.party.push(c);
      G.starter = id;
      catchSpecies(id);
      G.totalCaught++;
      const sp = SPECIES[id];
      starterScene.chosen = id;
      Dialog.start([
        'Prof. Rowan: A fine choice! ' + sp.name + ' it is.',
        'Take these Bind Orbs and a few Potions for the road.',
        'Your rival is already out there. Off you go, ' + TAMERS[G.tamer].name + '!',
      ], () => { saveGame(); enterOverworld(); });
      return;
    }
  }
}

function starterKey(k) {
  if (Dialog.active) Dialog.advance();
}

/* ===================================================================
 *  TEAM  (party review) — reachable from overworld or battle menu
 * =================================================================== */
const teamScene = { from: SCENE.OVERWORLD, sel: 0 };

function drawTeam() {
  background(24, 34, 66);
  push();
  textAlign(LEFT, TOP); fill(UI.accent); textFont(FONT_TITLE); textSize(28);
  text('Your Team', 40, 26);
  textFont(FONT_UI); textSize(15); fill(200, 214, 240);
  text('Bag: ' + G.bag.orb + ' Bind Orbs, ' + G.bag.potion + ' Potions   \u2022   Coins: ' + G.coins,
    40, 66);
  pop();

  if (G.party.length === 0) {
    centerText('No creatures yet.', VIEW_W / 2, VIEW_H / 2, 22, UI.cream);
  }

  const cardH = 78, gap = 12, x = 40, w = VIEW_W - 80;
  G.party.forEach((c, i) => {
    const y = 100 + i * (cardH + gap);
    panel(x, y, w, cardH, c.hp > 0 ? UI.panel : color(60, 40, 46), UI.accent2, 12, 3);
    // sprite chip
    push();
    const cx = x + 46, cy = y + cardH / 2;
    push(); translate(cx - 300, cy - 300); scale(0.28); pop();
    pop();
    drawCreatureArt(c.species.art, x + 46, y + cardH / 2 + 6, 0.26, false);

    push();
    textAlign(LEFT, TOP); fill(UI.cream); textFont(FONT_TITLE); textSize(20);
    text(c.nick + '  Lv ' + c.level, x + 96, y + 12);
    pop();
    typeBadge(x + 96, y + 42, c.species.type);
    hpBar(x + 250, y + 20, 240, c.hp, c.maxHp, c.hp);
    push();
    textAlign(LEFT, TOP); fill(210, 222, 246); textFont(FONT_UI); textSize(13);
    text('HP ' + c.hp + ' / ' + c.maxHp, x + 250, y + 44);
    // moves
    const mv = c.moves.map(m => MOVES[m.id].name).join('  \u2022  ');
    text(mv, x + 520, y + 20, w - 520, cardH - 20);
    pop();
  });

  button(VIEW_W - 180, VIEW_H - 60, 140, 42, '\u2190 Back', false, 18);
}

function teamMouse() {
  if (inside(VIEW_W - 180, VIEW_H - 60, 140, 42)) {
    Audio.blip();
    G.scene = teamScene.from || SCENE.OVERWORLD;
    if (G.scene === SCENE.OVERWORLD) enterOverworld();
  }
}
function teamKey(k) {
  if (k === 't' || k === 'T' || k === 'Escape' || k === 'Backspace') {
    Audio.blip();
    G.scene = teamScene.from || SCENE.OVERWORLD;
    if (G.scene === SCENE.OVERWORLD) enterOverworld();
  }
}

/* ===================================================================
 *  DEX  (Tamer's Log)
 * =================================================================== */
const dexScene = { sel: 0 };

function allSpeciesSorted() {
  return Object.values(SPECIES).sort((a, b) => a.dexNo - b.dexNo);
}

function drawDex() {
  background(20, 30, 58);
  const list = allSpeciesSorted();
  push();
  textAlign(LEFT, TOP); fill(UI.accent); textFont(FONT_TITLE); textSize(28);
  text('Tamer\u2019s Log', 40, 26);
  textFont(FONT_UI); textSize(15); fill(200, 214, 240);
  text('Seen ' + dexSeenCount() + '   \u2022   Caught ' + dexCaughtCount() + '   /   ' + list.length,
    40, 66);
  pop();

  // list on the left
  list.forEach((sp, i) => {
    const y = 100 + i * 64, x = 40, w = 360, h = 54;
    const seen = !!G.dexSeen[sp.id], caught = !!G.dexCaught[sp.id];
    const hot = dexScene.sel === i;
    panel(x, y, w, h, hot ? UI.panelLite : UI.panel, caught ? UI.good : UI.accent2, 10, 3);
    push();
    textAlign(LEFT, CENTER); textFont(FONT_UI); textSize(18); fill(UI.cream);
    const label = seen ? ('#' + nf(sp.dexNo, 2) + '  ' + sp.name) : ('#' + nf(sp.dexNo, 2) + '  ??????');
    text(label, x + 16, y + h / 2);
    if (caught) { fill(UI.good); textAlign(RIGHT, CENTER); text('\u2714 caught', x + w - 14, y + h / 2); }
    else if (seen) { fill(UI.mid); textAlign(RIGHT, CENTER); text('seen', x + w - 14, y + h / 2); }
    pop();
  });

  // detail on the right
  const sp = list[dexScene.sel];
  const seen = !!G.dexSeen[sp.id];
  panel(430, 100, VIEW_W - 470, 400, UI.panel, UI.accent, 14, 4);
  if (seen) {
    drawCreatureArt(sp.art, 430 + (VIEW_W - 470) / 2, 250, 0.9, false);
    push();
    textAlign(CENTER, TOP); fill(UI.cream); textFont(FONT_TITLE); textSize(26);
    text(sp.name, 430 + (VIEW_W - 470) / 2, 320);
    pop();
    typeBadge(430 + (VIEW_W - 470) / 2 - 34, 356, sp.type);
    push();
    textAlign(CENTER, TOP); fill(210, 222, 246); textFont(FONT_UI); textSize(15);
    text(sp.blurb, 450, 392, VIEW_W - 510, 90);
    pop();
  } else {
    centerText('Not yet seen.', 430 + (VIEW_W - 470) / 2, 260, 22, color(150, 165, 200));
    centerText('Explore the tall grass to find it!', 430 + (VIEW_W - 470) / 2, 292, 15, color(120, 135, 170));
  }

  button(VIEW_W - 180, VIEW_H - 60, 140, 42, '\u2190 Back', false, 18);
}

function dexMouse() {
  const list = allSpeciesSorted();
  for (let i = 0; i < list.length; i++) {
    if (inside(40, 100 + i * 64, 360, 54)) { Audio.blip(); dexScene.sel = i; return; }
  }
  if (inside(VIEW_W - 180, VIEW_H - 60, 140, 42)) { Audio.blip(); enterOverworld(); }
}
function dexKey(k) {
  const list = allSpeciesSorted();
  if (k === 'ArrowDown' || k === 's') dexScene.sel = (dexScene.sel + 1) % list.length;
  else if (k === 'ArrowUp' || k === 'w') dexScene.sel = (dexScene.sel + list.length - 1) % list.length;
  else if (k === 'x' || k === 'X' || k === 'Escape' || k === 'Backspace') { Audio.blip(); enterOverworld(); }
}
