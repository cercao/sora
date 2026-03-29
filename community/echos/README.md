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
  "island": "origin | forest | ruins | cloud",
  "position": { "x": 0.5, "y": 0.3 }
}
```

- `position.x` and `position.y` are values between 0 and 1 (screen proportion)
- `island` indicates which island the echo inhabits (for now all appear in the same scene)
- `author` can be any name or "anonymous"

## How to submit

1. Fork the repository
2. Create a file `community/echos/echo-your-name-001.json`
3. Fill it with your echo
4. Open a Pull Request with the title: `echo: your-name`

No programming knowledge is required. The JSON file is enough.
