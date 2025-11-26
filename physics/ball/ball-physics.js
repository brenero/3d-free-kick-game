/**
 * Módulo de física da bola
 * Gerencia gravidade, curva e efeito Magnus
 */

import * as THREE from "three";
import { EFEITO_MAGNUS, GRAVIDADE } from "../../config.js";

const gravity = new THREE.Vector3(0, GRAVIDADE, 0);

/**
 * Calcula a força de curva horizontal (perpendicular à velocidade)
 * @param {THREE.Vector3} ballVelocity - Vetor de velocidade atual da bola
 * @param {number} kickCurveAmount - Quantidade de curva (-1 a 1)
 * @param {number} curveFactor - Fator multiplicador da curva
 * @param {THREE.Vector3} sceneUp - Vetor up da cena (normalmente [0,1,0])
 * @returns {THREE.Vector3} - Vetor de força de curva
 */
export function calculateCurveForce(ballVelocity, kickCurveAmount, curveFactor, sceneUp) {
  const curveForce = new THREE.Vector3().crossVectors(sceneUp, ballVelocity);
  curveForce.multiplyScalar(kickCurveAmount * curveFactor);
  return curveForce;
}

/**
 * Calcula o efeito Magnus (sustentação vertical causada pela rotação)
 * Magnus é proporcional à velocidade da bola E à quantidade de curva
 * Física: Bolas rápidas com spin têm mais sustentação
 * @param {THREE.Vector3} ballVelocity - Vetor de velocidade atual da bola
 * @param {number} kickCurveAmount - Quantidade de curva (-1 a 1)
 * @returns {number} - Força vertical Magnus (positivo = sustentação)
 */
export function calculateMagnusEffect(ballVelocity, kickCurveAmount) {
  const speed = ballVelocity.length();
  const magnusLift = Math.abs(kickCurveAmount) * speed * EFEITO_MAGNUS;
  return magnusLift;
}

/**
 * Aplica física à bola com sistema de vento ponderado
 * @param {THREE.Vector3} ballVelocity - Vetor de velocidade da bola
 * @param {THREE.Mesh} ball - Mesh da bola
 * @param {number} kickCurveAmount - Quantidade de curva do chute
 * @param {number} curveFactor - Fator de curva da física
 * @param {THREE.Scene} scene - Cena do Three.js
 * @param {Object} windComponents - { eastWest: número, northSouth: número }
 */
export function applyBallPhysics(
  ballVelocity,
  ball,
  kickCurveAmount,
  curveFactor,
  scene,
  windComponents = null
) {
  // 1. Calcula força de curva base
  const curveForce = calculateCurveForce(ballVelocity, kickCurveAmount, curveFactor, scene.up);

  // 2. Adiciona vento leste-oeste à força de curva (maior impacto)
  if (windComponents && windComponents.eastWest !== 0) {
    curveForce.x += windComponents.eastWest;
  }

  // 3. Aplica curva combinada (curva + vento horizontal)
  if (kickCurveAmount !== 0 || (windComponents && windComponents.eastWest !== 0)) {
    ballVelocity.add(curveForce);
  }

  // 4. Calcula e aplica efeito Magnus (sustentação vertical)
  if (kickCurveAmount !== 0) {
    const magnusLift = calculateMagnusEffect(ballVelocity, kickCurveAmount);
    ballVelocity.y += magnusLift;
  }

  // 5. Aplica vento norte-sul (menor impacto, afeta direção)
  if (windComponents && windComponents.northSouth !== 0) {
    ballVelocity.z += windComponents.northSouth;
  }

  // 6. Aplica gravidade
  ballVelocity.add(gravity);

  // 7. Atualiza posição
  ball.position.add(ballVelocity);

  // 8. Rotação visual baseada na velocidade
  const rotationSpeed = 0.1;
  ball.rotation.x += ballVelocity.length() * rotationSpeed;
}

/**
 * Obtém o vetor de gravidade
 * @returns {THREE.Vector3} - Vetor de gravidade
 */
export function getGravity() {
  return gravity.clone();
}
