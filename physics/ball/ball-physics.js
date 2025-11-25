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
 * Aplica física à bola (gravidade, curva, efeito Magnus, vento)
 * @param {THREE.Vector3} ballVelocity - Vetor de velocidade da bola
 * @param {THREE.Mesh} ball - Mesh da bola
 * @param {number} kickCurveAmount - Quantidade de curva do chute
 * @param {number} curveFactor - Fator de curva da física
 * @param {THREE.Scene} scene - Cena do Three.js
 * @param {THREE.Vector3} windForce - Força do vento (opcional)
 */
export function applyBallPhysics(
  ballVelocity,
  ball,
  kickCurveAmount,
  curveFactor,
  scene,
  windForce = null
) {
  // 1. Calcula forças individualmente
  const curveForce = calculateCurveForce(ballVelocity, kickCurveAmount, curveFactor, scene.up);
  const magnusLift = calculateMagnusEffect(ballVelocity, kickCurveAmount);

  // 2. Aplica curva horizontal e Magnus vertical
  if (kickCurveAmount !== 0) {
    ballVelocity.add(curveForce);
    ballVelocity.y += magnusLift; // Magnus agora proporcional à velocidade
  }

  // 3. Aplica vento (força externa)
  if (windForce) {
    ballVelocity.add(windForce);
  }

  // 4. Aplica gravidade
  ballVelocity.add(gravity);

  // 5. Atualiza posição
  ball.position.add(ballVelocity);

  // 6. Rotação visual baseada na velocidade
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
