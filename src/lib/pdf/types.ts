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
  summary: {
    totalConsumption: number;
    totalDistance: number;
    avgConsumptionPerKm: number;
    avgConsumption: number;
    avgDistance: number;
  };
  detailedData: Array<{
    date: string;
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