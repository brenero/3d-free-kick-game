/**
 * Módulo de colisões da bola
 * Gerencia colisões com chão, traves e detecção de gol
 */

import * as THREE from "three";
import {
  RAIO_BOLA,
  COEF_RESTITUICAO_CHAO,
  COEF_RESTITUICAO_TRAVE,
} from "../../config.js";

/**
 * Verifica e trata colisão da bola com o chão
 * @param {THREE.Mesh} ball - Mesh da bola
 * @param {THREE.Vector3} ballVelocity - Vetor de velocidade da bola
 * @param {number} groundLevel - Nível do chão
 */
export function checkGroundBounce(ball, ballVelocity, groundLevel) {
  if (ball.position.y - RAIO_BOLA <= groundLevel) {
    ball.position.y = groundLevel + RAIO_BOLA;

    // Inverte velocidade Y com coeficiente de restituição
    ballVelocity.y = -ballVelocity.y * COEF_RESTITUICAO_CHAO;

    // Aplica atrito ao movimento horizontal
    ballVelocity.x *= 0.95;
    ballVelocity.z *= 0.95;

    // Para a bola se velocidade for muito pequena
    if (Math.abs(ballVelocity.y) < 0.02 && ballVelocity.length() < 0.05) {
      ballVelocity.set(0, 0, 0);
    }
  }
}

/**
 * Verifica e trata colisão da bola com os postes e travessão do gol
 * @param {THREE.Mesh} ball - Mesh da bola
 * @param {THREE.Vector3} ballVelocity - Vetor de velocidade da bola
 * @param {Object} goal - Objeto do gol contendo grupo e dimensões
 */
export function checkGoalPostCollision(ball, ballVelocity, goal) {
  const ballPos = ball.position;
  const goalPos = goal.group.position;
  const postRadius = 0.2; // Raio dos postes
  const goalWidth = goal.width;
  const goalHeight = goal.height;

  // Verifica se está na zona do gol (profundidade Z)
  if (ballPos.z > goalPos.z - 1 && ballPos.z < goalPos.z + 1) {
    // Poste esquerdo (cilindro vertical)
    const leftPostX = goalPos.x - goalWidth / 2;
    const distLeftPost = Math.sqrt(
      Math.pow(ballPos.x - leftPostX, 2) + Math.pow(ballPos.z - goalPos.z, 2)
    );

    if (distLeftPost < RAIO_BOLA + postRadius) {
      // Colisão com poste esquerdo
      const normal = new THREE.Vector3(
        ballPos.x - leftPostX,
        0,
        ballPos.z - goalPos.z
      ).normalize();

      // Reposiciona a bola
      ballPos.x = leftPostX + normal.x * (RAIO_BOLA + postRadius);
      ballPos.z = goalPos.z + normal.z * (RAIO_BOLA + postRadius);

      // Reflete velocidade
      const dot = ballVelocity.x * normal.x + ballVelocity.z * normal.z;
      ballVelocity.x =
        (ballVelocity.x - 2 * dot * normal.x) * COEF_RESTITUICAO_TRAVE;
      ballVelocity.z =
        (ballVelocity.z - 2 * dot * normal.z) * COEF_RESTITUICAO_TRAVE;
      ballVelocity.y *= COEF_RESTITUICAO_TRAVE;
      return;
    }

    // Poste direito (cilindro vertical)
    const rightPostX = goalPos.x + goalWidth / 2;
    const distRightPost = Math.sqrt(
      Math.pow(ballPos.x - rightPostX, 2) + Math.pow(ballPos.z - goalPos.z, 2)
    );

    if (distRightPost < RAIO_BOLA + postRadius) {
      // Colisão com poste direito
      const normal = new THREE.Vector3(
        ballPos.x - rightPostX,
        0,
        ballPos.z - goalPos.z
      ).normalize();

      // Reposiciona a bola
      ballPos.x = rightPostX + normal.x * (RAIO_BOLA + postRadius);
      ballPos.z = goalPos.z + normal.z * (RAIO_BOLA + postRadius);

      // Reflete velocidade
      const dot = ballVelocity.x * normal.x + ballVelocity.z * normal.z;
      ballVelocity.x =
        (ballVelocity.x - 2 * dot * normal.x) * COEF_RESTITUICAO_TRAVE;
      ballVelocity.z =
        (ballVelocity.z - 2 * dot * normal.z) * COEF_RESTITUICAO_TRAVE;
      ballVelocity.y *= COEF_RESTITUICAO_TRAVE;
      return;
    }

    // Travessão (horizontal superior)
    const crossbarY = goalPos.y + goalHeight - 0.5;
    const distCrossbar = Math.sqrt(
      Math.pow(ballPos.y - crossbarY, 2) + Math.pow(ballPos.z - goalPos.z, 2)
    );

    if (
      distCrossbar < RAIO_BOLA + postRadius &&
      ballPos.x > goalPos.x - goalWidth / 2 &&
      ballPos.x < goalPos.x + goalWidth / 2
    ) {
      // Colisão com travessão
      const normal = new THREE.Vector3(
        0,
        ballPos.y - crossbarY,
        ballPos.z - goalPos.z
      ).normalize();

      // Reposiciona a bola
      ballPos.y = crossbarY + normal.y * (RAIO_BOLA + postRadius);
      ballPos.z = goalPos.z + normal.z * (RAIO_BOLA + postRadius);

      // Reflete velocidade
      const dot = ballVelocity.y * normal.y + ballVelocity.z * normal.z;
      ballVelocity.y =
        (ballVelocity.y - 2 * dot * normal.y) * COEF_RESTITUICAO_TRAVE;
      ballVelocity.z =
        (ballVelocity.z - 2 * dot * normal.z) * COEF_RESTITUICAO_TRAVE;
      ballVelocity.x *= COEF_RESTITUICAO_TRAVE;
    }
  }
}

/**
 * Verifica e trata colisão da bola com as redes do gol
 * @param {THREE.Mesh} ball - Mesh da bola
 * @param {THREE.Vector3} ballVelocity - Vetor de velocidade da bola
 * @param {Object} goal - Objeto do gol contendo grupo e dimensões
 * @param {boolean} ballInNet - Flag indicando se a bola está na rede
 */
export function checkNetCollision(ball, ballVelocity, goal, ballInNet) {
  if (!ballInNet) return;

  const ballPos = ball.position;
  const goalPos = goal.group.position;
  const goalWidth = goal.width;
  const goalDepth = goal.depth;

  // Verifica colisão com rede traseira
  if (ballPos.z < goalPos.z - goalDepth + RAIO_BOLA) {
    ballPos.z = goalPos.z - goalDepth + RAIO_BOLA;
    ballVelocity.z = Math.abs(ballVelocity.z) * 0.3;
  }

  // Verifica colisão com redes laterais
  if (ballPos.x < goalPos.x - goalWidth / 2 + RAIO_BOLA) {
    ballPos.x = goalPos.x - goalWidth / 2 + RAIO_BOLA;
    ballVelocity.x = Math.abs(ballVelocity.x) * 0.3;
  }
  if (ballPos.x > goalPos.x + goalWidth / 2 - RAIO_BOLA) {
    ballPos.x = goalPos.x + goalWidth / 2 - RAIO_BOLA;
    ballVelocity.x = -Math.abs(ballVelocity.x) * 0.3;
  }
}

/**
 * Verifica se a bola fez gol
 * @param {THREE.Mesh} ball - Mesh da bola
 * @param {Object} goal - Objeto do gol contendo grupo e dimensões
 * @param {number} groundLevel - Nível do chão
 * @param {boolean} goalScored - Flag indicando se já foi marcado gol
 * @returns {Object|null} - Objeto com informações do gol ou null se não marcou
 */
export function checkForGoal(ball, goal, groundLevel, goalScored) {
  const ballPos = ball.position;
  const goalPos = goal.group.position;
  const goalWidth = goal.width;
  const goalHeight = goal.height;

  const goalDepthMin = goalPos.z - 0.2;
  const goalDepthMax = goalPos.z + 0.5;

  const isInsideX = Math.abs(ballPos.x - goalPos.x) < goalWidth / 2;
  const isInsideY = ballPos.y > groundLevel && ballPos.y < goalHeight - 0.5;
  const isInsideZ = ballPos.z < goalDepthMax && ballPos.z > goalDepthMin;

  // Verifica se a bola cruzou a linha do gol (entrou na área da rede)
  if (isInsideX && isInsideY && isInsideZ && !goalScored) {
    return {
      scored: true,
      ballInNet: true,
    };
  }

  return null;
}
