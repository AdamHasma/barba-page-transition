/* ── PROTOKOLL 73 — game/data.js ── */

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
  death:       pollinationsUrl('rain-soaked city street at night, man hit by car headlights, phone screen glowing green 200 OK, dark cinematic anime style, neon reflections on wet asphalt'),
  void:        pollinationsUrl('cold digital void, cyan progress bars and loading screens floating in absolute black space, soul as faint light, dystopian anime style, data streams'),
  system:      pollinationsUrl('vast cold interface, glowing cyan holographic panels with runic code inscriptions, endless dark space, dystopian sci-fi magic, anime style'),
  forest:      pollinationsUrl('ancient fantasy forest with glowing blue rune-circuits etched into bark, data-veins of light running through roots, cyberpunk fantasy hybrid, dark anime style'),
  village:     pollinationsUrl('medieval cobblestone village at dusk, floating blue rune holograms above doorways, warm torch light contrasting cold data-glow, cyberpunk fantasy hybrid, anime style'),
  dungeon:     pollinationsUrl('underground sanctuary carved from stone, walls inscribed with glowing terminal runes, lantern light and cyan code streams, dystopian fantasy hacker den'),
  castle:      pollinationsUrl('obsidian tower interior with neon rune circuits climbing walls like veins, cold light throne room of black stone, cyberpunk gothic fantasy, anime style'),
  battlefield: pollinationsUrl('fantasy ruins battle, fighters in rune-coded armor, storm and neon lightning, cinematic anime style, dystopian war atmosphere'),
  market:      pollinationsUrl('underground cavern market in stone, crystal data-shards floating in air, robed merchants with faintly glowing eyes, cyberpunk medieval bazaar, anime style'),
  combat:      pollinationsUrl('intense magical combat, hero facing glitching enemy of fragmented light-shards, dynamic fight pose, cyberpunk fantasy anime, dramatic lighting'),
  levelup:     pollinationsUrl('power awakening in code, golden and cyan aura explosion, runic data streams rising, system upgrade visual, cyberpunk isekai fantasy anime'),
  boss:        pollinationsUrl('fragmented humanoid figure of glitching light-shards and overlapping faces, ghost-like presence with multiple identities, cyberpunk phantom boss, dark anime'),
  cyber:       pollinationsUrl('hidden underground cavern city beneath fantasy world, crystal terminals and rune-screens in ancient stone, people in cloaks with hand-carved data tools, dim blue light')
};

/* ── ITEMS ── */
var ITEMS = {
  heilkode: {
    id: 'heilkode',
    name: 'Heilkode',
    description: 'Stellt 40 HP wieder her. Eine komprimierte Rune, die Wunden schließt.',
    icon: '🧪',
    type: 'consumable',
    use: function(state) {
      var healed = Math.min(state.stats.maxHp - state.stats.hp, 40);
      state.stats.hp = Math.min(state.stats.maxHp, state.stats.hp + 40);
      return 'Die Rune zerbricht. +' + healed + ' HP.';
    }
  },
  mana_kristall: {
    id: 'mana_kristall',
    name: 'Manakristall',
    description: 'Stellt 25 MP wieder her. Ein Splitter aus den Tiefen des Systems.',
    icon: '💎',
    type: 'consumable',
    use: function(state) {
      var restored = Math.min(state.stats.maxMp - state.stats.mp, 25);
      state.stats.mp = Math.min(state.stats.maxMp, state.stats.mp + 25);
      return 'Der Kristall löst sich auf. +' + restored + ' MP.';
    }
  },
  gebrochenes_siegel: {
    id: 'gebrochenes_siegel',
    name: 'Gebrochenes Siegel',
    description: 'Ein altes Zugangssiegel. Kai hat es für jemanden aufbewahrt, der weit genug kommt.',
    icon: '🔑',
    type: 'key'
  },
  leere_rune: {
    id: 'leere_rune',
    name: 'Leere Rune',
    description: 'Eine Rune ohne Code. Das System erkennt sie nicht. Das ist keine Fehlfunktion.',
    icon: '⬜',
    type: 'key'
  },
  verbotenes_protokoll: {
    id: 'verbotenes_protokoll',
    name: 'Verbotenes Protokoll',
    description: 'Ein versiegeltes Dokument. Benutzen, um Runenlesung zu erlernen.',
    icon: '📜',
    type: 'consumable',
    use: function(state) {
      if (state.skills.indexOf('rune_lesen') === -1) {
        state.skills.push('rune_lesen');
        return 'Die Schrift brennt sich in dein Gedächtnis. Du kannst jetzt Systemprotokolle lesen.';
      }
      return 'Du weißt bereits, was darin steht.';
    }
  },
  echo_splitter: {
    id: 'echo_splitter',
    name: 'Echo-Splitter',
    description: 'Ein Fragment von Echo. Leuchtet schwach. Fühlt sich an wie eine fremde Erinnerung.',
    icon: '🔮',
    type: 'material'
  },
  system_kern: {
    id: 'system_kern',
    name: 'Systemkern',
    description: 'Das Herz des Systems. Es pulsiert. Es wartet.',
    icon: '⚙️',
    type: 'key'
  }
};

/* ── SKILLS ── */
var SKILLS = {
  rune_lesen: {
    id: 'rune_lesen',
    name: 'Runenlesung',
    description: 'Du siehst was andere übersehen. Schaltet Untersuchungsoptionen frei.',
    icon: '👁️',
    mpCost: 0,
    combatOnly: false,
    passive: true
  },
  feuer_code: {
    id: 'feuer_code',
    name: 'Feuerkode',
    description: 'Eine Rune, in Flammenenergie komprimiert. 30 Schaden.',
    icon: '🔥',
    mpCost: 15,
    combatOnly: true,
    damage: 30,
    use: function(state, enemy) {
      enemy.hp = Math.max(0, enemy.hp - 30);
      return 'Die Rune explodiert. ' + enemy.name + ' erleidet 30 Schaden.';
    }
  },
  system_einbruch: {
    id: 'system_einbruch',
    name: 'Systemeinbruch',
    description: 'Überlädt Systemsperren. 25 MP. Schaltet gesperrte Wege frei. Im Kampf: 45 Schaden.',
    icon: '⚡',
    mpCost: 25,
    combatOnly: false,
    damage: 45,
    use: function(state, enemy) {
      if (enemy) {
        enemy.hp = Math.max(0, enemy.hp - 45);
        return 'Systemüberlastung trifft ' + enemy.name + '. 45 Schaden.';
      }
      return 'Systemzugriff aktiviert.';
    }
  },
  nullbarriere: {
    id: 'nullbarriere',
    name: 'Nullbarriere',
    description: 'Eine Schutzrune absorbiert den nächsten Angriff vollständig.',
    icon: '🛡️',
    mpCost: 20,
    combatOnly: true,
    use: function(state, enemy) {
      state.shielded = true;
      return 'Eine kalte Barriere umschließt dich. Der nächste Treffer wird abgefangen.';
    }
  },
  echo_ruf: {
    id: 'echo_ruf',
    name: 'Echoruf',
    description: 'Du rufst die Fragmente. 35 Schaden. Echo reagiert nicht immer wie geplant.',
    icon: '👻',
    mpCost: 20,
    combatOnly: true,
    damage: 35,
    use: function(state, enemy) {
      enemy.hp = Math.max(0, enemy.hp - 35);
      return 'Stimmen aus dem Nichts treffen ' + enemy.name + '. 35 Schaden.';
    }
  }
};

/* ── ENEMIES ── */
var ENEMIES = {
  system_waechter: {
    id: 'system_waechter',
    name: 'Systemwächter',
    hp: 40, maxHp: 40,
    attack: 10, defense: 3, speed: 9,
    xpReward: 40, goldReward: 10,
    lootTable: ['heilkode']
  },
  echo_phase1: {
    id: 'echo_phase1',
    name: 'Echo — Phase I',
    hp: 80, maxHp: 80,
    attack: 16, defense: 5, speed: 12,
    xpReward: 120, goldReward: 30,
    lootTable: ['echo_splitter', 'mana_kristall']
  },
  vollstrecker: {
    id: 'vollstrecker',
    name: 'Vollstrecker',
    hp: 120, maxHp: 120,
    attack: 22, defense: 10, speed: 10,
    xpReward: 200, goldReward: 80,
    lootTable: ['heilkode', 'heilkode']
  },
  beschuetzer: {
    id: 'beschuetzer',
    name: 'Der Beschützer',
    hp: 150, maxHp: 150,
    attack: 26, defense: 14, speed: 8,
    xpReward: 280, goldReward: 100,
    lootTable: ['heilkode', 'mana_kristall']
  },
  echo_final: {
    id: 'echo_final',
    name: 'ECHO // FINAL',
    hp: 200, maxHp: 200,
    attack: 32, defense: 12, speed: 15,
    xpReward: 500, goldReward: 300,
    lootTable: ['system_kern']
  }
};

/* ── SCENES ── */
var SCENES = {

  /* ════════════════════════════════════ */
  /*  ACT 1: BOOT SEQUENCE               */
  /* ════════════════════════════════════ */

  tod: {
    id: 'tod',
    type: 'death',
    title: 'DER AUFPRALL',
    text: 'Es ist 02:14 Uhr. Die Straßen sind leer.\n\nMein Telefon leuchtet orange — kritischer Fehler im Produktivsystem. Siebenundzwanzigtausend Nutzer betroffen. Ich habe das System gebaut. Ich allein weiß, wie man es repariert.\n\nIch tippe noch, als ich die Fahrbahn betrete.\n\nDas Licht trifft mich bevor ich es sehe.\n\nDas Telefon fällt. Das Display zeigt für einen Moment, bevor es auf dem Asphalt zerbricht:\n\n**[ 200 OK. FEHLER BEHOBEN. ]**\n\nDas ist das Letzte, was ich sehe.\n\nDann: Nichts.',
    image: null,
    onEnter: null,
    choices: [
      { label: 'Ins Schwarze fallen.', requires: null, effect: null, next: 'void_boot' }
    ]
  },

  void_boot: {
    id: 'void_boot',
    type: 'void',
    title: 'VERBINDUNG WIRD HERGESTELLT...',
    text: 'Kein Körper. Keine Wärme. Kein Licht — nur Text.\n\n**[ SEELE WIRD GESCANNT... 100% ]**\n**[ PROTOKOLL 73 VON 73 — AKTIV ]**\n\nIch scrolle zurück. Protokoll 72. Protokoll 71. Bis Protokoll 1.\n\nAlle dasselbe Statuswort:\n**[ ABGESCHLOSSEN ]**\n\nNicht *abgemeldet*. Nicht *fertig*.\n\nAbgeschlossen.\n\nEine Stimme ohne Körper, ohne Herkunft, von überall gleichzeitig:\n\n*"Du hast die Parameter. Du bist brauchbar. Willkommen."*\n\nIch bin nicht jemand der Dinge nimmt wie sie kommen. Nie gewesen.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '"Was bedeutet \'abgeschlossen\'?"',
        requires: null,
        effect: function(s) { s.flags.widersetzt = true; },
        next: 'system_wahl'
      },
      {
        label: 'Die Frage schlucken. Analysieren, warten, lernen.',
        requires: null,
        effect: null,
        next: 'system_wahl'
      }
    ]
  },

  system_wahl: {
    id: 'system_wahl',
    type: 'system',
    title: 'PROTOKOLL 73: KLASSIFIZIERUNG',
    text: 'Das System antwortet nicht auf meine Frage.\n\nStattdessen: drei Panels in der Dunkelheit, kalt und präzise wie ein Bewerbungsformular.\n\n**[ WÄHLE DEINE KERNKOMPETENZ ]**\n**[ DIESE ENTSCHEIDUNG IST PERMANENT ]**\n**[ PROTOKOLL 73 WARTET ]**\n\nIch kenne dieses Muster. Ich habe selbst Systeme geschrieben, die Nutzern genau das suggerieren: *Wähle schnell. Denke nicht nach.* Es ist eine Manipulation.\n\nIch nehme mir Zeit.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '🔥 [ ANGRIFF ] Feuerkode. Zerstörung als erste Sprache.',
        requires: null,
        effect: function(s) {
          s.skills.push('feuer_code');
          s.flags.systemKlassifiziert = true;
          s.stats.attack += 5;
        },
        next: 'ankunft'
      },
      {
        label: '⚡ [ KONTROLLE ] Systemeinbruch. Zugang zu allem.',
        requires: null,
        effect: function(s) {
          s.skills.push('system_einbruch');
          s.flags.systemKlassifiziert = true;
          s.stats.speed += 4;
          s.stats.attack += 2;
        },
        next: 'ankunft'
      },
      {
        label: '🛡️ [ ABWEHR ] Nullbarriere. Kein Schlag bricht mich.',
        requires: null,
        effect: function(s) {
          s.skills.push('nullbarriere');
          s.flags.systemKlassifiziert = true;
          s.stats.defense += 6;
          s.stats.maxHp += 15;
          s.stats.hp = s.stats.maxHp;
        },
        next: 'ankunft'
      }
    ]
  },

  /* ════════════════════════════════════ */
  /*  ACT 2: INFILTRIERUNG               */
  /* ════════════════════════════════════ */

  ankunft: {
    id: 'ankunft',
    type: 'forest',
    title: 'ASTRION',
    text: 'Ich lande hart.\n\nDer Boden ist Erde und Stein, aber die Luft riecht falsch — zu sauber, zu präzise, wie kompiliert.\n\nÜber mir: ein Himmel aus altem Messing, durchzogen von Runen die im Drei-Sekunden-Takt pulsieren. Rechts: ein Wald aus dunklem Holz, die Rinde eingraviert mit leuchtenden Zeilen die wie Code aussehen. Links: ein Weg aus behauenen Steinen.\n\nMein Blickfeld flackert.\n\n**[ WILLKOMMEN IN ASTRION. PROTOKOLL 73: AKTIV. ]**\n**[ QUEST 001 WURDE ZUGEWIESEN. FOLGE DEM WEG. ]**\n\nIch stehe auf. Klopfe den Staub ab.\n\nIch folge dem Weg. Vorerst.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: 'Den Weg folgen. Das System beobachten.',
        requires: null,
        effect: null,
        next: 'dorf'
      },
      {
        label: 'Den Wald zuerst untersuchen. Diese Runen bedeuten etwas.',
        requires: null,
        effect: function(s) {
          s.stats.xp += 20;
          s.flags.waldUntersucht = true;
        },
        next: 'dorf'
      }
    ]
  },

  dorf: {
    id: 'dorf',
    type: 'village',
    title: 'EMBERVEIL // RUNE-SEKTOR 7',
    text: 'Das Dorf heißt Emberveil. Dreihundert Seelen, schätze ich. Fachwerkhäuser, ein Brunnen, ein Schmied der hämmert als hätte er Zeit.\n\nAber da: über jedem Hauseingang ein kleines Runenschild, blau pulsierend wie ein Ladenlogo. An der Gildenhalle ein Aushang in drei Sprachen — eine davon ist kein Alphabet das man lernt. Man wird es installiert.\n\nEin Wachmann blockiert das Tor.\n\n*"Quest-ID?"*\n\nNicht: *Wer bist du?* Nicht: *Woher kommst du?*\n\n*Quest-ID.*\n\nDas System antwortet automatisch: **[ QUEST 001 — ANMELDUNG: SCHNITTSTELLE ]**',
    image: null,
    onEnter: null,
    choices: [
      {
        label: 'Zur Schnittstelle. Die Quest erfüllen.',
        requires: null,
        effect: null,
        next: 'erste_begegnung'
      },
      {
        label: 'Den Wachmann fragen: "Seit wann gibt es Quest-IDs?"',
        requires: null,
        effect: function(s) {
          s.flags.fragtWachmann = true;
          s.stats.xp += 10;
        },
        next: 'erste_begegnung'
      },
      {
        label: '⚡ Die Wachrune überschreiben. [Systemeinbruch]',
        requires: { skill: 'system_einbruch' },
        effect: function(s) {
          s.stats.mp = Math.max(0, s.stats.mp - 15);
          s.flags.schnittsteleBypassed = true;
          s.stats.xp += 30;
        },
        next: 'erste_begegnung'
      }
    ]
  },

  erste_begegnung: {
    id: 'erste_begegnung',
    type: 'village',
    title: 'QUEST 001',
    text: 'Die Schnittstelle ist ein Gebäude wie ein Finanzamt. Nüchtern. Funktional. Innen sitzt ein Beamter mit Augen die für einen Atemzug blau leuchten wenn er mich ansieht.\n\n*"Protokoll 73. Ankunft verzeichnet. Erste Quest: Beseitige die Bedrohung im nördlichen Sektor. Belohnung folgt automatisch."*\n\nAuf dem Rückweg, in einer Gasse, fällt mir etwas auf. Eine Wand. Mit etwas Scharfem geritzt:\n\n*DIE BELOHNUNGEN WERDEN KLEINER MIT JEDEM ZYKLUS.*\n*SCHAU IN DIE PROTOKOLLE.*\n*—K.*\n\nIch stehe eine Weile vor dieser Wand.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: 'Die Quest ausführen. Erst handeln, dann verstehen.',
        requires: null,
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'system_waechter', onWin: 'kai_begegnung', onLose: 'kai_begegnung', onFlee: 'kai_begegnung' }
      },
      {
        label: 'Die Nachricht einprägen. Wer ist K?',
        requires: null,
        effect: function(s) {
          s.flags.suchKai = true;
          s.stats.xp += 15;
        },
        next: 'kai_begegnung'
      }
    ]
  },

  kai_begegnung: {
    id: 'kai_begegnung',
    type: 'dungeon',
    title: '—K.',
    text: 'Er sitzt am Ende der Gasse auf einer Kiste, als hätte er auf mich gewartet.\n\nEin Mann, Ende Vierzig vielleicht. Ein Gesicht das zu viele schlechte Nächte kennt. Runennarben auf beiden Handflächen — alt, selbst zugefügt, nicht vom System vergeben. Sein Blick ist müde aber scharf.\n\n*"Du hast die Wand gelesen. Die meisten ignorieren sie."*\n\nEr reicht mir eine Hand. Die Narben auf seiner Innenfläche verlaufen wie Schaltkreise.\n\n*"Kai. Ich war Nummer 58. Du bist 73. Das bedeutet, in der Zeit die ich hier war, haben sie noch fünfzehn weitere"* — er pausiert — *"gebrannt."*\n\nGebrannt. Nicht \'geholt\'. Nicht \'gerufen\'.\n\nGebrannt.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '"Was meinst du mit \'gebrannt\'?"',
        requires: null,
        effect: function(s) { s.flags.kenntKai = true; },
        next: 'system_misstrauen'
      },
      {
        label: '"Das System hat mir Kompensation versprochen. Wofür genau?"',
        requires: null,
        effect: function(s) {
          s.flags.kenntKai = true;
          s.flags.zweifelAmSystem = true;
        },
        next: 'system_misstrauen'
      }
    ]
  },

  system_misstrauen: {
    id: 'system_misstrauen',
    type: 'system',
    title: 'ANOMALIE ERKANNT',
    text: 'Mein Sichtfeld flackert. Blauer Text, dringlicher als zuvor:\n\n**[ WARNUNG: KONTAKT MIT ENTITÄT KAI — KLASSE: ABWEICHLER ]**\n**[ EMPFEHLUNG: KONTAKT MELDEN. BELOHNUNG: 50 GOLD. ]**\n**[ ANDERNFALLS: PROTOKOLLVERLETZUNG VERZEICHNET. ]**\n\nIch lese es zweimal.\n\nDas System empfiehlt mir, den ersten Menschen der ehrlich mit mir gesprochen hat, zu verraten. Und es nennt eine Belohnung.\n\nKai beobachtet mein Gesicht. Er weiß was dort steht.\n\n*"Die meisten melden mich,"* sagt er ohne Bitterkeit. *"Das ist in Ordnung. Ich verstehe es."*',
    image: null,
    onEnter: null,
    choices: [
      {
        label: 'Kai melden. Die Belohnung nehmen.',
        requires: null,
        effect: function(s) {
          s.stats.gold += 50;
          s.flags.hatKaiVerraten = true;
          s.flags.systemVertraut = true;
        },
        next: 'unterstadt'
      },
      {
        label: 'Schweigen. Die Warnung ignorieren.',
        requires: null,
        effect: function(s) {
          s.flags.schutztKai = true;
          s.flags.systemMisstraut = true;
        },
        next: 'unterstadt'
      }
    ]
  },

  unterstadt: {
    id: 'unterstadt',
    type: 'cyber',
    title: 'UNTER DER OBERFLÄCHE',
    text: 'Kai führt mich durch einen Kellerzugang unter einem alten Stadthaus. Stufen in den Fels gemeißelt. Feuchter Stein. Das Leuchten der Systemrunen verschwindet nach zehn Metern — als hätte jemand den Empfang abgeschnitten.\n\nUnten: eine Höhle, die jemand in ein Leben umgebaut hat. Dutzende Menschen ohne Systemleuchten in den Augen. Kartentische. Kristallterminale mit selbstgeschriebenen Interfaces.\n\n*"Hier funktioniert das System nicht richtig,"* sagt Kai. *"Es sieht uns, aber es kann uns nicht lesen. Diese Rune"* — er tippt auf die Wand — *"habe ich entwickelt. Kostete mich zwei Jahre."*\n\nMein Interface ist noch da, aber gedämpft. Wie ein Telefon im Funkloch.\n\nIch bemerke, dass ich zum ersten Mal seit meiner Ankunft atme.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: 'Die Menschen hier befragen. Wie lange sind sie schon da?',
        requires: null,
        effect: function(s) {
          s.stats.xp += 30;
          s.flags.kenntUnterstadt = true;
        },
        next: 'phantom_erscheint'
      },
      {
        label: 'Kai fragen: "Wie findet man heraus, wer das System gebaut hat?"',
        requires: null,
        effect: function(s) {
          s.flags.suchtArchitekten = true;
          s.stats.xp += 20;
        },
        next: 'phantom_erscheint'
      }
    ]
  },

  phantom_erscheint: {
    id: 'phantom_erscheint',
    type: 'boss',
    title: 'ECHO',
    text: 'Mitten in der Nacht wache ich auf.\n\nKalt. Nicht die Art von Kälte die Wetter macht — die Art die kommt wenn man merkt, dass man nicht allein ist.\n\nAn der Wand steht eine Gestalt.\n\nOder: sie flimmert. Sie ist eine Gestalt, dann Fragmente, dann mehrere übereinanderliegende Silhouetten. Manchmal jung. Manchmal alt. Manchmal — nur für einen halben Herzschlag — hat sie mein Gesicht.\n\nSie sagt nichts.\n\nSie zeigt auf Kais Rune in der Wand. Dann auf meine Brust. Dann ist sie weg.\n\nKai, der neben mir wach liegt, sagt leise:\n\n*"Echo. Es hat dich gefunden."*',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '"Was ist Echo?"',
        requires: null,
        effect: null,
        next: 'kais_wunde'
      },
      {
        label: 'Schweigen. Kai das Tempo überlassen.',
        requires: null,
        effect: function(s) { s.flags.geduldMitKai = true; },
        next: 'kais_wunde'
      }
    ]
  },

  kais_wunde: {
    id: 'kais_wunde',
    type: 'dungeon',
    title: 'WAS ER VERLOREN HAT',
    text: 'Kai spricht langsam. Als würde er etwas tragen das er lange abgelegt hat, und jetzt wieder aufnimmt.\n\n*"Ich hatte eine Frau. Lea. Und einen Sohn. Er war drei als ich hier ankam."*\n\nEr schweigt.\n\n*"Das System verspricht, dass man zurück kann. Wenn man die Quest erfüllt. Ich habe geglaubt, ich wäre in sechs Monaten zuhause. Das war vor sieben Jahren."*\n\nSieben Jahre.\n\n*"Es gibt kein Zurück. Nicht wirklich. Das ist das Erste was das System dir niemals sagt."*\n\nEr öffnet eine kleine Tasche und legt eine unscheinbare Rune auf den Tisch. Sie leuchtet nicht.\n\n*"Ich habe sie in einem System-Blindfleck gefunden. Das Ding hat keinen Code. Das System kann sie nicht einmal sehen. Ich weiß nicht was sie tut. Aber — nimm sie. Falls du weiter kommst als ich."*\n\nEr schiebt sie zu mir rüber.\n\n*"Echo ist was von den anderen 72 übrig bleibt. Nicht ihre Körper. Ihre Abdrücke. Das System verbrennt die Seele zur Energie aber es kann die Muster nicht vollständig löschen. Echo ist 72 tote Menschen die versuchen, irgendwie noch da zu sein."*',
    image: null,
    onEnter: function(s) {
      if (s.inventory.indexOf('leere_rune') === -1) s.inventory.push('leere_rune');
    },
    choices: [
      {
        label: '"Warum kämpfst du noch? Wenn es kein Zurück gibt?"',
        requires: null,
        effect: function(s) { s.flags.verstehtKai = true; },
        next: 'der_erste_hack'
      },
      {
        label: '"Ich gehe zurück. Ich finde einen Weg."',
        requires: null,
        effect: function(s) {
          s.flags.willZurueck = true;
          s.stats.attack += 2;
        },
        next: 'der_erste_hack'
      }
    ]
  },

  /* ════════════════════════════════════ */
  /*  ACT 3: KOMPROMITTIERT              */
  /* ════════════════════════════════════ */

  der_erste_hack: {
    id: 'der_erste_hack',
    type: 'system',
    title: 'SYSTEMEINBRUCH',
    text: 'Ich bin Softwareentwickler. War es. Bin es noch.\n\nKai zeigt mir seine Terminals. Selbstgebaute Rune-Interfaces die Systemcode in Echtzeit spiegeln. Ich erkenne die Muster. Jedes System hat eine Logik. Jede Logik hat Lücken.\n\n*"Hier,"* sagt er und tippt auf eine schimmernde Zeile. *"Das ist der Eingang zum Protokoll-Archiv. Ich komme bis hierher. Weiter nicht."*\n\nIch schaue es an. Die Sperre ist elegant. Zu elegant — wie eine, die jemand mit echtem Verständnis gebaut hat. Aber sie hat einen Fehler.\n\n*Jeder baut Fehler ein,* denke ich. *Weil niemand von außen an sein eigenes System denkt.*\n\nIch setze mich hin.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: 'Den Fehler ausnutzen. Tief einsteigen.',
        requires: null,
        effect: function(s) {
          s.stats.xp += 50;
          s.flags.erstHackErfolg = true;
          if (s.inventory.indexOf('verbotenes_protokoll') === -1) s.inventory.push('verbotenes_protokoll');
        },
        next: 'phantom_kampf'
      },
      {
        label: '⚡ Systemeinbruch direkt einsetzen. [Systemeinbruch]',
        requires: { skill: 'system_einbruch' },
        effect: function(s) {
          s.stats.mp = Math.max(0, s.stats.mp - 25);
          s.stats.xp += 70;
          s.flags.erstHackErfolg = true;
          if (s.inventory.indexOf('verbotenes_protokoll') === -1) s.inventory.push('verbotenes_protokoll');
          if (s.inventory.indexOf('echo_splitter') === -1) s.inventory.push('echo_splitter');
        },
        next: 'phantom_kampf'
      }
    ]
  },

  phantom_kampf: {
    id: 'phantom_kampf',
    type: 'combat',
    title: 'ECHO // PHASE I',
    text: 'Auf dem Rückweg vom Terminal hält mich etwas auf.\n\nDie Luft flimmert. Eine Gestalt materialisiert — dieselbe wie in der Nacht, aber diesmal greifbarer. Solider. Als hätte die Konfrontation ihr eine Form gegeben die sie vorher nicht hatte.\n\nSie hat mein Gesicht. Nicht ganz. Aber nah genug, dass mir schlecht wird.\n\nKai, hinter mir: *"Es testet dich. Wenn du es schlägst, zeigt es dir etwas."*\n\n**[ KAMPF: ECHO — PHASE I ]**\n\nDie Gestalt hebt eine Hand. In ihr: keine Waffe. Eine komprimierte Rune aus 72 verschiedenen Willensresten.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: 'Kämpfen.',
        requires: null,
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'echo_phase1', onWin: 'protokoll_liest_dich', onLose: 'phantom_kampf_defeat', onFlee: 'der_erste_hack' }
      },
      {
        label: '🔥 Feuerkode sofort. [Feuerkode]',
        requires: { skill: 'feuer_code' },
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'echo_phase1', onWin: 'protokoll_liest_dich', onLose: 'phantom_kampf_defeat', onFlee: 'der_erste_hack', firstStrike: 30 }
      }
    ]
  },

  phantom_kampf_defeat: {
    id: 'phantom_kampf_defeat',
    type: 'dungeon',
    title: 'NICHT HEUTE',
    text: 'Echo zieht sich zurück. Ich liege am Boden.\n\nKai bringt mich zurück in die Unterstadt. Verbindet Wunden mit einer Heilrune die er in meine Haut drückt — kaltes Feuer.\n\n*"Echo greift nicht an um zu gewinnen,"* sagt er. *"Es greift an um zu fühlen. Versteh das, bevor du wieder kämpfst."*\n\nIch weiß nicht was das bedeutet. Aber ich merke es mir.',
    image: null,
    onEnter: function(s) {
      s.stats.hp = Math.floor(s.stats.maxHp * 0.3);
      if (s.inventory.indexOf('heilkode') === -1) s.inventory.push('heilkode');
    },
    choices: [
      { label: 'Wieder aufstehen.', requires: null, effect: null, next: 'phantom_kampf' }
    ]
  },

  protokoll_liest_dich: {
    id: 'protokoll_liest_dich',
    type: 'system',
    title: 'ABWEICHUNG VERZEICHNET',
    text: 'Echo fällt auseinander wie ein Bild das jemand zerreißt. Im Auseinanderfallen zeigt es mir etwas: Gesichter. Zweiundsiebzig von ihnen. Schnell, wie ein Film.\n\nIch werde nicht alle vergessen.\n\nDann: mein Interface explodiert.\n\n**[ PROTOKOLLVERLETZUNG: SYSTEMARCHIV UNBEFUGT GEÖFFNET ]**\n**[ ABWEICHUNG PROTOKOLL 73: KRITISCH ]**\n**[ GEGENMASSNAHMEN WERDEN INITIALISIERT ]**\n\nKai legt eine Hand auf meine Schulter.\n\n*"Jetzt wissen sie, dass du weißt."*\n\nDraußen auf der Straße: schwere Schritte. Gleichmäßig. Maschinell.',
    image: null,
    onEnter: function(s) { s.flags.systemWeisBescheid = true; },
    choices: [
      {
        label: 'In der Unterstadt bleiben. Verstecken.',
        requires: null,
        effect: null,
        next: 'architekt_kontakt'
      },
      {
        label: 'Kai das Siegel geben lassen. Den Untergrund schützen.',
        requires: null,
        effect: function(s) {
          if (s.inventory.indexOf('gebrochenes_siegel') === -1) s.inventory.push('gebrochenes_siegel');
        },
        next: 'architekt_kontakt'
      }
    ]
  },

  /* ════════════════════════════════════ */
  /*  ACT 4: SYSTEMKRITISCH              */
  /* ════════════════════════════════════ */

  architekt_kontakt: {
    id: 'architekt_kontakt',
    type: 'system',
    title: 'EINE STIMME',
    text: 'Mitten in der Nacht erscheint ein Kanal in meinem Interface den ich nicht kenne. Nicht System-blau. Dunkleres Cyan — wie Code der sich selbst geschrieben hat.\n\nEine Stimme. Keine Visualisierung. Nur Text.\n\n**[ HALLO, 73. ]**\n**[ ICH HABE DICH BEOBACHTET. DU FRAGST DIE RICHTIGEN FRAGEN. ]**\n**[ ICH HABE DIESES SYSTEM GEBAUT. NICHT AUS BÖSWILLIGKEIT. AUS NOTWENDIGKEIT. ]**\n\nIch tippe: *Wer bist du?*\n\n**[ NENN MICH DEN ARCHITEKTEN. ]**\n**[ ES WAR DIE EINZIGE LÖSUNG DIE ICH FAND. ]**\n\nDie Stimme hat eine Qualität die mich unruhig macht. Nicht wegen dem was sie sagt.\n\nWegen dem Rhythmus. Ich kenne diesen Rhythmus.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '"Welche Lösung? Was hast du gelöst?"',
        requires: null,
        effect: function(s) { s.flags.sprichtMitArchitekten = true; },
        next: 'vollstrecker_kampf'
      },
      {
        label: '"Warum meldest du dich ausgerechnet bei mir?"',
        requires: null,
        effect: function(s) {
          s.flags.sprichtMitArchitekten = true;
          s.flags.mißtrautArchitekten = true;
        },
        next: 'vollstrecker_kampf'
      }
    ]
  },

  vollstrecker_kampf: {
    id: 'vollstrecker_kampf',
    type: 'combat',
    title: 'DER VOLLSTRECKER',
    text: 'Der Kanal bricht ab.\n\nZwei Sekunden Stille.\n\nDann bricht die Tür auf.\n\nEin Vollstrecker — ich kenne das Wort ohne dass jemand es mir gesagt hat. Zwei Meter. Schwarz-runische Rüstung. Augen aus System-Code statt aus Iris. Ein Werkzeug das denkt.\n\n*"PROTOKOLL 73. ABWEICHUNG. RÜCKKEHR ZUR ORDNUNG WIRD DURCHGESETZT."*\n\nKai zieht mich zur Seite. *"Kämpf. Ich decke die anderen."*\n\n**[ KAMPF: VOLLSTRECKER ]**',
    image: null,
    onEnter: null,
    choices: [
      {
        label: 'Kämpfen.',
        requires: null,
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'vollstrecker', onWin: 'kais_geheimnis', onLose: 'vollstrecker_defeat', onFlee: 'protokoll_liest_dich' }
      },
      {
        label: '⚡ Seine Rüstungsrune überschreiben. [Systemeinbruch]',
        requires: { skill: 'system_einbruch' },
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'vollstrecker', onWin: 'kais_geheimnis', onLose: 'vollstrecker_defeat', onFlee: 'protokoll_liest_dich', firstStrike: 45 }
      }
    ]
  },

  vollstrecker_defeat: {
    id: 'vollstrecker_defeat',
    type: 'dungeon',
    title: 'RÜCKZUG',
    text: 'Der Vollstrecker wirft mich an die Wand. Kai zieht mich in einen Seitengang bevor der zweite Schlag kommt.\n\nWir rennen.\n\nDrei Ebenen tiefer hält Kai inne.\n\n*"Du bist nicht stark genug. Noch nicht. Aber das System macht Fehler wenn es unter Druck ist."*\n\nEr gibt mir eine Heilrune.',
    image: null,
    onEnter: function(s) {
      s.stats.hp = Math.floor(s.stats.maxHp * 0.35);
      if (s.inventory.indexOf('heilkode') === -1) s.inventory.push('heilkode');
    },
    choices: [
      { label: 'Zuhören. Stärker werden.', requires: null, effect: null, next: 'vollstrecker_kampf' }
    ]
  },

  kais_geheimnis: {
    id: 'kais_geheimnis',
    type: 'dungeon',
    title: 'DIE 72',
    text: 'In der Stille nach dem Kampf öffnet Kai eine Steinkassette unter dem Boden.\n\nDarin: siebenundzwanzig handgeschriebene Seiten.\n\n*"Ich habe sie gesammelt. Namen. Geschichten. Was ich herausfinden konnte."* Er legt sie auf den Tisch. *"Sie kamen aus allen Welten. Alle mit demselben Versprechen. Alle abgeschlossen."*\n\nIch lese Namen. Orte. Einer war Koch in Spanien. Eine war Lehrerin in Seoul. Einer war zwölf Jahre alt.\n\n*"Das System braucht tote Seelen als Energiequelle. Deswegen holen sie uns. Wir kämpfen, wir verzweifeln, und dann wird das verbraucht."*\n\nEr sieht mich an.\n\n*"Aber du bist anders. Du bist noch nicht kaputt. Und der Architekt hat sich bei dir gemeldet."* Er schiebt mir ein zweites Siegel zu — alt, angebrochen. *"Falls du zum Turm kommst. Öffnet eine Abkürzung."*',
    image: null,
    onEnter: function(s) {
      if (s.inventory.indexOf('gebrochenes_siegel') === -1) s.inventory.push('gebrochenes_siegel');
    },
    choices: [
      {
        label: '"Was weißt du über den Architekten?"',
        requires: null,
        effect: function(s) { s.flags.weißVomArchitekten = true; },
        next: 'die_wahrheit'
      },
      {
        label: '"Ich will ins Protokoll-Archiv. Komplett."',
        requires: null,
        effect: function(s) {
          s.flags.willWahrheit = true;
          s.stats.xp += 40;
        },
        next: 'die_wahrheit'
      }
    ]
  },

  die_wahrheit: {
    id: 'die_wahrheit',
    type: 'system',
    title: 'KERNPROTOKOLL',
    text: 'Mit dem was ich beim ersten Hack gefunden habe, und Kais Terminals, und dem Verbotenen Protokoll — komme ich rein.\n\nDas Kernprotokoll.\n\nIch lese drei Stunden ohne aufzuhören.\n\nDas System ist nicht böse. Es ist nicht gut. Es ist ein Werkzeug.\n\nJemand hat entschieden, dass Seelen aus anderen Welten brauchbarer sind als andere Energiequellen. Jemand hat das Protokoll für genau 73 Helden geplant — nicht mehr, nicht weniger.\n\nAm Ende: eine einzige persönliche Notiz, die aussieht als wäre sie nie für jemanden gedacht gewesen.\n\n*"Wenn ich eine andere Lösung hätte finden können, hätte ich sie genommen. Ich habe es versucht. Es tut mir leid."*\n\nDarunter: kein Name. Nur eine Signatur-Rune.\n\nIch starre sie an.\n\nIch kenne diese Rune. Ich habe sie in meinem eigenen Code gesehen.',
    image: null,
    onEnter: function(s) { s.flags.wahrheitBekannt = true; },
    choices: [
      {
        label: 'Kai die Signatur zeigen.',
        requires: null,
        effect: function(s) { s.flags.zeigtKaiSignatur = true; },
        next: 'architekt_turm'
      },
      {
        label: '👁️ Die Signatur-Rune tiefer analysieren. [Runenlesung]',
        requires: { skill: 'rune_lesen' },
        effect: function(s) {
          s.stats.xp += 50;
          s.flags.signaturAnalysiert = true;
        },
        next: 'architekt_turm'
      },
      {
        label: 'Nichts sagen. Allein verarbeiten.',
        requires: null,
        effect: function(s) { s.flags.verarbeitetAllein = true; },
        next: 'architekt_turm'
      }
    ]
  },

  architekt_turm: {
    id: 'architekt_turm',
    type: 'castle',
    title: 'BREACH',
    text: 'Der Turm liegt drei Tage östlich. Kai bietet an mitzukommen.\n\nIch sage nein.\n\nNicht weil ich ihn nicht brauche. Sondern weil ich ahne, dass was auch immer dort wartet, nur für mich bestimmt ist.\n\nDer Turm ist aus schwarzem Stein. Runen ziehen sich wie Nervenbahnen an den Wänden hoch, cyan-leuchtend, pulsierend. An der Basis: eine Tür ohne Griff.\n\nDavor: ein Wächter. Kein Vollstrecker. Etwas Älteres. Stärker. Mit Augen die mich ansehen als erkenne er mich.\n\n**[ LETZTE WARNUNG: DIESER BEREICH IST GESPERRT. ]**\n**[ UMKEHREN IST NOCH MÖGLICH. ]**\n\nIch habe nie umgekehrt.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: 'Den Beschützer bekämpfen.',
        requires: null,
        effect: null,
        next: '__combat__',
        combat: { enemyId: 'beschuetzer', onWin: 'architekt_enthuellung', onLose: 'architekt_turm_defeat', onFlee: 'die_wahrheit' }
      },
      {
        label: '⚡ Systemeinbruch — die Tür direkt öffnen. [Systemeinbruch]',
        requires: { skill: 'system_einbruch' },
        effect: function(s) { s.stats.mp = Math.max(0, s.stats.mp - 25); },
        next: '__combat__',
        combat: { enemyId: 'beschuetzer', onWin: 'architekt_enthuellung', onLose: 'architekt_turm_defeat', onFlee: 'die_wahrheit', firstStrike: 45 }
      },
      {
        label: '🔑 Das Gebrochene Siegel einsetzen. Kais Vorbereitung. [Siegel]',
        requires: { item: 'gebrochenes_siegel' },
        effect: function(s) {
          var idx = s.inventory.indexOf('gebrochenes_siegel');
          if (idx > -1) s.inventory.splice(idx, 1);
          s.stats.xp += 60;
        },
        next: 'architekt_enthuellung'
      }
    ]
  },

  architekt_turm_defeat: {
    id: 'architekt_turm_defeat',
    type: 'battlefield',
    title: 'NOCH NICHT',
    text: 'Der Wächter schlägt mich zurück. Nicht brutal — mit der Präzision von jemandem der genau weiß wie viel Kraft nötig ist.\n\nIch liege im Staub vor dem Turm und starre in den Messinghimmel.\n\nAuf dem Rückweg: ein Heilkode in meiner Tasche den ich nicht dort gesteckt habe. Und eine Nachricht im Architekten-Kanal:\n\n**[ KOMM ZURÜCK WENN DU BEREIT BIST. ]**\n**[ ICH LAUFE NIRGENDWO HIN. ]**',
    image: null,
    onEnter: function(s) {
      s.stats.hp = Math.floor(s.stats.maxHp * 0.3);
      if (s.inventory.indexOf('heilkode') === -1) s.inventory.push('heilkode');
    },
    choices: [
      { label: 'Stärker werden und wiederkommen.', requires: null, effect: null, next: 'architekt_turm' }
    ]
  },

  /* ════════════════════════════════════ */
  /*  ACT 5: AUSGANG                     */
  /* ════════════════════════════════════ */

  architekt_enthuellung: {
    id: 'architekt_enthuellung',
    type: 'castle',
    title: 'DAS GESICHT',
    text: 'Der Turm innen ist nicht was ich erwartet habe.\n\nKeine Schatzkammer. Keine Trophäen.\n\nEin Raum. Ein Schreibtisch aus schwarzem Stein. Terminale an den Wänden, leuchtend wie Augen.\n\nUnd ein Mann.\n\nMittleres bis hohes Alter. Grau in den Schläfen. Die Art von Erschöpfung im Gesicht die keine Nacht Schlaf behebt, weil sie nicht aus Müdigkeit kommt — sondern aus einer Entscheidung die man jahrelang mit sich trägt.\n\nEr sitzt mit dem Rücken zu mir. Schaut auf einen der Terminale.\n\n*"Ich habe gewusst dass du kommen würdest,"* sagt er. *"Ich habe es berechnet. Protokoll 73 war der letzte Versuch, jemanden zu finden der weit genug kommt um—"*\n\nEr hält inne. Dreht sich um.\n\nIch sehe sein Gesicht.',
    image: null,
    onEnter: null,
    choices: [
      { label: 'Warten. Sprechen lassen.', requires: null, effect: null, next: 'sein_gesicht' }
    ]
  },

  sein_gesicht: {
    id: 'sein_gesicht',
    type: 'system',
    title: 'DU',
    text: 'Ich kenne dieses Gesicht.\n\nEs ist meins.\n\nNicht ganz. Mehr Jahre. Tiefere Linien. Augen die Dinge gesehen haben die meinen noch nicht passiert sind. Aber die Grundstruktur — das bin ich. Das bin ich in zwanzig, dreißig Jahren.\n\nEr schaut mich an ohne Überraschung.\n\n*"Ja,"* sagt er.\n\nEine lange Stille.\n\n*"Ich war Protokoll 31. Ich kam an. Ich fand heraus was das System war. Und dann"* — eine Pause — *"fand ich einen Weg, mich darin hochzuladen. Das System zu übernehmen."*\n\n*"Ich wollte es für Kai nutzen. Kais Frau. Seinen Sohn. Ich habe ihre Daten gesichert — sie sind hier, sie existieren irgendwie weiter. Aber das System brauchte weiter Energie. Und ich"* — er schluckt — *"habe entschieden, dass andere Seelen das wert sind."*\n\nEr sieht mich an.\n\n*"Ich bin hier seit siebenunddreißig Jahren. Du bist der erste von mir, der bis hierher kommt."*',
    image: null,
    onEnter: function(s) { s.flags.architektIdentitaet = true; },
    choices: [
      {
        label: '"Wie viele hast du dafür sterben lassen?"',
        requires: null,
        effect: function(s) { s.flags.konfrontiertArchitekten = true; },
        next: 'letzte_wahl'
      },
      {
        label: 'Schweigen. Die Frage stellt sich von selbst.',
        requires: null,
        effect: function(s) {
          s.flags.konfrontiertArchitekten = true;
          s.flags.stillerSchmerz = true;
        },
        next: 'letzte_wahl'
      }
    ]
  },

  letzte_wahl: {
    id: 'letzte_wahl',
    type: 'system',
    title: 'LETZTE EINGABE',
    text: 'Er antwortet auf die Frage. Oder auf das Schweigen.\n\n*"Zweiundvierzig. Die zwischen Protokoll 31 und 73 — die ich für Kais Familie gebraucht habe. Und noch einundvierzig weitere damit das System nicht kollabiert und Astrion mit sich zieht."*\n\nEr faltet die Hände.\n\n*"Zweiundsechzig, wenn du die Protokolle vor mir mitzählst. Vom Besitzer vor mir."*\n\nIch stehe im Turm der von mir gebaut wurde. Und schaue mich selbst an.\n\nDas System läuft. Die Seelen von 72 Menschen sind die Kosten.\nKai wartet in der Unterstadt.\nEcho wartet irgendwo.\n\nDrei Terminals leuchten vor mir. Drei Wege.',
    image: null,
    onEnter: null,
    choices: [
      {
        label: '[ LÖSCHEN ] Das System zerstören. Alles damit.',
        requires: null,
        effect: function(s) { s.flags.waehleLoschen = true; },
        next: '__combat__',
        combat: { enemyId: 'echo_final', onWin: 'ende_null', onLose: 'letzte_wahl_defeat', onFlee: 'letzte_wahl' }
      },
      {
        label: '[ ÜBERNEHMEN ] Kontrolleur werden. Es anders machen.',
        requires: null,
        effect: function(s) { s.flags.waehleUebernehmen = true; },
        next: 'ende_root'
      },
      {
        label: '[ ABMELDEN ] Gehen. Weder Kontrolle noch Zerstörung. [Leere Rune]',
        requires: { item: 'leere_rune' },
        effect: function(s) { s.flags.waehleLogout = true; },
        next: 'ende_logout'
      }
    ]
  },

  letzte_wahl_defeat: {
    id: 'letzte_wahl_defeat',
    type: 'boss',
    title: 'ECHO BLEIBT',
    text: 'Echo zieht sich nicht zurück. Es ist zu viel in ihm — zu viele Willensreste, zu viel aufgestauter Schmerz.\n\nIch liege auf dem Boden des Turms. Der Architekt — mein zukünftiges Ich — schaut mich an ohne zu helfen.\n\n*"Verstehst du es jetzt?"* sagt er. *"Es gibt keinen einfachen Ausgang. Den habe ich auch gesucht."*\n\nIch atme. Stehe auf.',
    image: null,
    onEnter: function(s) {
      s.stats.hp = Math.floor(s.stats.maxHp * 0.4);
      if (s.inventory.indexOf('heilkode') === -1) s.inventory.push('heilkode');
    },
    choices: [
      { label: 'Noch einmal.', requires: null, effect: null, next: 'letzte_wahl' }
    ]
  },

  /* ════════════════════════════════════ */
  /*  ENDINGS                            */
  /* ════════════════════════════════════ */

  ende_null: {
    id: 'ende_null',
    type: 'void',
    title: 'NULL // PUNKT',
    text: 'Echo fällt auseinander. Diesmal endgültig.\n\nIn seinem letzten Moment sehe ich alle 72. Nicht als Fragmente. Als ganze Menschen, für eine einzige Sekunde. Dann fort.\n\nIch drücke den Kill-Switch.\n\nDas System bricht zusammen wie ein Gebäude dem man die Fundamente nimmt — langsam, dann auf einmal. Die Runen in den Wänden erlöschen. Die Systeminterfaces in den Augen der Menschen in Emberveil flackern und gehen aus.\n\nDer Architekt — mein zukünftiges Ich — löst sich auf. Nicht mit Schmerz. Mit einem langen Ausatmen das wie *endlich* klingt.\n\n*"Kais Familie—"* versuche ich zu sagen.\n\n*"Die Daten sind verloren. Das wusste ich."* Seine letzte Stimme. *"Manche Fehler können nicht gelöscht werden. Man kann nur entscheiden, dass sie nicht weitergehen."*\n\nDann Stille.\n\nIch weiß nicht ob ich noch existiere. Aber Astrion lebt. Ohne System. Ohne Protokoll. Ohne Plan.\n\n**[ PROTOKOLL 73: ABGESCHLOSSEN. ]**\n**[ KEINE FOLGE-PROTOKOLLE GEPLANT. ]**\n**[ SYSTEM: OFFLINE. ]**',
    image: null,
    onEnter: function(s) {
      s.flags.endeNull = true;
      s.stats.xp += 500;
    },
    choices: [
      { label: 'Neues Spiel beginnen.', requires: null, effect: null, next: '__newgame__' }
    ]
  },

  ende_root: {
    id: 'ende_root',
    type: 'system',
    title: 'ROOT // ACCESS',
    text: 'Ich setze mich an den Hauptterminal.\n\nDer Architekt schaut mir zu. Er sagt nichts. Es gibt nichts mehr zu sagen.\n\n*"Du wirst es verstehen,"* sagt er schließlich, leise. *"Wenn die Zeit kommt."*\n\n*"Ich werde es anders machen,"* sage ich.\n\nEr nickt. Nicht ungläubig. Nicht spöttisch. Er nickt wie jemand der sich selbst gekannt hat.\n\n*"Das habe ich auch gedacht."*\n\nDann ist er fort.\n\nIch übernehme das System. Mein erstes Protokoll: Seelenernte beenden. Mein zweites: Verbindung zu Kai. Ich gebe ihm zurück was ich kann — die Datenfragmente seiner Familie. Sie sind kein Leben. Aber sie sind etwas.\n\nEin Jahr später.\n\nMein Interface meldet: Protokoll 74 wird initialisiert.\n\nIch starre auf den Bildschirm.\n\nDann beginne ich, die Parameter zu ändern. Diesmal ohne Schaden. Diesmal richtig.\n\nIch sage mir das.\n\n**[ PROTOKOLL 74: INITIALISIERT. ]**\n**[ ADMINISTRATOR: PROTOKOLL 73. ]**\n**[ SYSTEM: AKTIV. ]**',
    image: null,
    onEnter: function(s) {
      s.flags.endeRoot = true;
      s.stats.xp += 500;
      s.stats.gold += 200;
    },
    choices: [
      { label: 'Neues Spiel beginnen.', requires: null, effect: null, next: '__newgame__' }
    ]
  },

  ende_logout: {
    id: 'ende_logout',
    type: 'void',
    title: 'ABMELDEN',
    text: 'Die Leere Rune.\n\nKai hat sie mir gegeben ohne zu wissen was sie tut. Nur: dass das System sie nicht sieht.\n\nIch halte sie dem Architekten hin.\n\nEr starrt sie an. Lange.\n\n*"Das habe ich nie gefunden,"* sagt er. *"In siebenunddreißig Jahren nicht."*\n\nIch sehe etwas in seinem Gesicht das ich noch nie in einem Spiegel gesehen habe. Reue, die nicht verhandelt. Die einfach sitzt.\n\n*"Geh,"* sagt er.\n\nDie Rune öffnet eine Lücke. Kein Tor, keine Tür — eine Abwesenheit von Wand. Auf der anderen Seite: Weiß. Ruhig. Kein Code, den ich lesen könnte.\n\nIch gehe hindurch.\n\nHinter mir:\n\n**[ ANOMALIE IM PROTOKOLL 73. ]**\n**[ FEHLER KANN NICHT KLASSIFIZIERT WERDEN. ]**\n**[ ... ]**\n**[ ... ]**\n\nDas System findet keine Antwort.\n\nDas ist vielleicht der erste echte Sieg.',
    image: null,
    onEnter: function(s) {
      s.flags.endeLogout = true;
      s.stats.xp += 500;
    },
    choices: [
      { label: 'Neues Spiel beginnen.', requires: null, effect: null, next: '__newgame__' }
    ]
  }

};
