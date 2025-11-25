/**
 * Módulo de física do vento
 * Gerencia direção e força do vento que afeta a bola
 */

import * as THREE from "three";
import { VENTO_MINIMO, VENTO_MAXIMO, VENTO_ATIVO } from "../config.js";

// Estado do vento
let windForce = new THREE.Vector3(0, 0, 0);
let windDirection = 0; // Ângulo em graus (0-360)
let windSpeed = 0; // Velocidade (0-1)

/**
 * Gera um vento aleatório
 * Direção: aleatória (0-360 graus)
 * Velocidade: aleatória entre VENTO_MINIMO e VENTO_MAXIMO
 */
export function randomizeWind() {
  if (!VENTO_ATIVO) {
    windForce.set(0, 0, 0);
    windDirection = 0;
    windSpeed = 0;
    return;
  }

  // Direção aleatória em graus (0-360)
  windDirection = Math.random() * 360;

  // Força aleatória entre MIN e MAX
  const windMagnitude = VENTO_MINIMO + Math.random() * (VENTO_MAXIMO - VENTO_MINIMO);

  // Converte direção para radianos
  const angleRad = (windDirection * Math.PI) / 180;

  // Calcula componentes X e Z (vento horizontal)
  // Sistema Three.js: +X = direita, -X = esquerda, -Z = gol/frente, +Z = trás
  // 0° = Norte (gol = -Z), 90° = Leste (direita = +X)
  // 180° = Sul (trás = +Z), 270° = Oeste (esquerda = -X)
  const windX = Math.sin(angleRad) * windMagnitude;
  const windZ = -Math.cos(angleRad) * windMagnitude;

  windForce.set(windX, 0, windZ);

  // Normaliza velocidade para 0-1 para exibição
  windSpeed = (windMagnitude - VENTO_MINIMO) / (VENTO_MAXIMO - VENTO_MINIMO);
}

/**
 * Retorna a força do vento como vetor
 * @returns {THREE.Vector3} - Vetor de força do vento
 */
export function getWindForce() {
  return windForce.clone();
}

/**
 * Retorna informações do vento para exibição
 * @returns {Object} - {direction: número em graus, speed: 0-1, speedPercent: 0-100}
 */
export function getWindInfo() {
  return {
    direction: windDirection,
    speed: windSpeed,
    speedPercent: Math.round(windSpeed * 100),
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
