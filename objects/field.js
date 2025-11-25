/**
 * Módulo do campo de futebol
 */

import * as THREE from "three";

/**
 * Cria e retorna o campo de futebol
 * @param {THREE.Scene} scene - Cena do Three.js
 * @returns {THREE.Mesh} - Mesh do campo
 */
export function createField(scene) {
  // --- CAMPO ---
  const fieldGeometry = new THREE.PlaneGeometry(80, 100);
  const fieldMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d5016,
    roughness: 0.8,
  });
  const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
  field.rotation.x = -Math.PI / 2;
  field.position.y = -0.5;
  field.receiveShadow = true;
  scene.add(field);

  // --- LINHAS DO CAMPO ---
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const penaltyBoxGeometry = new THREE.PlaneGeometry(18, 16.5);
  const penaltyBox = new THREE.Mesh(penaltyBoxGeometry, lineMaterial);
  penaltyBox.rotation.x = -Math.PI / 2;
  penaltyBox.position.set(0, -0.49, -12);
  scene.add(penaltyBox);

  return field;
}
