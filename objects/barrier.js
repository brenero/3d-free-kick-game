/**
 * Módulo da barreira
 */

import * as THREE from "three";
import {
  BARREIRA_LARGURA,
  BARREIRA_ALTURA,
  BARREIRA_Z,
  BARREIRA_DESLOCAMENTO_MIN,
  BARREIRA_DESLOCAMENTO_MAX,
} from "../config.js";

/**
 * Cria e retorna a barreira transparente
 * @param {THREE.Scene} scene - Cena do Three.js
 * @returns {THREE.Mesh} - Mesh da barreira
 */
export function createBarrier(scene) {
  const barrierGeometry = new THREE.BoxGeometry(
    BARREIRA_LARGURA,
    BARREIRA_ALTURA,
    2
  );
  const barrierMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    wireframe: false,
  });
  const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
  scene.add(barrier);

  return barrier;
}

/**
 * Posiciona a barreira aleatoriamente (nunca no centro)
 * @param {THREE.Mesh} barrier - Mesh da barreira
 */
export function randomizeBarrierPosition(barrier) {
  // Gera um número aleatório entre MIN e MAX
  const offset =
    BARREIRA_DESLOCAMENTO_MIN +
    Math.random() * (BARREIRA_DESLOCAMENTO_MAX - BARREIRA_DESLOCAMENTO_MIN);
  // Escolhe aleatoriamente esquerda (-1) ou direita (1)
  const side = Math.random() < 0.5 ? -1 : 1;
  const barrierX = side * offset;

  barrier.position.set(barrierX, BARREIRA_ALTURA / 2 - 0.5, BARREIRA_Z);
}
