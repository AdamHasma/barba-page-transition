/* ── SHADOW SLAVE — game/data.js ── */

function seedFromText(text) {
  var h = 0;
  for (var i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) % 1000000;
  }
  return h;
}

function pollinationsUrl(prompt) {
  var fullPrompt = prompt + ', 16:9 wide cinematic composition, correct proportions';
  var seed = seedFromText(fullPrompt);
  return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(fullPrompt) +
         '?width=1280&height=720&nologo=true&model=flux&seed=' + seed;
}

var IMAGE_MAP = {
  slum:         pollinationsUrl('dystopian urban slum district at dawn, crumbling brutalist concrete, wet alleyways, grey sky, single figure walking, dark cinematic realism'),
  station:      pollinationsUrl('near-future government processing center, harsh fluorescent light, sterile grey corridor, intake desk, sparse waiting area, dark clinical realism'),
  nightmare:    pollinationsUrl('vast frozen wasteland in perpetual grey twilight, ash-covered ruins under broken sky, oppressive dark fantasy dreamscape, cinematic dark art'),
  dream_realm:  pollinationsUrl('endless nightmare dreamscape, cracked grey earth stretching to horizon, dim red horizon, impossible geometry, dark surreal fantasy landscape'),
  mountain:     pollinationsUrl('brutal frozen mountain pass at high altitude, blizzard, iron chains glinting in snowstorm, no colour, dark survival fantasy, cinematic'),
  caravan:      pollinationsUrl('slave caravan ascending a frozen mountain, chained figures in rags, grey-armored soldiers, overcast stormy sky, dark fantasy brutality, cinematic'),
  winter_camp:  pollinationsUrl('small survival camp in blizzard, dying firelight, huddled figures wrapped in rags, frozen ground, oppressive darkness outside, dark survival atmosphere'),
  ruins:        pollinationsUrl('ancient temple ruins at night, crumbling stone pillars, creeping shadows, eerie cold light source unseen, dark fantasy, cinematic moody'),
  shadow:       pollinationsUrl('pure darkness solidifying into form, shadow energy coalescing into shape, void becoming substance, dark power awakening, cinematic dark fantasy'),
  death:        pollinationsUrl('final moment in dark dreamscape, figure falling into shadow void, nightmare dissolving, dark fantasy despair, cinematic wide shot'),
  game_over:    pollinationsUrl('dead end in nightmare, wrong path revealed, dark red atmosphere, shadows closing in, no escape, dark fantasy cinematic dread'),
  combat:       pollinationsUrl('desperate nightmare combat, Aspirant fighting nightmare creature in ash wastes, dynamic action, dark fantasy adrenaline, cinematic'),
  boss:         pollinationsUrl('colossal nightmare creature emerging from darkness, overwhelming presence, Aspirant dwarfed beneath it, dark fantasy boss encounter, cinematic'),
  levelup:      pollinationsUrl('Aspirant awakening power, soul energy radiating outward, nightmare world reacting, dark ascension moment, cinematic dark fantasy')
};

/* ── ITEMS ── */
var ITEMS = {
  healing_tonic: {
    id: 'healing_tonic',
    name: 'Healing Tonic',
    description: 'Crude alchemical draught. Restores 40 HP.',
    icon: '🧪',
    type: 'consumable',
    use: function(state) {
      var healed = Math.min(state.stats.maxHp - state.stats.hp, 40);
      state.stats.hp = Math.min(state.stats.maxHp, state.stats.hp + 40);
      return 'The tonic burns going down. +' + healed + ' HP.';
    }
  },
  soul_shard: {
    id: 'soul_shard',
    name: 'Soul Shard',
    description: 'Fragment of crystallized soul energy. Restores 25 MP.',
    icon: '💎',
    type: 'consumable',
    use: function(state) {
      var restored = Math.min(state.stats.maxMp - state.stats.mp, 25);
      state.stats.mp = Math.min(state.stats.maxMp, state.stats.mp + 25);
      return 'The shard dissolves into cold energy. +' + restored + ' MP.';
    }
  },
  iron_ration: {
    id: 'iron_ration',
    name: 'Iron Ration',
    description: 'Hard bread and dried meat. Restores 20 HP.',
    icon: '🍖',
    type: 'consumable',
    use: function(state) {
      var healed = Math.min(state.stats.maxHp - state.stats.hp, 20);
      state.stats.hp = Math.min(state.stats.maxHp, state.stats.hp + 20);
      return 'You eat quickly. +' + healed + ' HP.';
    }
  },
  memory_fragment: {
    id: 'memory_fragment',
    name: 'Memory Fragment',
    description: 'A crystallized memory absorbed from a defeated nightmare. Teaches a skill when used.',
    icon: '🔮',
    type: 'consumable',
    use: function(state) {
      if (state.skills.indexOf('shadow_step') === -1) {
        state.skills.push('shadow_step');
        return 'The memory dissolves into you. You understand something you did not before.';
      }
      return 'You already carry this knowledge.';
    }
  },
  nightmare_trophy: {
    id: 'nightmare_trophy',
    name: 'Nightmare Trophy',
    description: 'Remnant of a defeated nightmare creature. Valuable to the right buyer.',
    icon: '🦴',
    type: 'material'
  },
  slave_collar: {
    id: 'slave_collar',
    name: 'Slave Collar',
    description: 'Iron collar with a broken locking mechanism. Still carries the weight.',
    icon: '⛓️',
    type: 'key'
  },
  broken_weapon: {
    id: 'broken_weapon',
    name: 'Broken Blade',
    description: 'Half a sword. Better than nothing.',
    icon: '🗡️',
    type: 'key'
  }
};

/* ── SKILLS ── */
var SKILLS = {
  child_of_shadows: {
    id: 'child_of_shadows',
    name: 'Child of Shadows',
    description: 'You see perfectly in darkness. Shadows bend toward you. Unlocks options others cannot perceive.',
    icon: '🌑',
    mpCost: 0,
    combatOnly: false,
    passive: true
  },
  fated: {
    id: 'fated',
    name: 'Fated',
    description: 'Unlikely things happen around you. Passive luck modifier.',
    icon: '🎲',
    mpCost: 0,
    combatOnly: false,
    passive: true
  },
  mark_of_divinity: {
    id: 'mark_of_divinity',
    name: 'Mark of Divinity',
    description: 'Something ancient recognizes you. Unlocks divine-touched choices.',
    icon: '✦',
    mpCost: 0,
    combatOnly: false,
    passive: true
  },
  shadow_step: {
    id: 'shadow_step',
    name: 'Shadow Step',
    description: 'Step through shadow to strike. 20 MP. 35 damage and dodge next hit.',
    icon: '👁️',
    mpCost: 20,
    combatOnly: true,
    damage: 35,
    use: function(state, enemy) {
      enemy.hp = Math.max(0, enemy.hp - 35);
      state.shielded = true;
      return 'You step through shadow. ' + enemy.name + ' takes 35 damage. You evade the next strike.';
    }
  },
  shadow_veil: {
    id: 'shadow_veil',
    name: 'Shadow Veil',
    description: 'Wrap yourself in darkness. 15 MP. Greatly improves flee chance this turn.',
    icon: '🌫️',
    mpCost: 15,
    combatOnly: true,
    use: function(state, enemy) {
      state.flags._veilActive = true;
      return 'Shadows fold around you. Running will be easier now.';
    }
  },
  aspect_temple_slave: {
    id: 'aspect_temple_slave',
    name: 'Temple Slave',
    description: 'Your Aspect. Despised by the System. Its full potential is unknown.',
    icon: '⛩️',
    mpCost: 0,
    combatOnly: false,
    passive: true
  }
};

/* ── ENEMIES ── */
var ENEMIES = {
  bone_scavenger: {
    id: 'bone_scavenger',
    name: 'Bone Scavenger',
    hp: 35, maxHp: 35,
    attack: 9, defense: 2, speed: 8,
    xpReward: 40, goldReward: 5,
    lootTable: ['nightmare_trophy', 'iron_ration']
  },
  carapace_warrior: {
    id: 'carapace_warrior',
    name: 'Carapace Warrior',
    hp: 65, maxHp: 65,
    attack: 14, defense: 6, speed: 7,
    xpReward: 90, goldReward: 15,
    lootTable: ['nightmare_trophy', 'healing_tonic']
  },
  nightmare_soldier: {
    id: 'nightmare_soldier',
    name: 'Nightmare Soldier',
    hp: 50, maxHp: 50,
    attack: 12, defense: 4, speed: 10,
    xpReward: 65, goldReward: 10,
    lootTable: ['iron_ration', 'broken_weapon']
  },
  lord_of_ashes: {
    id: 'lord_of_ashes',
    name: 'Lord of Ashes',
    hp: 130, maxHp: 130,
    attack: 22, defense: 10, speed: 9,
    xpReward: 220, goldReward: 60,
    lootTable: ['healing_tonic', 'memory_fragment']
  },
  crimson_wraith: {
    id: 'crimson_wraith',
    name: 'Crimson Wraith',
    hp: 190, maxHp: 190,
    attack: 30, defense: 14, speed: 16,
    xpReward: 480, goldReward: 200,
    lootTable: ['soul_shard', 'memory_fragment']
  }
};

/* ── SCENES — populated at runtime from JSON chapter files ── */
var SCENES = {};
