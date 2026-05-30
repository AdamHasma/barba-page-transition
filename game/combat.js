var CombatEngine = (function() {
  var active = false;
  var currentEnemy = null;
  var onWin, onLose, onFlee;
  var playerTurn = true;
  var log = [];

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function addLog(msg, cls) {
    log.push({ msg: msg, cls: cls || '' });
    if (log.length > 10) log.shift();
    renderLog();
  }

  function renderLog() {
    var el = document.getElementById('combat-log');
    el.innerHTML = '';
    log.forEach(function(entry) {
      var p = document.createElement('p');
      p.className = entry.cls;
      p.textContent = entry.msg;
      el.appendChild(p);
    });
    el.scrollTop = el.scrollHeight;
  }

  function updateEnemyBar() {
    var pct = Math.max(0, currentEnemy.hp / currentEnemy.maxHp * 100);
    document.getElementById('enemy-hp-bar').style.width = pct + '%';
    document.getElementById('enemy-hp-text').textContent = currentEnemy.hp + '/' + currentEnemy.maxHp;
  }

  function setActionsDisabled(disabled) {
    var btns = document.querySelectorAll('#combat-actions button');
    btns.forEach(function(b) { b.disabled = disabled; });
  }

  function renderActions() {
    var state = GameEngine.getState();
    var container = document.getElementById('combat-actions');
    container.innerHTML = '';

    var attackBtn = document.createElement('button');
    attackBtn.className = 'combat-btn attack-btn';
    attackBtn.textContent = '⚔️ Attack';
    attackBtn.addEventListener('click', function() { playerAttack(); });
    container.appendChild(attackBtn);

    state.skills.forEach(function(skillId) {
      var skill = SKILLS[skillId];
      if (!skill || !skill.combatOnly) return;
      var btn = document.createElement('button');
      btn.className = 'combat-btn skill-btn';
      var mpLabel = skill.mpCost > 0 ? ' (' + skill.mpCost + ' MP)' : '';
      btn.textContent = skill.icon + ' ' + skill.name + mpLabel;
      btn.disabled = (state.stats.mp < skill.mpCost);
      btn.addEventListener('click', function() { playerSkill(skillId); });
      container.appendChild(btn);
    });

    var fleeBtn = document.createElement('button');
    fleeBtn.className = 'combat-btn flee-btn';
    fleeBtn.textContent = '🏃 Flee';
    fleeBtn.addEventListener('click', function() { playerFlee(); });
    container.appendChild(fleeBtn);
  }

  function playerAttack() {
    if (!playerTurn || !active) return;
    setActionsDisabled(true);

    var state = GameEngine.getState();
    var raw = state.stats.attack + randInt(-3, 3);
    var crit = Math.random() < 0.1;
    var dmg = Math.max(1, raw - currentEnemy.defense);
    if (crit) dmg = Math.floor(dmg * 1.5);

    currentEnemy.hp = Math.max(0, currentEnemy.hp - dmg);
    updateEnemyBar();

    if (crit) addLog('Critical hit! You strike for ' + dmg + ' damage!', 'crit-msg');
    else addLog('You strike ' + currentEnemy.name + ' for ' + dmg + ' damage!', 'player-action');

    if (currentEnemy.hp <= 0) { endCombat('win'); return; }

    playerTurn = false;
    setTimeout(enemyTurn, 900);
  }

  function playerSkill(skillId) {
    if (!playerTurn || !active) return;
    var state = GameEngine.getState();
    var skill = SKILLS[skillId];
    if (!skill) return;
    if (state.stats.mp < skill.mpCost) { addLog('Not enough MP!', 'system-msg'); return; }

    setActionsDisabled(true);
    state.stats.mp -= skill.mpCost;
    GameUI.renderStats(state);

    var msg = skill.use(state, currentEnemy);
    addLog(msg, 'player-action');
    updateEnemyBar();

    if (currentEnemy.hp <= 0) { endCombat('win'); return; }

    playerTurn = false;
    setTimeout(enemyTurn, 900);
  }

  function playerFlee() {
    if (!playerTurn || !active) return;
    setActionsDisabled(true);

    var state = GameEngine.getState();
    var chance = 40 + (state.stats.speed - currentEnemy.speed) * 5;
    chance = Math.max(15, Math.min(85, chance));

    if (Math.random() * 100 < chance) {
      addLog('You successfully fled!', 'system-msg');
      setTimeout(function() { endCombat('flee'); }, 700);
    } else {
      addLog('Couldn\'t escape!', 'system-msg');
      playerTurn = false;
      setTimeout(enemyTurn, 900);
    }
  }

  function enemyTurn() {
    if (!active) return;
    var state = GameEngine.getState();

    if (state.shielded) {
      state.shielded = false;
      addLog(currentEnemy.name + ' attacks — blocked by Divine Shield!', 'system-msg');
    } else {
      var raw = currentEnemy.attack + randInt(-2, 2);
      var crit = Math.random() < 0.08;
      var dmg = Math.max(1, raw - state.stats.defense);
      if (crit) dmg = Math.floor(dmg * 1.5);

      state.stats.hp = Math.max(0, state.stats.hp - dmg);
      GameUI.renderStats(state);

      if (crit) addLog(currentEnemy.name + ' lands a critical blow for ' + dmg + '!', 'enemy-action');
      else addLog(currentEnemy.name + ' strikes you for ' + dmg + ' damage.', 'enemy-action');
    }

    if (state.stats.hp <= 0) { endCombat('lose'); return; }

    playerTurn = true;
    setActionsDisabled(false);
    renderActions();
  }

  function endCombat(result) {
    active = false;
    var overlay = document.getElementById('combat-overlay');
    overlay.classList.add('hidden');
    log = [];

    var state = GameEngine.getState();

    if (result === 'win') {
      state.stats.xp += currentEnemy.xpReward;
      state.stats.gold += currentEnemy.goldReward;

      if (currentEnemy.lootTable && currentEnemy.lootTable.length > 0) {
        var lootId = currentEnemy.lootTable[randInt(0, currentEnemy.lootTable.length - 1)];
        if (lootId) {
          state.inventory.push(lootId);
          GameUI.showToast('Obtained: ' + (ITEMS[lootId] ? ITEMS[lootId].icon + ' ' + ITEMS[lootId].name : lootId));
        }
      }

      GameEngine.checkLevelUp();
      GameUI.renderStats(state);
      GameEngine.navigateTo(onWin);
    } else if (result === 'lose') {
      GameEngine.navigateTo(onLose);
    } else {
      GameEngine.navigateTo(onFlee);
    }
  }

  function start(enemy, winScene, loseScene, fleeScene) {
    currentEnemy = enemy;
    onWin = winScene;
    onLose = loseScene;
    onFlee = fleeScene;
    active = true;
    playerTurn = true;
    log = [];

    document.getElementById('enemy-name').textContent = enemy.name;
    updateEnemyBar();
    renderActions();

    var overlay = document.getElementById('combat-overlay');
    overlay.classList.remove('hidden');

    addLog('A battle begins! ' + enemy.name + ' appears!', 'system-msg');
  }

  return { start: start };
})();
