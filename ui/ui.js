/**
 * Módulo de gerenciamento da interface do usuário
 */

// --- Elementos da UI ---
const heightDisplay = document.getElementById("height-display");
const curveDisplay = document.getElementById("curve-display");
const goalMessage = document.getElementById("goal-message");
const powerBarContainer = document.getElementById("power-bar-container");
const powerBarFill = document.getElementById("power-bar-fill");
const powerBarLabel = document.getElementById("power-bar-label");
const windArrow = document.getElementById("wind-arrow");
const windSpeed = document.getElementById("wind-speed");

/**
 * Atualiza os displays de altura e curva na tela
 * @param {number} height - Valor da altura (0-1)
 * @param {number} curve - Valor da curva (-1 a 1)
 */
export function updateUI(height, curve) {
  heightDisplay.innerText = `Altura: ${(height * 100).toFixed(0)}`;
  curveDisplay.innerText = `Curva: ${(curve * 100).toFixed(0)}`;
}

/**
 * Atualiza a barra de força
 * @param {number} power - Valor da força (0-100)
 */
export function updatePowerBar(power) {
  const percentage = Math.min(100, Math.max(0, power));
  powerBarFill.style.width = `${percentage}%`;
  powerBarLabel.innerText = `FORÇA: ${percentage.toFixed(0)}%`;
}

/**
 * Mostra a barra de força
 */
export function showPowerBar() {
  powerBarContainer.style.display = "block";
}

/**
 * Esconde a barra de força
 */
export function hidePowerBar() {
  powerBarContainer.style.display = "none";
}

/**
 * Exibe a mensagem "GOL!" na tela
 */
export function showGoalMessage() {
  goalMessage.style.display = "block";
}

/**
 * Esconde a mensagem "GOL!" da tela
 */
export function hideGoalMessage() {
  goalMessage.style.display = "none";
}

/**
 * Atualiza o indicador de vento
 * @param {number} direction - Direção em graus (0-360)
 * @param {number} speedPercent - Velocidade em porcentagem (0-100)
 */
export function updateWindIndicator(direction, speedPercent) {
  // Rotaciona a seta na direção do vento
  windArrow.style.transform = `rotate(${direction}deg)`;

  // Atualiza a velocidade
  windSpeed.innerText = `${speedPercent}%`;

  // Muda a cor baseado na velocidade
  if (speedPercent < 30) {
    windSpeed.style.color = "#00ff00"; // Verde - vento fraco
  } else if (speedPercent < 70) {
    windSpeed.style.color = "#ffff00"; // Amarelo - vento médio
  } else {
    windSpeed.style.color = "#ff6600"; // Laranja - vento forte
  }
}
