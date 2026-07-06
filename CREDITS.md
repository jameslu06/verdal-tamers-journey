# Credits

## Original artwork & concept

**James K** — created the original *Customize Your Character* p5.js project: all of the hand-drawn vector artwork for the three tamers and the four creatures, along with the facial expressions and the outfit/color customization system. That project is the foundation this game is built on, and the characters you see here are James K's drawings, carried over and repositioned for a top-down RPG.

## Version 2 — *Verdal: A Tamer's Journey*

Built on top of the original artwork, this version adds:

- An original game world (**Verdal Isle**) with a walkable tile-based overworld.
- Original creature and tamer names, an original five-type system, and an original move list.
- A turn-based battle engine (damage math, type effectiveness, critical hits, accuracy, status moves, speed/priority ordering).
- Wild encounters, a catching system (Bind Orbs), leveling, learnsets, and a rival battle.
- A reworked "Style Studio" that repurposes the original dress-up customization.
- A creature log (dex), save/continue via `localStorage`, and code-synthesized sound effects.
- A modular file layout suitable for version control and GitHub Pages.

## Libraries

- **[p5.js](https://p5js.org/)** (v1.4.0) — creative-coding library, MIT licensed.
- **p5.sound** — p5's audio add-on, used for the oscillator-based sound effects.

## Sound

All sound effects are generated at runtime with p5.sound oscillators. No audio files are bundled, so there is no third-party audio to credit.

---

If you build on this further, please keep this credit to James K for the original characters and customizer.
