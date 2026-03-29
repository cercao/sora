# Sōra — Jogo de planar e contemplação (opensource)

## Visão do projeto

Criar um jogo web simples, leve e relaxante chamado **Sōra** onde o jogador controla um espírito do vento que planeia por um arquipélago de ilhas flutuantes. O objetivo central é a **curiosidade**: o mundo é construído colaborativamente pela comunidade, e cada sessão revela algo novo que alguém criou.

Não há game over. Não há timer. Não há pontuação. Há apenas o vento, o silêncio, e fragmentos de presença que outras pessoas deixaram.

---

## Stack técnica

- **Motor**: Phaser 3 (browser-first, leve, bem documentado para iniciantes)
- **Linguagem**: TypeScript
- **Build**: Vite
- **Estrutura de ecos (contribuições da comunidade)**: arquivos JSON simples em `/community/echos/`
- **Som**: Tone.js para som generativo e ambient
- **Deploy**: GitHub Pages (zero infraestrutura)

---

## Tarefa principal

Crie a estrutura inicial completa do jogo com os seguintes sistemas:

### 1. Mecânica de voo

- Física de planar com gravidade leve (0.06), drag alto (0.982), lift moderado (1.6) e inércia lateral fluida (0.88)
- Segurar espaço/toque ganha altitude, soltar planeia livremente
- Sem estados de morte ou falha — ao tocar o chão, o personagem simplesmente pousa suavemente e pode saltar novamente
- Trilha de partículas suave atrás do personagem durante o voo

### 2. Mundo inicial (Ilha de Origem)

- Uma ilha flutuante central com grama, algumas árvores simples e névoa nas bordas
- 3-4 ilhas menores ao redor, acessíveis por planar
- Paralaxe simples com camadas de nuvens e montanhas distantes
- Ciclo dia/noite lento (não afeta gameplay, só atmosfera)

### 3. Sistema de Ecos (contribuições da comunidade)

Um "Eco" é um fragmento deixado por alguém: pode ser uma nota de cor, uma forma flutuante, um som suave, uma frase curta.

Ecos são definidos em arquivos JSON em `/community/echos/` com este schema:

```json
{
  "id": "unique-id",
  "author": "nome ou anônimo",
  "type": "sound | visual | message",
  "content": {},
  "island": "origin | forest | ruins | cloud",
  "position": { "x": 0.5, "y": 0.3 }
}
```

- Quando o jogador se aproxima de um Eco, ele se materializa suavemente
- Crie 3 ecos de exemplo com personalidades diferentes

### 4. Som generativo

Usando Tone.js, crie uma trilha ambient que:

- Tem um drone base sempre presente (calmo, 40-60 BPM equivalente)
- Adiciona uma nota suave quando o jogador encontra um Eco
- Muda de textura levemente dependendo da altitude (mais etéreo no alto, mais terroso no baixo)
- Nunca repete exatamente — é generativo

### 5. UI minimalista

- Nenhuma HUD tradicional
- Indicador de altitude discreto (linha fina na lateral, quase invisível)
- Quando próximo de um Eco: nome do autor aparece em fade suave, some em 3 segundos
- Menu de pausa simples com: "continuar", "sobre o jogo", "como contribuir"

---

## Estrutura de arquivos esperada

```
/
├── src/
│   ├── scenes/
│   │   ├── GameScene.ts        # cena principal
│   │   └── MenuScene.ts        # tela de início
│   ├── systems/
│   │   ├── FlightPhysics.ts    # física de planar
│   │   ├── EchoSystem.ts       # carregamento e exibição de ecos
│   │   └── AmbientSound.ts     # som generativo com Tone.js
│   ├── world/
│   │   ├── Island.ts           # gerador de ilhas
│   │   └── Parallax.ts         # sistema de paralaxe
│   └── main.ts
├── community/
│   └── echos/
│       ├── README.md           # como contribuir com um eco
│       └── example-*.json      # 3 ecos de exemplo
├── public/
├── index.html
├── package.json
└── CONTRIBUTING.md             # guia de contribuição da comunidade
```

---

## Arquivos de comunidade importantes

### CONTRIBUTING.md deve explicar

- O que é um Eco e como criar um
- O schema JSON completo com exemplos
- Como fazer um Pull Request (mesmo para não-desenvolvedores)
- Filosofia do projeto: sem julgamento, qualquer personalidade ou crença é bem-vinda, o único critério é que não cause dano a ninguém

### README.md deve incluir

- Visão do projeto em 3 parágrafos
- Como rodar localmente (`npm install && npm run dev`)
- Link para CONTRIBUTING.md
- Galeria de screenshots quando disponível

---

## Critérios de qualidade

- O jogo deve rodar suavemente a 60fps em navegadores modernos
- Primeiro carregamento abaixo de 2MB
- Zero dependências de backend — tudo estático
- Código comentado em inglês (para comunidade internacional), mas README em português e inglês
- Deve funcionar em mobile (touch) e desktop (teclado/mouse)

---

## Observação sobre o nome

Existe um jogo chamado "Sora" na Steam. Usar "Sōra" (com macron) como nome de projeto/repositório, mas considerar um nome alternativo para evitar confusão. Sugestões: **Kairu** (flutuar em japonês simplificado), **Vēnt** (vento), **Planare**, ou deixar como decisão da comunidade via discussão no GitHub.

---

## Início — agentes especializados

Use múltiplos agentes especializados via Ruflo:

1. **Agente Arquiteto**: define estrutura de pastas e configurações (Vite, TypeScript, Phaser 3)
2. **Agente de Física**: implementa `FlightPhysics.ts` e testa os parâmetros de planar
3. **Agente de Mundo**: cria as ilhas, paralaxe e ciclo visual
4. **Agente de Som**: implementa `AmbientSound.ts` com Tone.js
5. **Agente de Comunidade**: cria os arquivos JSON de ecos, README e CONTRIBUTING.md

Comece pelo **Agente Arquiteto** e garanta que o projeto compile e abra no browser com uma tela em branco antes de passar para os outros agentes.