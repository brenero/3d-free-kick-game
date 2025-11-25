/**
 * Módulo de IA do goleiro
 * Predição de trajetória e movimento inteligente
 */

import * as THREE from "three";
import {
  GOLEIRO_VELOCIDADE,
  GOLEIRO_TEMPO_REACAO,
  GOLEIRO_ALCANCE_X,
  GOLEIRO_ALCANCE_Y,
} from "../../config.js";
import { getGravity } from "../ball/ball-physics.js";

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

  // Simula a trajetória da bola considerando gravidade e curva
  let simX = ballPos.x;
  let simY = ballPos.y;
  let simZ = ballPos.z;
  let simVelX = ballVel.x;
  let simVelY = ballVel.y;
  let simVelZ = ballVel.z;

  // Simula frame por frame até chegar ao gol
  for (let i = 0; i < timeToGoal && simZ > goalZ; i++) {
    // Aplica curva
    if (kickCurveAmount !== 0) {
      const curveForce = kickCurveAmount * curveFactor;
      simVelX += curveForce * Math.sign(-simVelZ);
    }

    // Aplica gravidade
    simVelY += gravity.y;

    // Atualiza posição
    simX += simVelX;
    simY += simVelY;
    simZ += simVelZ;

    // Se chegou no plano do gol
    if (simZ <= goalZ) {
      return new THREE.Vector3(simX, simY, goalZ);
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
 * Move o goleiro em direção ao alvo
 * @param {THREE.Group} goalkeeperGroup - Grupo do goleiro
 * @param {Object} goalkeeperState - Estado do goleiro (targetX, targetY)
 */
export function moveGoalkeeper(goalkeeperGroup, goalkeeperState) {
  const currentX = goalkeeperGroup.position.x;
  const currentY = goalkeeperGroup.position.y;

  // Move suavemente em direção ao alvo
  const deltaX = goalkeeperState.targetX - currentX;
  const deltaY = goalkeeperState.targetY - currentY;

  goalkeeperGroup.position.x += deltaX * GOLEIRO_VELOCIDADE;
  goalkeeperGroup.position.y += deltaY * GOLEIRO_VELOCIDADE;
}
