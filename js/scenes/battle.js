/* =============================================================
 *  scenes/battle.js  —  Verdal: A Tamer's Journey
 *  Turn-based battles: type-effective damage, stat moves, catching
 *  with Bind Orbs, potions, switching, XP/level-ups, and multi-
 *  creature rival battles. Your hand-drawn creatures are the fighters.
 * ============================================================= */

function pActive() { return G.party[G.battle.playerIdx]; }
function eActive() { return G.battle.enemy; }
function avgPartyLevel() {
  if (!G.party.length) return 5;
  return G.party.reduce((s, c) => s + c.level, 0) / G.party.length;
}

// ---- step queue: chains dialog + state changes cleanly ----
function bRun() {
  const B = G.battle;
  if (!B || B.over) return;   // battle was cleared/finished — stop draining the queue
  if (B.queue.length) { const s = B.queue.shift(); s(); }
  else { B.phase = B.nextPhase || 'menu'; B.nextPhase = null; }
}
function bSay(lines) { return () => Dialog.start(lines, () => bRun()); }
function bDo(fn) { return () => { fn(); bRun(); }; }
function bWait(sec) { return () => { setTimeout(() => bRun(), sec * 1000); }; }

// ---------- starting battles ----------
function startWildBattle(wild) {
  seeSpecies(wild.id);
  const B = {
    kind: 'wild', enemy: wild, playerIdx: firstHealthy(),
    phase: 'anim', menu: 0, moveSel: 0, bagSel: 0, teamSel: 0,
    queue: [], hpShownE: wild.hp, hpShownP: 0, shakeE: 0, shakeP: 0,
    flashE: 0, flashP: 0, enemyScale: 1, canRun: true, caught: false, over: false,
  };
  G.battle = B; G.scene = SCENE.BATTLE;
  B.hpShownP = pActive().hp;
  B.queue = [
    bSay(['A wild ' + wild.species.name + ' appeared!']),
    bSay(['Go, ' + pActive().nick + '!']),
  ];
  B.nextPhase = 'menu';
  bRun();
}

function startRivalBattle() {
  const others = Object.keys(TAMERS).filter(k => k !== G.tamer);
  const rk = pick(others);
  const lvl = max(5, Math.round(avgPartyLevel()));
  const team = [
    makeCreature(pick(['voltpip', 'sproutle']), lvl),
    makeCreature(pick(['emberlit', 'aquashell']), lvl + 1),
  ];
  team.forEach(c => seeSpecies(c.id));
  const B = {
    kind: 'rival', rival: rk, enemyTeam: team, enemyIdx: 0, enemy: team[0],
    playerIdx: firstHealthy(),
    phase: 'anim', menu: 0, moveSel: 0, bagSel: 0, teamSel: 0,
    queue: [], hpShownE: team[0].hp, hpShownP: 0, shakeE: 0, shakeP: 0,
    flashE: 0, flashP: 0, enemyScale: 1, canRun: false, caught: false, over: false,
  };
  G.battle = B; G.scene = SCENE.BATTLE;
  B.hpShownP = pActive().hp;
  B.queue = [
    bSay(['Rival ' + TAMERS[rk].name + ' blocks the path!', TAMERS[rk].name + ': Let\u2019s see how far you\u2019ve come!']),
    bSay([TAMERS[rk].name + ' sent out ' + team[0].species.name + '!']),
    bSay(['Go, ' + pActive().nick + '!']),
  ];
  B.nextPhase = 'menu';
  bRun();
}

// ---------- enemy AI ----------
function enemyChooseMove() {
  const e = eActive(), p = pActive();
  const usable = e.moves.filter(m => m.pp > 0);
  const list = usable.length ? usable : e.moves;
  // 60% pick the strongest effective move
  if (random() < 0.6) {
    let best = list[0], bestScore = -1;
    for (const m of list) {
      const md = MOVES[m.id];
      const score = (md.power || 0) * typeMultiplier(md.type, p.species.type);
      if (score > bestScore) { bestScore = score; best = m; }
    }
    return best;
  }
  return pick(list);
}

// ---------- resolving a move ----------
function performMove(attacker, defender, moveSlot, isPlayer) {
  const B = G.battle;
  const md = MOVES[moveSlot.id];
  const steps = [];
  steps.push(bDo(() => { if (moveSlot.pp > 0) moveSlot.pp--; }));
  steps.push(bSay([(isPlayer ? attacker.nick : (B.kind === 'rival' ? 'Foe ' : 'Wild ') + attacker.nick) + ' used ' + md.name + '!']));

  // accuracy
  if (random() * 100 > md.acc) {
    steps.push(bSay(['\u2026but it missed!']));
    return steps;
  }

  if (md.category === 'status') {
    steps.push(bDo(() => {
      attacker.statStages[md.stat] = clampNum((attacker.statStages[md.stat] || 0) + md.stage, -6, 6);
      Audio.select();
    }));
    steps.push(bSay([attacker.nick + '\u2019s ' + (md.stat === 'atk' ? 'attack' : 'defense') + ' rose!']));
    return steps;
  }

  const res = damageCalc(attacker, defender, md);
  steps.push(bDo(() => {
    defender.hp = max(0, defender.hp - res.dmg);
    if (isPlayer) { B.shakeE = 0.35; B.flashE = 0.2; } else { B.shakeP = 0.35; B.flashP = 0.2; }
    if (res.mult > 1) Audio.superhit(); else if (res.mult < 1) Audio.weak(); else Audio.hit();
  }));
  if (res.crit) steps.push(bSay(['A critical hit!']));
  if (res.mult > 1) steps.push(bSay(['It\u2019s super effective!']));
  else if (res.mult < 1) steps.push(bSay(['It\u2019s not very effective\u2026']));
  return steps;
}

function faintSteps(fainted, isEnemy) {
  const B = G.battle;
  const steps = [];
  steps.push(bDo(() => { Audio.faint(); if (isEnemy) B.enemyScale = 1; }));
  // shrink animation
  steps.push(() => {
    const iv = setInterval(() => {
      if (isEnemy) B.enemyScale = max(0, B.enemyScale - 0.12);
      if (B.enemyScale <= 0 || !isEnemy) { clearInterval(iv); bRun(); }
    }, 30);
    if (!isEnemy) bRun();
  });
  steps.push(bSay([(isEnemy ? (B.kind === 'rival' ? 'Foe ' : 'Wild ') : '') + fainted.nick + ' fainted!']));
  return steps;
}

// XP + level-up steps for the active party member after an enemy faints.
function xpGainSteps(defeatedEnemy) {
  const learner = pActive();
  const reward = xpReward(defeatedEnemy);
  const steps = [];
  steps.push(bSay([learner.nick + ' gained ' + reward + ' EXP!']));
  steps.push(() => {
    const r = grantXp(learner, reward);
    if (r.levels.length) {
      Audio.levelup();
      const lines = [learner.nick + ' grew to Lv. ' + learner.level + '!'];
      r.learned.forEach(mn => lines.push(learner.nick + ' learned ' + mn + '!'));
      Dialog.start(lines, () => bRun());
    } else bRun();
  });
  return steps;
}

// Steps that actually END a battle in the player's favour.
function endWinSteps() {
  const B = G.battle;
  const steps = [];
  if (B.kind === 'rival') {
    steps.push(bDo(() => { G.rivalBeaten = true; G.coins += 300; }));
    steps.push(bSay(['You defeated Rival ' + TAMERS[B.rival].name + '!', 'You earned 300 coins!']));
  }
  steps.push(bDo(() => { B.over = true; B.phase = 'result'; finishBattle('win'); }));
  return steps;
}

// Shared resolution when EITHER side faints. Rebuilds the queue with the
// appropriate tail (faint anim -> xp / next foe / switch / win / lose).
function resolveFaint(def) {
  const B = G.battle;
  const e = eActive();
  const isEnemyDown = (def === e);
  const tail = faintSteps(def, isEnemyDown);
  if (isEnemyDown) {
    tail.push(...xpGainSteps(def));
    if (B.kind === 'rival' && B.enemyTeam && B.enemyIdx < B.enemyTeam.length - 1) {
      // send out the rival's next creature instead of ending the battle
      tail.push(bDo(() => {
        B.enemyIdx++;
        B.enemy = B.enemyTeam[B.enemyIdx];
        B.hpShownE = B.enemy.hp;
        B.enemyScale = 1;
        seeSpecies(B.enemy.id);
      }));
      tail.push(bSay(['Rival ' + TAMERS[B.rival].name + ' sent out ' + B.enemy.species.name + '!']));
      tail.push(bDo(() => { B.phase = 'menu'; }));
    } else {
      tail.push(...endWinSteps());
    }
  } else {
    // a player creature fainted
    if (partyWiped()) tail.push(...loseSteps());
    else tail.push(bDo(() => { B.phase = 'team'; B.forceSwitch = true; }));
  }
  B.queue = tail; bRun();
}

function loseSteps() {
  return [
    bSay(['Your team can no longer battle\u2026']),
    bSay(['You scramble back to the lab.']),
    bDo(() => { G.battle.over = true; finishBattle('lose'); }),
  ];
}

function finishBattle(result) {
  const B = G.battle;
  if (result === 'lose') {
    healParty();
    G.player.col = 12; G.player.row = 11;
  }
  saveGame();
  setTimeout(() => { G.battle = null; enterOverworld(); }, 700);
}

// ---------- a full turn ----------
function takePlayerTurn(playerMoveSlot) {
  const B = G.battle;
  const p = pActive(), e = eActive();
  const eMove = enemyChooseMove();
  const pMd = MOVES[playerMoveSlot.id], eMd = MOVES[eMove.id];
  const pPrio = pMd.priority || 0, ePrio = eMd.priority || 0;
  let playerFirst;
  if (pPrio !== ePrio) playerFirst = pPrio > ePrio;
  else if (effStat(p, 'spd') !== effStat(e, 'spd')) playerFirst = effStat(p, 'spd') > effStat(e, 'spd');
  else playerFirst = random() < 0.5;

  const first = playerFirst
    ? { atk: p, def: e, slot: playerMoveSlot, isP: true }
    : { atk: e, def: p, slot: eMove, isP: false };
  const second = playerFirst
    ? { atk: e, def: p, slot: eMove, isP: false }
    : { atk: p, def: e, slot: playerMoveSlot, isP: true };

  // First attacker acts. If the defender survives, the second attacker acts.
  const q = [];
  q.push(...performMove(first.atk, first.def, first.slot, first.isP));
  q.push(() => {
    if (first.def.hp <= 0) { resolveFaint(first.def); return; }
    const q2 = [];
    q2.push(...performMove(second.atk, second.def, second.slot, second.isP));
    q2.push(() => {
      if (second.def.hp <= 0) { resolveFaint(second.def); return; }
      B.queue = [bDo(() => { B.phase = 'menu'; })]; bRun();
    });
    B.queue = q2; bRun();
  });
  B.queue = q; B.phase = 'anim'; bRun();
}

// enemy-only turn (used after a failed catch / after switching)
function enemyOnlyTurn() {
  const B = G.battle;
  const p = pActive(), e = eActive();
  const eMove = enemyChooseMove();
  const seq = performMove(e, p, eMove, false);
  seq.push(() => {
    if (p.hp <= 0) { resolveFaint(p); return; }
    B.queue = [bDo(() => { B.phase = 'menu'; })]; bRun();
  });
  B.queue = seq; B.phase = 'anim'; bRun();
}

// ---------- catching ----------
function tryCatch() {
  const B = G.battle;
  if (G.bag.orb <= 0) { Dialog.start(['You have no Bind Orbs left!'], () => { B.phase = 'menu'; }); return; }
  const e = eActive();
  const chance = catchChance(e, 0);
  B.phase = 'anim';
  B.queue = [
    bDo(() => { G.bag.orb--; Audio.catchTry(); }),
    bSay(['You threw a Bind Orb!']),
    bDo(() => { B.orbShake = 0; }),
    bWait(0.8),
  ];
  if (random() < chance) {
    B.queue.push(bDo(() => { Audio.caught(); catchSpecies(e.id); G.totalCaught++; }));
    B.queue.push(bSay(['Gotcha! ' + e.species.name + ' was caught!']));
    B.queue.push(() => {
      if (G.party.length < 6) { G.party.push(e); Dialog.start([e.species.name + ' joined your team!'], () => bRun()); }
      else Dialog.start(['Your team is full \u2014 ' + e.species.name + ' was sent to the reserve.'], () => bRun());
    });
    B.queue.push(bDo(() => { B.over = true; saveGame(); finishBattle('win'); }));
    bRun();
  } else {
    const near = chance > 0.5;
    B.queue.push(bSay([near ? 'So close! It broke free!' : 'Oh no \u2014 it escaped the orb!']));
    B.queue.push(() => { enemyOnlyTurn(); });
    bRun();
  }
}

// ---------- switching ----------
function switchTo(idx) {
  const B = G.battle;
  if (idx === B.playerIdx || G.party[idx].hp <= 0) { Audio.bump(); return; }
  const forced = B.forceSwitch;
  B.playerIdx = idx; B.forceSwitch = false;
  B.hpShownP = pActive().hp;
  if (forced) {
    B.phase = 'anim';
    B.queue = [bSay(['Go, ' + pActive().nick + '!']), bDo(() => { B.phase = 'menu'; })];
    bRun();
  } else {
    // switching costs your turn -> enemy attacks
    B.phase = 'anim';
    B.queue = [bSay(['Come back! Go, ' + pActive().nick + '!'])];
    B.queue.push(() => { enemyOnlyTurn(); });
    bRun();
  }
}

// ---------- run ----------
function tryRun() {
  const B = G.battle;
  if (!B.canRun) { Dialog.start(['You can\u2019t flee from a rival battle!'], () => { B.phase = 'menu'; }); return; }
  const p = pActive(), e = eActive();
  const ok = effStat(p, 'spd') >= effStat(e, 'spd') || random() < 0.6;
  B.phase = 'anim';
  if (ok) {
    B.queue = [bDo(() => Audio.flee()), bSay(['You got away safely!']), bDo(() => { B.over = true; finishBattle('run'); })];
  } else {
    B.queue = [bSay(['Couldn\u2019t get away!'])];
    B.queue.push(() => enemyOnlyTurn());
  }
  bRun();
}

// ---------- update / easing ----------
function updateBattle(dt) {
  const B = G.battle; if (!B) return;
  Dialog.update(dt);
  // ease hp bars
  const p = pActive(), e = eActive();
  B.hpShownP += (p.hp - B.hpShownP) * min(1, dt * 8);
  B.hpShownE += (e.hp - B.hpShownE) * min(1, dt * 8);
  B.shakeE = max(0, B.shakeE - dt); B.shakeP = max(0, B.shakeP - dt);
  B.flashE = max(0, B.flashE - dt); B.flashP = max(0, B.flashP - dt);
}

// ---------- rendering ----------
function drawCreatureCard(x, y, w, c, showHpNum) {
  panel(x, y, w, showHpNum ? 92 : 64, UI.panel, UI.accent, 10, 3);
  uiText(c.nick, x + 14, y + 8, 19, UI.cream);
  uiText('Lv.' + c.level, x + w - 62, y + 8, 16, UI.accent);
  typeBadge(x + w - 74, y + 30, c.species.type);
  hpBar(x + 14, y + 36, w - 90, c.hp, c.maxHp, (c === pActive()) ? G.battle.hpShownP : G.battle.hpShownE);
  if (showHpNum) {
    uiText(Math.ceil((c === pActive() ? G.battle.hpShownP : G.battle.hpShownE)) + ' / ' + c.maxHp, x + 14, y + 52, 15, UI.cream);
    xpBar(x + 14, y + 76, w - 28, c);
  }
}

function battleMenu() {
  const B = G.battle;
  const opts = ['Fight', 'Bag', 'Team', B.canRun ? 'Run' : '\u2014'];
  const x0 = 520, y0 = 452, bw = 220, bh = 60, gap = 12;
  for (let i = 0; i < 4; i++) {
    const bx = x0 + (i % 2) * (bw + gap);
    const by = y0 + floor(i / 2) * (bh + gap);
    button(bx, by, bw, bh, opts[i], B.menu === i, 22);
  }
  // left text prompt
  panel(20, 452, 480, 132, UI.cream, UI.accent2, 12, 4);
  uiText('What will ' + pActive().nick + ' do?', 40, 500, 24, UI.ink);
}

function battleMoveMenu() {
  const B = G.battle;
  const p = pActive();
  const x0 = 20, y0 = 452, bw = 340, bh = 58, gap = 10;
  for (let i = 0; i < 4; i++) {
    const bx = x0 + (i % 2) * (bw + gap);
    const by = y0 + floor(i / 2) * (bh + gap);
    if (i < p.moves.length) {
      const m = p.moves[i], md = MOVES[m.id];
      const hover = button(bx, by, bw, bh, '', B.moveSel === i, 18);
      push(); textAlign(LEFT, CENTER); textFont(FONT_UI); fill(UI.ink);
      textSize(19); text(md.name, bx + 14, by + bh / 2 - 8);
      textSize(13); fill(60);
      text('PP ' + m.pp + '/' + m.maxpp, bx + 14, by + bh / 2 + 12);
      noStroke(); fill(TYPE_COLOR[md.type]); rect(bx + bw - 66, by + bh / 2 - 10, 54, 20, 6);
      fill(255); textAlign(CENTER, CENTER); textSize(12); text(md.type, bx + bw - 39, by + bh / 2);
      pop();
    } else {
      push(); fill(UI.panelLite); stroke(UI.accent2); strokeWeight(2); rect(bx, by, bw, bh, 10); pop();
    }
  }
  panel(720, 452, 260, 132, UI.cream, UI.accent2, 12, 4);
  uiText('Back: Esc', 740, 546, 15, UI.ink);
  if (p.moves[B.moveSel]) {
    const md = MOVES[p.moves[B.moveSel].id];
    uiText('Power ' + (md.power || '\u2014'), 740, 470, 16, UI.ink);
    uiText('Acc ' + md.acc, 740, 494, 16, UI.ink);
    uiText(md.category, 740, 518, 16, UI.ink);
  }
}

function battleBagMenu() {
  const B = G.battle;
  const items = [
    { name: 'Bind Orb', qty: G.bag.orb, act: 'orb' },
    { name: 'Potion (+20 HP)', qty: G.bag.potion, act: 'potion' },
  ];
  panel(20, 452, 960, 132, UI.cream, UI.accent2, 12, 4);
  for (let i = 0; i < items.length; i++) {
    const by = 468 + i * 50;
    const hot = B.bagSel === i;
    push(); fill(hot ? UI.accent : UI.cream); stroke(UI.accent2); strokeWeight(2);
    rect(40, by, 500, 42, 8);
    fill(UI.ink); noStroke(); textFont(FONT_UI); textSize(20); textAlign(LEFT, CENTER);
    text(items[i].name, 56, by + 21);
    textAlign(RIGHT, CENTER); text('x' + items[i].qty, 520, by + 21);
    pop();
  }
  uiText('Enter: use  \u2022  Esc: back', 600, 500, 18, UI.ink);
}

function battleTeamMenu() {
  const B = G.battle;
  panel(20, 300, 960, 284, UI.cream, UI.accent2, 12, 4);
  uiText(B.forceSwitch ? 'Choose your next partner!' : 'Send out which partner?', 44, 316, 22, UI.ink);
  for (let i = 0; i < G.party.length; i++) {
    const c = G.party[i];
    const by = 352 + i * 36;
    const hot = B.teamSel === i;
    push();
    fill(hot ? UI.accent : (c.hp <= 0 ? '#e7c9c9' : UI.cream));
    stroke(UI.accent2); strokeWeight(2); rect(44, by, 912, 32, 6);
    fill(UI.ink); noStroke(); textFont(FONT_UI); textSize(17); textAlign(LEFT, CENTER);
    text((i === B.playerIdx ? '\u25B6 ' : '   ') + c.nick + '  Lv.' + c.level, 58, by + 16);
    textAlign(RIGHT, CENTER);
    text('HP ' + c.hp + '/' + c.maxHp + (c.hp <= 0 ? '  (fainted)' : ''), 940, by + 16);
    pop();
  }
  if (!B.forceSwitch) uiText('Esc: back', 840, 316, 15, UI.ink);
}

function drawBattle() {
  const B = G.battle; if (!B) return;
  // sky gradient
  for (let y = 0; y < 440; y += 4) {
    const t = y / 440;
    stroke(lerpColor(color('#bfe3ff'), color('#eaf6ff'), t)); line(0, y, VIEW_W, y);
  }
  noStroke();
  // ground
  fill('#cde6a6'); ellipse(760, 250, 320, 90);       // enemy platform
  fill('#bfe08f'); ellipse(240, 430, 380, 110);       // player platform
  // battle band
  fill('#0b1b3a'); rect(0, 440, VIEW_W, 4);

  const e = eActive(), p = pActive();

  // enemy creature
  push();
  const ex = 760 + (B.shakeE > 0 ? sin(frameCount) * 6 : 0);
  drawCreatureArt(e.species.art, ex, 210, 0.62 * (B.enemyScale === undefined ? 1 : B.enemyScale), false);
  if (B.flashE > 0) { fill(255, 80, 80, 120 * (B.flashE / 0.2)); ellipse(760, 210, 220, 220); }
  pop();

  // player creature (mirrored to face the foe)
  push();
  const px = 240 + (B.shakeP > 0 ? sin(frameCount) * 6 : 0);
  drawCreatureArt(p.species.art, px, 380, 0.9, true);
  if (B.flashP > 0) { fill(255, 80, 80, 120 * (B.flashP / 0.2)); ellipse(240, 380, 260, 260); }
  pop();

  // info cards
  drawCreatureCard(40, 40, 320, e, false);
  drawCreatureCard(620, 320, 340, p, true);

  // bottom UI by phase
  if (Dialog.active) {
    Dialog.draw(20, 452, VIEW_W - 40, 132);
  } else {
    switch (B.phase) {
      case 'menu': battleMenu(); break;
      case 'move': battleMoveMenu(); break;
      case 'bag': battleBagMenu(); break;
      case 'team': battleTeamMenu(); break;
      default:
        panel(20, 452, VIEW_W - 40, 132, UI.cream, UI.accent2, 12, 4);
        uiText('\u2026', 40, 500, 24, UI.ink);
    }
  }
}

// ---------- input ----------
function battleKey(k, code) {
  const B = G.battle; if (!B) return;
  if (Dialog.active) { Dialog.advance(); return; }
  const p = pActive();
  if (B.phase === 'menu') {
    if (code === LEFT_ARROW || k === 'a') B.menu = (B.menu % 2 === 1) ? B.menu - 1 : B.menu;
    else if (code === RIGHT_ARROW || k === 'd') B.menu = (B.menu % 2 === 0) ? min(3, B.menu + 1) : B.menu;
    else if (code === UP_ARROW || k === 'w') B.menu = max(0, B.menu - 2);
    else if (code === DOWN_ARROW || k === 's') B.menu = min(3, B.menu + 2);
    else if (code === ENTER || k === ' ') { Audio.blip(); chooseMainMenu(B.menu); }
  } else if (B.phase === 'move') {
    if (code === LEFT_ARROW) B.moveSel = max(0, B.moveSel - 1);
    else if (code === RIGHT_ARROW) B.moveSel = min(p.moves.length - 1, B.moveSel + 1);
    else if (code === UP_ARROW) B.moveSel = max(0, B.moveSel - 2);
    else if (code === DOWN_ARROW) B.moveSel = min(p.moves.length - 1, B.moveSel + 2);
    else if (code === ESCAPE) B.phase = 'menu';
    else if (code === ENTER || k === ' ') {
      const slot = p.moves[B.moveSel];
      if (slot && slot.pp > 0) { Audio.blip(); takePlayerTurn(slot); }
      else if (slot) Dialog.start(['No PP left for that move!']);
    }
  } else if (B.phase === 'bag') {
    if (code === UP_ARROW) B.bagSel = 0;
    else if (code === DOWN_ARROW) B.bagSel = 1;
    else if (code === ESCAPE) B.phase = 'menu';
    else if (code === ENTER || k === ' ') useBagItem(B.bagSel);
  } else if (B.phase === 'team') {
    if (code === UP_ARROW) B.teamSel = max(0, B.teamSel - 1);
    else if (code === DOWN_ARROW) B.teamSel = min(G.party.length - 1, B.teamSel + 1);
    else if (code === ESCAPE && !B.forceSwitch) B.phase = 'menu';
    else if (code === ENTER || k === ' ') switchTo(B.teamSel);
  }
}

function chooseMainMenu(i) {
  const B = G.battle;
  if (i === 0) B.phase = 'move';
  else if (i === 1) B.phase = 'bag';
  else if (i === 2) { B.phase = 'team'; B.forceSwitch = false; }
  else if (i === 3) tryRun();
}

function useBagItem(i) {
  const B = G.battle;
  if (i === 0) { if (G.bag.orb > 0) tryCatch(); else Dialog.start(['No Bind Orbs left!']); }
  else {
    if (G.bag.potion <= 0) { Dialog.start(['No Potions left!']); return; }
    const p = pActive();
    if (p.hp >= p.maxHp) { Dialog.start([p.nick + ' is already at full HP!']); return; }
    G.bag.potion--; Audio.heal();
    p.hp = min(p.maxHp, p.hp + 20);
    B.phase = 'anim';
    B.queue = [bSay(['You used a Potion. ' + p.nick + ' recovered HP!'])];
    B.queue.push(() => enemyOnlyTurn());
    bRun();
  }
}

function battleMouse() {
  const B = G.battle; if (!B) return;
  if (Dialog.active) { Dialog.advance(); return; }
  if (B.phase === 'menu') {
    const opts = 4, x0 = 520, y0 = 452, bw = 220, bh = 60, gap = 12;
    for (let i = 0; i < opts; i++) {
      const bx = x0 + (i % 2) * (bw + gap), by = y0 + floor(i / 2) * (bh + gap);
      if (inside(bx, by, bw, bh)) { Audio.blip(); chooseMainMenu(i); return; }
    }
  } else if (B.phase === 'move') {
    const p = pActive(), x0 = 20, y0 = 452, bw = 340, bh = 58, gap = 10;
    for (let i = 0; i < p.moves.length; i++) {
      const bx = x0 + (i % 2) * (bw + gap), by = y0 + floor(i / 2) * (bh + gap);
      if (inside(bx, by, bw, bh)) { const slot = p.moves[i]; if (slot.pp > 0) { Audio.blip(); takePlayerTurn(slot); } return; }
    }
    if (inside(720, 452, 260, 132)) B.phase = 'menu';
  } else if (B.phase === 'bag') {
    for (let i = 0; i < 2; i++) { if (inside(40, 468 + i * 50, 500, 42)) { useBagItem(i); return; } }
  } else if (B.phase === 'team') {
    for (let i = 0; i < G.party.length; i++) { if (inside(44, 352 + i * 36, 912, 32)) { switchTo(i); return; } }
  }
}
