/**
 * Módulo de IA do goleiro
 * Predição de trajetória e movimento inteligente
 */

import * as THREE from "three";
import {
  GOLEIRO_VELOCIDADE_MAX,
  GOLEIRO_ACELERACAO,
  GOLEIRO_VELOCIDADE_MERGULHO,
  GOLEIRO_DISTANCIA_MERGULHO,
  GOLEIRO_TEMPO_REACAO,
  GOLEIRO_ALCANCE_X,
  GOLEIRO_ALCANCE_Y,
} from "../../config.js";
import {
  getGravity,
  calculateCurveForce,
  calculateMagnusEffect
} from "../ball/ball-physics.js";

/**
 * Prevê onde a bola estará quando cruzar o plano Z do gol
 * @param {THREE.Mesh} ball - Mesh da bola
 * @param {THREE.Vector3} ballVelocity - Vetor de velocidade da bola
 * @param {THREE.Group} goalGroup - Grupo do gol
 * @param {number} kickCurveAmount - Quantidade de curva do chute
 * @param {number} curveFactor - Fator de curva da física
 * @returns {THREE.Vector3|null} - Posição prevista da bola ou null
 */
export function predictBallPositionAtGoal(
  ball,
  ballVelocity,
  goalGroup,
  kickCurveAmount,
  curveFactor
) {
  const goalZ = goalGroup.position.z;
  const ballPos = ball.position;
  const ballVel = ballVelocity;
  const gravity = getGravity();

  // Se a bola não está indo em direção ao gol, retorna null
  if (ballVel.z >= 0) return null;

  // Calcula quanto tempo levará para a bola chegar ao gol
  const deltaZ = goalZ - ballPos.z;
  const timeToGoal = deltaZ / ballVel.z;

  // Se tempo é negativo ou muito longo, retorna null
  if (timeToGoal < 0 || timeToGoal > 200) return null;

  // Simula a trajetória da bola usando a física real
  let simPos = new THREE.Vector3(ballPos.x, ballPos.y, ballPos.z);
  let simVel = new THREE.Vector3(ballVel.x, ballVel.y, ballVel.z);
  const sceneUp = new THREE.Vector3(0, 1, 0);

  // Simula frame por frame até chegar ao gol
  for (let i = 0; i < timeToGoal && simPos.z > goalZ; i++) {
    // 1. Calcula força de curva real (perpendicular à velocidade)
    const curveForce = calculateCurveForce(simVel, kickCurveAmount, curveFactor, sceneUp);

    // 2. Aplica curva horizontal
    if (kickCurveAmount !== 0) {
      simVel.add(curveForce);

      // 3. Aplica efeito Magnus (sustentação vertical)
      const magnusLift = calculateMagnusEffect(simVel, kickCurveAmount);
      simVel.y += magnusLift;
    }

    // 4. Aplica gravidade
    simVel.add(gravity);

    // 5. Atualiza posição
    simPos.add(simVel);

    // Se chegou no plano do gol
    if (simPos.z <= goalZ) {
      return new THREE.Vector3(simPos.x, simPos.y, goalZ);
    }
  }

  return null;
}

/**
 * Atualiza a IA do goleiro
 * @param {boolean} ballKicked - Flag indicando se a bola foi chutada
 * @param {boolean} goalScored - Flag indicando se foi marcado gol
 * @param {Object} goalkeeperState - Estado do goleiro (targetX, targetY, reactionCounter)
 * @param {THREE.Vector3|null} predictedPos - Posição prevista da bola
 */
export function updateGoalkeeperAI(
  ballKicked,
  goalScored,
  goalkeeperState,
  predictedPos
) {
  if (!ballKicked || goalScored) {
    // Volta para o centro quando não há bola em jogo
    goalkeeperState.targetX = 0;
    goalkeeperState.targetY = 0.5;
    goalkeeperState.reactionCounter = 0;
    return;
  }

  // Tempo de reação
  goalkeeperState.reactionCounter++;
  if (goalkeeperState.reactionCounter < GOLEIRO_TEMPO_REACAO) {
    return;
  }

  // Prevê onde a bola vai passar
  if (predictedPos) {
    // Limita o alcance do goleiro
    goalkeeperState.targetX = THREE.MathUtils.clamp(
      predictedPos.x,
      -GOLEIRO_ALCANCE_X,
      GOLEIRO_ALCANCE_X
    );
    goalkeeperState.targetY = THREE.MathUtils.clamp(
      predictedPos.y,
      0.5,
      0.5 + GOLEIRO_ALCANCE_Y
    );
  }
}

/**
 * Aplica inclinação ao goleiro para simular mergulho
 * @param {THREE.Group} goalkeeperGroup - Grupo do goleiro
 * @param {number} deltaX - Distância horizontal até o alvo
 * @param {number} deltaY - Distância vertical até o alvo
 * @param {number} distanceToTarget - Distância total até o alvo
 */
function applyGoalkeeperLean(goalkeeperGroup, deltaX, deltaY, distanceToTarget) {
  const leanThreshold = 1.5; // Distância mínima para começar a inclinar
  const goalkeeperHeight = 1.4; // Altura aproximada do goleiro (considerando escala)

  if (distanceToTarget > leanThreshold) {
    // Calcula ângulo de inclinação lateral (Z axis) baseado no deltaX
    const maxLeanAngle = Math.PI / 4; // 45 graus máximo
    const leanIntensity = Math.min(Math.abs(deltaX) / 3, 1); // Normaliza 0-1
    const leanAngleZ = (deltaX > 0 ? -1 : 1) * leanIntensity * maxLeanAngle;

    // Calcula inclinação frontal (X axis) baseado no deltaY
    const leanAngleX = Math.min(Math.abs(deltaY) / 2, 1) * (Math.PI / 6); // Até 30 graus

    // Aplica rotação suave
    goalkeeperGroup.rotation.z = THREE.MathUtils.lerp(goalkeeperGroup.rotation.z, leanAngleZ, 0.1);
    goalkeeperGroup.rotation.x = THREE.MathUtils.lerp(goalkeeperGroup.rotation.x, leanAngleX, 0.1);

    // Ajusta Y para evitar afundar no chão quando inclinado
    // Quanto mais inclinado, mais precisa subir
    const totalLean = Math.abs(goalkeeperGroup.rotation.z) + Math.abs(goalkeeperGroup.rotation.x);
    const yOffset = Math.sin(totalLean) * (goalkeeperHeight * 0.3);
    goalkeeperGroup.position.y = 0.5 + yOffset;
  } else {
    // Volta para posição vertical quando perto do alvo
    goalkeeperGroup.rotation.z = THREE.MathUtils.lerp(goalkeeperGroup.rotation.z, 0, 0.15);
    goalkeeperGroup.rotation.x = THREE.MathUtils.lerp(goalkeeperGroup.rotation.x, 0, 0.15);

    // Volta para Y normal
    goalkeeperGroup.position.y = THREE.MathUtils.lerp(goalkeeperGroup.position.y, 0.5, 0.15);
  }
}

/**
 * Move o goleiro em direção ao alvo com aceleração e mergulho
 * @param {THREE.Group} goalkeeperGroup - Grupo do goleiro
 * @param {Object} goalkeeperState - Estado do goleiro (targetX, targetY, velocityX, velocityY, isDiving)
 * @param {THREE.Mesh} ball - Mesh da bola (para calcular distância e ativar mergulho)
 */
export function moveGoalkeeper(goalkeeperGroup, goalkeeperState, ball = null) {
  // Inicializa velocidades se não existirem
  if (goalkeeperState.velocityX === undefined) goalkeeperState.velocityX = 0;
  if (goalkeeperState.velocityY === undefined) goalkeeperState.velocityY = 0;
  if (goalkeeperState.isDiving === undefined) goalkeeperState.isDiving = false;

  const currentX = goalkeeperGroup.position.x;
  const currentY = goalkeeperGroup.position.y;

  // Calcula distância até o alvo
  const deltaX = goalkeeperState.targetX - currentX;
  const deltaY = goalkeeperState.targetY - currentY;
  const distanceToTarget = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Aplica inclinação (mergulho) quando está se movendo para os lados
  applyGoalkeeperLean(goalkeeperGroup, deltaX, deltaY, distanceToTarget);

  // Detecta se deve mergulhar (bola próxima ao gol)
  let maxSpeed = GOLEIRO_VELOCIDADE_MAX;
  if (ball) {
    const distanceToBall = Math.sqrt(
      (ball.position.x - currentX) ** 2 +
      (ball.position.y - currentY) ** 2 +
      (ball.position.z - goalkeeperGroup.position.z) ** 2
    );

    // Ativa mergulho se bola está próxima
    if (distanceToBall < GOLEIRO_DISTANCIA_MERGULHO) {
      goalkeeperState.isDiving = true;
      maxSpeed = GOLEIRO_VELOCIDADE_MERGULHO;
    } else if (distanceToBall > GOLEIRO_DISTANCIA_MERGULHO * 1.5) {
      goalkeeperState.isDiving = false;
    }
  }

  // Aplica aceleração em direção ao alvo
  if (distanceToTarget > 0.1) {
    // Normaliza direção e aplica aceleração
    const dirX = deltaX / distanceToTarget;
    const dirY = deltaY / distanceToTarget;

    goalkeeperState.velocityX += dirX * GOLEIRO_ACELERACAO;
    goalkeeperState.velocityY += dirY * GOLEIRO_ACELERACAO;

    // Limita velocidade máxima
    const currentSpeed = Math.sqrt(
      goalkeeperState.velocityX ** 2 + goalkeeperState.velocityY ** 2
    );
    if (currentSpeed > maxSpeed) {
      goalkeeperState.velocityX = (goalkeeperState.velocityX / currentSpeed) * maxSpeed;
      goalkeeperState.velocityY = (goalkeeperState.velocityY / currentSpeed) * maxSpeed;
    }
  } else {
    // Desacelera quando perto do alvo
    goalkeeperState.velocityX *= 0.85;
    goalkeeperState.velocityY *= 0.85;
  }

  // Atualiza posição com velocidade
  goalkeeperGroup.position.x += goalkeeperState.velocityX;
  goalkeeperGroup.position.y += goalkeeperState.velocityY;
}
