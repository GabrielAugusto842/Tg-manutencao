// --- CONSTANTES DE METAS ---
export const MTTR_META_HORAS = 4.0;
export const MTBF_META_HORAS = 200.0;

// Converte horas decimais para o formato de horas e minutos.
export function formatHoras(hours) {
  // Verifica se o valor das horas é inválido ou negativo
  if (
    hours === null ||
    typeof hours === "undefined" ||
    isNaN(hours) ||
    hours < 0
  )
    return "0h 00min";

  const totalMinutes = Math.round(hours * 60); // Converte as horas decimais para minutos
  const h = Math.floor(totalMinutes / 60); // Calcula as horas inteiras
  const m = totalMinutes % 60; // Calcula os minutos restantes

  return `${h}h ${m.toString().padStart(2, "0")}min`; // Retorna no formato "Xh YYmin"
}

// Formata um número para percentual com 2 casas decimais.
export function formatPercentual(value) {
  // Verifica se o valor é inválido ou NaN
  if (value === null || typeof value === "undefined" || isNaN(value))
    return "0.00%";

  return `${parseFloat(value).toFixed(2)}%`; // Formata o valor com 2 casas decimais e adiciona o símbolo de porcentagem
}

/**
 Define a cor para o MTTR com base no valor atual em comparação com a meta.
 MTTR deve ser baixo, então valores abaixo ou iguais à meta são VERDES.  */

export function getMttrColor(mttrValue, meta = MTTR_META_HORAS) {
  // Verifica se o valor do MTTR é inválido
  if (
    mttrValue === null ||
    typeof mttrValue === "undefined" ||
    isNaN(mttrValue)
  )
    return "#6c757d";

  // Se o valor do MTTR é menor ou igual à meta, a cor será verde (sucesso)
  if (mttrValue <= meta) {
    return "#0ebc0eff";
  }

  // Se o valor do MTTR for maior que a meta, a cor será vermelha (alerta)
  return "#cc1818ff";
}

/**
 * Define a cor para o MTBF com base no valor atual em comparação com a meta.
 * MTBF deve ser alto, então valores acima ou iguais à meta são VERDES.*/

export function getMtbfColor(mtbfValue, meta = MTBF_META_HORAS) {
  // Verifica se o valor do MTBF é inválido
  if (
    mtbfValue === null ||
    typeof mtbfValue === "undefined" ||
    isNaN(mtbfValue)
  )
    return "#6c757d"; // Retorna cinza padrão se o valor for inválido

  // Se o valor do MTBF é maior ou igual à meta, a cor será verde (sucesso)
  if (mtbfValue >= meta) {
    return "#0ebc0eff";
  }

  // Se o valor do MTBF for menor que a meta, a cor será vermelha (alerta)
  return "#cc1818ff";
}

export const getMttaColor = (valorAtual, valorMeta) => {
  if (valorAtual <= valorMeta) {
    return "#0ebc0eff"; // Verde
  }
  return "#cc1818ff"; // Laranja/Amarelo
};
