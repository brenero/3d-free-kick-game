/**
 * Módulo do goleiro
 */

import * as THREE from "three";

/**
 * Cria e retorna o goleiro
 * @param {THREE.Scene} scene - Cena do Three.js
 * @returns {Object} - Objeto contendo o grupo do goleiro e sua posição inicial
 */
export function createGoalkeeper(scene) {
  const goalkeeperGroup = new THREE.Group();

  // --- CORPO ---
  const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 8, 16);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff6600 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  goalkeeperGroup.add(body);

  // --- CABEÇA ---
  const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1;
  head.castShadow = true;
  goalkeeperGroup.add(head);

  // --- BRAÇOS ---
  const armGeometry = new THREE.CapsuleGeometry(0.15, 0.8, 8, 16);
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0xff6600 });

  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.rotation.z = Math.PI / 6;
  leftArm.position.set(-0.5, 0.3, 0);
  leftArm.castShadow = true;
  goalkeeperGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.rotation.z = -Math.PI / 6;
  rightArm.position.set(0.5, 0.3, 0);
  rightArm.castShadow = true;
  goalkeeperGroup.add(rightArm);

  // --- POSIÇÃO INICIAL ---
  const goalkeeperInitialPos = new THREE.Vector3(0, 0.5, -19);
  goalkeeperGroup.position.copy(goalkeeperInitialPos);
  scene.add(goalkeeperGroup);

  return {
    group: goalkeeperGroup,
    initialPosition: goalkeeperInitialPos.clone(),
  };
}

/**
 * Reseta o goleiro para a posição inicial
 * @param {THREE.Group} goalkeeperGroup - Grupo do goleiro
 * @param {THREE.Vector3} initialPosition - Posição inicial
 */
export function resetGoalkeeper(goalkeeperGroup, initialPosition) {
  goalkeeperGroup.position.copy(initialPosition);
}
