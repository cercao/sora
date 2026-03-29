# Como contribuir com um Eco / How to contribute an Echo

## O que é um Eco?

Um Eco é um fragmento de presença que você deixa no mundo de Sōra. Pode ser uma mensagem, uma memória, uma cor, um som — qualquer coisa que pareça verdadeira para você.

*An Echo is a fragment of presence you leave in the world of Sōra. It can be a message, a memory, a color, a sound — anything that feels true to you.*

## Schema

```json
{
  "id": "echo-seu-nome-001",
  "author": "seu nome ou anônimo",
  "type": "sound | visual | message",
  "content": {},
  "island": "origin | forest | ruins | cloud",
  "position": { "x": 0.5, "y": 0.3 }
}
```

- `position.x` e `position.y` são valores entre 0 e 1 (proporção da tela)
- `island` indica qual ilha o eco habita (por enquanto todos aparecem na mesma cena)
- `author` pode ser qualquer nome ou "anônimo"

## Como enviar

1. Faça um fork do repositório
2. Crie um arquivo `community/echos/echo-seu-nome-001.json`
3. Preencha com seu eco
4. Abra um Pull Request com o título: `eco: seu-nome`

Não é necessário saber programar. O arquivo JSON é suficiente.
