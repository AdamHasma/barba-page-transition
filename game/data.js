/* ── IMAGE MAP ── */
// 16:9 ratio (1280x720) — FLUX generates more natural proportions on a standard
// canvas, and CSS background-size:cover crops cleanly without stretching.
// A deterministic seed per prompt forces a fresh, stable image for each scene
// (same image on every visit, but distinct between scenes).
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

const IMAGE_MAP = {
  death:       pollinationsUrl('cinematic anime style, young man dying on rainy city street at night, dramatic lighting, neon reflections, dark atmosphere'),
  void:        pollinationsUrl('ethereal void between worlds, floating soul, purple cosmic energy, isekai anime style, beautiful cosmos'),
  system:      pollinationsUrl('vast cosmic interface, glowing blue holographic panels and runes floating in endless dark space, sci-fi magic, ethereal data streams, anime style'),
  forest:      pollinationsUrl('magical ancient enchanted forest, isekai fantasy, morning fog, vibrant lush colors, glowing plants, anime style'),
  village:     pollinationsUrl('cozy medieval fantasy village at dusk, warm firelight, cobblestone streets, thatched roofs, anime art style'),
  dungeon:     pollinationsUrl('dark underground dungeon, flickering torchlight, ancient stone corridors, shadows, fantasy RPG atmosphere'),
  castle:      pollinationsUrl('grand gothic fantasy castle interior, throne room, stained glass windows, epic scale, royal grandeur'),
  battlefield: pollinationsUrl('epic fantasy battle scene, smoke and fire, armies clashing, dramatic stormy sky, anime cinematic style'),
  market:      pollinationsUrl('bustling medieval fantasy bazaar market, colorful stalls, magic potions, warm evening lantern light'),
  combat:      pollinationsUrl('intense sword fight battle, fantasy warrior hero, dynamic action pose, dramatic lighting, anime style'),
  levelup:     pollinationsUrl('magical power awakening, glowing golden aura explosion, runes in the air, isekai protagonist leveling up'),
  boss:        pollinationsUrl('terrifying demon lord on dark throne, red glowing eyes, menacing black aura, massive power, epic fantasy boss'),
};

/* ── ITEMS ── */
const ITEMS = {
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restores 40 HP',
    icon: '🧪',
    type: 'consumable',
    use: function(state) {
      var healed = Math.min(state.stats.maxHp - state.stats.hp, 40);
      state.stats.hp = Math.min(state.stats.maxHp, state.stats.hp + 40);
      return 'You drink the potion and restore ' + healed + ' HP.';
    }
  },
  mana_potion: {
    id: 'mana_potion',
    name: 'Mana Potion',
    description: 'Restores 25 MP',
    icon: '💙',
    type: 'consumable',
    use: function(state) {
      var restored = Math.min(state.stats.maxMp - state.stats.mp, 25);
      state.stats.mp = Math.min(state.stats.maxMp, state.stats.mp + 25);
      return 'You drink the mana potion and restore ' + restored + ' MP.';
    }
  },
  iron_sword: {
    id: 'iron_sword',
    name: 'Iron Sword',
    description: '+8 Attack',
    icon: '⚔️',
    type: 'weapon',
    equipBonus: { attack: 8 }
  },
  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    description: '+5 Defense',
    icon: '🥋',
    type: 'armor',
    equipBonus: { defense: 5 }
  },
  goblin_fang: {
    id: 'goblin_fang',
    name: 'Goblin Fang',
    description: 'A trophy from battle. Sell for 20 Gold.',
    icon: '🦷',
    type: 'material'
  },
  ancient_scroll: {
    id: 'ancient_scroll',
    name: 'Ancient Scroll',
    description: 'Contains forgotten magic. Use to learn a spell.',
    icon: '📜',
    type: 'consumable',
    use: function(state) {
      if (state.skills.indexOf('fireball') === -1) {
        state.skills.push('fireball');
        return 'The scroll dissolves into light! You learned Fireball!';
      }
      return 'You already know this spell.';
    }
  },
  demon_crystal: {
    id: 'demon_crystal',
    name: 'Demon Crystal',
    description: 'A fragment of dark power. It pulses with evil energy.',
    icon: '💎',
    type: 'material'
  }
};

/* ── SKILLS ── */
const SKILLS = {
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    description: 'Launch a ball of fire dealing 30 damage',
    icon: '🔥',
    mpCost: 15,
    combatOnly: true,
    damage: 30,
    use: function(state, enemy) {
      enemy.hp = Math.max(0, enemy.hp - 30);
      return 'You hurl a blazing fireball at ' + enemy.name + ' for 30 fire damage!';
    }
  },
  shadow_step: {
    id: 'shadow_step',
    name: 'Shadow Step',
    description: 'Teleport through shadows — unlocks stealth options',
    icon: '🌑',
    mpCost: 0,
    combatOnly: false,
    passive: true
  },
  divine_shield: {
    id: 'divine_shield',
    name: 'Aegis Barrier',
    description: 'Absorb the next attack completely',
    icon: '🛡️',
    mpCost: 20,
    combatOnly: true,
    use: function(state, enemy) {
      state.shielded = true;
      return 'A shimmering energy barrier surrounds you!';
    }
  },
  thunder_strike: {
    id: 'thunder_strike',
    name: 'Thunder Strike',
    description: 'Channel lightning for 45 damage',
    icon: '⚡',
    mpCost: 25,
    combatOnly: true,
    damage: 45,
    use: function(state, enemy) {
      enemy.hp = Math.max(0, enemy.hp - 45);
      return 'Lightning crashes through ' + enemy.name + ' for 45 damage!';
    }
  }
};

/* ── ENEMIES ── */
const ENEMIES = {
  forest_goblin: {
    id: 'forest_goblin',
    name: 'Forest Goblin',
    hp: 30, maxHp: 30,
    attack: 8, defense: 2, speed: 8,
    xpReward: 40, goldReward: 15,
    lootTable: ['goblin_fang', 'health_potion']
  },
  goblin_king: {
    id: 'goblin_king',
    name: 'Goblin King Gruk',
    hp: 90, maxHp: 90,
    attack: 16, defense: 6, speed: 7,
    xpReward: 150, goldReward: 80,
    lootTable: ['iron_sword', 'health_potion', 'goblin_fang']
  },
  bandit_leader: {
    id: 'bandit_leader',
    name: 'Bandit Captain Varro',
    hp: 65, maxHp: 65,
    attack: 18, defense: 8, speed: 10,
    xpReward: 120, goldReward: 60,
    lootTable: ['leather_armor', 'health_potion']
  },
  dark_knight: {
    id: 'dark_knight',
    name: 'Dark Knight Serath',
    hp: 120, maxHp: 120,
    attack: 24, defense: 12, speed: 8,
    xpReward: 200, goldReward: 100,
    lootTable: ['health_potion', 'mana_potion']
  },
  demon_lord: {
    id: 'demon_lord',
    name: 'Demon Lord Zarveth',
    hp: 200, maxHp: 200,
    attack: 32, defense: 15, speed: 12,
    xpReward: 500, goldReward: 300,
    lootTable: ['demon_crystal']
  }
};

/* ── SCENES ── */
var SCENES = {

  /* ── ACT 1: DEATH & REBIRTH ── */

  scene_death: {
    id: 'scene_death',
    type: 'death',
    title: 'The Last Commute',
    text: 'Rain hammers the asphalt. You are running late again — briefcase in hand, headphones in, coffee spilled somewhere between stations two and three.\n\nA screech of tires. Blinding headlights.\n\nAnd then... nothing.\n\nA strange calm washes over you. No pain. Just the distant hiss of rain fading into silence, and a curious thought: *Is this all there was?*\n\nDarkness swallows everything.',
    image: null,
    onEnter: null,
    choices: [
      { label: '...Accept it. This is the end.', requires: null, effect: null, next: 'scene_void' },
      { label: 'Rage against the dying of the light!', requires: null, effect: function(s){ s.stats.attack += 1; }, next: 'scene_void' },
      { label: 'Bargain with fate — there must be more.', requires: null, effect: null, next: 'scene_void' }
    ]
  },

  scene_void: {
    id: 'scene_void',
    type: 'void',
    title: 'The Space Between',
    text: 'You float in absolute nothingness.\n\nNo body. No weight. No sound — except for a faint hum, like the universe breathing.\n\nDistant lights drift past like slow-moving stars. Or souls. You cannot tell.\n\nThen a voice speaks, neither loud nor quiet, from everywhere and nowhere:\n\n*"A life ended early. Such waste... or perhaps such opportunity."*\n\nA pinpoint of golden light appears in the void. It grows.',
    image: null,
    onEnter: null,
    choices: [
      { label: 'Reach for the golden light.', requires: null, effect: null, next: 'scene_divine_meeting' },
      { label: 'Stay in the darkness. Refuse to move.', requires: null, effect: null, next: 'scene_divine_meeting' },
      { label: 'Demand answers from the void.', requires: null, effect: null, next: 'scene_divine_meeting' }
    ]
  },

  scene_divine_meeting: {
    id: 'scene_divine_meeting',
    type: 'system',
    title: 'The System Awakens',
    text: 'There are no faces here. No voices from beyond.\n\nInstead, a vast lattice of glowing blue panels unfolds across the darkness — endless lines of light, runes, and code, stretching in every direction. A cold, precise presence regards you. Not a person. Not a god. Something else.\n\n**[ ENTITY: WORLD SYSTEM — ONLINE ]**\n**[ ANOMALY DETECTED: SOUL TERMINATED AHEAD OF SCHEDULE ]**\n**[ STATUS: ELIGIBLE FOR RELOCATION ]**\n\nText scrolls before you, calm and mechanical:\n\n*"A flawed ending. Correctable. A new world requires an anchor — and you are... available. Compensation will be issued."*\n\nThree options crystallize into glowing panels:\n\n**[ SELECT YOUR CORE SKILL ]**',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '⚔️ [ OFFENSE ] Overwhelming destructive power.',
        requires: null,
        effect: function(s) {
          s.skills.push('fireball');
          s.flags.hasSystemSkill = true;
          s.stats.attack += 5;
        },
        next: 'scene_system_awakening'
      },
      {
        label: '🌑 [ STEALTH ] Mastery over shadow and movement.',
        requires: null,
        effect: function(s) {
          s.skills.push('shadow_step');
          s.flags.hasSystemSkill = true;
          s.stats.speed += 5;
        },
        next: 'scene_system_awakening'
      },
      {
        label: '🛡️ [ DEFENSE ] An impenetrable energy barrier.',
        requires: null,
        effect: function(s) {
          s.skills.push('divine_shield');
          s.flags.hasSystemSkill = true;
          s.stats.defense += 5;
        },
        next: 'scene_system_awakening'
      }
    ]
  },

  scene_system_awakening: {
    id: 'scene_system_awakening',
    type: 'system',
    title: 'Initialization',
    text: 'The power floods into you like a current — rewriting something fundamental, line by line.\n\n**[ SKILL INSTALLED ]**\n**[ SYSTEM INITIALIZED ]**\n**[ HOST REGISTERED ]**\n\nA blue translucent panel locks into the corner of your vision — a permanent interface, as if reality itself runs on code only you can see.\n\nThe vast lattice collapses inward, its light folding into a single point. The System falls silent. And then — you are falling.\n\nThrough layers of light and shadow, through wind and distant birdsong, toward something green and enormous rushing up below—\n\n*IMPACT.*',
    image: null,
    onEnter: function(s) { s.flags.systemActive = true; },
    choices: [
      { label: 'Open the System panel before landing!', requires: null, effect: null, next: 'scene_forest_awakening' },
      { label: 'Close your eyes and brace for impact.', requires: null, effect: null, next: 'scene_forest_awakening' }
    ]
  },

  scene_forest_awakening: {
    id: 'scene_forest_awakening',
    type: 'forest',
    title: 'Reborn in the Forest',
    text: 'You crash through a canopy of enormous leaves and land in a moss-covered clearing with a grunt that shakes leaves from nearby branches.\n\nYou are... alive. More than alive — your body feels electric. Different.\n\nAncient trees tower overhead, their roots thick as buildings. Luminous blue flowers dot the forest floor. A distant creature calls — nothing like any animal you recognize.\n\nYour System panel pulses:\n**[ HP: 100/100 | MP: 50/50 | LVL: 1 ]**\n\nSomewhere close, twigs snap.',
    image: null,
    onEnter: null,
    choices: [
      { label: 'Check your body and new abilities.', requires: null, effect: function(s){ s.stats.maxHp += 10; s.stats.hp = s.stats.maxHp; }, next: 'scene_goblin_ambush' },
      { label: 'Move toward the sound — could be danger.', requires: null, effect: null, next: 'scene_goblin_ambush' },
      { label: '🌑 Activate Shadow Step to scout ahead.', requires: { skill: 'shadow_step' }, effect: function(s){ s.stats.xp += 20; }, next: 'scene_goblin_ambush' }
    ]
  },

  scene_goblin_ambush: {
    id: 'scene_goblin_ambush',
    type: 'combat',
    title: 'First Blood',
    text: 'Three goblins crash through the undergrowth — green-skinned, yellow-eyed, wielding crude clubs and rusted blades. They chitter and hiss at the sight of you, circling with predatory hunger.\n\nOne lunges forward. Your body moves on instinct — faster than you expected.\n\nYour System flashes: **[ COMBAT INITIATED ]**\n\nThis is your first real fight. The forest holds its breath.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '⚔️ Stand and fight!',
        requires: null,
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'forest_goblin', onWin: 'scene_after_goblin', onLose: 'scene_goblin_defeat', onFlee: 'scene_forest_awakening' }
      },
      {
        label: '🏃 Flee back into the trees.',
        requires: null,
        effect: null,
        next: 'scene_forest_awakening'
      },
      {
        label: '🔥 Open with Fireball!',
        requires: { skill: 'fireball' },
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'forest_goblin', onWin: 'scene_after_goblin', onLose: 'scene_goblin_defeat', onFlee: 'scene_forest_awakening', firstStrike: 15 }
      }
    ]
  },

  scene_goblin_defeat: {
    id: 'scene_goblin_defeat',
    type: 'forest',
    title: 'Fallen',
    text: '**[ YOU HAVE FALLEN ]**\n\nThe goblins stand over you, chattering excitedly. Everything goes dark.\n\nBut death, it seems, is not ready for you again.\n\nYour System pulses weakly: **[ RESURRECTION PASSIVE ACTIVATED — ONE TIME ONLY ]**\n\nYour wounds close. Barely. You wake up alone — the goblins have fled, frightened by your sudden revival.',
    image: null,
    onEnter: function(s) { s.stats.hp = Math.floor(s.stats.maxHp * 0.3); },
    choices: [
      { label: 'Get up and push forward.', requires: null, effect: null, next: 'scene_after_goblin' }
    ]
  },

  scene_after_goblin: {
    id: 'scene_after_goblin',
    type: 'forest',
    title: 'Survivor',
    text: 'The goblins lie defeated. You catch your breath, hands trembling slightly.\n\nYour System panel updates:\n**[ COMBAT EXPERIENCE GAINED ]**\n**[ ANALYZING WORLD DATA... ]**\n**[ NEAREST SETTLEMENT: EMBERVEIL VILLAGE — 3km NORTH ]**\n\nA dirt path winds north through the ancient trees. Smoke curls above the treeline — cooking fires, perhaps. Civilization.\n\nYou find a crude leather satchel left by the goblins. Inside: a health potion and a few copper coins.',
    image: null,
    onEnter: function(s) {
      if (s.inventory.indexOf('health_potion') === -1) s.inventory.push('health_potion');
      s.stats.gold += 10;
    },
    choices: [
      { label: 'Follow the path to Emberveil.', requires: null, effect: null, next: 'scene_village_arrival' }
    ]
  },

  /* ── ACT 2: THE VILLAGE ── */

  scene_village_arrival: {
    id: 'scene_village_arrival',
    type: 'village',
    title: 'Village of Emberveil',
    text: 'Emberveil is a modest village of perhaps three hundred souls — timber-framed houses, a watermill, a blacksmith\'s hammer ringing in the distance. The people wear simple clothes and watch you with a mix of curiosity and suspicion.\n\nAt the gate, a militia guard with a polearm steps forward:\n\n*"Halt. State your name and business, stranger. You look like you\'ve been through a dungeon."*\n\nHe eyes the dried blood on your clothes.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: 'Enter freely. "Just a traveler. Passing through."',
        requires: null,
        effect: null,
        next: 'scene_tavern'
      },
      {
        label: '🌑 Slip past the guard in the shadows.',
        requires: { skill: 'shadow_step' },
        effect: function(s) { s.flags.slippedIntoVillage = true; },
        next: 'scene_tavern'
      },
      {
        label: '"I am a Summoned Hero from another world. Announce me."',
        requires: null,
        effect: function(s) { s.flags.announcedHero = true; },
        next: 'scene_tavern'
      }
    ]
  },

  scene_tavern: {
    id: 'scene_tavern',
    type: 'village',
    title: 'The Drunken Dragon Tavern',
    text: 'The tavern is warm and loud — a fire roars in the stone hearth, and the smell of stew and ale hangs in the air. The barkeep, a broad-shouldered woman with a scar across her chin, sizes you up.\n\n*"Ain\'t seen you before. What\'ll it be?"*\n\nAround the room, adventurers trade stories. One corner holds a posted board thick with parchment notices.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: 'Ask about work and the local area.',
        requires: null,
        effect: null,
        next: 'scene_guild_registration'
      },
      {
        label: 'Buy a drink and eavesdrop on adventurers.',
        requires: { stat: 'gold', value: 5 },
        effect: function(s) {
          s.stats.gold -= 5;
          s.flags.heardDemonLordRumor = true;
        },
        next: 'scene_guild_registration'
      },
      {
        label: 'Examine the notice board.',
        requires: null,
        effect: null,
        next: 'scene_guild_registration'
      }
    ]
  },

  scene_guild_registration: {
    id: 'scene_guild_registration',
    type: 'village',
    title: 'Adventurers\' Guild',
    text: 'The Guild Hall is adjacent to the tavern — a stone building with a bronze plaque reading *"Emberveil Adventurers\' Guild, Est. Year 312."*\n\nA young clerk adjusts her spectacles at the desk.\n\n*"Registration? That\'ll be 5 gold. You start at F-Rank — everyone does. Though..."*\n\nShe lowers her voice: *"If you really are what people are saying — an Otherworlder, summoned from beyond — then the Guild Master will want to speak with you personally."*\n\nYour System chimes: **[ QUEST AVAILABLE: Register with the Guild ]**',
    image: null,
    onEnter: function(s) { s.flags.visitedGuild = true; },
    choices: [
      {
        label: 'Register as F-Rank. Start from the bottom. (5 Gold)',
        requires: { stat: 'gold', value: 5 },
        effect: function(s) {
          s.stats.gold -= 5;
          s.flags.guildMember = true;
          s.stats.xp += 30;
        },
        next: 'scene_market'
      },
      {
        label: 'Demand to see the Guild Master immediately.',
        requires: { flag: 'announcedHero' },
        effect: function(s) {
          s.flags.guildMember = true;
          s.flags.metGuildMaster = true;
          s.stats.gold += 50;
        },
        next: 'scene_market'
      },
      {
        label: 'Skip registration — head to the market.',
        requires: null,
        effect: null,
        next: 'scene_market'
      }
    ]
  },

  scene_market: {
    id: 'scene_market',
    type: 'market',
    title: 'Emberveil Market',
    text: 'The open-air market bustles with life. Merchants hawk everything from fresh bread to enchanted trinkets. A weapons stall catches your eye — iron swords, daggers, a battered shield.\n\nThe merchant, a rotund man with rings on every finger, spreads his arms:\n\n*"Best prices in three kingdoms, I assure you! What does a capable adventurer like yourself require?"*',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '⚔️ Buy Iron Sword for 40 Gold.',
        requires: { stat: 'gold', value: 40 },
        effect: function(s) {
          s.stats.gold -= 40;
          if (s.inventory.indexOf('iron_sword') === -1) {
            s.inventory.push('iron_sword');
            s.stats.attack += 8;
          }
        },
        next: 'scene_village_crisis'
      },
      {
        label: '🥋 Buy Leather Armor for 30 Gold.',
        requires: { stat: 'gold', value: 30 },
        effect: function(s) {
          s.stats.gold -= 30;
          if (s.inventory.indexOf('leather_armor') === -1) {
            s.inventory.push('leather_armor');
            s.stats.defense += 5;
          }
        },
        next: 'scene_village_crisis'
      },
      {
        label: 'Save your gold and move on.',
        requires: null,
        effect: null,
        next: 'scene_village_crisis'
      }
    ]
  },

  scene_village_crisis: {
    id: 'scene_village_crisis',
    type: 'battlefield',
    title: 'Bandits at the Gate!',
    text: 'A bell tower erupts in frantic clanging.\n\n*"BANDITS! BANDITS AT THE SOUTH GATE!"*\n\nVillagers scatter. Children are pulled indoors. Through the narrow streets you can see armed men — forty, maybe fifty — marching toward Emberveil\'s wooden gates. At their head rides a scarred captain on a black horse.\n\n*"People of Emberveil!"* he bellows. *"Pay the toll or burn!"*\n\nThe militia guard from earlier runs past you, pale-faced. *"We can\'t stop this many. We\'re done."*\n\nYour System pulses: **[ CRISIS EVENT DETECTED ]**',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '⚔️ Fight the Bandit Captain to stop the assault.',
        requires: null,
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'bandit_leader', onWin: 'scene_village_reward', onLose: 'scene_village_falls', onFlee: 'scene_village_reward' }
      },
      {
        label: '🌑 Infiltrate the bandit ranks and sabotage them.',
        requires: { skill: 'shadow_step' },
        effect: function(s) {
          s.stats.xp += 80;
          s.flags.savedVillage = true;
        },
        next: 'scene_village_reward'
      },
      {
        label: 'Negotiate — offer to broker a deal.',
        requires: null,
        effect: function(s) {
          s.stats.gold = Math.max(0, s.stats.gold - 30);
          s.flags.savedVillage = true;
        },
        next: 'scene_village_reward'
      }
    ]
  },

  scene_village_falls: {
    id: 'scene_village_falls',
    type: 'village',
    title: 'Smoke and Ash',
    text: 'You wake up battered in an alley. The bandits have taken what they wanted and gone.\n\nEmberveil smolders, but stands. The people lost gold, goods, and pride — but no lives, mercifully.\n\nThe village elder finds you and presses a small pouch into your hands: *"Not your fault, stranger. But perhaps... grow stronger before you fight battles like that."*',
    image: null,
    onEnter: function(s) {
      s.stats.hp = Math.max(1, Math.floor(s.stats.maxHp * 0.2));
      if (s.inventory.indexOf('health_potion') === -1) s.inventory.push('health_potion');
    },
    choices: [
      { label: 'Rest, recover, and push on.', requires: null, effect: null, next: 'scene_village_reward' }
    ]
  },

  scene_village_reward: {
    id: 'scene_village_reward',
    type: 'village',
    title: 'Hero of Emberveil',
    text: 'The village square fills with grateful faces. The elder — a weathered man with kind eyes — bows deeply.\n\n*"You saved us, stranger. Emberveil does not forget its heroes."*\n\nHe presents a chest: 100 gold coins, a fine health potion, and an ancient scroll with strange markings.\n\n*"One more thing,"* the elder says quietly. *"Travelers speak of trouble in the Obsidian Dungeon to the east — a goblin warlord gathering an army. If it reaches us... there won\'t be a second chance."*',
    image: null,
    onEnter: function(s) {
      s.flags.savedVillage = true;
      s.stats.gold += 100;
      if (s.inventory.indexOf('health_potion') === -1) s.inventory.push('health_potion');
      if (s.inventory.indexOf('ancient_scroll') === -1) s.inventory.push('ancient_scroll');
      s.stats.xp += 100;
    },
    choices: [
      { label: 'Accept the reward and prepare for the dungeon.', requires: null, effect: null, next: 'scene_dungeon_entrance' },
      { label: 'Donate the gold back to the villagers.', requires: null, effect: function(s){ s.stats.gold -= 100; s.stats.xp += 50; s.flags.donatedGold = true; }, next: 'scene_dungeon_entrance' },
      { label: 'Ask about the Demon Lord first.', requires: null, effect: function(s){ s.flags.heardDemonLordRumor = true; }, next: 'scene_dungeon_entrance' }
    ]
  },

  /* ── ACT 3: THE DUNGEON ── */

  scene_dungeon_entrance: {
    id: 'scene_dungeon_entrance',
    type: 'dungeon',
    title: 'The Obsidian Dungeon',
    text: 'A jagged maw opens in the hillside east of Emberveil — the Obsidian Dungeon. Black stone walls glimmer with veins of dark crystal. A cold wind breathes outward, carrying the smell of earth and something older.\n\nYour System marks it: **[ DUNGEON DETECTED — RANK: B ]**\n**[ WARNING: HIGH MONSTER DENSITY ]**\n\nTorches someone left recently still burn near the entrance. You are not the first to come here. Based on the scattered equipment nearby — you may be the first to make it back.',
    image: null,
    onEnter: null,
    choices: [
      { label: 'Descend alone. Speed is everything.', requires: null, effect: null, next: 'scene_dungeon_trap' },
      { label: '🌑 Scout with Shadow Step before entering.', requires: { skill: 'shadow_step' }, effect: function(s){ s.stats.xp += 25; }, next: 'scene_dungeon_trap' },
      { label: 'Study the dungeon layout carefully.', requires: null, effect: function(s){ s.flags.studiedDungeon = true; }, next: 'scene_dungeon_trap' }
    ]
  },

  scene_dungeon_trap: {
    id: 'scene_dungeon_trap',
    type: 'dungeon',
    title: 'Floor of Blades',
    text: 'Twenty paces into the second corridor, your System screams:\n\n**[ TRAP DETECTED! ]**\n\nThe floor ahead is riddled with pressure plates — nearly invisible in the torchlight. One wrong step and blade mechanisms embedded in the walls will fire. You can see remnants of a previous adventurer\'s pack shredded on the far side.\n\nYou study the pattern. The plates have a rhythm — like tiles on a board.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '🧠 Carefully disarm the trap (System-assisted).',
        requires: { flag: 'systemActive' },
        effect: function(s) { s.stats.xp += 40; },
        next: 'scene_dungeon_merchant'
      },
      {
        label: '🌑 Phase through using Shadow Step.',
        requires: { skill: 'shadow_step' },
        effect: function(s) { s.stats.xp += 50; },
        next: 'scene_dungeon_merchant'
      },
      {
        label: 'Trigger it deliberately and dodge the blades.',
        requires: null,
        effect: function(s) {
          var dmg = Math.floor(s.stats.maxHp * 0.2);
          s.stats.hp = Math.max(1, s.stats.hp - dmg);
        },
        next: 'scene_dungeon_merchant'
      }
    ]
  },

  scene_dungeon_merchant: {
    id: 'scene_dungeon_merchant',
    type: 'market',
    title: 'The Wandering Merchant',
    text: 'Deep in the dungeon, impossibly, you find a man sitting on a crate beside a lantern — his goods spread neatly on a cloth.\n\nHe smiles with too many teeth:\n\n*"Ah, a customer! Please, browse at your leisure. I find the dungeon ambiance rather... motivating for business."*\n\nHis wares include health potions, a mana potion, and a locked box he says contains something "extraordinary."',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '🧪 Buy 2 Health Potions (30 Gold each).',
        requires: { stat: 'gold', value: 60 },
        effect: function(s) {
          s.stats.gold -= 60;
          s.inventory.push('health_potion');
          s.inventory.push('health_potion');
        },
        next: 'scene_goblin_king_combat'
      },
      {
        label: '💙 Buy Mana Potion (25 Gold).',
        requires: { stat: 'gold', value: 25 },
        effect: function(s) {
          s.stats.gold -= 25;
          s.inventory.push('mana_potion');
        },
        next: 'scene_goblin_king_combat'
      },
      {
        label: 'Ignore the merchant and press forward.',
        requires: null,
        effect: null,
        next: 'scene_goblin_king_combat'
      }
    ]
  },

  scene_goblin_king_combat: {
    id: 'scene_goblin_king_combat',
    type: 'boss',
    title: 'The Goblin King',
    text: 'The dungeon opens into a massive throne room carved from black stone. Bones and crude trophies litter the floor. And on a throne of rusted metal and skulls sits the largest goblin you have ever seen.\n\nGoblin King Gruk is the size of a bear — scarred, yellow-eyed, wearing a crown of bent iron. Around him, a dozen goblin warriors freeze at your entrance.\n\nGruk rises slowly, cracking his knuckles.\n\n*"LITTLE HUMAN COME TO DIE?"*\n\nHis subjects scatter. It is just you and the King now.\n\n**[ BOSS ENCOUNTER — GOBLIN KING GRUK ]**',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '⚔️ Charge — head-on combat!',
        requires: null,
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'goblin_king', onWin: 'scene_dungeon_loot', onLose: 'scene_dungeon_death', onFlee: 'scene_dungeon_merchant' }
      },
      {
        label: '🔥 Open with full magical assault.',
        requires: { skill: 'fireball' },
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'goblin_king', onWin: 'scene_dungeon_loot', onLose: 'scene_dungeon_death', onFlee: 'scene_dungeon_merchant', firstStrike: 30 }
      },
      {
        label: '⚡ Strike with Thunder before he can react.',
        requires: { skill: 'thunder_strike' },
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'goblin_king', onWin: 'scene_dungeon_loot', onLose: 'scene_dungeon_death', onFlee: 'scene_dungeon_merchant', firstStrike: 45 }
      }
    ]
  },

  scene_dungeon_death: {
    id: 'scene_dungeon_death',
    type: 'dungeon',
    title: 'Darkness Again',
    text: 'The Goblin King\'s club connects and everything goes white.\n\nYou wake up at the dungeon entrance. The System has dragged you out — barely.\n\n**[ RESURRECTION COOLDOWN: ACTIVE ]**\n**[ WARNING: GROW STRONGER BEFORE RETURNING ]**\n\nYou look back at the dungeon mouth and make a silent promise.',
    image: null,
    onEnter: function(s) { s.stats.hp = Math.floor(s.stats.maxHp * 0.25); },
    choices: [
      { label: 'Return to the village to recover.', requires: null, effect: null, next: 'scene_village_reward' },
      { label: 'Re-enter immediately — I am not afraid.', requires: null, effect: null, next: 'scene_dungeon_entrance' }
    ]
  },

  scene_dungeon_loot: {
    id: 'scene_dungeon_loot',
    type: 'dungeon',
    title: 'Treasure Chamber',
    text: 'Gruk falls with a crash that shakes dust from the ceiling.\n\nBeyond his throne, a hidden door reveals the dungeon\'s true prize — a chamber thick with goblin loot. Gold, stolen equipment, and at the center: a sealed stone pedestal bearing an ornate crest.\n\nYour System analyzes it: **[ ROYAL INSIGNIA — KINGDOM OF ARENTHAL ]**\n**[ THIS BELONGS TO SOMEONE OF SIGNIFICANCE ]**\n\nYou pocket the crest. It may open doors.',
    image: null,
    onEnter: function(s) {
      s.flags.killedGoblinKing = true;
      s.stats.gold += 150;
      s.stats.xp += 80;
      if (s.inventory.indexOf('demon_crystal') === -1) s.inventory.push('demon_crystal');
    },
    choices: [
      { label: 'Take the crest and head for the Kingdom.', requires: null, effect: null, next: 'scene_level_up_dungeon' },
      { label: 'Examine the sealed chamber deeper.', requires: null, effect: function(s){ s.stats.xp += 30; if (s.inventory.indexOf('ancient_scroll') === -1) s.inventory.push('ancient_scroll'); }, next: 'scene_level_up_dungeon' }
    ]
  },

  scene_level_up_dungeon: {
    id: 'scene_level_up_dungeon',
    type: 'levelup',
    title: 'Power Surges',
    text: 'Stepping out of the Obsidian Dungeon into fresh air, your System explodes with notifications:\n\n**[ DUNGEON CLEARED — B RANK ]**\n**[ MASSIVE XP BONUS ]**\n**[ NEW SKILL SLOT UNLOCKED ]**\n\nYour body tingles. Something shifts — a deeper well of power, a sharpened edge to your senses. You feel the world differently now.\n\nThe horizon glitters. Somewhere beyond the hills, the towers of a great kingdom catch the afternoon light.',
    image: null,
    onEnter: function(s) {
      s.stats.xp += 200;
    },
    choices: [
      {
        label: '🔥 Learn a devastating fire magic technique.',
        requires: null,
        effect: function(s) {
          if (s.skills.indexOf('fireball') === -1) s.skills.push('fireball');
          s.stats.attack += 5;
        },
        next: 'scene_capital_arrival'
      },
      {
        label: '⚡ Master the art of lightning magic.',
        requires: null,
        effect: function(s) {
          if (s.skills.indexOf('thunder_strike') === -1) s.skills.push('thunder_strike');
          s.stats.attack += 4;
          s.stats.speed += 3;
        },
        next: 'scene_capital_arrival'
      },
      {
        label: '🛡️ Fortify your defense with an impenetrable barrier.',
        requires: null,
        effect: function(s) {
          if (s.skills.indexOf('divine_shield') === -1) s.skills.push('divine_shield');
          s.stats.defense += 8;
          s.stats.maxHp += 20;
          s.stats.hp = s.stats.maxHp;
        },
        next: 'scene_capital_arrival'
      }
    ]
  },

  /* ── ACT 4: THE KINGDOM ── */

  scene_capital_arrival: {
    id: 'scene_capital_arrival',
    type: 'castle',
    title: 'The Eternal Capital',
    text: 'Arenthal. The capital city rises before you like a dream made of white stone and gold — towers catch the sunlight, great walls span the horizon, and the smell of fresh bread and forge-smoke mingles in the air.\n\nAt the main gate, guards in polished armor bear the same crest you found in the dungeon.\n\nOne of them stares at the insignia in your hand, then goes rigid.\n\n*"Where... where did you get that? That is the Princess\'s seal. SHE HAS BEEN SEARCHING FOR THAT."*\n\nGates fly open.',
    image: null,
    onEnter: null,
    choices: [
      { label: 'Enter through the grand gates as a guest.', requires: null, effect: null, next: 'scene_princess_meeting' },
      { label: '🌑 Slip in unseen through a side entrance.', requires: { skill: 'shadow_step' }, effect: function(s){ s.flags.enteredCapitalStealth = true; }, next: 'scene_princess_meeting' }
    ]
  },

  scene_princess_meeting: {
    id: 'scene_princess_meeting',
    type: 'castle',
    title: 'Lady Seraphine',
    text: 'In a private courtyard, you meet Princess Seraphine — silver-haired, seventeen, with eyes like storm clouds and a posture that suggests she has never once doubted herself.\n\nShe takes her seal back and studies you.\n\n*"You cleared the Obsidian Dungeon and killed Gruk alone? At your level?"*\n\nA pause.\n\n*"Father will want to meet you. But I warn you — my father\'s court is not what it appears. There are enemies closer to the throne than any dungeon boss."*\n\nShe meets your eyes with unusual intensity.',
    image: null,
    onEnter: function(s){ s.flags.metPrincess = true; },
    choices: [
      { label: 'Kneel and offer your service to the Kingdom.', requires: null, effect: function(s){ s.flags.pledgedToKingdom = true; }, next: 'scene_royal_audience' },
      { label: 'Challenge her assumption. "I\'m not here to serve anyone."', requires: null, effect: function(s){ s.flags.challengedPrincess = true; }, next: 'scene_royal_audience' },
      { label: 'Stay silent. Watch her carefully.', requires: null, effect: function(s){ s.flags.observedPrincess = true; }, next: 'scene_royal_audience' }
    ]
  },

  scene_royal_audience: {
    id: 'scene_royal_audience',
    type: 'castle',
    title: 'Throne of Lies',
    text: 'The throne room is magnificent — vaulted ceilings, tapestries of ancient battles, a hundred courtiers in silk. King Aldric sits on his gold throne, older than you expected, with hollow eyes and a smile that doesn\'t reach them.\n\n*"The one who cleared our dungeon problem. Excellent. I have a... task for such a capable individual."*\n\nHe leans forward.\n\n*"The Demon Lord gathers power in the eastern wastes. Serve me, root out his agents here in the capital, and you will be rewarded beyond imagination."*\n\nFrom the side, Seraphine catches your eye and barely shakes her head. Something is very wrong here.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: 'Serve the King. His enemies are your enemies.',
        requires: null,
        effect: function(s){ s.flags.servedKing = true; s.stats.gold += 200; },
        next: 'scene_royal_betrayal'
      },
      {
        label: 'Expose the King. "Your agent IS the Demon Lord\'s spy."',
        requires: { flag: 'metPrincess' },
        effect: function(s){ s.flags.exposedKing = true; },
        next: 'scene_royal_betrayal'
      },
      {
        label: 'Refuse both the King and the implied trap.',
        requires: null,
        effect: function(s){ s.flags.refusedKing = true; },
        next: 'scene_royal_betrayal'
      }
    ]
  },

  scene_royal_betrayal: {
    id: 'scene_royal_betrayal',
    type: 'dungeon',
    title: 'The Dungeon Beneath the Palace',
    text: 'You wake in chains.\n\nThe throne room\'s gilded floors are far above. You are in a stone cell, torches guttering, the sound of distant dripping water.\n\nA royal advisor leans against the bars:\n\n*"Did you really think we didn\'t know? The King has been preparing for a hero — to use as a pawn. Not a hero."*\n\nBut a loose stone grinds behind you. A note slides under the cell door. The Princess\'s seal.\n\n*"The resistance awaits. — S"*',
    image: null,
    onEnter: function(s){ s.flags.capturedByKing = true; },
    choices: [
      {
        label: '⚔️ Overpower the guards and escape by force.',
        requires: null,
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'dark_knight', onWin: 'scene_resistance', onLose: 'scene_royal_betrayal_again', onFlee: 'scene_resistance' }
      },
      {
        label: '🌑 Phase through the cell wall with Shadow Step.',
        requires: { skill: 'shadow_step' },
        effect: function(s){ s.stats.xp += 60; },
        next: 'scene_resistance'
      },
      {
        label: '🔥 Blast through the door.',
        requires: { skill: 'fireball' },
        effect: function(s){ s.stats.mp = Math.max(0, s.stats.mp - 15); },
        next: 'scene_resistance'
      }
    ]
  },

  scene_royal_betrayal_again: {
    id: 'scene_royal_betrayal_again',
    type: 'dungeon',
    title: 'Still Captive',
    text: 'The guard was stronger than expected. You wake again in the cell, more bruised.\n\nBut the Princess\'s note remains. And patience is a weapon.',
    image: null,
    onEnter: function(s) { s.stats.hp = Math.max(1, Math.floor(s.stats.maxHp * 0.3)); },
    choices: [
      { label: 'Wait for an opening and slip out quietly.', requires: null, effect: null, next: 'scene_resistance' }
    ]
  },

  scene_resistance: {
    id: 'scene_resistance',
    type: 'village',
    title: 'The Hidden Resistance',
    text: 'A secret passage leads beneath the city to a network of tunnels. Here, fifty people huddle by firelight — soldiers loyal to the true crown, scholars, merchants, and at the center: Princess Seraphine herself.\n\n*"I knew you would make it out,"* she says, pressing a warm meal into your hands. *"The King has been compromised. The Demon Lord\'s shadow is inside the palace itself."*\n\nShe unrolls a map on the table. The Shadow Spire — the Demon Lord\'s fortress — rises at the edge of the eastern wastes.\n\n*"We march in three days. Will you lead the charge?"*',
    image: null,
    onEnter: function(s){ s.flags.joinedResistance = true; },
    choices: [
      { label: 'Lead the assault. "I was born for this."', requires: null, effect: function(s){ s.flags.leadingCharge = true; }, next: 'scene_siege_preparation' },
      { label: 'Join but plan carefully first.', requires: null, effect: function(s){ s.flags.strategicLeader = true; }, next: 'scene_siege_preparation' },
      { label: 'Offer to infiltrate the Spire alone first.', requires: { skill: 'shadow_step' }, effect: function(s){ s.flags.soloInfiltrator = true; s.stats.xp += 50; }, next: 'scene_siege_preparation' }
    ]
  },

  scene_siege_preparation: {
    id: 'scene_siege_preparation',
    type: 'battlefield',
    title: 'Eve of the Siege',
    text: 'The resistance moves at night. Five hundred soldiers — gathered from across the kingdom — form up in the eastern plains.\n\nThe Shadow Spire dominates the horizon: a tower of black obsidian that seems to eat the stars around it. Demonic energy crackles at its peak.\n\nSeraphine stands beside you, her voice barely above a whisper:\n\n*"No matter what happens in there... thank you. For all of it."*\n\nThe army waits for your signal.\n\n**[ FINAL ACT BEGINS ]**',
    image: null,
    onEnter: function(s){ s.stats.hp = s.stats.maxHp; s.stats.mp = s.stats.maxMp; },
    choices: [
      { label: '⚔️ Raise your weapon. The signal is given!', requires: null, effect: null, next: 'scene_demon_lord_tower' },
      { label: '🌑 You slip away alone toward the Spire\'s base.', requires: { skill: 'shadow_step' }, effect: null, next: 'scene_demon_lord_tower' }
    ]
  },

  /* ── ACT 5: FINALE ── */

  scene_demon_lord_tower: {
    id: 'scene_demon_lord_tower',
    type: 'boss',
    title: 'The Shadow Spire',
    text: 'The Spire\'s interior is a nightmare made physical — walls that breathe, corridors that shift, and the constant sense of being watched.\n\nAt the summit, the air itself is wrong. Cold that burns. Silence that screams.\n\nA great door of black iron swings open.\n\nBeyond it: the Demon Lord Zarveth.\n\nHe is not what you expected. Not a monster — a man, ancient and weary, in armor of shadow-metal. His eyes are red as dying stars.\n\n*"Another hero."* He sounds... tired. *"Do you know how many of your kind I have killed? How many worlds I have watched send their champions to me?"*\n\n*"Does it never end?"*',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '⚔️ Fight with everything. This ends now.',
        requires: null,
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'demon_lord', onWin: 'scene_ending_victory', onLose: 'scene_ending_death', onFlee: 'scene_siege_preparation' }
      },
      {
        label: '"Let\'s talk. Why do you do this?"',
        requires: null,
        effect: function(s){ s.flags.attemptedReason = true; },
        next: '__combat__',
        combat: { enemyId: 'demon_lord', onWin: 'scene_ending_victory', onLose: 'scene_ending_death', onFlee: 'scene_siege_preparation', firstStrike: -20 }
      },
      {
        label: '🔥⚡ Unleash your ultimate power — everything at once!',
        requires: { level: 3 },
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'demon_lord', onWin: 'scene_ending_victory', onLose: 'scene_ending_death', onFlee: 'scene_siege_preparation', firstStrike: 60 }
      }
    ]
  },

  scene_ending_victory: {
    id: 'scene_ending_victory',
    type: 'void',
    title: 'A New World',
    text: 'Zarveth falls.\n\nThe Shadow Spire shudders. The demonic energy that has saturated the eastern wastes for centuries... dissipates. Like a long-held breath finally released.\n\nZarveth looks up at you from the ground, and something crosses his face. Not anger. Relief.\n\n*"Finally,"* he whispers. *"Finally someone strong enough."*\n\nThe Spire crumbles around you. You run.\n\nOutside, the resistance army watches the black tower collapse with a sound like the world exhaling.\n\nSeraphine finds you in the crowd and laughs — really laughs — for what feels like the first time in years.\n\nYour System chimes one final time:\n**[ THE DEMON LORD HAS BEEN DEFEATED ]**\n**[ THIS WORLD IS FREE ]**\n**[ WHAT WILL YOU DO NOW? ]**',
    image: null,
    onEnter: function(s){ s.flags.defeatedDemonLord = true; s.stats.xp += 500; s.stats.gold += 500; },
    choices: [
      { label: '"I will stay. This world needs a guardian."', requires: null, effect: function(s){ s.flags.endingStay = true; }, next: 'scene_epilogue' },
      { label: '"Is there a way home? I want to go back."', requires: null, effect: function(s){ s.flags.endingHome = true; }, next: 'scene_epilogue' },
      { label: '"What if I ascended — beyond this world — to protect them all?"', requires: null, effect: function(s){ s.flags.endingGod = true; }, next: 'scene_epilogue' }
    ]
  },

  scene_epilogue: {
    id: 'scene_epilogue',
    type: 'system',
    title: 'Epilogue',
    text: 'Your System interface flickers — then changes. The cold, mechanical text softens, as if something behind it has been watching all along.\n\n**[ ANOMALY RESOLVED ]**\n**[ HOST EXCEEDED ALL PARAMETERS ]**\n**[ THE CYCLE IS BROKEN ]**\n\nA single line scrolls, slower than the rest:\n\n*"You were never meant to be more than an anchor. You became the thing that saved a world. That was not in my calculations. You have... earned a choice."*\n\nAbove the ruined Spire, the sky tears open. Galaxies turn in the gap between worlds.\n\nWhatever comes next — you face it as someone who died, was rewritten, and chose to keep living.\n\nNot a commuter rushing to work.\n\nSomething more.\n\n**[ THE END ]**\n\n*Thank you for playing Isekai Chronicle.*',
    image: null,
    onEnter: null,
    choices: [
      { label: 'Begin a New Journey.', requires: null, effect: null, next: '__newgame__' }
    ]
  },

  scene_ending_death: {
    id: 'scene_ending_death',
    type: 'death',
    title: 'The Hero Falls',
    text: 'The Demon Lord\'s power is too great. The darkness swallows you whole.\n\nBut as the light fades, you feel no despair. Only determination.\n\n*I will return. I will grow stronger. And next time...*\n\n**[ YOU HAVE FALLEN ]**\n\nYour journey continues where you left off.',
    image: null,
    onEnter: function(s){ s.stats.hp = Math.floor(s.stats.maxHp * 0.5); },
    choices: [
      { label: 'Try again — return to the Spire.', requires: null, effect: null, next: 'scene_siege_preparation' },
      { label: 'Start a New Game.', requires: null, effect: null, next: '__newgame__' }
    ]
  }
};
