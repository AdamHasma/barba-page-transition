# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## What this is

A browser-based **text RPG** adapting the novel *Shadow Slave* by Guiltythree. No build step, no framework, no dependencies — plain HTML/CSS/JS that runs by opening `index.html`. The EPUB source (`ss.epub`, 95 chapters) lives in the project root.

## Chapter production

**When the user says "nächste chapter" (or "next chapter"):** see `CHAPTERS.md` for the full workflow and chapter status tracker.

## Running & deploying

- **Run locally:** `python -m http.server 8080` in the project root, then open `http://localhost:8080`. (Cannot use `file://` — the engine fetches chapter JSON files at runtime.)
- **No build / lint / test tooling exists.** Do not add npm/bundler steps unless asked.
- **Deployment:** Netlify — connected to the `main` branch, auto-deploys on push. Publish directory: `.` (repo root, no build command). See `netlify.toml`.

## Architecture

Four global modules loaded in order via `<script>` tags in `index.html`:

`game/data.js` → `game/engine.js` → `game/combat.js` → `game/ui.js` → `main.js`

- **`game/data.js`** — All static content: `ITEMS`, `SKILLS`, `ENEMIES`, `IMAGE_MAP`, `pollinationsUrl()`, `seedFromText()`. `SCENES = {}` starts empty and is populated at runtime from chapter JSON files.
- **`game/engine.js`** — `GameEngine` IIFE: state machine, async chapter loading (`fetch('story/chNN.json')`), effect DSL, checkpoint system, level-up logic. Save key: `ss_rpg_save`. Checkpoint key: `ss_checkpoint`.
- **`game/combat.js`** — `CombatEngine` IIFE: turn-based combat overlay. Entry: `CombatEngine.start(enemy, onWin, onLose, onFlee)`.
- **`game/ui.js`** — `GameUI` IIFE: all DOM rendering, typewriter effect, image loading, modals/toasts. The engine never touches the DOM.
- **`main.js`** — `DOMContentLoaded` → `GameEngine.init()`.

### Chapter loading

- Chapters live in `story/chNN.json` (one file per chapter).
- Scene ID prefix determines chapter: `ch02_intro` → loads `story/ch02.json`.
- `SCENES` is merged with chapter data as chapters are loaded on demand.

### Scene data contract

Each scene: `{ id, type, title, text, image, onEnter, choices[] }`.

- `type` is a key into `IMAGE_MAP`. Valid types: `slum, station, nightmare, dream_realm, mountain, caravan, winter_camp, ruins, shadow, death, game_over, combat, boss, levelup`.
- `onEnter` and `choice.effect` are **JSON op arrays** (not functions). See `CHAPTERS.md` for the full op reference.
- `choice.next` is a scene ID or special token: `__checkpoint__`, `__newgame__`, `__combat__`.
- `choice.requires` is `null` or `{ skill | item | flag | stat+value | level }` — gated choices render dimmed but visible.

### Game over scenes

Scene type `game_over` → `<body>` gets class `scene-is-gameover` → red tint CSS. Always offer two choices: load checkpoint and start over.

### Important conventions

- **Item/skill IDs are persisted in saves.** Never rename an ID — change only `name`/`description`/`icon`.
- **Images** generated via Pollinations.ai in `pollinationsUrl()`. Seed is deterministic from the prompt text — changing the prompt changes the image.
- **Starting state:** HP 80, MP 40, ATK 8, DEF 3, SPD 12, Level 1, XP 0. Starting scene: `ch01_intro`.
