/**
 * Módulo da bola
 */

import * as THREE from "three";
import { RAIO_BOLA } from "../config.js";

/**
 * Cria e retorna a bola
 * @param {THREE.Group} aimGroup - Grupo de mira que contém a bola
 * @returns {Object} - Objeto contendo a mesh da bola e o grupo de mira
 */
export function createBall(aimGroup) {
  // --- BOLA ---
  const ballGeometry = new THREE.SphereGeometry(RAIO_BOLA, 32, 32);
  const ballMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.1,
  });
  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.castShadow = true;
  ball.receiveShadow = true;
  ball.position.set(0, 0, 0);
  aimGroup.add(ball);

  // --- PADRÃO DA BOLA (pentágonos) ---
  const patternMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const patternGeometry = new THREE.SphereGeometry(0.23, 32, 32);
  const pattern = new THREE.Mesh(patternGeometry, patternMaterial);
  pattern.scale.set(0.3, 0.3, 0.3);
  ball.add(pattern);

  return ball;
}

/**
 * Cria e retorna o grupo de mira (aim group)
 * @param {THREE.Scene} scene - Cena do Three.js
 * @param {number} groundLevel - Nível do chão
 * @returns {Object} - Objeto contendo o grupo de mira e a posição inicial
 */
export function createAimGroup(scene, groundLevel) {
  const aimGroup = new THREE.Group();
  const initialAimGroupPosition = new THREE.Vector3(
    0,
    groundLevel + RAIO_BOLA,
    10
  );
  aimGroup.position.copy(initialAimGroupPosition);
  scene.add(aimGroup);

  return {
    group: aimGroup,
    initialPosition: initialAimGroupPosition.clone(),
  };
}
