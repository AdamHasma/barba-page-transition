# Chapter Production Guide

**Trigger:** When the user says "nächste chapter" (or "next chapter"), execute the workflow below on the next pending chapter.

---

## Chapter Status

| # | Title | Status | File |
|---|-------|--------|------|
| 1 | Nightmare Begins | ✅ Done | `story/ch01.json` |
| 2 | Slave Caravan | ✅ Done | `story/ch02.json` |
| 3 | The Strings of Fate | ✅ Done | `story/ch03.json` |
| 4 | Mountain King | ⏳ Next | — |
| 5 | Broken Chains | — | — |
| 6 | Confronting the Tyrant | — | — |
| 7 | Three Slaves and a Hero | — | — |
| 8 | Nothing at All | — | — |
| 9 | Wishful Thinking | — | — |
| 10 | First Man Down | — | — |
| 11 | Crossroads | — | — |
| 12 | The Smell of Blood | — | — |
| 13 | Moment of Truth | — | — |
| 14 | Child of Shadows | — | — |
| 15 | Shadow Slave | — | — |
| 16 | Rebirth | — | — |
| 17 | Three Simple Words | — | — |
| 18 | Absence of Light | — | — |
| 19 | Crossing the Bridge | — | — |
| 20 | Outcast Once Again | — | — |
| 21 | First Performance | — | — |
| 22 | Corpse Corner | — | — |
| 23 | Dreams and Nightmares | — | — |
| 24 | Moving Up in the World | — | — |
| 25 | Wilderness Survival | — | — |
| 26 | Changing Star | — | — |
| 27 | Measure of Power | — | — |
| 28 | Training Montage | — | — |
| 29 | The Last Day on Earth | — | — |
| 30 | Starless Void | — | — |
| 31 | Low Tide | — | — |
| 32 | Making a Choice | — | — |
| 33 | Carapace Scavenger | — | — |
| 34 | Only Steel Remembers | — | — |
| 35 | A Shadow, a Star and an Oracle | — | — |
| 36 | Bonfire | — | — |
| 37 | Getting to Know Each Other | — | — |
| 38 | Questions in the Dark | — | — |
| 39 | Journey to the West | — | — |
| 40 | Weak Point | — | — |
| 41 | Strength in Numbers | — | — |
| 42 | Essence of Combat | — | — |
| 43 | Repetition | — | — |
| 44 | Cassie's Dream | — | — |
| 45 | Sound of Laughter | — | — |
| 46 | Experience | — | — |
| 47 | Echo | — | — |
| 48 | The Storm | — | — |
| 49 | Natural Element | — | — |
| 50 | Death Trap | — | — |
| 51 | Carapace Centurion | — | — |
| 52 | Clarity | — | — |
| 53 | Immortal Flame | — | — |
| 54 | Spoils of War | — | — |
| 55 | Lucky People | — | — |
| 56 | The Heaviest Thing in the World | — | — |
| 57 | Use of Weapons | — | — |
| 58 | Survival of the Fittest | — | — |
| 59 | Shadow of the Crimson Spire | — | — |
| 60 | Bone Ridge | — | — |
| 61 | Sea of Ash | — | — |
| 62 | Hide and Seek | — | — |
| 63 | Lord of Ashes | — | — |
| 64 | Pursued by Demons | — | — |
| 65 | Lights in the Darkness | — | — |
| 66 | First Part of the Plan | — | — |
| 67 | Racing Against Time | — | — |
| 68 | Beacon of Death | — | — |
| 69 | The Guest | — | — |
| 70 | Judgement of the Blade | — | — |
| 71 | One Small Mistake | — | — |
| 72 | Demon Slayers | — | — |
| 73 | The Circle of Death | — | — |
| 74 | Midnight Shard | — | — |
| 75 | Broken Dreams | — | — |
| 76 | The Abyss | — | — |
| 77 | Enthralled | — | — |
| 78 | Bliss | — | — |
| 79 | Twist of Fate | — | — |
| 80 | Spirit of Exploration | — | — |
| 81 | Weaver's Eye | — | — |
| 82 | Fear of the Unknown | — | — |
| 83 | Five | — | — |
| 84 | Black Seed | — | — |
| 85 | One Step at a Time | — | — |
| 86 | Final Clue | — | — |
| 87 | Plan of Escape | — | — |
| 88 | Boat Builders | — | — |
| 89 | Demon's Bones | — | — |
| 90 | Nightfall | — | — |
| 91 | Escape | — | — |
| 92 | Journey into the Night | — | — |
| 93 | Black Water | — | — |
| 94 | Battle in the Depths | — | — |
| 95 | Starlight | — | — |

---

## Workflow — Step by Step

### 0. Identify the next chapter

Look at the status table above. Take the first row marked ⏳ Next. Its EPUB file is `OEBPS/page-{N-1}.html` (Chapter 1 = page-0.html, Chapter 2 = page-1.html, etc.).

### 1. Extract the raw chapter text from the EPUB

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('c:\_ Dev Projekte\unnoetig\text-rpg\ss.epub')
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'OEBPS/page-X.html' }  # replace X
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()
$text = $content -replace '<[^>]+>', "`n"
$text = $text -replace '&amp;','&' -replace '&lt;','<' -replace '&gt;','>' -replace '&nbsp;',' ' -replace '&quot;','"' -replace '&#39;',"'" -replace '&mdash;','—' -replace '&hellip;','…' -replace '&rsquo;',"'" -replace '&ldquo;','"' -replace '&rdquo;','"'
($text -split "`n" | Where-Object { $_.Trim() -ne '' }) -join "`n"
```

### 2. Extract canonical events

List what Sunny **actually does** in the chapter — in order. Be specific. This is the source of truth. Every correct player choice must trace back to one of these events.

### 3. Map decision points

From the canonical events, identify 1–3 moments where a player might plausibly choose differently. For each:
- **Correct path:** what Sunny did in the book → leads forward
- **Wrong path(s):** plausible but incorrect → leads to `game_over` scene or setback

Rules for decision points:
- Wrong choices must feel tempting, not stupid
- Each chapter should have at least 1 and at most 3 binary decisions
- Not every scene needs a decision — most are single-choice narrative beats

### 4. Design the scene list

Typical structure for a chapter:
```
chNN_intro         → opening beat (no decision)
chNN_decision_A    → first binary (correct / wrong)
chNN_gameover_X    → wrong path result (type: game_over)
chNN_beat_1        → narrative beat (no decision)
chNN_decision_B    → second binary if needed
chNN_climax        → chapter peak
chNN_end           → chapter complete, teaser for next
```

Scene IDs always use the prefix `chNN_` (e.g., `ch02_intro`).

### 5. Write the scenes

Apply Guiltythree's style throughout:

**Voice rules:**
- Second person ("You"), present tense
- Short paragraphs — 1–3 sentences each
- Snarky, dry internal monologue when Sunny thinks
- Dialogue in *italics* with `*...*`
- Emotions shown through action/sensation, never labeled
- Scenes end on tension or decision, never on summary

**Forbidden words/phrases:**
- suddenly, in that moment, a wave of emotion
- "Taking a deep breath..."
- "He felt afraid / relieved / determined"
- Multi-sentence adjective stacks

**Good examples from Ch01:**
- ✓ `*The Spell always completes its work.*` — italicized thought, no commentary
- ✓ `It costs most of what you have left in your pocket. You buy it anyway.` — action over justification
- ✓ `The dark comes up like water.` — sensory metaphor, no explanation

**System messages** use `**[ CAPS ]**` format:
```
**[ ASPECT REVEALED: TEMPLE SLAVE ]**
**[ DORMANT TIER — ATTRIBUTES HIDDEN ]**
```

### 6. Assign effects

Each scene's `onEnter` and each choice's `effect` is a JSON array of ops:

| Op | Required fields | What it does |
|----|-----------------|--------------|
| `addXp` | `value` | Add XP |
| `addGold` | `value` | Add gold |
| `addHp` | `value` | Restore HP (capped at maxHp) |
| `addMp` | `value` | Restore MP (capped at maxMp) |
| `setHp` | `pct` (0.0–1.0) | Set HP to % of max |
| `setMp` | `pct` (0.0–1.0) | Set MP to % of max |
| `modStat` | `stat`, `value` | Add value to any stat |
| `setStat` | `stat`, `value` | Set any stat to value |
| `setFlag` | `name`, (opt)`value` | Set a boolean/value flag |
| `addItem` | `id` | Add item to inventory |
| `removeItem` | `id` | Remove item from inventory |
| `addSkill` | `id` | Add skill/aspect/attribute |
| `removeSkill` | `id` | Remove skill |

XP pacing (rough guide): 30–50 XP per chapter for narrative scenes, 60–120 for combat/boss. Level-ups should feel earned, not constant.

### 7. Choose scene types (background image)

Valid `type` values and when to use them:

| Type | Scene | IMAGE_MAP description |
|------|-------|-----------------------|
| `slum` | Real world / Outskirts | Dystopian urban slum, grey concrete |
| `station` | Police precinct / processing | Government facility, harsh fluorescent |
| `nightmare` | Open Dream Realm / wastes | Frozen wasteland, ash-covered, dim twilight |
| `dream_realm` | Deep nightmare / surreal spaces | Cracked grey earth, impossible geometry |
| `mountain` | Mountain pass | Brutal frozen pass, blizzard, chains |
| `caravan` | Slave caravan scenes | Chained figures, soldiers, stormy sky |
| `winter_camp` | Camp / shelter scenes | Dying firelight, huddled figures, blizzard |
| `ruins` | Temple or ancient ruins | Stone pillars, creeping shadows, cold light |
| `shadow` | Shadow power / awakening | Darkness solidifying into form |
| `death` | Final death scene | Figure falling into void |
| `game_over` | Wrong-choice dead end | Red atmosphere, shadows closing in |
| `combat` | Regular combat | Aspirant vs. creature, ash wastes |
| `boss` | Boss encounter | Colossal creature, Aspirant dwarfed |
| `levelup` | Tier advancement | Soul energy radiating, dark ascension |

### 8. Write the JSON file

File: `story/chNN.json`

```json
{
  "id": "chNN",
  "title": "Chapter N: Title",
  "scenes": {

    "chNN_intro": {
      "id": "chNN_intro",
      "type": "nightmare",
      "title": "Scene Title",
      "text": "Scene text with \\n for newlines and *italic* for dialogue/thoughts.",
      "image": null,
      "onEnter": [
        { "op": "addXp", "value": 30 }
      ],
      "choices": [
        {
          "label": "Choice label.",
          "requires": null,
          "effect": null,
          "next": "chNN_next_scene"
        }
      ]
    }

  }
}
```

Game-over scenes always have exactly these two choices:
```json
{ "label": "⎌ Load Chapter Checkpoint", "requires": null, "effect": null, "next": "__checkpoint__" },
{ "label": "↺ Start Over", "requires": null, "effect": null, "next": "__newgame__" }
```

Chapter-end scenes always have:
```json
{ "label": "↺ Restart Chapter N", "requires": null, "effect": null, "next": "__checkpoint__" }
```

### 9. Validate

```powershell
# Parse the JSON (will throw if malformed)
Get-Content 'c:\_ Dev Projekte\unnoetig\text-rpg\story\chNN.json' -Raw | ConvertFrom-Json | Select-Object id, title

# List all scene IDs
$scenes = (Get-Content 'c:\_ Dev Projekte\unnoetig\text-rpg\story\chNN.json' -Raw | ConvertFrom-Json).scenes
$scenes.PSObject.Properties.Name

# Check all `next` references are valid
$validIds = $scenes.PSObject.Properties.Name
$special = @('__checkpoint__', '__newgame__', '__combat__')
$scenes.PSObject.Properties | ForEach-Object {
  $s = $_.Value
  $s.choices | ForEach-Object {
    if ($_.next -notin $validIds -and $_.next -notin $special) {
      Write-Host "BROKEN: $($s.id) -> $($_.next)"
    }
  }
}
Write-Host "Done."
```

### 10. Update this file

After completing the chapter, update the status table:
- Change the row from `⏳ Next` to `✅ Done` and add the file path
- Change the next chapter's row to `⏳ Next`

---

## Carry-over flags between chapters

Flags set in one chapter can gate choices in the next. Known cross-chapter flags:

| Flag | Set in | Used in | Effect |
|------|--------|---------|--------|
| `heard_veteran_advice` | Ch01 — fought drowsiness during veteran's speech | Ch02 | Unlocks "Check your Aspect and Attributes immediately" as a gated choice |
| `surrendered` | Ch01 — went to police voluntarily | Ch02+ | Character background |
| `nightmare_entered` | Ch01 — entered First Trial | Ch02 | Sanity check |

Add new flags to this table when introduced.

---

## Skills & items already defined in data.js

**Skills (passive unless noted):**
- `aspect_temple_slave` — Temple Slave aspect (given in Ch01)
- `child_of_shadows` — revealed around Ch14
- `fated` — revealed later
- `mark_of_divinity` — revealed later
- `shadow_step` — combat skill (learned from Memory)
- `shadow_veil` — combat skill

**Items:**
- `healing_tonic`, `soul_shard`, `iron_ration` — consumables
- `memory_fragment` — teaches `shadow_step`
- `nightmare_trophy`, `slave_collar`, `broken_weapon` — key/material

**Enemies:**
- `bone_scavenger` (35 HP), `carapace_warrior` (65 HP), `nightmare_soldier` (50 HP)
- `lord_of_ashes` (130 HP — boss), `crimson_wraith` (190 HP — boss)

To add new skills/items/enemies, edit `game/data.js`.
