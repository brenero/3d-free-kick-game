# Jogo de Cobrança de Falta 3D

## Estrutura do Projeto

O projeto foi refatorado em uma estrutura modular organizada por responsabilidade:

```
/
├── index.html              # Página HTML principal
├── main.js                 # Orquestrador principal do jogo
├── config.js               # Configurações e constantes ajustáveis
├── game_documentation.md   # Documentação do jogo
├── README.md              # Este arquivo
│
├── ui/                    # Interface do usuário
│   └── ui.js             # Gerenciamento de elementos da UI
│
├── rendering/            # Renderização
│   └── renderer.js       # Configuração da cena, câmera e renderer
│
├── objects/              # Objetos do jogo
│   ├── field.js         # Campo de futebol
│   ├── barrier.js       # Barreira transparente
│   ├── goal.js          # Gol com redes
│   ├── goalkeeper.js    # Goleiro
│   ├── ball.js          # Bola
│   └── arrow.js         # Seta de mira curva
│
├── physics/             # Física do jogo
│   ├── ball/
│   │   ├── ball-physics.js      # Física da bola (gravidade, curva, Magnus)
│   │   └── ball-collision.js    # Colisões da bola
│   ├── goalkeeper/
│   │   ├── goalkeeper-ai.js     # IA do goleiro (predição e movimento)
│   │   └── goalkeeper-collision.js  # Colisões do goleiro
│   └── barrier/
│       └── barrier-collision.js # Colisões da barreira
│
└── old/                 # Backup do código original
    ├── main.js
    ├── main_backup.js
    └── index.html
```

## Módulos

### config.js
Contém todas as constantes configuráveis do jogo:
- Configurações da seta (visual)
- Física da bola (velocidade, curva, Magnus effect)
- Coeficientes de colisão
- Dimensões da barreira
- Dimensões do gol
- Parâmetros do goleiro (velocidade, reação, alcance)
- Configurações da câmera

### ui/ui.js
Gerencia a interface do usuário:
- `updateUI(power, curve)` - Atualiza displays de força e curva
- `showGoalMessage()` - Exibe mensagem "GOL!"
- `hideGoalMessage()` - Esconde mensagem "GOL!"

### rendering/renderer.js
Configuração da renderização:
- Cena, câmera e renderer do Three.js
- Iluminação (ambiente e direcional)
- Handler de redimensionamento
- Função `render()` para renderizar a cena

### objects/
Módulos de criação de objetos 3D:
- **field.js**: Campo de futebol com linhas
- **barrier.js**: Barreira transparente com posicionamento aleatório
- **goal.js**: Estrutura do gol com postes e redes
- **goalkeeper.js**: Modelo 3D do goleiro
- **ball.js**: Bola com padrão e grupo de mira
- **arrow.js**: Seta curva de mira com visualização Bézier

### physics/
Módulos de física e colisões:

#### ball/
- **ball-physics.js**:
  - Aplica gravidade, curva e efeito Magnus
  - Rotação da bola baseada na velocidade

- **ball-collision.js**:
  - Colisão com chão (bounce com coeficiente de restituição)
  - Colisão com postes e travessão (reflexão vetorial)
  - Colisão com redes do gol
  - Detecção de gol

#### goalkeeper/
- **goalkeeper-ai.js**:
  - `predictBallPositionAtGoal()` - Simula trajetória da bola
  - `updateGoalkeeperAI()` - Calcula alvo com tempo de reação
  - `moveGoalkeeper()` - Movimento suave em direção ao alvo

- **goalkeeper-collision.js**:
  - Detecta e trata colisão bola-goleiro
  - Defesa com reflexão da bola

#### barrier/
- **barrier-collision.js**:
  - Detecção AABB (Axis-Aligned Bounding Box)
  - Colisão nas 6 faces da barreira
  - Aplicação de atrito

## Como Modificar

### Ajustar Parâmetros do Jogo
Edite `config.js` para modificar:
- Velocidade e física da bola
- Dificuldade do goleiro
- Tamanho e posição da barreira
- Dimensões do gol

### Adicionar Novos Objetos
1. Crie um arquivo em `objects/`
2. Exporte funções de criação
3. Importe e use em `main.js`

### Modificar Física
1. Edite os módulos em `physics/`
2. Mantenha as assinaturas de função consistentes
3. Teste todas as interações

## Executando o Jogo

```bash
python -m http.server 8000
```

Acesse: http://localhost:8000

## Controles

- **A / D**: Mira (esquerda/direita)
- **W / S**: Força/Altura
- **Q / E**: Curva (esquerda/direita)
- **ESPAÇO / CLIQUE**: Chutar

## Benefícios da Refatoração

1. **Separação de responsabilidades**: Cada módulo tem uma função clara
2. **Manutenibilidade**: Fácil localizar e modificar código específico
3. **Reutilização**: Módulos podem ser reutilizados em outros projetos
4. **Testabilidade**: Módulos isolados são mais fáceis de testar
5. **Escalabilidade**: Fácil adicionar novos recursos sem afetar código existente
6. **Legibilidade**: Código mais organizado e autodocumentado
