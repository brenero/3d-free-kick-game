/**
 * Módulo de colisão da barreira
 * Gerencia a detecção e resposta de colisão entre a bola e a barreira
 */

import * as THREE from "three";
import {
  RAIO_BOLA,
  COEF_RESTITUICAO_BARREIRA,
  BARREIRA_LARGURA,
  BARREIRA_ALTURA,
  BARREIRA_Z,
} from "../../config.js";

/**
 * Verifica e trata colisão da bola com a barreira
 * @param {THREE.Mesh} ball - Mesh da bola
 * @param {THREE.Vector3} ballVelocity - Vetor de velocidade da bola
 * @param {THREE.Mesh} barrier - Mesh da barreira
 * @param {number} groundLevel - Nível do chão
 */
export function checkBarrierCollision(
  ball,
  ballVelocity,
  barrier,
  groundLevel
) {
  const ballPos = ball.position;
  const barrierThickness = 0.3;

  // Verifica se está na região da barreira (usando posição real da barreira)
  const barrierCenterX = barrier.position.x;
  const barrierMinX = barrierCenterX - BARREIRA_LARGURA / 2;
  const barrierMaxX = barrierCenterX + BARREIRA_LARGURA / 2;
  const barrierMinY = groundLevel;
  const barrierMaxY = groundLevel + BARREIRA_ALTURA;
  const barrierMinZ = BARREIRA_Z - barrierThickness / 2;
  const barrierMaxZ = BARREIRA_Z + barrierThickness / 2;

  // Verifica colisão com a barreira
  if (
    ballPos.x > barrierMinX - RAIO_BOLA &&
    ballPos.x < barrierMaxX + RAIO_BOLA &&
    ballPos.y > barrierMinY - RAIO_BOLA &&
    ballPos.y < barrierMaxY + RAIO_BOLA &&
    ballPos.z > barrierMinZ - RAIO_BOLA &&
    ballPos.z < barrierMaxZ + RAIO_BOLA
  ) {
    // Determina qual face da barreira foi atingida
    const distToFront = Math.abs(ballPos.z - barrierMaxZ);
    const distToBack = Math.abs(ballPos.z - barrierMinZ);
    const distToLeft = Math.abs(ballPos.x - barrierMinX);
    const distToRight = Math.abs(ballPos.x - barrierMaxX);
    const distToTop = Math.abs(ballPos.y - barrierMaxY);
    const distToBottom = Math.abs(ballPos.y - barrierMinY);

    const minDist = Math.min(
      distToFront,
      distToBack,
      distToLeft,
      distToRight,
      distToTop,
      distToBottom
    );

    // Colisão frontal (bola vindo em direção ao gol)
    if (minDist === distToFront) {
      ballPos.z = barrierMaxZ + RAIO_BOLA;
      ballVelocity.z = -Math.abs(ballVelocity.z) * COEF_RESTITUICAO_BARREIRA;
    }
    // Colisão traseira
    else if (minDist === distToBack) {
      ballPos.z = barrierMinZ - RAIO_BOLA;
      ballVelocity.z = Math.abs(ballVelocity.z) * COEF_RESTITUICAO_BARREIRA;
    }
    // Colisão lateral esquerda
    else if (minDist === distToLeft) {
      ballPos.x = barrierMinX - RAIO_BOLA;
      ballVelocity.x = -Math.abs(ballVelocity.x) * COEF_RESTITUICAO_BARREIRA;
    }
    // Colisão lateral direita
    else if (minDist === distToRight) {
      ballPos.x = barrierMaxX + RAIO_BOLA;
      ballVelocity.x = Math.abs(ballVelocity.x) * COEF_RESTITUICAO_BARREIRA;
    }
    // Colisão no topo
    else if (minDist === distToTop) {
      ballPos.y = barrierMaxY + RAIO_BOLA;
      ballVelocity.y = Math.abs(ballVelocity.y) * COEF_RESTITUICAO_BARREIRA;
    }
    // Colisão na base
    else if (minDist === distToBottom) {
      ballPos.y = barrierMinY - RAIO_BOLA;
      ballVelocity.y = -Math.abs(ballVelocity.y) * COEF_RESTITUICAO_BARREIRA;
    }

    // Aplica atrito
    ballVelocity.x *= 0.9;
    ballVelocity.z *= 0.9;
  }
}
