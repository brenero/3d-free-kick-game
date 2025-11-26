/**
 * Módulo de física do vento
 * Gerencia direção e força do vento que afeta a bola
 * Sistema com 2 componentes ponderados:
 * - Leste-Oeste (X): Afeta curva (peso maior)
 * - Norte-Sul (Z): Afeta direção (peso menor)
 */

import * as THREE from "three";
import {
  VENTO_MINIMO,
  VENTO_MAXIMO,
  VENTO_ATIVO,
  VENTO_PESO_LESTE_OESTE,
  VENTO_PESO_NORTE_SUL
} from "../config.js";

// Estado do vento (componentes separados)
let windEastWest = 0; // Vento horizontal (X) - afeta curva
let windNorthSouth = 0; // Vento frontal (Z) - afeta direção
let windDirection = 0; // Ângulo em graus (0-360) - apenas para display
let windSpeed = 0; // Velocidade (0-1) - apenas para display

/**
 * Gera um vento aleatório com componentes separados e ponderados
 * Leste-Oeste (X): peso maior, afeta curva
 * Norte-Sul (Z): peso menor, afeta direção
 */
export function randomizeWind() {
  if (!VENTO_ATIVO) {
    windEastWest = 0;
    windNorthSouth = 0;
    windDirection = 0;
    windSpeed = 0;
    return;
  }

  // Direção aleatória em graus (0-360)
  windDirection = Math.random() * 360;

  // Força base aleatória entre MIN e MAX
  const windMagnitude = VENTO_MINIMO + Math.random() * (VENTO_MAXIMO - VENTO_MINIMO);

  // Converte direção para radianos
  const angleRad = (windDirection * Math.PI) / 180;

  // Calcula componentes X e Z
  // Sistema Three.js: +X = direita, -X = esquerda, -Z = gol/frente, +Z = trás
  // 0° = Norte (gol = -Z), 90° = Leste (direita = +X)
  // 180° = Sul (trás = +Z), 270° = Oeste (esquerda = -X)
  const baseWindX = Math.sin(angleRad) * windMagnitude;
  const baseWindZ = -Math.cos(angleRad) * windMagnitude;

  // Aplica pesos diferentes para cada componente
  windEastWest = baseWindX * VENTO_PESO_LESTE_OESTE;
  windNorthSouth = baseWindZ * VENTO_PESO_NORTE_SUL;

  // Normaliza velocidade para 0-1 para exibição
  windSpeed = (windMagnitude - VENTO_MINIMO) / (VENTO_MAXIMO - VENTO_MINIMO);
}

/**
 * Retorna os componentes separados do vento
 * @returns {Object} - { eastWest: número, northSouth: número }
 */
export function getWindComponents() {
  return {
    eastWest: windEastWest,
    northSouth: windNorthSouth
  };
}

/**
 * Retorna a força do vento como vetor (para compatibilidade)
 * @returns {THREE.Vector3} - Vetor de força do vento
 */
export function getWindForce() {
  return new THREE.Vector3(windEastWest, 0, windNorthSouth);
}

/**
 * Retorna informações do vento para exibição
 * @returns {Object} - {direction, combinedMagnitude, combinedPercent, eastWest, northSouth}
 */
export function getWindInfo() {
  // Calcula magnitude combinada dos componentes ponderados
  const combinedMagnitude = Math.sqrt(windEastWest * windEastWest + windNorthSouth * windNorthSouth);

  // Calcula direção combinada em graus (0° = Norte/gol, 90° = Leste/direita)
  // atan2 retorna ângulo em radianos, convertemos para graus
  // Sistema: -Z = Norte (0°), +X = Leste (90°), +Z = Sul (180°), -X = Oeste (270°)
  let combinedDirection = (Math.atan2(windEastWest, -windNorthSouth) * 180 / Math.PI);
  if (combinedDirection < 0) combinedDirection += 360;

  // Calcula percentual baseado na magnitude máxima possível combinada
  const maxMagnitude = Math.sqrt(
    (VENTO_MAXIMO * VENTO_PESO_LESTE_OESTE) ** 2 +
    (VENTO_MAXIMO * VENTO_PESO_NORTE_SUL) ** 2
  );
  const combinedPercent = maxMagnitude > 0
    ? Math.round((combinedMagnitude / maxMagnitude) * 100)
    : 0;

  return {
    direction: combinedDirection,
    combinedMagnitude: combinedMagnitude,
    combinedPercent: combinedPercent,
    eastWest: windEastWest,
    northSouth: windNorthSouth,
  };
}

/**
 * Retorna a direção do vento como string (N, S, E, W, etc)
 * @returns {string} - Direção cardinal
 */
export function getWindDirectionString() {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(windDirection / 45) % 8;
  return directions[index];
}
