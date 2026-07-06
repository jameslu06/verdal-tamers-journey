/* =============================================================
 *  game.js  —  Verdal: A Tamer's Journey
 *  The beating heart: global state, creature construction, stat and
 *  battle math, wild encounters, party/dex management, and save/load.
 *  Scene files call into these helpers; rendering lives elsewhere.
 * ============================================================= */

// ---------- small helpers ----------
function rngInt(a, b) { return floor(random(a, b + 1)); }
function pick(arr) { return arr[floor(random(arr.length))]; }
function clampNum(v, lo, hi) { return max(lo, min(hi, v)); }
function weightedPick(table) {
  let total = 0;
  for (const t of table) total += t.weight;
  let r = random(total);
  for (const t of table) { if (r < t.weight) return t; r -= t.weight; }
  return table[table.length - 1];
}

// ---------- global state ----------
const G = {
  scene: SCENE.TITLE,
  tamer: 'kai',            // chosen tamer key
  starter: null,           // chosen starter species id
  party: [],               // array of creature instances (max 6)
  bag: { orb: 8, potion: 4 },
  coins: 200,
  dexSeen: {},             // {speciesId:true}
  dexCaught: {},           // {speciesId:true}
  player: { col: 12, row: 11, dir: 'down', px: 0, py: 0, moving: false, t: 0, anim: 0 },
  battle: null,
  rivalBeaten: false,
  totalCaught: 0,
  steps: 0,
};

// ---------- stat & creature math ----------
function xpForLevel(level) { return level * level * level; }           // cumulative xp needed
function levelFromXp(xp) { return max(1, floor(Math.cbrt(xp))); }

function recomputeStats(c) {
  const b = c.species.base, L = c.level;
  c.maxHp = floor((b.hp * L) / 50) + L + 10;
  c.stats = {
    atk: floor((b.atk * L) / 40) + 3,
    def: floor((b.def * L) / 40) + 3,
    spd: floor((b.spd * L) / 40) + 3,
  };
}

function movesForLevel(species, level) {
  const learned = species.learnset.filter(e => e.lvl <= level).map(e => e.move);
  // keep the most recent four
  return learned.slice(-4);
}

function makeCreature(id, level) {
  const sp = SPECIES[id];
  const c = {
    id, species: sp, nick: sp.name,
    level, xp: xpForLevel(level),
    statStages: { atk: 0, def: 0 },
  };
  recomputeStats(c);
  c.hp = c.maxHp;
  c.moves = movesForLevel(sp, level).map(m => ({ id: m, pp: MOVES[m].pp, maxpp: MOVES[m].pp }));
  return c;
}

function stageMult(stage) {
  stage = clampNum(stage, -6, 6);
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
}
function effStat(c, key) { return floor(c.stats[key] * stageMult(c.statStages[key] || 0)); }

// ---------- damage & catching ----------
function damageCalc(attacker, defender, move) {
  if (move.category === 'status' || move.power <= 0) return { dmg: 0, mult: 1, crit: false };
  const atk = effStat(attacker, 'atk');
  const def = effStat(defender, 'def');
  const base = floor(((2 * attacker.level / 5 + 2) * move.power * atk / def) / 50) + 2;
  const mult = typeMultiplier(move.type, defender.species.type);
  const stab = move.type === attacker.species.type ? 1.5 : 1;
  const crit = random() < 0.0625;
  const critM = crit ? 1.5 : 1;
  const rand = random(0.85, 1.0);
  const dmg = max(1, floor(base * mult * stab * critM * rand));
  return { dmg, mult, crit };
}

function catchChance(target, orbBonus) {
  const hpFactor = 1 - target.hp / target.maxHp;      // low HP -> easier
  const lvlBonus = clampNum((12 - target.level) * 0.01, 0, 0.12);
  const rate = 0.12 + hpFactor * 0.6 + target.species.catchRate * 0.35 + lvlBonus + (orbBonus || 0);
  return clampNum(rate, 0.06, 0.95);
}

function xpReward(defeated) { return floor(defeated.level * 7) + 4; }

// Award xp; returns {levels:[newLevel...], learned:[moveName...]}
function grantXp(c, amount) {
  const out = { levels: [], learned: [] };
  c.xp += amount;
  while (c.level < 50 && c.xp >= xpForLevel(c.level + 1)) {
    c.level += 1;
    recomputeStats(c);
    out.levels.push(c.level);
    // learn any new move at this level
    for (const e of c.species.learnset) {
      if (e.lvl === c.level && !c.moves.some(m => m.id === e.move)) {
        if (c.moves.length < 4) c.moves.push({ id: e.move, pp: MOVES[e.move].pp, maxpp: MOVES[e.move].pp });
        else { c.moves.shift(); c.moves.push({ id: e.move, pp: MOVES[e.move].pp, maxpp: MOVES[e.move].pp }); }
        out.learned.push(MOVES[e.move].name);
      }
    }
    c.hp = min(c.maxHp, c.hp + 6); // small heal on level
  }
  return out;
}

// ---------- party / dex ----------
function firstHealthy() { return G.party.findIndex(c => c.hp > 0); }
function partyWiped() { return G.party.every(c => c.hp <= 0); }
function healParty() { G.party.forEach(c => { c.hp = c.maxHp; c.statStages = { atk: 0, def: 0 }; c.moves.forEach(m => m.pp = m.maxpp); }); }

function seeSpecies(id) { G.dexSeen[id] = true; }
function catchSpecies(id) { G.dexSeen[id] = true; G.dexCaught[id] = true; }
function dexSeenCount() { return Object.keys(G.dexSeen).length; }
function dexCaughtCount() { return Object.keys(G.dexCaught).length; }

// ---------- wild encounters ----------
function rollWildEncounter() {
  const t = weightedPick(WILD_TABLE);
  const lvl = rngInt(t.min, t.max);
  return makeCreature(t.species, lvl);
}

// ---------- save / load (localStorage; safe for GitHub Pages) ----------
const SAVE_KEY = 'verdal_tamers_save_v1';
function saveGame() {
  try {
    const data = {
      tamer: G.tamer, starter: G.starter, bag: G.bag, coins: G.coins,
      dexSeen: G.dexSeen, dexCaught: G.dexCaught, rivalBeaten: G.rivalBeaten,
      totalCaught: G.totalCaught, steps: G.steps,
      player: { col: G.player.col, row: G.player.row, dir: G.player.dir },
      party: G.party.map(c => ({
        id: c.id, nick: c.nick, level: c.level, xp: c.xp, hp: c.hp,
        moves: c.moves.map(m => ({ id: m.id, pp: m.pp })),
      })),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) { return false; }
}
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    G.tamer = d.tamer; G.starter = d.starter; G.bag = d.bag; G.coins = d.coins;
    G.dexSeen = d.dexSeen || {}; G.dexCaught = d.dexCaught || {};
    G.rivalBeaten = !!d.rivalBeaten; G.totalCaught = d.totalCaught || 0; G.steps = d.steps || 0;
    G.player.col = d.player.col; G.player.row = d.player.row; G.player.dir = d.player.dir;
    G.party = (d.party || []).map(pc => {
      const c = makeCreature(pc.id, pc.level);
      c.nick = pc.nick; c.xp = pc.xp; c.hp = pc.hp;
      c.moves = pc.moves.map(m => ({ id: m.id, pp: m.pp, maxpp: MOVES[m.id].pp }));
      return c;
    });
    return G.party.length > 0;
  } catch (e) { return false; }
}
function wipeSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

// ---------- reset to a brand-new game ----------
function resetNewGame() {
  G.starter = null;
  G.party = [];
  G.bag = { orb: 8, potion: 4 };
  G.coins = 200;
  G.dexSeen = {}; G.dexCaught = {};
  G.rivalBeaten = false; G.totalCaught = 0; G.steps = 0;
  G.player = { col: 12, row: 11, dir: 'down', px: 0, py: 0, moving: false, t: 0, anim: 0 };
  G.battle = null;
}
