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
const windDirection = document.getElementById("wind-direction");

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
 * Atualiza o indicador de vento com direção combinada (rosa dos ventos)
 * @param {Object} windInfo - { direction, combinedPercent }
 */
export function updateWindIndicator(windInfo) {
  const { direction, combinedPercent } = windInfo;

  // Rotaciona a seta para a direção do vento
  // Ajuste: -90° porque a seta ➜ inicia apontando para leste (90°)
  // mas queremos que 0° aponte para norte (cima)
  windArrow.style.transform = `rotate(${direction - 90}deg)`;

  // Atualiza magnitude com cor baseada na intensidade
  windSpeed.innerText = `${combinedPercent}%`;
  windSpeed.style.color = getWindColor(combinedPercent);

  // Atualiza direção cardinal
  const cardinalDirection = getCardinalDirection(direction);
  windDirection.innerText = cardinalDirection;
}

/**
 * Converte graus para direção cardinal
 * @param {number} degrees - Direção em graus (0-360)
 * @returns {string} - Direção cardinal (N, NE, E, SE, S, SW, W, NW)
 */
function getCardinalDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * Retorna cor baseada na intensidade do vento
 * @param {number} percent - Percentual (0-100)
 * @returns {string} - Cor em hex
 */
function getWindColor(percent) {
  if (percent < 30) {
    return "#00ff00"; // Verde - vento fraco
  } else if (percent < 70) {
    return "#ffff00"; // Amarelo - vento médio
  } else {
    return "#ff6600"; // Laranja - vento forte
  }
}
