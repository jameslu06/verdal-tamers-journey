/* =============================================================
 *  audio.js  —  Verdal: A Tamer's Journey
 *  All sound is synthesised at runtime with p5.sound oscillators.
 *  Nothing is loaded from an audio file, so there is no third-party
 *  audio and no copyright concern. Sound is optional and fails
 *  silently if the browser blocks audio before a user gesture.
 * ============================================================= */

const Audio = {
  ready: false,
  muted: false,
  env: null,
  osc: null,

  init() {
    try {
      this.env = new p5.Envelope();
      this.env.setADSR(0.005, 0.08, 0.1, 0.12);
      this.env.setRange(0.28, 0);
      this.osc = new p5.Oscillator('square');
      this.osc.amp(this.env);
      this.osc.start();
      this.ready = true;
    } catch (e) {
      this.ready = false;
    }
  },

  // Play a short tone at a frequency (Hz) after an optional delay (s).
  tone(freq, wave = 'square', delay = 0, dur = 0.12) {
    if (!this.ready || this.muted) return;
    try {
      const e = this.env;
      const o = this.osc;
      setTimeout(() => {
        o.setType(wave);
        o.freq(freq);
        e.setADSR(0.005, dur * 0.5, 0.05, dur * 0.4);
        e.play(o);
      }, delay * 1000);
    } catch (e) { /* ignore */ }
  },

  // A quick arpeggio helper.
  seq(notes, wave = 'square', step = 0.09) {
    notes.forEach((f, i) => this.tone(f, wave, i * step, step + 0.02));
  },

  blip()    { this.tone(660, 'square', 0, 0.06); },
  select()  { this.seq([523, 784], 'square', 0.06); },
  hit()     { this.tone(180, 'sawtooth', 0, 0.1); },
  superhit(){ this.seq([320, 200, 140], 'sawtooth', 0.05); },
  weak()    { this.tone(140, 'triangle', 0, 0.14); },
  faint()   { this.seq([392, 330, 262, 196], 'triangle', 0.1); },
  levelup() { this.seq([523, 659, 784, 1047], 'square', 0.09); },
  catchTry(){ this.seq([440, 440, 440], 'square', 0.14); },
  caught()  { this.seq([523, 659, 784, 1047, 1319], 'square', 0.1); },
  flee()    { this.seq([392, 262], 'triangle', 0.08); },
  heal()    { this.seq([659, 784, 988], 'sine', 0.1); },
  fanfare() { this.seq([523, 659, 784, 659, 784, 1047], 'square', 0.12); },
  bump()    { this.tone(110, 'triangle', 0, 0.05); },

  toggleMute() { this.muted = !this.muted; return this.muted; },
};
