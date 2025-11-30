/**
 * src/Services/formatters.js
 * Arquivo de utilitários para formatação de valores e lógica de cores de KPIs.
 */

// --- CONSTANTES DE METAS ---
export const MTTR_META_HORAS = 4.0; // Meta de 4.0 horas para MTTR
export const MTBF_META_HORAS = 200.0; // Meta de 200.0 horas para MTBF

/**
 * Converte horas decimais (ex: 13.75) para formato Hh Mm (ex: 13h 45min).
 * @param {number} hours - Tempo em horas decimais.
 * @returns {string} - Tempo formatado (ex: "13h 45min").
 */
export function formatHoras(hours) {
  if (
    hours === null ||
    typeof hours === "undefined" ||
    isNaN(hours) ||
    hours < 0
  )
    return "0h 0min";

  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return `${h}h ${m.toString().padStart(2, "0")}min`;
}

/**
 * Formata um número para percentual, garantindo 2 casas decimais.
 * @param {number} value - Valor percentual (ex: 98.5).
 * @returns {string} - Valor formatado com '%' (ex: "98.50%").
 */
export function formatPercentual(value) {
  if (value === null || typeof value === "undefined" || isNaN(value))
    return "0.00%";
  return `${parseFloat(value).toFixed(2)}%`;
}

/**
 * Define a cor para o MTTR (MTTR deve ser baixo, então abaixo da meta é VERDE).
 * @param {number} mttrValue - Valor atual do MTTR.
 * @param {number} meta - Meta do MTTR (em horas).
 * @returns {string} - Código de cor CSS.
 */
export function getMttrColor(mttrValue, meta = MTTR_META_HORAS) {
  if (
    mttrValue === null ||
    typeof mttrValue === "undefined" ||
    isNaN(mttrValue)
  )
    return "#6c757d"; // Cinza padrão

  // Verde (Sucesso): Valor abaixo ou igual à meta
  if (mttrValue <= meta) {
    return "#28a745";
  }
  // Vermelho (Alerta): Valor acima da meta
  return "#dc3545";
}

/**
 * Define a cor para o MTBF (MTBF deve ser alto, então acima da meta é VERDE).
 * @param {number} mtbfValue - Valor atual do MTBF.
 * @param {number} meta - Meta do MTBF (em horas).
 * @returns {string} - Código de cor CSS.
 */
export function getMtbfColor(mtbfValue, meta = MTBF_META_HORAS) {
  if (
    mtbfValue === null ||
    typeof mtbfValue === "undefined" ||
    isNaN(mtbfValue)
  )
    return "#6c757d"; // Cinza padrão

  // Verde (Sucesso): Valor acima ou igual à meta
  if (mtbfValue >= meta) {
    return "#28a745";
  }
  // Vermelho (Alerta): Valor abaixo da meta
  return "#dc3545";
}
