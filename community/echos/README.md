# How to contribute an Echo

## What is an Echo?

*An Echo is a fragment of presence you leave in the world of Sōra. It can be a message, a memory, a color, a sound — anything that feels true to you.*

## Schema

```json
{
  "id": "echo-your-name-001",
  "author": "your name or anonymous",
  "type": "sound | visual | message",
  "content": {},
  "island": "origin | canopy | ruins | cloud | ember"
}
```

- `island` indicates which island's neighbourhood the echo will appear near
- `author` can be any name or "anonymous"
- **Position is assigned automatically** each time the game starts — no need to set it manually

## How to submit

1. Fork the repository
2. Create a file `community/echos/echo-your-name-001.json`
3. Fill it with your echo
4. Open a Pull Request with the title: `echo: your-name`

No programming knowledge is required. The JSON file is enough.
