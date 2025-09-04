export interface PDFOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  unit?: 'mm' | 'cm' | 'in' | 'pt';
  format?: 'a4' | 'a3' | 'letter' | 'legal';
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  quality?: number;
  scale?: number;
}

export interface ReportData {
  period: string;
  devices: string[]; // Lista de números de série dos dispositivos
  summary: {
    totalConsumption: number;
    totalDistance: number;
    avgConsumptionPerKm: number;
    avgConsumption: number;
    avgDistance: number;
  };
  // NOVO: Dados detalhados por dispositivo
  detailedDataByDevice: {
    [deviceSerial: string]: Array<{
      date: string;
      deviceSerial?: string; // Opcional para compatibilidade
      accumulatedDistance: number;
      accumulatedConsumption: number;
      distance: number;
      consumption: number;
      consumptionPerKm: number;
    }>;
  };
  // MANTIDO: Dados consolidados (opcional)
  detailedData: Array<{
    date: string;
    deviceSerial?: string; // Opcional para compatibilidade
    accumulatedDistance: number;
    accumulatedConsumption: number;
    distance: number;
    consumption: number;
    consumptionPerKm: number;
  }>;
}

export interface PDFContext {
  doc: any; // jsPDF instance
  options: PDFOptions;
  currentY: number;
  pageWidth: number;
  pageHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
}