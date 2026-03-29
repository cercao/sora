---
name: create-echo
description: "Create a new Sōra community Echo. Use when: adding a new echo, creating a community message, contributing an echo fragment, adding sound/visual/message echo to the game, creating echo JSON file, registering a new echo in EchoSystem."
argument-hint: "Describe the echo (author, type, content, island)"
---

# Create Echo — Sōra

Creates a new community Echo: a JSON file in `community/echos/` **plus** the corresponding entry in `EchoSystem.ts`.

## Procedure

### 1. Gather echo details

Ask the user (or infer from context):

| Field | Values |
|-------|--------|
| `author` | Any name or `"anonymous"` |
| `type` | `"message"` · `"sound"` · `"visual"` |
| `content` | See [Content by type](#content-by-type) |
| `island` | `"origin"` · `"canopy"` · `"ruins"` · `"cloud"` · `"ember"` |
| `position` | World coordinates — see [Island map](#island-map) |

### 2. Choose a unique ID

Format: `echo-<slug>-<nnn>` (e.g. `echo-lucas-001`).  
Check `community/echos/` for existing IDs to avoid duplicates.

### 3. Create the JSON file

Use the template in [./assets/echo-template.json](./assets/echo-template.json).  
Save as `community/echos/<id>.json`.

### 4. Register in EchoSystem

Open `src/systems/EchoSystem.ts` and add the file basename (without `.json`) to the `files` array in `loadEchos()`:

```ts
// Before
const files = ['example-wind', 'example-memory', 'example-color', 'example-ruins', 'example-ember'];

// After — add your file name
const files = ['example-wind', 'example-memory', 'example-color', 'example-ruins', 'example-ember', '<id>'];
```

### 5. Validate

- JSON must be valid (no trailing commas, quoted keys)
- `island` must exactly match one of the five biome IDs
- `position` must be within the world bounds: x 0–5000, y 0–3000
- `id` must be unique across all files in `community/echos/`

---

## Content by type

### `"message"`
```json
{
  "text": "A short sentence or reflection."
}
```

### `"sound"`
```json
{
  "frequency": 432,
  "duration": 2.5,
  "note": "Optional human-readable description of the sound."
}
```

### `"visual"`
```json
{
  "color": "#b0d8ff",
  "shape": "circle",
  "note": "Optional human-readable note about what this visual means."
}
```

---

## Island map

Each island has a world-coordinate center and theme. Place echoes near (but not necessarily exactly at) the center.

| `island` | Center (x, y) | Theme |
|----------|---------------|-------|
| `origin` | 2500, 1900 | Mossy green, beginnings |
| `canopy` | 900, 800 | Deep forest, mystery |
| `ruins` | 3900, 2100 | Stone, memory, loss |
| `cloud` | 3700, 600 | Airy, dreamlike, white-blue |
| `ember` | 700, 2300 | Fire, warmth, energy |

> **Note:** The `community/echos/README.md` describes position as 0–1 fractions, but the engine uses **absolute world coordinates** (world size: 5000 × 3000). Always use world coordinates matching the examples.

---

## Known Limitation

`loadEchos()` in `EchoSystem.ts` loads a hardcoded list of files. **Every new echo JSON must also be added to that array**, otherwise it will not appear in-game. This is step 4 above.
