/**
 * Utilitários para formatação de números e datas no padrão brasileiro
 */

/**
 * Formata números no padrão brasileiro
 */
export const formatNumber = (
  value: number, 
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    style?: 'decimal' | 'currency' | 'percent';
    currency?: string;
  } = {}
): string => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    style = 'decimal',
    currency = 'BRL'
  } = options;

  return new Intl.NumberFormat('pt-BR', {
    style,
    currency: style === 'currency' ? currency : undefined,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
};

/**
 * Formata distância em quilômetros
 */
export const formatDistance = (km: number): string => {
  if (km === 0) return '0 km';
  
  if (km >= 1000) {
    return `${formatNumber(km, { maximumFractionDigits: 0 })} km`;
  } else {
    return `${formatNumber(km, { maximumFractionDigits: 1 })} km`;
  }
};

/**
 * Formata distância sem unidade (apenas número)
 */
export const formatDistanceValue = (km: number): string => {
  if (km === 0) return '0';
  
  if (km >= 1000) {
    return formatNumber(km, { maximumFractionDigits: 0 });
  } else {
    return formatNumber(km, { maximumFractionDigits: 1 });
  }
};

/**
 * Formata consumo em kWh
 */
export const formatConsumption = (kwh: number): string => {
  if (kwh === 0) return '0 kWh';
  
  if (kwh >= 1000) {
    return `${formatNumber(kwh, { maximumFractionDigits: 1 })} kWh`;
  } else {
    return `${formatNumber(kwh, { maximumFractionDigits: 2 })} kWh`;
  }
};

/**
 * Formata eficiência energética (kWh/km)
 */
export const formatEfficiency = (kwhPerKm: number): string => {
  if (kwhPerKm === 0) return '0,000 kWh/km';
  
  return `${formatNumber(kwhPerKm, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kWh/km`;
};

/**
 * Formata consumo sem unidade (apenas número)
 */
export const formatConsumptionValue = (kwh: number): string => {
  if (kwh === 0) return '0';
  
  if (kwh >= 1000) {
    return formatNumber(kwh, { maximumFractionDigits: 1 });
  } else {
    return formatNumber(kwh, { maximumFractionDigits: 2 });
  }
};

/**
 * Formata eficiência sem unidade (apenas número)
 */
export const formatEfficiencyValue = (kwhPerKm: number): string => {
  if (kwhPerKm === 0) return '0,000';
  
  return formatNumber(kwhPerKm, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
};

/**
 * Formata percentual
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
};

/**
 * Formata data no padrão brasileiro
 */
export const formatDateBR = (dateString: string | Date): string => {
  if (typeof dateString === 'string') {
    // Se é string no formato YYYY-MM-DD, criar data brasileira evitando timezone
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('pt-BR');
    }
    // Se é string em outro formato, usar new Date
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } else {
    // Se já é Date, usar diretamente
    return dateString.toLocaleDateString('pt-BR');
  }
};

/**
 * Formata data local no formato YYYY-MM-DD evitando problemas de timezone
 * Versão consolidada para uso em todo o sistema
 */
export const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Converte string de data brasileira (DD/MM/YYYY) para Date
 */
export const parseDateBR = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

/**
 * Converte timestamp UTC para horário brasileiro (GMT-3)
 */
export const convertUTCtoBRT = (utcTimestamp: string): Date => {
  const utcTime = new Date(utcTimestamp);
  // Subtrair 3 horas para converter UTC para BRT (GMT-3)
  return new Date(utcTime.getTime() - (3 * 60 * 60 * 1000));
};

/**
 * Cria Date brasileira a partir de string no formato YYYY-MM-DD
 * Evita problemas de timezone ao interpretar como data local
 */
export const createBrazilianDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

/**
 * Formata data para o formato esperado pela API (UTC com horários BRT)
 * Para BRT (GMT-3): dia brasileiro vai de 03:00 UTC até 02:59 UTC do dia seguinte
 */
export const formatDateForAPI = (date: Date, isEndDate: boolean = false): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (isEndDate) {
    // Data de fim: próximo dia às 02:59:59.999Z (equivale a 23:59:59.999 BRT)
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextYear = nextDay.getFullYear();
    const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
    const nextDayStr = String(nextDay.getDate()).padStart(2, '0');
    return `${nextYear}-${nextMonth}-${nextDayStr}T02:59:59.999Z`;
  } else {
    // Data de início: mesmo dia às 03:00:00.000Z (equivale a 00:00:00.000 BRT)
    return `${year}-${month}-${day}T03:00:00.000Z`;
  }
};

/**
 * Formata data e hora no padrão brasileiro
 */
export const formatDateTimeBR = (date: Date): string => {
  return date.toLocaleString('pt-BR');
};

/**
 * Formata número inteiro (sem casas decimais)
 */
export const formatInteger = (value: number): string => {
  return formatNumber(value, { maximumFractionDigits: 0 });
};

/**
 * Formata número com 1 casa decimal
 */
export const formatDecimal1 = (value: number): string => {
  return formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

/**
 * Formata número com 2 casas decimais
 */
export const formatDecimal2 = (value: number): string => {
  return formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Formata valor monetário em reais
 */
export const formatCurrency = (value: number): string => {
  return formatNumber(value, { style: 'currency', currency: 'BRL' });
};

/**
 * Formata número compacto (K, M, B)
 */
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value);
};
