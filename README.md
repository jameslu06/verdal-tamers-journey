# Verdal: A Tamer's Journey

A little top-down creature-taming RPG built with [p5.js](https://p5js.org/). Explore **Verdal Isle**, walk through tall grass to meet wild **Kith**, battle them in turn-based fights, and toss a **Bind Orb** to add them to your team. It grew out of an earlier "dress-up" character-customizer — the hand-drawn characters from that project live on here as the game's tamers and starter creatures.

Play the game online: https://jameslu06.github.io/verdal-tamers-journey/

> Think classic handheld monster RPGs — an overworld, random encounters, type match-ups, catching, leveling — but with its own names, creatures, moves, and world.

---

## Features

- **A walkable overworld** — a 25×15 tile map with a lab, a pond, tree lines, signs you can read, tall grass, a rest pad, and a rival waiting on the path.
- **Grid-based movement** with smooth tweening (arrow keys or WASD).
- **Wild encounters** in the tall grass, with a full **turn-based battle system**: speed/priority ordering, a five-type effectiveness triangle, STAB, critical hits, accuracy, and stat-boosting status moves.
- **Catching** with Bind Orbs — catch chance scales with the target's remaining HP, its species catch-rate, and its level.
- **Leveling & learnsets** — creatures gain EXP, level up, recompute stats, and learn new moves.
- **A rival battle** with a two-creature team.
- **A style studio** (the old dress-up game, reworked) — pick your tamer, recolor their outfit, and set an expression before you set out.
- **A Tamer's Log** (creature dex) tracking what you've seen and caught.
- **Save & continue** via the browser's `localStorage`.
- **Code-synthesized sound effects** (no audio files) using p5.sound oscillators — mute with the note icon or the `M` key.

---

## Controls

| Action | Keys |
| --- | --- |
| Move | Arrow keys or **W A S D** |
| Interact / confirm / advance text | **Space** or **Enter** |
| Open Team | **T** |
| Open Log (dex) | **X** |
| Mute / unmute | **M** (or click the note icon) |

In battle, use the arrow keys to move the cursor and **Space/Enter** to confirm. Most menus are also fully clickable with the mouse.

---

## Running it

Because the game loads several script files and saves progress, open it from a **local web server** rather than double-clicking `index.html` (browsers block some features on the `file://` protocol).

**Option A — Python (already on most machines):**

```bash
cd verdal-tamers-journey
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

**Option B — Node:**

```bash
npx serve .
```

**Option C — GitHub Pages:** push this folder to a repo, enable Pages on the `main` branch (root), and it will be playable at your Pages URL. No build step is required.

---

## Project structure

```
verdal-tamers-journey/
├── index.html            # loads libraries + all modules in order
├── css/
│   └── style.css
├── lib/                  # local p5 copies so the game works offline
│   ├── p5.min.js
│   └── p5.sound.min.js
└── js/
    ├── config.js         # canvas size, tile size, SCENE enum, palette globals
    ├── data.js           # types, moves, species, starters, wild table, tamers
    ├── audio.js          # oscillator-based sound effects
    ├── ui.js             # panels, buttons, HP/XP bars, type badges, dialog box
    ├── game.js           # global state + stat/damage/catch/xp math + save/load
    ├── art/
    │   ├── faces.js      # facial-expression drawing
    │   ├── creatures.js  # the four hand-drawn creatures
    │   └── trainers.js   # the three hand-drawn tamers
    ├── scenes/
    │   ├── menus.js      # title, style studio, starter pick, team, dex
    │   ├── overworld.js  # map, movement, encounters, interactions
    │   └── battle.js     # turn-based battle engine
    └── sketch.js         # setup/draw router + input dispatch (loads last)
```

The load order in `index.html` matters: config → data → audio → ui → game → art → scenes → `sketch.js` last.

---

## Types

Five types with a small, readable chart:

- **Ember** beats **Leaf**
- **Leaf** beats **Tide**
- **Tide** beats **Ember**
- **Spark** is strong against **Tide**
- **Normal** is neutral to everything

---

## Inspiration and artwork note

Verdal: A Tamer's Journey is a fan-made creature-taming RPG inspired by classic monster-catching games, especially Pokémon.

The game code, systems, world (Verdal Isle), dialogue, battle logic, and progression mechanics are original work created for this project.

Some of the creature artwork used in this game was created by James for an earlier p5.js character-customizer project. Those creature designs are fan-made Pokémon-inspired artworks that were adapted and reused in this version of the game.

In other words, James created the in-game drawings and assets, while the creature concepts themselves are influenced by Pokémon-style designs rather than being fully original intellectual property.

Pokémon and related franchise elements are the property of Nintendo, Game Freak, and Creatures Inc. This project is an unofficial personal/student fan project and is not affiliated with or endorsed by those companies.

If this project is ever expanded beyond personal or educational use, the creature artwork should be replaced or redesigned into fully original designs.

---

## License

Released under the MIT License — see `LICENSE`. Note that the license covers the **code**; please read the artwork note above before reusing the creature designs publicly.

Have fun on Verdal Isle. 
