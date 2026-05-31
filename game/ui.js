var GameUI = (function() {
  var typewriterTimer = null;
  var typewriterDone = false;
  var fullText = '';
  var fullHtml = '';
  var imageCache = {};

  /* ── MARKDOWN → HTML ── */
  function parseMarkdown(text) {
    var segments = [];
    var regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
    var lastIndex = 0;
    var match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: text.slice(lastIndex, match.index), tag: null });
      }
      if (match[1] !== undefined) {
        segments.push({ text: match[1], tag: 'strong' });
      } else {
        segments.push({ text: match[2], tag: 'em' });
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex), tag: null });
    }
    return segments;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderSegment(seg, partial) {
    var txt = (partial !== undefined) ? seg.text.slice(0, partial) : seg.text;
    var html = escapeHtml(txt).replace(/\n/g, '<br>');
    if (seg.tag && txt.length > 0) return '<' + seg.tag + '>' + html + '</' + seg.tag + '>';
    return html;
  }

  function buildPartialHtml(segments, visibleCount) {
    var html = '';
    var remaining = visibleCount;
    for (var i = 0; i < segments.length && remaining > 0; i++) {
      var seg = segments[i];
      if (remaining >= seg.text.length) {
        html += renderSegment(seg);
        remaining -= seg.text.length;
      } else {
        html += renderSegment(seg, remaining);
        remaining = 0;
      }
    }
    return html;
  }

  function buildFullHtml(segments) {
    return segments.map(function(seg) { return renderSegment(seg); }).join('');
  }

  /* ── IMAGE LOADING ── */
  function loadSceneImage(sceneType, sceneOverride) {
    var url = sceneOverride || IMAGE_MAP[sceneType] || IMAGE_MAP['forest'];
    var bgEl = document.getElementById('scene-bg');

    if (imageCache[url]) {
      bgEl.style.backgroundImage = 'url(' + imageCache[url] + ')';
      bgEl.classList.remove('image-loading');
      bgEl.style.opacity = '1';
      return;
    }

    // Show shimmer immediately while image generates
    bgEl.classList.add('image-loading');
    bgEl.style.opacity = '1';

    var testImg = new Image();
    testImg.onload = function() {
      bgEl.style.backgroundImage = 'url(' + url + ')';
      bgEl.classList.remove('image-loading');
      imageCache[url] = url;
    };
    testImg.onerror = function() {
      var fallback = 'https://picsum.photos/seed/' + encodeURIComponent(sceneType) + '_rpg/1200/600';
      bgEl.style.backgroundImage = 'url(' + fallback + ')';
      bgEl.classList.remove('image-loading');
      imageCache[url] = fallback;
    };
    testImg.src = url;
  }

  /* ── TYPEWRITER ── */
  function typewriterText(text, element, speed) {
    var segments = parseMarkdown(text);
    var totalChars = segments.reduce(function(sum, s) { return sum + s.text.length; }, 0);
    fullText = text;
    fullHtml = buildFullHtml(segments);
    typewriterDone = false;
    if (typewriterTimer) clearInterval(typewriterTimer);
    element.innerHTML = '';
    var i = 0;
    speed = speed || 22;

    typewriterTimer = setInterval(function() {
      if (i < totalChars) {
        i++;
        element.innerHTML = buildPartialHtml(segments, i);
        element.scrollTop = element.scrollHeight;
      } else {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
        typewriterDone = true;
      }
    }, speed);
  }

  function skipTypewriter() {
    if (typewriterTimer) {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }
    var el = document.getElementById('narrative-box');
    el.innerHTML = fullHtml;
    typewriterDone = true;
  }

  /* ── SCENE RENDER ── */
  function renderScene(scene, state) {
    if (!scene) return;

    document.getElementById('scene-title').textContent = scene.title || '';
    loadSceneImage(scene.type, scene.image);

    var narrativeEl = document.getElementById('narrative-box');
    typewriterText(scene.text || '', narrativeEl);

    renderChoices(scene.choices || [], state);
  }

  /* ── CHOICES ── */
  function renderChoices(choices, state) {
    var container = document.getElementById('choices-container');
    container.innerHTML = '';

    choices.forEach(function(choice) {
      var met = GameEngine.checkRequirement(choice.requires);
      var btn = document.createElement('button');
      btn.className = 'choice-btn' + (met ? '' : ' locked');
      btn.disabled = !met;

      var labelText = choice.label;
      btn.textContent = labelText;

      if (!met && choice.requires) {
        var reqSpan = document.createElement('div');
        reqSpan.className = 'choice-requirement';
        reqSpan.textContent = GameEngine.requirementLabel(choice.requires);
        btn.appendChild(reqSpan);
        btn.disabled = false;
        btn.classList.add('locked');
        btn.addEventListener('click', function() {
          showToast(GameEngine.requirementLabel(choice.requires));
        });
      } else {
        btn.addEventListener('click', function() {
          GameEngine.makeChoice(choice);
        });
      }

      container.appendChild(btn);
    });
  }

  /* ── STATS ── */
  function renderStats(state) {
    if (!state) return;
    var s = state.stats;

    document.getElementById('player-name-display').textContent = state.playerName + ' — Level ' + s.level;

    var hpPct = Math.max(0, s.hp / s.maxHp * 100);
    var mpPct = Math.max(0, s.mp / s.maxMp * 100);
    var xpPct = Math.max(0, s.xp / s.xpToNext * 100);

    document.getElementById('hp-bar').style.width = hpPct + '%';
    document.getElementById('mp-bar').style.width = mpPct + '%';
    document.getElementById('xp-bar').style.width = xpPct + '%';

    document.getElementById('hp-text').textContent = s.hp + '/' + s.maxHp;
    document.getElementById('mp-text').textContent = s.mp + '/' + s.maxMp;
    document.getElementById('xp-text').textContent = s.xp + '/' + s.xpToNext;

    document.getElementById('stat-atk').textContent  = s.attack;
    document.getElementById('stat-def').textContent  = s.defense;
    document.getElementById('stat-spd').textContent  = s.speed;
    document.getElementById('stat-lvl').textContent  = s.level;
    document.getElementById('stat-gold').textContent = s.gold;
  }

  /* ── INVENTORY ── */
  function renderInventory(state) {
    if (!state) return;
    var grid = document.getElementById('inventory-grid');
    var emptyHint = document.getElementById('inventory-empty');
    grid.innerHTML = '';

    var counts = {};
    state.inventory.forEach(function(id) {
      counts[id] = (counts[id] || 0) + 1;
    });

    var unique = Object.keys(counts);
    emptyHint.style.display = unique.length === 0 ? 'block' : 'none';

    unique.forEach(function(id) {
      var item = ITEMS[id];
      if (!item) return;

      var div = document.createElement('div');
      div.className = 'inventory-item';
      div.setAttribute('title', item.name + ': ' + item.description);

      if (item.type === 'consumable' && item.use) {
        var useBtn = document.createElement('button');
        useBtn.className = 'use-item-btn';
        useBtn.textContent = item.icon;
        useBtn.addEventListener('click', function() { GameEngine.useItem(id); });
        div.appendChild(useBtn);
      } else {
        div.textContent = item.icon;
      }

      if (counts[id] > 1) {
        var countEl = document.createElement('span');
        countEl.className = 'inventory-count';
        countEl.textContent = counts[id];
        div.appendChild(countEl);
      }

      var tooltip = document.createElement('div');
      tooltip.className = 'item-tooltip';
      tooltip.textContent = item.name + ': ' + item.description;
      div.appendChild(tooltip);

      grid.appendChild(div);
    });
  }

  /* ── SKILLS ── */
  function renderSkills(state) {
    if (!state) return;
    var list = document.getElementById('skills-list');
    var emptyHint = document.getElementById('skills-empty');
    list.innerHTML = '';

    emptyHint.style.display = state.skills.length === 0 ? 'block' : 'none';

    state.skills.forEach(function(id) {
      var skill = SKILLS[id];
      if (!skill) return;

      var div = document.createElement('div');
      div.className = 'skill-item';

      var icon = document.createElement('span');
      icon.className = 'skill-icon';
      icon.textContent = skill.icon;

      var name = document.createElement('span');
      name.className = 'skill-name';
      name.textContent = skill.name;

      div.appendChild(icon);
      div.appendChild(name);

      if (skill.mpCost > 0) {
        var mp = document.createElement('span');
        mp.className = 'skill-mp';
        mp.textContent = skill.mpCost + ' MP';
        div.appendChild(mp);
      } else if (skill.passive) {
        var passiveLabel = document.createElement('span');
        passiveLabel.className = 'skill-mp';
        passiveLabel.textContent = 'Passive';
        div.appendChild(passiveLabel);
      }

      list.appendChild(div);
    });
  }

  /* ── TOAST ── */
  var toastTimer = null;
  function showToast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      el.classList.add('hidden');
      toastTimer = null;
    }, 2500);
  }

  /* ── LEVEL UP MODAL ── */
  function showLevelUp(level, callback) {
    var modal = document.getElementById('levelup-modal');
    var text = document.getElementById('levelup-text');
    text.textContent = 'You reached Level ' + level + '!\n+15 Max HP · +8 Max MP · +3 Attack · +2 Defense\nHP fully restored!';
    modal.classList.remove('hidden');

    var btn = document.getElementById('levelup-close');
    var handler = function() {
      modal.classList.add('hidden');
      btn.removeEventListener('click', handler);
      if (callback) callback();
    };
    btn.addEventListener('click', handler);
  }

  /* ── NAME MODAL ── */
  function showNameModal(callback) {
    var modal = document.getElementById('name-modal');
    modal.classList.remove('hidden');
    var input = document.getElementById('name-input');
    var btn = document.getElementById('name-confirm');
    input.value = '';
    input.focus();

    function confirm() {
      var name = input.value.trim() || 'Kaito';
      modal.classList.add('hidden');
      callback(name);
    }

    btn.onclick = confirm;
    input.onkeydown = function(e) { if (e.key === 'Enter') confirm(); };
  }

  /* ── CLICK TO SKIP TYPEWRITER ── */
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('narrative-box').addEventListener('click', function() {
      if (!typewriterDone) skipTypewriter();
    });
  });

  return {
    renderScene: renderScene,
    renderStats: renderStats,
    renderInventory: renderInventory,
    renderSkills: renderSkills,
    showToast: showToast,
    showLevelUp: showLevelUp,
    showNameModal: showNameModal,
    loadSceneImage: loadSceneImage
  };
})();
