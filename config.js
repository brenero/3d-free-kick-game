// ========================================
// CONFIGURAÇÕES DE AJUSTE MANUAL
// ========================================

// Configurações da Seta
export const CURVA_VISUAL_SETA = 1; // Multiplicador da curva visual da seta (quanto maior, mais curva na seta)

// Configurações da Física da Bola
export const CURVA_FISICA_BOLA = 0.02; // Fator de curva da física da bola (quanto maior, mais a bola curva)
export const VELOCIDADE_BOLA = 0.4; // Velocidade horizontal máxima do chute (quando força está em 100%)
export const FORCA_INICIAL_Y = 0.1; // Velocidade vertical base (W/S controlam, multiplicada pela força do chute)
export const EFEITO_MAGNUS = -0.005; // Sustentação vertical (multiplicado por curva * velocidade da bola)
export const RAIO_BOLA = 0.22; // Raio da bola
export const GRAVIDADE = -0.0098; // Força da gravidade (negativo = puxa pra baixo)

// Configurações da Barra de Força
export const VELOCIDADE_BARRA_FORCA = 1.5; // Velocidade que a barra enche por frame (1.5 = ~67 frames para 100%)
export const FORCA_MINIMA_CHUTE = 20; // Força mínima necessária para chutar (0-100)
export const MULTIPLICADOR_FORCA_MAXIMA = 2; // Multiplicador aplicado quando a barra está em 100% (1.0 = normal, 1.5 = 150% mais forte)

// Configurações de Colisão
export const COEF_RESTITUICAO_CHAO = 0.6; // Coeficiente de restituição do chão (0-1, quanto maior mais quica)
export const COEF_RESTITUICAO_TRAVE = 0.7; // Coeficiente de restituição da trave (0-1, quanto maior mais quica)
export const COEF_RESTITUICAO_BARREIRA = 0.5; // Coeficiente de restituição da barreira

// Configurações da Barreira
export const BARREIRA_Z = 2; // Posição Z da barreira (entre bola e gol)
export const BARREIRA_LARGURA = 3; // Largura da barreira
export const BARREIRA_ALTURA = 2.4; // Altura da barreira
export const BARREIRA_DESLOCAMENTO_MIN = 1.5; // Deslocamento mínimo lateral da barreira (nunca no centro)
export const BARREIRA_DESLOCAMENTO_MAX = 2; // Deslocamento máximo lateral da barreira

// Configurações do Gol
export const GOL_LARGURA = 16; // Largura do gol
export const GOL_ALTURA = 5; // Altura do gol

// Configurações do Goleiro
export const GOLEIRO_VELOCIDADE = 0.05; // Velocidade de movimento do goleiro
export const GOLEIRO_TEMPO_REACAO = 20; // Frames de atraso na reação (maior = mais lento)
export const GOLEIRO_ALCANCE_X = 5; // Alcance lateral máximo do goleiro
export const GOLEIRO_ALCANCE_Y = 1; // Alcance vertical máximo do goleiro

// Configurações da Câmera
export const CAMERA_DISTANCE = 14; // Distância da câmera até a bola

// Configurações do Vento
export const VENTO_MINIMO = 0; // Força mínima do vento (0 = sem vento)
export const VENTO_MAXIMO = 0.009; // Força máxima do vento (afeta velocidade da bola, máx ~60%)
export const VENTO_ATIVO = true; // Ativa/desativa a mecânica de vento
