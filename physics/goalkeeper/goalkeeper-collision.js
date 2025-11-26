/**
 * Módulo de colisão do goleiro
 * Gerencia a detecção e resposta de colisão entre a bola e o goleiro
 */

import * as THREE from "three";
import { RAIO_BOLA, GOLEIRO_RAIO_COLISAO, GOLEIRO_ESCALA } from "../../config.js";

/**
 * Verifica e trata colisão da bola com o goleiro
 * @param {THREE.Mesh} ball - Mesh da bola
 * @param {THREE.Vector3} ballVelocity - Vetor de velocidade da bola
 * @param {THREE.Group} goalkeeperGroup - Grupo do goleiro
 * @param {boolean} ballKicked - Flag indicando se a bola foi chutada
 * @param {boolean} goalScored - Flag indicando se foi marcado gol
 */
export function checkGoalkeeperCollision(
  ball,
  ballVelocity,
  goalkeeperGroup,
  ballKicked,
  goalScored
) {
  if (!ballKicked || goalScored) return;

  const ballPos = ball.position;
  const gkPos = goalkeeperGroup.position;

  // Distância entre bola e goleiro
  const distance = Math.sqrt(
    Math.pow(ballPos.x - gkPos.x, 2) +
      Math.pow(ballPos.y - gkPos.y, 2) +
      Math.pow(ballPos.z - gkPos.z, 2)
  );

  // Raio de colisão do goleiro (base * escala)
  const gkCollisionRadius = GOLEIRO_RAIO_COLISAO * GOLEIRO_ESCALA;

  if (distance < RAIO_BOLA + gkCollisionRadius) {
    // Defesa! Bola volta
    const normal = new THREE.Vector3(
      ballPos.x - gkPos.x,
      ballPos.y - gkPos.y,
      ballPos.z - gkPos.z
    ).normalize();

    // Reposiciona a bola
    ballPos.x = gkPos.x + normal.x * (RAIO_BOLA + gkCollisionRadius);
    ballPos.y = gkPos.y + normal.y * (RAIO_BOLA + gkCollisionRadius);
    ballPos.z = gkPos.z + normal.z * (RAIO_BOLA + gkCollisionRadius);

    // Reflete a velocidade (defesa)
    const dot =
      ballVelocity.x * normal.x +
      ballVelocity.y * normal.y +
      ballVelocity.z * normal.z;
    ballVelocity.x = (ballVelocity.x - 2 * dot * normal.x) * 0.6;
    ballVelocity.y = (ballVelocity.y - 2 * dot * normal.y) * 0.6;
    ballVelocity.z = (ballVelocity.z - 2 * dot * normal.z) * 0.6;
  }
}
