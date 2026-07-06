/* =============================================================
 *  scenes/overworld.js  —  Verdal: A Tamer's Journey
 *  A small tile region you explore on foot. Tall grass hides wild
 *  creatures, a lab heals your team, signs give hints, and a rival
 *  waits to test you. The player avatar is an original top-down
 *  sprite tinted with your chosen tamer's colours.
 * ============================================================= */

let MAP = null;

function buildMap() {
  const R = MAP_ROWS, C = MAP_COLS;
  const grid = [];
  for (let r = 0; r < R; r++) { const row = []; for (let c = 0; c < C; c++) row.push('G'); grid.push(row); }
  // tree border
  for (let c = 0; c < C; c++) { grid[0][c] = 'T'; grid[R - 1][c] = 'T'; }
  for (let r = 0; r < R; r++) { grid[r][0] = 'T'; grid[r][C - 1] = 'T'; }

  const stamp = (r0, r1, c0, c1, ch) => {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) grid[r][c] = ch;
  };

  // Lab (Rowan's Field Lab) — 2x2 building near the top
  stamp(1, 2, 11, 12, 'B');
  const labDoor = { r: 3, c: 12 };

  // Pond
  stamp(6, 8, 1, 3, 'W');

  // Tall-grass patches
  stamp(4, 6, 6, 10, 'g');
  stamp(4, 6, 15, 19, 'g');
  stamp(9, 10, 6, 16, 'g');

  // Tree clusters for shape
  stamp(8, 9, 18, 19, 'T');
  stamp(12, 13, 18, 19, 'T');

  // Decorative path around start
  for (let r = 11; r <= 12; r++) { grid[r][10] = 'P'; grid[r][12] = 'P'; grid[r][14] = 'P'; }

  // Heal pad (a soft place near home)
  grid[13][6] = 'H';

  // Rival encounter tile
  grid[7][13] = 'R';

  // Signs
  grid[3][4] = 'S';
  grid[10][17] = 'S';
  grid[13][10] = 'S';

  const signs = {
    '3,4': ['ROWAN\'S FIELD LAB', 'Choose a partner, then explore Verdal Isle!'],
    '10,17': ['WILD ROUTE', 'Rustling grass means a wild critter is near.', 'Weaken it, then throw a Bind Orb to make a friend.'],
    '13,10': ['VERDAL ISLE', 'Ember beats Leaf, Leaf beats Tide, Tide beats Ember.', 'Spark answers the Tide. Type wisely, tamer!'],
  };

  return { grid, labDoor, signs, R, C };
}

function tileAt(c, r) {
  if (r < 0 || c < 0 || r >= MAP.R || c >= MAP.C) return 'T';
  return MAP.grid[r][c];
}
function isWalkable(c, r) {
  const t = tileAt(c, r);
  return t === 'G' || t === 'g' || t === 'P' || t === 'H' || t === 'R';
}

// tamer colour lookup for the avatar
function tamerColors() {
  if (G.tamer === 'rex') return { hat: rexHatC, shirt: rexShirtC, hair: rexHairC };
  if (G.tamer === 'mira') return { hat: miraHatC, shirt: miraShirtC, hair: miraHairC };
  return { hat: kaiHatC, shirt: kaiShirt2C, hair: kaiHairC };
}

function enterOverworld() {
  if (!MAP) MAP = buildMap();
  const p = G.player;
  p.px = p.col * TILE; p.py = p.row * TILE;
  p.moving = false; p.t = 0;
  G.scene = SCENE.OVERWORLD;
}

function startStep(dc, dr, dir) {
  const p = G.player;
  p.dir = dir;
  if (p.moving) return;
  const nc = p.col + dc, nr = p.row + dr;
  // interaction check for facing solid handled elsewhere; here only walkable
  if (!isWalkable(nc, nr)) { Audio.bump(); return; }
  p.tc = nc; p.tr = nr; p.moving = true; p.t = 0;
  p.startX = p.col * TILE; p.startY = p.row * TILE;
}

function facingTile() {
  const p = G.player;
  const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[p.dir];
  return { c: p.col + d[0], r: p.row + d[1] };
}

function overworldInteract() {
  const f = facingTile();
  const t = tileAt(f.c, f.r);
  const key = f.r + ',' + f.c;
  if (t === 'S' && MAP.signs[key]) { Audio.blip(); Dialog.start(MAP.signs[key]); return; }
  if (t === 'B') { // lab door / building -> heal
    Audio.heal(); healParty();
    Dialog.start(['Prof. Rowan: Your team looks tired.', 'There — fully rested and ready!']);
    return;
  }
  if (t === 'R' && !G.rivalBeaten) { startRivalBattle(); return; }
}

function updateOverworld(dt) {
  const p = G.player;
  Dialog.update(dt);
  if (Dialog.active) return;

  if (p.moving) {
    p.t += dt * 6.5;
    p.anim += dt * 10;
    if (p.t >= 1) {
      p.t = 1; p.moving = false;
      p.col = p.tc; p.row = p.tr;
      p.px = p.col * TILE; p.py = p.row * TILE;
      G.steps++;
      onEnterTile();
    } else {
      p.px = lerp(p.startX, p.tc * TILE, p.t);
      p.py = lerp(p.startY, p.tr * TILE, p.t);
    }
  } else {
    // held-key movement
    if (keyIsDown(87) || keyIsDown(UP_ARROW)) startStep(0, -1, 'up');
    else if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) startStep(0, 1, 'down');
    else if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) startStep(-1, 0, 'left');
    else if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) startStep(1, 0, 'right');
  }
}

function onEnterTile() {
  const p = G.player;
  const t = tileAt(p.col, p.row);
  if (t === 'H') {
    Audio.heal(); healParty();
    Dialog.start(['You rest on the soft grass mat.', 'Your team is fully healed!']);
    return;
  }
  if (t === 'g') {
    if (random() < 0.16) {
      const wild = rollWildEncounter();
      startWildBattle(wild);
    }
  }
  if (t === 'R' && !G.rivalBeaten) {
    startRivalBattle();
  }
}

// ---------- rendering ----------
function tileColor(t) {
  switch (t) {
    case 'G': return '#7ec850';
    case 'g': return '#4f9b34';
    case 'T': return '#2f7d32';
    case 'W': return '#4aa6e0';
    case 'P': return '#d8c18a';
    case 'H': return '#f4c6de';
    case 'R': return '#7ec850';
    case 'B': return '#c56a3a';
    case 'S': return '#7ec850';
    default: return '#7ec850';
  }
}

function drawTileDeco(t, x, y) {
  push();
  if (t === 'T') {
    fill('#1f5d22'); noStroke();
    ellipse(x + TILE / 2, y + TILE / 2 - 4, TILE - 4, TILE - 4);
    fill('#2f7d32'); ellipse(x + TILE / 2 - 6, y + TILE / 2 - 8, 16, 16);
  } else if (t === 'g') {
    stroke('#2f6d20'); strokeWeight(2);
    for (let i = 0; i < 4; i++) {
      const gx = x + 8 + i * 8;
      line(gx, y + TILE - 6, gx - 3, y + TILE - 16);
      line(gx, y + TILE - 6, gx + 3, y + TILE - 16);
    }
  } else if (t === 'W') {
    noFill(); stroke(255, 255, 255, 120); strokeWeight(2);
    const w = sin(frameCount * 0.08 + x) * 2;
    arc(x + TILE / 2 + w, y + TILE / 2, 16, 8, 0, PI);
  } else if (t === 'S') {
    fill('#8a5a2b'); noStroke(); rect(x + TILE / 2 - 2, y + 14, 4, 20);
    fill(UI.cream); stroke('#8a5a2b'); strokeWeight(2); rect(x + 6, y + 6, TILE - 12, 16, 3);
  } else if (t === 'H') {
    noStroke(); fill(255, 255, 255, 180);
    textAlign(CENTER, CENTER); textSize(16); text('\u2665', x + TILE / 2, y + TILE / 2);
  } else if (t === 'R' && !G.rivalBeaten) {
    // rival marker
    fill('#ffd23f'); noStroke(); textAlign(CENTER, CENTER); textSize(18);
    text('!', x + TILE / 2, y + TILE / 2 - 2);
  }
  pop();
}

function drawPlayerAvatar() {
  const p = G.player;
  const x = p.px + TILE / 2;
  const y = p.py + TILE / 2;
  const col = tamerColors();
  const bob = p.moving ? sin(p.anim * 3) * 2 : 0;
  push();
  translate(x, y + bob);
  // shadow
  noStroke(); fill(0, 0, 0, 60); ellipse(0, 14, 26, 10);
  // body / shirt
  fill(col.shirt); stroke(20); strokeWeight(2);
  rect(-11, -2, 22, 18, 6);
  // head
  fill(skinC); ellipse(0, -10, 22, 22);
  // cap
  fill(col.hat); noStroke();
  arc(0, -12, 24, 22, PI, TWO_PI);
  rect(-12, -13, 24, 4, 2);
  // little brim by facing
  fill(col.hat);
  if (p.dir === 'down') rect(-8, -14, 16, 5, 2);
  else if (p.dir === 'up') { /* brim hidden */ }
  else if (p.dir === 'left') rect(-14, -14, 8, 5, 2);
  else rect(6, -14, 8, 5, 2);
  // eyes (facing)
  fill(20);
  if (p.dir === 'down') { ellipse(-4, -8, 3, 4); ellipse(4, -8, 3, 4); }
  else if (p.dir === 'left') { ellipse(-5, -8, 3, 4); }
  else if (p.dir === 'right') { ellipse(5, -8, 3, 4); }
  // feet
  fill(30); const sw = p.moving ? sin(p.anim * 3) * 3 : 0;
  ellipse(-6 + sw, 16, 8, 6); ellipse(6 - sw, 16, 8, 6);
  pop();
}

function drawOverworldHUD() {
  // top bar
  panel(8, 8, 320, 54, UI.panel, UI.accent, 10, 3);
  const t = TAMERS[G.tamer];
  uiText(t.name, 20, 16, 20, UI.accent);
  uiText('Team ' + G.party.length + '/6', 20, 40, 15);
  uiText('Orbs ' + G.bag.orb, 120, 16, 15);
  uiText('Potions ' + G.bag.potion, 120, 40, 15);
  uiText('Coins ' + G.coins, 230, 16, 15);
  uiText('Dex ' + dexCaughtCount() + '/' + Object.keys(SPECIES).length, 230, 40, 15);

  // controls hint (bottom-right)
  push();
  fill(0, 0, 0, 120); noStroke(); rect(VIEW_W - 300, VIEW_H - 34, 292, 28, 8);
  fill(UI.cream); textFont(FONT_UI); textSize(13); textAlign(LEFT, CENTER);
  text('Move: WASD/Arrows  \u2022  Talk/Heal: Space  \u2022  Team: T  \u2022  Dex: X', VIEW_W - 292, VIEW_H - 20);
  pop();
}

function drawOverworld() {
  background('#7ec850');
  // tiles
  for (let r = 0; r < MAP.R; r++) {
    for (let c = 0; c < MAP.C; c++) {
      const t = MAP.grid[r][c];
      const x = c * TILE, y = r * TILE;
      noStroke(); fill(tileColor(t)); rect(x, y, TILE, TILE);
      // subtle grass checker
      if ((t === 'G' || t === 'R' || t === 'S') && (r + c) % 2 === 0) { fill(0, 0, 0, 10); rect(x, y, TILE, TILE); }
      if (t === 'B') { // lab building block detail
        fill('#a8552c'); rect(x, y, TILE, TILE);
        fill('#f4e2b8'); rect(x + 6, y + 6, TILE - 12, TILE - 12, 3);
      }
      drawTileDeco(t, x, y);
    }
  }
  // lab roof label
  push(); fill(UI.ink); textFont(FONT_UI); textSize(12); textAlign(CENTER, CENTER);
  text('LAB', 11.99 * TILE + TILE, 1 * TILE + TILE / 2); pop();

  drawPlayerAvatar();
  drawOverworldHUD();

  Dialog.draw(20, VIEW_H - 150, VIEW_W - 40, 130);
}

function overworldKey(k, code) {
  if (Dialog.active) { Dialog.advance(); return; }
  if (k === ' ' || code === ENTER) overworldInteract();
  else if (k === 't' || k === 'T') { G.scene = SCENE.TEAM; teamScene.from = SCENE.OVERWORLD; }
  else if (k === 'x' || k === 'X') { G.scene = SCENE.DEX; }
}

function overworldMouse() {
  if (Dialog.active) Dialog.advance();
}
