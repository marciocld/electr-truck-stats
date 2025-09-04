/**
 * Formata uma data no padrão brasileiro (dd/mm/aaaa)
 * @param dateString - String da data a ser formatada
 * @returns Data formatada no padrão brasileiro
 */
export function formatDateBR(dateString: string): string {
  // Se é string no formato YYYY-MM-DD, criar data brasileira evitando timezone
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  }
  // Se é string em outro formato, usar new Date
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

/**
 * Formata um número para exibição com casas decimais específicas
 * @param value - Valor numérico
 * @param decimals - Número de casas decimais
 * @returns Valor formatado como string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Formata um valor de distância com unidade
 * @param distance - Distância em km
 * @returns Distância formatada com unidade
 */
export function formatDistance(distance: number): string {
  return `${formatNumber(distance, 0)} km`;
}

/**
 * Formata um valor de consumo com unidade
 * @param consumption - Consumo em kWh
 * @returns Consumo formatado com unidade
 */
export function formatConsumption(consumption: number): string {
  return `${formatNumber(consumption, 2)} kWh`;
}

/**
 * Formata um valor de consumo por km com unidade
 * @param consumptionPerKm - Consumo por km em kWh/km
 * @returns Consumo por km formatado com unidade
 */
export function formatConsumptionPerKm(consumptionPerKm: number): string {
  return `${formatNumber(consumptionPerKm, 3)} kWh/km`;
}