/**
 * Jogo de Cobrança de Falta 3D
 * Arquivo principal - orquestra todos os módulos
 */

import * as THREE from "three";

// Importações de módulos
import {
  VELOCIDADE_BOLA,
  ALTURA_CHUTE_PADRAO,
  ALTURA_CHUTE_MINIMA,
  ALTURA_CHUTE_MAXIMA,
  CURVA_FISICA_BOLA,
  RAIO_BOLA,
  VELOCIDADE_BARRA_FORCA,
  FORCA_MINIMA_CHUTE,
  MULTIPLICADOR_FORCA_MAXIMA,
  GRAVIDADE,
} from "./config.js";

import {
  updateUI,
  showGoalMessage,
  hideGoalMessage,
  updatePowerBar,
  showPowerBar,
  hidePowerBar,
  updateWindIndicator,
} from "./ui/ui.js";
import { scene, camera, render } from "./rendering/renderer.js";

import { createField } from "./objects/field.js";
import { createBarrier, randomizeBarrierPosition } from "./objects/barrier.js";
import { createGoal } from "./objects/goal.js";
import { createGoalkeeper, resetGoalkeeper, positionGoalkeeperOpposite } from "./objects/goalkeeper.js";
import { createBall, createAimGroup } from "./objects/ball.js";
import {
  initArrow,
  createCurvedArrow,
  updateAimArrowDirection,
} from "./objects/arrow.js";

import {
  applyBallPhysics,
} from "./physics/ball/ball-physics.js";
import {
  checkGroundBounce,
  checkGoalPostCollision,
  checkNetCollision,
  checkForGoal,
} from "./physics/ball/ball-collision.js";
import {
  predictBallPositionAtGoal,
  updateGoalkeeperAI,
  moveGoalkeeper,
} from "./physics/goalkeeper/goalkeeper-ai.js";
import { checkGoalkeeperCollision } from "./physics/goalkeeper/goalkeeper-collision.js";
import { checkBarrierCollision } from "./physics/barrier/barrier-collision.js";
import {
  randomizeWind,
  getWindComponents,
  getWindInfo,
} from "./physics/wind.js";

// --- CRIAÇÃO DOS OBJETOS ---
createField(scene);

const barrier = createBarrier(scene);
const goal = createGoal(scene);
const goalkeeper = createGoalkeeper(scene);

// Posiciona barreira e goleiro no lado oposto
const barrierSide = randomizeBarrierPosition(barrier);
positionGoalkeeperOpposite(goalkeeper.group, barrierSide);

const groundLevel = -0.5;
const aimGroupData = createAimGroup(scene, groundLevel);
const aimGroup = aimGroupData.group;

const ball = createBall(aimGroup);
initArrow(aimGroup);

// --- ESTADO DO JOGO ---
let ballKicked = false;
let goalScored = false;
let ballInNet = false;
let ballVelocity = new THREE.Vector3();

// Estado da mira
const rotationStep = Math.PI / 180; // 1 grau em radianos (incremento de 1 em 1)
const powerStep = 0.01; // Incremento de 1 no display (0.01 * 100 = 1)
const minPowerY = ALTURA_CHUTE_MINIMA;
const maxPowerY = ALTURA_CHUTE_MAXIMA;
const defaultPowerY = ALTURA_CHUTE_PADRAO;
let kickPowerY = defaultPowerY;

const curveStep = 0.02; // Incremento de 2 no display (0.02 * 100 = 2)
const minCurve = -1;
const maxCurve = 1;
let curveAmount = 0;
let kickCurveAmount = 0;
const curveFactor = CURVA_FISICA_BOLA;

// Estado do goleiro
const goalkeeperState = {
  targetX: 0,
  targetY: 0.5,
  reactionCounter: 0,
};

// Estado das teclas pressionadas
const keysPressed = {
  left: false,
  right: false,
  up: false,
  down: false,
  curveLeft: false,
  curveRight: false,
  space: false,
};

// Estado da força do chute
let kickPower = 0; // 0-100
const maxKickPower = 100;
let isChargingPower = false;

// --- FUNÇÕES DO JOGO ---

/**
 * Atualiza a direção da seta de mira
 */
function updateAimArrow() {
  createCurvedArrow(curveAmount, kickPowerY);
}

/**
 * Reseta a bola e o jogo para o estado inicial
 */
function resetBall() {
  // Reseta bola para o aimGroup
  aimGroup.add(ball);
  ball.position.set(0, 0, 0);
  ball.rotation.set(0, 0, 0);

  // Posição centralizada fixa
  aimGroup.position.copy(aimGroupData.initialPosition);
  aimGroup.rotation.y = 0;

  // Reseta parâmetros
  kickPowerY = defaultPowerY;
  curveAmount = 0;
  kickCurveAmount = 0;

  updateAimArrow();
  updateUI(kickPowerY, curveAmount);

  ballVelocity.set(0, 0, 0);
  ballKicked = false;
  goalScored = false;
  ballInNet = false;

  // Reposiciona barreira e goleiro no lado oposto (ANTES de resetar tudo)
  const barrierSide = randomizeBarrierPosition(barrier);

  // Reseta goleiro para centro
  resetGoalkeeper(goalkeeper.group, goalkeeper.initialPosition);
  // Depois posiciona no lado oposto da barreira
  positionGoalkeeperOpposite(goalkeeper.group, barrierSide);

  goalkeeperState.targetX = 0;
  goalkeeperState.targetY = 0.5;
  goalkeeperState.reactionCounter = 0;

  // Reseta estado das teclas
  keysPressed.left = false;
  keysPressed.right = false;
  keysPressed.up = false;
  keysPressed.down = false;
  keysPressed.curveLeft = false;
  keysPressed.curveRight = false;
  keysPressed.space = false;

  // Reseta força do chute
  kickPower = 0;
  isChargingPower = false;
  hidePowerBar();

  // Randomiza vento
  randomizeWind();
  const windInfo = getWindInfo();
  updateWindIndicator(windInfo);

  aimGroup.visible = true;
  hideGoalMessage();
}

/**
 * Executa o chute da bola com a força acumulada
 */
function kickBall() {
  if (!ballKicked && kickPower >= FORCA_MINIMA_CHUTE) {
    ballKicked = true;
    kickCurveAmount = curveAmount;

    // Calcula a direção do chute baseada na rotação do aimGroup
    const kickDirection = new THREE.Vector3();
    aimGroup.getWorldDirection(kickDirection);

    aimGroup.getWorldPosition(ball.position);
    scene.add(ball);

    // Aplica o multiplicador à força da barra (0-100)
    const forcaReal = kickPower * MULTIPLICADOR_FORCA_MAXIMA;
    // Velocidade baseada na força real (pode ultrapassar 100%)
    const powerMultiplier = forcaReal / 100;
    ballVelocity.copy(kickDirection).multiplyScalar(-VELOCIDADE_BOLA * powerMultiplier);
    // Multiplica a altura pela força do chute (chutes fortes sobem mais)
    ballVelocity.y = kickPowerY * powerMultiplier;

    aimGroup.visible = false;
    hidePowerBar();
  }
}

/**
 * Verifica se a bola fez gol e trata a lógica
 */
function handleGoalCheck() {
  const goalResult = checkForGoal(ball, goal, groundLevel, goalScored);

  if (goalResult && goalResult.scored) {
    goalScored = true;
    ballInNet = true;
    showGoalMessage();

    // Reduz velocidade quando entra na rede
    ballVelocity.multiplyScalar(0.3);
    ballVelocity.y = Math.max(ballVelocity.y, -0.1);

    setTimeout(resetBall, 3000);
  }
}

// --- CONTROLES ---
document.addEventListener("keydown", (event) => {
  if (ballKicked) return;

  if (event.code === "KeyA" || event.code === "ArrowLeft") {
    keysPressed.left = true;
  } else if (event.code === "KeyD" || event.code === "ArrowRight") {
    keysPressed.right = true;
  } else if (event.code === "KeyW" || event.code === "ArrowUp") {
    keysPressed.up = true;
  } else if (event.code === "KeyS" || event.code === "ArrowDown") {
    keysPressed.down = true;
  } else if (event.code === "KeyQ") {
    keysPressed.curveLeft = true;
  } else if (event.code === "KeyE") {
    keysPressed.curveRight = true;
  } else if (event.code === "Space") {
    if (!keysPressed.space) {
      // Começa a carregar força
      keysPressed.space = true;
      isChargingPower = true;
      kickPower = 0;
      showPowerBar();
    }
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "KeyA" || event.code === "ArrowLeft") {
    keysPressed.left = false;
  } else if (event.code === "KeyD" || event.code === "ArrowRight") {
    keysPressed.right = false;
  } else if (event.code === "KeyW" || event.code === "ArrowUp") {
    keysPressed.up = false;
  } else if (event.code === "KeyS" || event.code === "ArrowDown") {
    keysPressed.down = false;
  } else if (event.code === "KeyQ") {
    keysPressed.curveLeft = false;
  } else if (event.code === "KeyE") {
    keysPressed.curveRight = false;
  } else if (event.code === "Space") {
    if (keysPressed.space) {
      // Solta espaço - executa o chute
      keysPressed.space = false;
      isChargingPower = false;
      kickBall();
    }
  }
});

// Reseta teclas quando o usuário sai da janela (previne teclas "presas")
window.addEventListener("blur", () => {
  keysPressed.left = false;
  keysPressed.right = false;
  keysPressed.up = false;
  keysPressed.down = false;
  keysPressed.curveLeft = false;
  keysPressed.curveRight = false;
  keysPressed.space = false;
  isChargingPower = false;
  hidePowerBar();
});

/**
 * Processa as teclas pressionadas continuamente
 */
function processKeyInput() {
  if (ballKicked) return;

  let stateChanged = false;

  // Rotação da mira
  if (keysPressed.left) {
    aimGroup.rotation.y += rotationStep;
    stateChanged = true;
  }
  if (keysPressed.right) {
    aimGroup.rotation.y -= rotationStep;
    stateChanged = true;
  }

  // Altura (antigo força/altura)
  if (keysPressed.up) {
    kickPowerY = Math.min(kickPowerY + powerStep, maxPowerY);
    updateAimArrow();
    stateChanged = true;
  }
  if (keysPressed.down) {
    kickPowerY = Math.max(kickPowerY - powerStep, minPowerY);
    updateAimArrow();
    stateChanged = true;
  }

  // Curva
  if (keysPressed.curveLeft) {
    curveAmount = Math.max(curveAmount - curveStep, minCurve);
    updateAimArrow();
    stateChanged = true;
  }
  if (keysPressed.curveRight) {
    curveAmount = Math.min(curveAmount + curveStep, maxCurve);
    updateAimArrow();
    stateChanged = true;
  }

  if (stateChanged) {
    updateUI(kickPowerY, curveAmount);
  }

  // Carrega força do chute (barra)
  if (isChargingPower) {
    kickPower = Math.min(kickPower + VELOCIDADE_BARRA_FORCA, maxKickPower);
    updatePowerBar(kickPower);
  }
}

// --- LOOP DE ANIMAÇÃO ---
function animate() {
  requestAnimationFrame(animate);

  // Processa inputs continuamente
  processKeyInput();

  if (ballKicked && !goalScored) {
    // Aplica física da bola (com vento ponderado)
    const windComponents = getWindComponents();
    applyBallPhysics(ballVelocity, ball, kickCurveAmount, curveFactor, scene, windComponents);

    // Atualiza IA do goleiro
    const predictedPos = predictBallPositionAtGoal(
      ball,
      ballVelocity,
      goal.group,
      kickCurveAmount,
      curveFactor
    );
    updateGoalkeeperAI(ballKicked, goalScored, goalkeeperState, predictedPos);
    moveGoalkeeper(goalkeeper.group, goalkeeperState, ball);

    // Verifica colisões
    checkGroundBounce(ball, ballVelocity, groundLevel);
    checkBarrierCollision(ball, ballVelocity, barrier, groundLevel);
    checkGoalPostCollision(ball, ballVelocity, goal);
    checkGoalkeeperCollision(
      ball,
      ballVelocity,
      goalkeeper.group,
      ballKicked,
      goalScored
    );
    handleGoalCheck();

    // Verifica se errou (bola saiu muito longe ou voltou)
    if (
      !goalScored &&
      (ball.position.y < groundLevel - 2 ||
        ball.position.z < goal.group.position.z - 20 ||
        ball.position.z > 12 ||
        Math.abs(ball.position.x) > 20 ||
        (ballVelocity.length() < 0.01 &&
          ball.position.y <= groundLevel + RAIO_BOLA + 0.01))
    ) {
      resetBall();
    }
  }
  // Goleiro só se move quando a bola é chutada (não volta ao centro antes do chute)

  // Física da bola quando está na rede após o gol
  if (ballInNet) {
    ballVelocity.add(new THREE.Vector3(0, GRAVIDADE, 0)); // Gravidade
    ball.position.add(ballVelocity);
    checkGroundBounce(ball, ballVelocity, groundLevel);
    checkNetCollision(ball, ballVelocity, goal, ballInNet);
  }

  render();
}

// --- INICIALIZAÇÃO ---
resetBall();
animate();
