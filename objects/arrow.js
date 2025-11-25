/**
 * Módulo da seta de mira curva
 */

import * as THREE from "three";
import { CURVA_VISUAL_SETA } from "../config.js";

const arrowOrigin = new THREE.Vector3(0, 0.1, 0.2);
const arrowLength = 2.5;
const arrowColor = 0xffff00;

// Grupo para a seta curva customizada
let curvedArrowGroup;
let curvedLine;
let arrowHead;

/**
 * Cria o grupo inicial da seta curva
 * @param {THREE.Group} aimGroup - Grupo de mira que contém a seta
 * @returns {THREE.Group} - Grupo da seta curva
 */
export function initArrow(aimGroup) {
  curvedArrowGroup = new THREE.Group();
  curvedArrowGroup.position.copy(arrowOrigin);

  // Cria a seta inicial
  createCurvedArrow(0, 0.3);
  aimGroup.add(curvedArrowGroup);

  return curvedArrowGroup;
}

/**
 * Cria ou recria a seta curva com os novos valores
 * @param {number} curveAmount - Quantidade de curva (-1 a 1)
 * @param {number} heightAmount - Quantidade de altura/força (0 a 1)
 */
export function createCurvedArrow(curveAmount, heightAmount) {
  // Remove a linha e cabeça antigas se existirem
  if (curvedLine) curvedArrowGroup.remove(curvedLine);
  if (arrowHead) curvedArrowGroup.remove(arrowHead);

  // Calcula o ponto de controle para a curva
  const startPoint = new THREE.Vector3(0, 0, 0);
  const midPoint = new THREE.Vector3(
    curveAmount * CURVA_VISUAL_SETA, // Deslocamento lateral na "barriga" da curva
    heightAmount * arrowLength * 0.5,
    -arrowLength * 0.5
  );
  const endPoint = new THREE.Vector3(
    0, // Volta para o centro (não desloca lateralmente)
    heightAmount * arrowLength,
    -arrowLength
  );

  // Cria a curva quadrática
  const curve = new THREE.QuadraticBezierCurve3(startPoint, midPoint, endPoint);

  // Cria a geometria da linha como um tubo para projetar sombra
  const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.05, 8, false);
  const lineMaterial = new THREE.MeshStandardMaterial({
    color: arrowColor,
    roughness: 0.5,
  });
  curvedLine = new THREE.Mesh(tubeGeometry, lineMaterial);
  curvedLine.castShadow = true; // Habilita projeção de sombra
  curvedArrowGroup.add(curvedLine);

  // Cria a cabeça da seta (triângulo 2D)
  const triangleShape = new THREE.Shape();
  triangleShape.moveTo(0, 0.3); // Ponta do triângulo
  triangleShape.lineTo(-0.15, -0.15); // Base esquerda
  triangleShape.lineTo(0.15, -0.15); // Base direita
  triangleShape.lineTo(0, 0.3); // Volta para a ponta

  const extrudeSettings = {
    depth: 0.05, // Pequena profundidade para fazer sombra
    bevelEnabled: false,
  };
  const headGeometry = new THREE.ExtrudeGeometry(
    triangleShape,
    extrudeSettings
  );
  const headMaterial = new THREE.MeshStandardMaterial({
    color: arrowColor,
    side: THREE.DoubleSide,
    roughness: 0.5,
  });
  arrowHead = new THREE.Mesh(headGeometry, headMaterial);
  arrowHead.castShadow = true; // Habilita projeção de sombra

  // Posiciona e rotaciona a cabeça da seta no final da curva
  arrowHead.position.copy(endPoint);

  // Calcula a tangente (direção) da curva no ponto final
  const tangent = curve.getTangent(1).normalize();

  // Faz o triângulo "olhar" na direção da tangente
  const targetPoint = new THREE.Vector3().addVectors(endPoint, tangent);
  arrowHead.lookAt(targetPoint);

  // Ajusta a rotação para o triângulo ficar perpendicular correto e virado para frente
  arrowHead.rotateX(-Math.PI / 2);
  arrowHead.rotateZ(Math.PI); // Vira 180 graus para a ponta ficar na frente
  curvedArrowGroup.add(arrowHead);
}

/**
 * Atualiza a direção da seta de mira
 * @param {number} curveAmount - Quantidade de curva
 * @param {number} kickPowerY - Potência do chute
 */
export function updateAimArrowDirection(curveAmount, kickPowerY) {
  createCurvedArrow(curveAmount, kickPowerY);
}
