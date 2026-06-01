var GameEngine = (function() {
  var SAVE_KEY       = 'ss_rpg_save';
  var CHECKPOINT_KEY = 'ss_checkpoint';

  var state          = null;
  var pendingLevelUps = [];
  var LOADED_CHAPTERS = {};
  var isInitializing  = false;
  var buttonsWired    = false;

  /* ── FRESH STATE ── */
  function createFreshState(name) {
    return {
      playerName: name || 'Sunny',
      sceneId: 'ch01_intro',
      stats: {
        hp: 80, maxHp: 80,
        mp: 40, maxMp: 40,
        attack: 8, defense: 3, speed: 12,
        level: 1, xp: 0, xpToNext: 100,
        gold: 0
      },
      flags: {},
      inventory: [],
      skills: [],
      shielded: false
    };
  }

  /* ── EFFECT DSL ── */
  function applyEffects(effects, state) {
    if (!effects) return;
    if (typeof effects === 'function') { effects(state); return; }
    if (!Array.isArray(effects)) return;
    effects.forEach(function(op) {
      switch (op.op) {
        case 'addXp':      state.stats.xp   += (op.value || 0); break;
        case 'addGold':    state.stats.gold  += (op.value || 0); break;
        case 'addHp':      state.stats.hp = Math.min(state.stats.maxHp, state.stats.hp + (op.value || 0)); break;
        case 'addMp':      state.stats.mp = Math.min(state.stats.maxMp, state.stats.mp + (op.value || 0)); break;
        case 'setHp':      state.stats.hp = Math.max(1, Math.floor(state.stats.maxHp * (op.pct || 1))); break;
        case 'setMp':      state.stats.mp = Math.max(0, Math.floor(state.stats.maxMp * (op.pct || 1))); break;
        case 'modStat':    if (state.stats[op.stat] !== undefined) state.stats[op.stat] += (op.value || 0); break;
        case 'setStat':    if (state.stats[op.stat] !== undefined) state.stats[op.stat] = op.value; break;
        case 'setFlag':    state.flags[op.name] = (op.value !== undefined ? op.value : true); break;
        case 'addItem':    state.inventory.push(op.id); break;
        case 'removeItem': {
          var idx = state.inventory.indexOf(op.id);
          if (idx > -1) state.inventory.splice(idx, 1);
          break;
        }
        case 'addSkill':
          if (state.skills.indexOf(op.id) === -1) state.skills.push(op.id);
          break;
        case 'removeSkill': {
          var si = state.skills.indexOf(op.id);
          if (si > -1) state.skills.splice(si, 1);
          break;
        }
      }
    });
  }

  /* ── SAVE / LOAD ── */
  function saveGame() {
    var toSave = JSON.parse(JSON.stringify(state));
    toSave.combat = null;
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
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

  /* ── CHECKPOINTS ── */
  function saveCheckpoint() {
    if (!state) return;
    var toSave = JSON.parse(JSON.stringify(state));
    toSave.combat = null;
    var chapterId = getChapterIdFromSceneId(toSave.sceneId);
    var cp = { chapterId: chapterId, state: toSave, timestamp: Date.now() };
    localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(cp));
    GameUI.showToast('Checkpoint saved — Chapter ' + (chapterId || '?'));
    GameUI.updateCheckpointButton();
  }

  function loadCheckpointData() {
    var raw = localStorage.getItem(CHECKPOINT_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch(e) { return null; }
  }

  function hasCheckpoint() {
    return !!localStorage.getItem(CHECKPOINT_KEY);
  }

  function clearCheckpoint() {
    localStorage.removeItem(CHECKPOINT_KEY);
  }

  /* ── CHAPTER LOADING ── */
  function getChapterIdFromSceneId(sceneId) {
    if (!sceneId) return null;
    var m = sceneId.match(/^(ch\d+)/);
    return m ? m[1] : null;
  }

  async function loadChapter(chapterId) {
    if (LOADED_CHAPTERS[chapterId]) return;
    GameUI.showLoadingOverlay();
    try {
      var resp = await fetch('story/' + chapterId + '.json');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      Object.assign(SCENES, data.scenes || {});
      LOADED_CHAPTERS[chapterId] = true;
    } catch(e) {
      console.error('Failed to load chapter:', chapterId, e);
      GameUI.showToast('Could not load chapter: ' + chapterId);
    }
    GameUI.hideLoadingOverlay();
  }

  /* ── STATE GETTERS ── */
  function getState() { return state; }

  /* ── REQUIREMENTS ── */
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
    if (req.skill)  return '[Requires: ' + (SKILLS[req.skill]  ? SKILLS[req.skill].name  : req.skill) + ']';
    if (req.item)   return '[Requires: ' + (ITEMS[req.item]    ? ITEMS[req.item].name    : req.item)  + ']';
    if (req.flag)   return '[Requires specific knowledge]';
    if (req.stat)   return '[Requires ' + req.stat + ' ≥ ' + req.value + ']';
    if (req.level)  return '[Requires Level ' + req.level + ']';
    return '';
  }

  /* ── LEVEL UP ── */
  function checkLevelUp() {
    while (state.stats.xp >= state.stats.xpToNext) {
      state.stats.xp      -= state.stats.xpToNext;
      state.stats.level   += 1;
      state.stats.xpToNext = Math.floor(100 * Math.pow(1.4, state.stats.level - 1));
      state.stats.maxHp   += 15;
      state.stats.hp       = state.stats.maxHp;
      state.stats.maxMp   += 8;
      state.stats.mp       = state.stats.maxMp;
      state.stats.attack  += 3;
      state.stats.defense += 2;
      pendingLevelUps.push(state.stats.level);
    }
  }

  function flushLevelUps(callback) {
    if (pendingLevelUps.length === 0) { if (callback) callback(); return; }
    var lvl = pendingLevelUps.shift();
    GameUI.showLevelUp(lvl, function() { flushLevelUps(callback); });
  }

  /* ── NAVIGATION ── */
  async function navigateTo(sceneId) {
    if (sceneId === '__newgame__') {
      resetGame();
      clearCheckpoint();
      await init();
      return;
    }

    if (sceneId === '__checkpoint__') {
      var cp = loadCheckpointData();
      if (!cp) { GameUI.showToast('No checkpoint found.'); return; }
      state = cp.state;
      var cpChapterId = cp.chapterId;
      if (cpChapterId && !LOADED_CHAPTERS[cpChapterId]) {
        await loadChapter(cpChapterId);
      }
      GameUI.showToast('Checkpoint loaded.');
      await navigateTo(state.sceneId);
      return;
    }

    var chapterId = getChapterIdFromSceneId(sceneId);

    if (chapterId && !LOADED_CHAPTERS[chapterId]) {
      await loadChapter(chapterId);
    }

    /* Auto-checkpoint when entering a chapter for the first time in this session */
    if (!isInitializing && chapterId) {
      var savedCp = loadCheckpointData();
      var savedCpChapter = savedCp ? savedCp.chapterId : null;
      if (chapterId !== savedCpChapter) {
        state.sceneId = sceneId;
        saveCheckpoint();
      }
    }

    var scene = SCENES[sceneId];
    if (!scene) { console.error('Scene not found:', sceneId); return; }

    state.sceneId = sceneId;
    applyEffects(scene.onEnter, state);
    checkLevelUp();
    saveGame();

    GameUI.renderScene(scene, state);
    GameUI.renderStats(state);
    GameUI.renderInventory(state);
    GameUI.renderSkills(state);
    GameUI.updateCheckpointButton();

    flushLevelUps(null);
  }

  /* ── CHOICES ── */
  function makeChoice(choice) {
    if (!checkRequirement(choice.requires)) return;
    applyEffects(choice.effect, state);
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

  /* ── ITEMS ── */
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

  /* ── INIT ── */
  async function init() {
    isInitializing = true;

    if (!buttonsWired) {
      buttonsWired = true;

      document.getElementById('btn-save').addEventListener('click', function() {
        if (!state) return;
        saveGame();
        GameUI.showToast('Game saved.');
      });

      document.getElementById('btn-load').addEventListener('click', function() {
        var s = loadGame();
        if (!s) { GameUI.showToast('No save found.'); return; }
        state = s;
        navigateTo(state.sceneId);
        GameUI.showToast('Game loaded.');
      });

      document.getElementById('btn-reset').addEventListener('click', function() {
        if (!confirm('Start a new game? All progress will be lost.')) return;
        resetGame();
        clearCheckpoint();
        state = null;
        GameUI.showNameModal(function(name) {
          state = createFreshState(name);
          navigateTo('ch01_intro');
        });
      });

      document.getElementById('btn-checkpoint').addEventListener('click', function() {
        if (!hasCheckpoint()) { GameUI.showToast('No checkpoint saved yet.'); return; }
        if (!confirm('Load last checkpoint? Progress since then will be lost.')) return;
        navigateTo('__checkpoint__');
      });
    }

    var saved = loadGame();
    if (saved) {
      state = saved;
      var chapterId = getChapterIdFromSceneId(state.sceneId);
      if (chapterId) await loadChapter(chapterId);
      isInitializing = false;
      GameUI.renderScene(SCENES[state.sceneId], state);
      GameUI.renderStats(state);
      GameUI.renderInventory(state);
      GameUI.renderSkills(state);
      GameUI.updateCheckpointButton();
    } else {
      isInitializing = false;
      GameUI.showNameModal(function(name) {
        state = createFreshState(name);
        navigateTo('ch01_intro');
      });
    }
  }

  return {
    init: init,
    navigateTo: navigateTo,
    makeChoice: makeChoice,
    useItem: useItem,
    getState: getState,
    checkRequirement: checkRequirement,
    requirementLabel: requirementLabel,
    checkLevelUp: checkLevelUp,
    hasCheckpoint: hasCheckpoint,
    saveCheckpoint: saveCheckpoint
  };
})();
