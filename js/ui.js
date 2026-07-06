/* =============================================================
 *  ui.js  —  Verdal: A Tamer's Journey
 *  Reusable interface pieces (rounded panels, buttons, HP bars) and
 *  a typewriter Dialog system used by battles and overworld chatter.
 * ============================================================= */

function panel(x, y, w, h, fillc = UI.panel, strokec = UI.accent, r = 12, sw = 4) {
  push();
  stroke(strokec); strokeWeight(sw); fill(fillc);
  rect(x, y, w, h, r);
  pop();
}

function uiText(str, x, y, size, col = UI.cream, align = LEFT, font = FONT_UI) {
  push();
  textFont(font); textSize(size); fill(col); textAlign(align, TOP);
  text(str, x, y);
  pop();
}

function centerText(str, x, y, size, col = UI.cream, font = FONT_UI) {
  push();
  textFont(font); textSize(size); fill(col); textAlign(CENTER, CENTER);
  text(str, x, y);
  pop();
}

// A clickable button. Returns true when hovered (draws hover state).
function button(x, y, w, h, label, hot = false, size = 20) {
  const hover = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
  push();
  stroke(UI.accent2); strokeWeight(3);
  fill(hover || hot ? UI.accent : UI.cream);
  rect(x, y, w, h, 10);
  noStroke(); fill(UI.ink);
  textFont(FONT_UI); textSize(size); textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  pop();
  return hover;
}

function inside(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

// HP bar with smooth colour shift and a display value that eases toward hp.
function hpBar(x, y, w, cur, max, shown) {
  const frac = clampNum((shown !== undefined ? shown : cur) / max, 0, 1);
  push();
  noStroke(); fill(30, 30, 40); rect(x, y, w, 12, 6);
  let c = UI.good;
  if (frac < 0.5) c = UI.mid;
  if (frac < 0.22) c = UI.bad;
  fill(c); rect(x, y, w * frac, 12, 6);
  noStroke(); fill(255, 255, 255, 60); rect(x, y, w * frac, 5, 6);
  pop();
}

// XP bar (thin, cyan).
function xpBar(x, y, w, c) {
  const cur = c.xp - xpForLevel(c.level);
  const need = xpForLevel(c.level + 1) - xpForLevel(c.level);
  const frac = clampNum(cur / need, 0, 1);
  push();
  noStroke(); fill(20, 30, 50); rect(x, y, w, 5, 3);
  fill('#37c6ff'); rect(x, y, w * frac, 5, 3);
  pop();
}

function typeBadge(x, y, t) {
  push();
  noStroke(); fill(TYPE_COLOR[t] || '#888');
  rect(x, y, 58, 20, 6);
  fill(255); textFont(FONT_UI); textSize(13); textAlign(CENTER, CENTER);
  text(t, x + 29, y + 10);
  pop();
}

// ---------- Typewriter dialog ----------
const Dialog = {
  lines: [], idx: 0, shown: 0, cps: 45, timer: 0,
  active: false, onComplete: null,

  start(lines, onComplete) {
    this.lines = Array.isArray(lines) ? lines.slice() : [lines];
    this.idx = 0; this.shown = 0; this.timer = 0;
    this.active = true; this.onComplete = onComplete || null;
  },
  get current() { return this.lines[this.idx] || ''; },
  get lineDone() { return this.shown >= this.current.length; },

  update(dt) {
    if (!this.active) return;
    if (!this.lineDone) {
      this.timer += dt;
      const per = 1 / this.cps;
      while (this.timer >= per && !this.lineDone) { this.shown++; this.timer -= per; }
    }
  },
  // advance to next line or finish; returns true if it consumed the input
  advance() {
    if (!this.active) return false;
    if (!this.lineDone) { this.shown = this.current.length; return true; }
    if (this.idx < this.lines.length - 1) { this.idx++; this.shown = 0; this.timer = 0; return true; }
    this.active = false;
    const cb = this.onComplete; this.onComplete = null;
    if (cb) cb();
    return true;
  },
  draw(x, y, w, h) {
    if (!this.active) return;
    panel(x, y, w, h, UI.cream, UI.accent2, 12, 4);
    push();
    fill(UI.ink); textFont(FONT_UI); textSize(21); textAlign(LEFT, TOP);
    text(this.current.substring(0, this.shown), x + 20, y + 16, w - 40, h - 24);
    if (this.lineDone) {
      fill(UI.accent2);
      const bob = sin(frameCount * 0.15) * 3;
      triangle(x + w - 26, y + h - 22 + bob, x + w - 14, y + h - 22 + bob, x + w - 20, y + h - 14 + bob);
    }
    pop();
  },
};
