# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

Start a local HTTP server:
```bash
python -m http.server 8000
```

Access at: http://localhost:8000

## Project Architecture

This is a **3D soccer free kick game** built with Three.js using ES6 modules. The architecture follows a strict separation of concerns with modular physics.

### Core Design Principles

1. **Configuration-Driven**: All tunable parameters live in `config.js` - never hardcode physics values
2. **Modular Physics**: Each force (curve, wind, Magnus effect, gravity) is calculated in separate functions before being combined
3. **Interactive Physics**: Curve force is calculated perpendicular to the **current velocity** (not initial direction), making it interact with wind realistically
4. **No Build System**: Pure ES6 modules loaded directly in browser via import maps

### Module Organization

```
main.js                    # Orchestrator - initializes objects, game loop, input handling
config.js                  # Single source of truth for all constants
├── ui/ui.js              # DOM manipulation only
├── rendering/renderer.js  # Three.js scene, camera, lights (stateless exports)
├── objects/              # 3D object creation (export factory functions)
│   ├── ball.js
│   ├── arrow.js
│   ├── field.js
│   ├── barrier.js
│   ├── goal.js
│   └── goalkeeper.js
└── physics/              # Pure physics calculations
    ├── wind.js           # Wind generation and force calculation
    ├── ball/
    │   ├── ball-physics.js      # Force calculations (modular functions)
    │   └── ball-collision.js    # Collision detection and response
    ├── goalkeeper/
    │   ├── goalkeeper-ai.js
    │   └── goalkeeper-collision.js
    └── barrier/
        └── barrier-collision.js
```

## Key Architectural Patterns

### Physics Force Application Order

In `physics/ball/ball-physics.js`, forces are applied in this **specific order** each frame:

1. **Calculate** individual forces (curve, Magnus)
2. **Apply** curve horizontal force + Magnus vertical lift (if curve ≠ 0)
3. **Apply** wind force (constant external force)
4. **Apply** gravity
5. **Update** position (integrate velocity)

**Why this order matters:**
- Curve is calculated based on current velocity (interactive with wind)
- Magnus effect is proportional to ball speed × curve amount (realistic physics)
- Changing this order will break the physics interaction

### State Management

Game state is managed in `main.js` with these critical states:
- `ballKicked` - Controls physics simulation
- `goalScored` - Prevents physics after goal
- `ballInNet` - Special physics mode (reduced velocity, gravity only)
- `keysPressed` - Object tracking continuous key states
- `isChargingPower` - Power bar filling state

### Coordinate System

Three.js world coordinates from camera perspective (at Z+14):
- **+X** = Right, **-X** = Left
- **+Y** = Up, **-Y** = Down
- **-Z** = Toward goal (forward), **+Z** = Away from goal (backward)

**Important**: Wind direction uses CSS rotation (0° = up = toward goal), converted to Three.js coordinates with negated Z component.

## Working with Physics

### Adding a New Force

1. Create calculation function in `physics/ball/ball-physics.js`:
   ```javascript
   export function calculateNewForce(ballVelocity, params) {
     const force = new THREE.Vector3(...);
     return force;
   }
   ```

2. Add constant to `config.js` with descriptive comment

3. Call in `applyBallPhysics()` at the appropriate step (see force order above)

4. Import constant in the physics module

### Magnus Effect Implementation

The Magnus effect (curve-induced lift) is **velocity-dependent**:
```javascript
magnusLift = abs(curveAmount) × ballSpeed × EFEITO_MAGNUS
```

This makes fast curved shots stay in the air longer (realistic). The constant `EFEITO_MAGNUS = -0.005` was calibrated for this formula.

### Wind Mechanics

Wind is randomized each attempt in `physics/wind.js`:
- Direction: 0-360° (0° = toward goal)
- Magnitude: `VENTO_MINIMO` to `VENTO_MAXIMO`
- Applied as constant force vector each frame
- Interacts with curve (curve is perpendicular to wind-affected velocity)

## Controls and Input

Input uses **key state tracking** (`keysPressed` object) processed every frame in `processKeyInput()`:
- Allows continuous input while holding keys
- `window.blur` listener prevents stuck keys
- Space bar: `keydown` starts charging, `keyup` executes kick

**Power Bar Mechanic:**
- Hold space → `kickPower` increases at `VELOCIDADE_BARRA_FORCA` per frame
- Release space → kick executes if `kickPower >= FORCA_MINIMA_CHUTE`
- Final force = `kickPower × MULTIPLICADOR_FORCA_MAXIMA` (can exceed 100%)

## Common Modifications

### Adjusting Game Difficulty

Edit `config.js`:
- **Easier**: Decrease `GOLEIRO_VELOCIDADE`, increase `GOLEIRO_TEMPO_REACAO`
- **Harder**: Increase wind range (`VENTO_MAXIMO`), decrease `GOL_LARGURA`

### Tuning Ball Physics

All in `config.js`:
- `VELOCIDADE_BOLA` - Horizontal speed (affects distance)
- `FORCA_INICIAL_Y` - Vertical component (affects height)
- `CURVA_FISICA_BOLA` - Curve strength
- `EFEITO_MAGNUS` - How much curve creates lift (negative = upward)
- `GRAVIDADE` - Fall rate (negative value)

**Critical**: When changing velocity formulas, remember vertical velocity is multiplied by power:
```javascript
ballVelocity.y = kickPowerY × powerMultiplier  // NOT just kickPowerY
```

### Adding New Objects

1. Create module in `objects/` with factory function:
   ```javascript
   export function createMyObject(scene) {
     const mesh = new THREE.Mesh(...);
     scene.add(mesh);
     return mesh;
   }
   ```

2. Import and call in `main.js` before game loop

3. Add any constants to `config.js`

## Important Implementation Details

### Goalkeeper AI

`physics/goalkeeper/goalkeeper-ai.js` uses trajectory prediction:
1. `predictBallPositionAtGoal()` simulates full ball path with physics
2. Prediction includes curve and gravity (but not wind - intentional limitation)
3. `updateGoalkeeperAI()` adds reaction delay via frame counter
4. Movement is smoothed with `GOLEIRO_VELOCIDADE` multiplier

### Collision Detection

Three systems:
- **Ground**: Y-position check + coefficient of restitution
- **Goal posts/net**: Bounding box + vector reflection
- **Barrier**: AABB (Axis-Aligned Bounding Box) with 6-face collision
- **Goalkeeper**: Bounding box collision during active defense

### Visual Aim Arrow

`objects/arrow.js` uses Bézier curves:
- Curve amount affects control point offset
- Updated via `createCurvedArrow()` when curve/height changes
- Lives in `aimGroup` (rotated for horizontal aim)

## ES6 Module Pattern

All modules use named exports:
```javascript
// config.js
export const CONSTANT = value;

// objects/ball.js
export function createBall(parent) { ... }

// physics/ball/ball-physics.js
export function calculateCurveForce(...) { ... }
export function applyBallPhysics(...) { ... }
```

Import maps in `index.html` provide Three.js:
```javascript
import * as THREE from "three";  // Maps to CDN
```

## Code Organization Rules

1. **Never duplicate constants** - always import from `config.js`
2. **Physics functions must be pure** - no side effects except position updates
3. **UI module only manipulates DOM** - no game logic
4. **Objects modules are factories** - return created meshes/groups
5. **Main.js is the only orchestrator** - all other modules are stateless utilities
