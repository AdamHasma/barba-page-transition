var GameEngine = (function() {
  var SAVE_KEY = 'isekai_rpg_save';
  var state = null;
  var pendingLevelUps = [];

  function createFreshState(name) {
    return {
      playerName: name || 'Hero',
      sceneId: 'scene_death',
      stats: {
        hp: 100, maxHp: 100,
        mp: 50,  maxMp: 50,
        attack: 12, defense: 5, speed: 10,
        level: 1, xp: 0, xpToNext: 100,
        gold: 0
      },
      flags: {},
      inventory: [],
      skills: [],
      shielded: false
    };
  }

  function saveGame() {
    var toSave = JSON.parse(JSON.stringify(state));
    toSave.combat = null;
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    GameUI.showToast('Game saved!');
  }

  function loadGame() {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch(e) { return null; }
  }

  function hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  function resetGame() {
    localStorage.removeItem(SAVE_KEY);
  }

  function getState() { return state; }

  function checkRequirement(req) {
    if (!req) return true;
    if (req.skill  && state.skills.indexOf(req.skill) === -1) return false;
    if (req.item   && state.inventory.indexOf(req.item) === -1) return false;
    if (req.flag   && !state.flags[req.flag]) return false;
    if (req.stat   && state.stats[req.stat] < req.value) return false;
    if (req.level  && state.stats.level < req.level) return false;
    return true;
  }

  function requirementLabel(req) {
    if (!req) return '';
    if (req.skill)  return '[Requires: ' + (SKILLS[req.skill] ? SKILLS[req.skill].name : req.skill) + ']';
    if (req.item)   return '[Requires: ' + (ITEMS[req.item]   ? ITEMS[req.item].name   : req.item)  + ']';
    if (req.flag)   return '[Requires specific knowledge]';
    if (req.stat)   return '[Requires ' + req.stat + ' ≥ ' + req.value + ']';
    if (req.level)  return '[Requires Level ' + req.level + ']';
    return '';
  }

  function checkLevelUp() {
    while (state.stats.xp >= state.stats.xpToNext) {
      state.stats.xp -= state.stats.xpToNext;
      state.stats.level += 1;
      state.stats.xpToNext = Math.floor(100 * Math.pow(1.4, state.stats.level - 1));
      state.stats.maxHp += 15;
      state.stats.hp = state.stats.maxHp;
      state.stats.maxMp += 8;
      state.stats.mp = state.stats.maxMp;
      state.stats.attack += 3;
      state.stats.defense += 2;
      pendingLevelUps.push(state.stats.level);
    }
  }

  function flushLevelUps(callback) {
    if (pendingLevelUps.length === 0) { if (callback) callback(); return; }
    var lvl = pendingLevelUps.shift();
    GameUI.showLevelUp(lvl, function() { flushLevelUps(callback); });
  }

  function navigateTo(sceneId) {
    if (sceneId === '__newgame__') {
      resetGame();
      init();
      return;
    }

    var scene = SCENES[sceneId];
    if (!scene) { console.error('Scene not found:', sceneId); return; }

    state.sceneId = sceneId;
    if (scene.onEnter) scene.onEnter(state);

    checkLevelUp();
    saveGame();

    GameUI.renderScene(scene, state);
    GameUI.renderStats(state);
    GameUI.renderInventory(state);
    GameUI.renderSkills(state);

    flushLevelUps(null);
  }

  function makeChoice(choice) {
    if (!checkRequirement(choice.requires)) return;

    if (choice.effect) choice.effect(state);
    checkLevelUp();

    if (choice.next === '__combat__' && choice.combat) {
      var enemyDef = ENEMIES[choice.combat.enemyId];
      if (!enemyDef) { navigateTo(choice.combat.onWin); return; }

      var enemy = JSON.parse(JSON.stringify(enemyDef));
      if (choice.combat.firstStrike && choice.combat.firstStrike > 0) {
        enemy.hp = Math.max(0, enemy.hp - choice.combat.firstStrike);
      }
      if (enemy.hp <= 0) { navigateTo(choice.combat.onWin); return; }

      CombatEngine.start(enemy, choice.combat.onWin, choice.combat.onLose, choice.combat.onFlee);
    } else {
      flushLevelUps(function() { navigateTo(choice.next); });
    }

    GameUI.renderStats(state);
    GameUI.renderInventory(state);
    GameUI.renderSkills(state);
  }

  function useItem(itemId) {
    var idx = state.inventory.indexOf(itemId);
    if (idx === -1) return;
    var item = ITEMS[itemId];
    if (!item || item.type !== 'consumable' || !item.use) return;
    var msg = item.use(state);
    state.inventory.splice(idx, 1);
    GameUI.showToast(msg || 'Used ' + item.name + '.');
    GameUI.renderStats(state);
    GameUI.renderInventory(state);
  }

  function init() {
    var saved = loadGame();
    if (saved) {
      state = saved;
      GameUI.renderScene(SCENES[state.sceneId] || SCENES.scene_death, state);
      GameUI.renderStats(state);
      GameUI.renderInventory(state);
      GameUI.renderSkills(state);
    } else {
      GameUI.showNameModal(function(name) {
        state = createFreshState(name);
        navigateTo('scene_death');
      });
    }

    document.getElementById('btn-save').addEventListener('click', saveGame);
    document.getElementById('btn-load').addEventListener('click', function() {
      var s = loadGame();
      if (!s) { GameUI.showToast('No save found.'); return; }
      state = s;
      navigateTo(state.sceneId);
      GameUI.showToast('Game loaded!');
    });
    document.getElementById('btn-reset').addEventListener('click', function() {
      if (!confirm('Start a new game? Current progress will be lost.')) return;
      resetGame();
      state = null;
      GameUI.showNameModal(function(name) {
        state = createFreshState(name);
        navigateTo('scene_death');
      });
    });
  }

  return {
    init: init,
    navigateTo: navigateTo,
    makeChoice: makeChoice,
    useItem: useItem,
    getState: getState,
    checkRequirement: checkRequirement,
    requirementLabel: requirementLabel,
    checkLevelUp: checkLevelUp
  };
})();
