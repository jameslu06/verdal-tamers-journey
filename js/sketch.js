/* =====================================================================
 *  sketch.js  —  the heart that ties every scene together
 *  --------------------------------------------------------------------
 *  Global-mode p5. Load order matters (see index.html): config, data,
 *  audio, ui, game, art/*, scenes/* all load BEFORE this file, so every
 *  helper and scene function is already defined by the time draw() runs.
 * ===================================================================== */

let titleFont, uiFont;
let audioStarted = false;

function preload() {
  // Fonts are pulled from Google Fonts via index.html; p5 will fall back
  // to the CSS font stack if these fail, so preloading is best-effort.
  try { titleFont = loadFont; } catch (e) {}
}

function setup() {
  const cnv = createCanvas(VIEW_W, VIEW_H);
  cnv.parent('game');
  pixelDensity(1);
  textFont(FONT_UI);
  initPalette();
  MAP = buildMap();
  G.scene = SCENE.TITLE;
}

/* Web audio can only start after a user gesture — kick it off on the
 * first click or key press. */
function ensureAudio() {
  if (audioStarted) return;
  audioStarted = true;
  try { if (typeof userStartAudio === 'function') userStartAudio(); } catch (e) {}
  Audio.init();
}

function draw() {
  const dt = Math.min(deltaTime / 1000, 0.05); // clamp for stability

  switch (G.scene) {
    case SCENE.TITLE:     drawTitle(); break;
    case SCENE.CUSTOMIZE: drawCustomize(); break;
    case SCENE.STARTER:   Dialog.update(dt); drawStarter(); break;
    case SCENE.OVERWORLD: updateOverworld(dt); drawOverworld(); break;
    case SCENE.BATTLE:    updateBattle(dt); drawBattle(); break;
    case SCENE.TEAM:      drawTeam(); break;
    case SCENE.DEX:       drawDex(); break;
    default:              drawTitle();
  }

  // global mute chip (top-right)
  drawMuteChip();
}

function drawMuteChip() {
  const x = VIEW_W - 34, y = 12;
  push();
  noStroke();
  fill(0, 0, 0, 40); ellipse(x, y + 10, 30, 30);
  fill(Audio.muted ? UI.bad : UI.cream);
  textAlign(CENTER, CENTER); textFont(FONT_UI); textSize(15);
  text(Audio.muted ? '\u2715' : '\u266A', x, y + 10);
  pop();
}

function muteChipHit() {
  return dist(mouseX, mouseY, VIEW_W - 34, 22) < 16;
}

/* ---------- input routing ---------- */
function mousePressed() {
  ensureAudio();
  if (muteChipHit()) { Audio.toggleMute(); return; }

  switch (G.scene) {
    case SCENE.TITLE:     titleMouse(); break;
    case SCENE.CUSTOMIZE: customizeMouse(); break;
    case SCENE.STARTER:   starterMouse(); break;
    case SCENE.OVERWORLD: overworldMouse(); break;
    case SCENE.BATTLE:    battleMouse(); break;
    case SCENE.TEAM:      teamMouse(); break;
    case SCENE.DEX:       dexMouse(); break;
  }
}

function keyPressed() {
  ensureAudio();
  const k = key;
  const code = keyCode;

  // global mute toggle
  if (k === 'm' || k === 'M') { Audio.toggleMute(); return; }

  switch (G.scene) {
    case SCENE.TITLE:     titleKey(k); break;
    case SCENE.CUSTOMIZE: break; // studio is mouse-driven
    case SCENE.STARTER:   starterKey(k); break;
    case SCENE.OVERWORLD: overworldKey(k, code); break;
    case SCENE.BATTLE:    battleKey(k, code); break;
    case SCENE.TEAM:      teamKey(k); break;
    case SCENE.DEX:       dexKey(k); break;
  }
  // stop arrow keys / space from scrolling the page
  if ([32, 37, 38, 39, 40].includes(code)) return false;
}
