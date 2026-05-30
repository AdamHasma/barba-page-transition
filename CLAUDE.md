# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser-based **text RPG** ("Isekai Chronicle"). Despite the repo name (`barba-page-transition`), the original Barba.js page-transition demo was fully replaced — there is no build step, no framework, and no dependencies. It is plain HTML/CSS/JS that runs by opening `index.html`.

## Running & deploying

- **Run locally:** open `index.html` directly in a browser (no server needed). `file://` works because there are no ES modules or fetch-of-local-files.
- **No build / lint / test tooling exists.** Do not add npm/bundler steps unless asked.
- **Deployment:** GitHub Pages. Pages serves the **`gh-pages`** branch, but `main` is the working branch. Both branches must be kept at the same commit or changes won't go live. After pushing `main`, sync with:
  ```
  git checkout gh-pages && git reset --hard origin/main && git push origin gh-pages --force-with-lease && git checkout main
  ```
  `.nojekyll` is required at root so Pages serves files as-is.

## Architecture

Four global IIFE/object modules loaded in dependency order via `<script>` tags in `index.html` (order matters — no module system):

`game/data.js` → `game/engine.js` → `game/combat.js` → `game/ui.js` → `main.js`

- **`game/data.js`** — All content, zero logic dependencies. Exposes globals `SCENES`, `ITEMS`, `SKILLS`, `ENEMIES`, `IMAGE_MAP`. This is where story/balance edits happen.
- **`game/engine.js`** — `GameEngine` IIFE: the state machine. Owns the single mutable `GameState`, `localStorage` save/load (key `isekai_rpg_save`), scene navigation, requirement checks, and leveling. Public API: `init, navigateTo, makeChoice, useItem, getState, checkRequirement, requirementLabel, checkLevelUp`.
- **`game/combat.js`** — `CombatEngine` IIFE: turn-based combat overlay. Entry point `CombatEngine.start(enemy, onWin, onLose, onFlee)`. On resolution it awards XP/gold/loot, calls `GameEngine.checkLevelUp()`, then `GameEngine.navigateTo()` to the appropriate scene.
- **`game/ui.js`** — `GameUI` IIFE: all DOM rendering, typewriter effect, image loading, modals/toasts. The engine never touches the DOM directly — it calls `GameUI.*`.
- **`main.js`** — three-line entry point; `DOMContentLoaded` → `GameEngine.init()`.

### Control flow

`init()` loads a save or shows the name modal → `navigateTo(sceneId)` runs `scene.onEnter`, checks level-ups, **auto-saves**, and re-renders. Player clicks a choice → `makeChoice(choice)` runs `choice.effect(state)` then branches on `choice.next`.

### Scene data contract (`SCENES` in data.js)

Each scene: `{ id, type, title, text, image, onEnter, choices[] }`.
- `type` is a key into `IMAGE_MAP` and selects the background image. Valid types: `death, void, system, forest, village, dungeon, castle, battlefield, market, combat, levelup, boss`.
- `choices[]` entries: `{ label, requires, effect, next }`.
  - `requires` is `null` or `{ skill | item | flag | stat+value | level }` — gated choices render dimmed but visible (see `checkRequirement` / `requirementLabel`).
  - `effect(state)` mutates `GameState` (stats, flags, inventory, skills).
  - `next` is a target scene id **or** a special token:
    - `'__combat__'` — requires a sibling `combat: { enemyId, onWin, onLose, onFlee, firstStrike? }`; hands off to `CombatEngine.start`.
    - `'__newgame__'` — wipes the save and restarts.

### Important conventions

- **Single source of truth:** one `GameState` object lives in `engine.js`; everything reads it via `GameEngine.getState()`. `combat` is the only ephemeral field (nulled before saving).
- **Item/skill IDs are persisted in saves.** Renaming an `ITEMS`/`SKILLS` key breaks existing saves — change the display `name`/`description`/`icon`, keep the id. (e.g. the "Aegis Barrier" skill still has id `divine_shield`.)
- **Scene/skill effects use ES5 `function`-style closures**, not arrow functions, to match the existing style and run as plain `<script>` globals.
- **Images** are AI-generated on the fly via Pollinations.ai (`pollinationsUrl()` in data.js, 1280×720, model=flux). Each prompt gets a deterministic `seed` (via `seedFromText`) so a scene shows the same image across visits; changing the prompt/seed forces regeneration. `GameUI.loadSceneImage` falls back to `picsum.photos` on error and crossfades via opacity.
