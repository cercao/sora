# Sora — Copilot Repository Instructions

## Project Vision
Sora is a relaxing, collaborative web game where players glide as a wind spirit through floating islands. The world is built by the community: anyone can contribute an "Echo" (a message, sound, or visual fragment) via JSON files. There is no game over, timer, or score—just wind, silence, and presence.

## Coding Guidelines
- Use TypeScript and Phaser 3 for all game logic.
- Use Tone.js for generative ambient sound.
- All code comments must be in English.
- Prioritize smooth performance (60fps) and mobile/desktop compatibility.
- No backend: all data is static and local.
- Keep the UI minimal and non-intrusive.

## Community Contributions
- Echoes are defined in `/community/echos/` as JSON files with the schema:
  ```json
  {
    "id": "unique-id",
    "author": "name or anonymous",
    "type": "sound | visual | message",
    "content": {},
    "island": "origin | forest | ruins | cloud",
    "position": { "x": 0.5, "y": 0.3 }
  }
  ```
- Anyone can submit an Echo via Pull Request. No programming knowledge required.
- See `community/echos/README.md` for details.

## File Structure
- Main code in `src/` (scenes, systems, world)
- Community content in `community/echos/`
- Entry point: `src/main.ts`

## Quality Criteria
- Game loads under 2MB, runs at 60fps
- Works on mobile and desktop
- All code is commented in English
- README and docs in both Portuguese and English

## Naming Note
Use "Sōra" (with macron) to avoid confusion with other games named "Sora". Alternative names are under community discussion.
