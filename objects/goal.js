/**
 * Módulo do gol
 */

import * as THREE from "three";
import { GOL_LARGURA, GOL_ALTURA } from "../config.js";

/**
 * Cria e retorna a estrutura do gol com redes
 * @param {THREE.Scene} scene - Cena do Three.js
 * @returns {Object} - Objeto contendo o grupo do gol e suas dimensões
 */
export function createGoal(scene) {
  const goalGroup = new THREE.Group();
  const postMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const goalWidth = GOL_LARGURA;
  const goalHeight = GOL_ALTURA;
  const goalDepth = 2;
  const postGeometry = new THREE.BoxGeometry(0.4, goalHeight, 0.4);

  // --- POSTES FRONTAIS ---
  const leftPost = new THREE.Mesh(postGeometry, postMaterial);
  leftPost.position.set(-goalWidth / 2, goalHeight / 2 - 0.5, 0);
  leftPost.castShadow = true;

  const rightPost = new THREE.Mesh(postGeometry, postMaterial);
  rightPost.position.set(goalWidth / 2, goalHeight / 2 - 0.5, 0);
  rightPost.castShadow = true;

  const crossbarGeometry = new THREE.BoxGeometry(goalWidth + 0.4, 0.4, 0.4);
  const crossbar = new THREE.Mesh(crossbarGeometry, postMaterial);
  crossbar.position.set(0, goalHeight - 0.5, 0);
  crossbar.castShadow = true;

  // --- POSTES TRASEIROS ---
  const backPostGeometry = new THREE.BoxGeometry(0.4, goalHeight, 0.4);
  const backLeftPost = new THREE.Mesh(backPostGeometry, postMaterial);
  backLeftPost.position.set(-goalWidth / 2, goalHeight / 2 - 0.5, -goalDepth);
  backLeftPost.castShadow = true;

  const backRightPost = new THREE.Mesh(backPostGeometry, postMaterial);
  backRightPost.position.set(goalWidth / 2, goalHeight / 2 - 0.5, -goalDepth);
  backRightPost.castShadow = true;

  const backCrossbarGeometry = new THREE.BoxGeometry(goalWidth + 0.4, 0.4, 0.4);
  const backCrossbar = new THREE.Mesh(backCrossbarGeometry, postMaterial);
  backCrossbar.position.set(0, goalHeight - 0.5, -goalDepth);
  backCrossbar.castShadow = true;

  goalGroup.add(
    leftPost,
    rightPost,
    crossbar,
    backLeftPost,
    backRightPost,
    backCrossbar
  );

  // --- REDES ---
  const netMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    wireframe: false,
  });

  // Rede traseira
  const backNetGeometry = new THREE.PlaneGeometry(goalWidth, goalHeight);
  const backNet = new THREE.Mesh(backNetGeometry, netMaterial);
  backNet.position.set(0, goalHeight / 2 - 0.5, -goalDepth);
  goalGroup.add(backNet);

  // Redes laterais
  const sideNetGeometry = new THREE.PlaneGeometry(goalDepth, goalHeight);
  const leftNet = new THREE.Mesh(sideNetGeometry, netMaterial);
  leftNet.rotation.y = Math.PI / 2;
  leftNet.position.set(-goalWidth / 2, goalHeight / 2 - 0.5, -goalDepth / 2);
  goalGroup.add(leftNet);

  const rightNet = new THREE.Mesh(sideNetGeometry, netMaterial);
  rightNet.rotation.y = Math.PI / 2;
  rightNet.position.set(goalWidth / 2, goalHeight / 2 - 0.5, -goalDepth / 2);
  goalGroup.add(rightNet);

  // Rede superior
  const topNetGeometry = new THREE.PlaneGeometry(goalWidth, goalDepth);
  const topNet = new THREE.Mesh(topNetGeometry, netMaterial);
  topNet.rotation.x = Math.PI / 2;
  topNet.position.set(0, goalHeight - 0.5, -goalDepth / 2);
  goalGroup.add(topNet);

  // Posiciona o gol
  goalGroup.position.z = -20;
  scene.add(goalGroup);

  return {
    group: goalGroup,
    width: goalWidth,
    height: goalHeight,
    depth: goalDepth,
    leftPost,
    rightPost,
    crossbar,
  };
}
