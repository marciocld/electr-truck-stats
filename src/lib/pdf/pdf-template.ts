import jsPDF from 'jspdf';
import { PDFOptions, ReportData } from './types';
import { formatDateBR, formatDistance, formatConsumption, formatEfficiency, formatDistanceValue, formatConsumptionValue, formatEfficiencyValue, formatDecimal1, formatDecimal2 } from '../formatters';

/**
 * Classe responsável por gerar PDF usando template nativo do jsPDF
 * ao invés de capturar imagens HTML
 */
export class PDFTemplateGenerator {
  private doc: jsPDF;
  private options: PDFOptions;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;
  private margin: { top: number; right: number; bottom: number; left: number };

  constructor(options: PDFOptions = {}) {
    this.options = {
      filename: 'relatorio-eletrico.pdf',
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      quality: 1.0,
      scale: 2,
      ...options
    };

    this.doc = new jsPDF({
      orientation: this.options.orientation,
      unit: this.options.unit,
      format: this.options.format
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = this.options.margin!;
    this.currentY = this.margin.top;
  }

  /**
   * Gera PDF completo usando template nativo
   */
  public async generatePDF(data: ReportData): Promise<void> {
    try {
      // Adicionar cabeçalho
      this.addHeader(data.period);
      
      // Adicionar resumo executivo
      this.addSummarySection(data.summary);
      
      // Adicionar tabela de dados detalhados
      this.addDetailedDataTable(data.detailedData);
      
      // Adicionar rodapé
      this.addFooter();
      
      console.log('PDF template gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF template:', error);
      throw error;
    }
  }

  /**
   * Adiciona cabeçalho do relatório
   */
  private addHeader(period: string): void {
    // Logo da empresa (placeholder - pode ser substituído por imagem real)
    this.doc.setFillColor(41, 128, 185); // Azul corporativo
    this.doc.rect(this.margin.left, this.currentY, 40, 15, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('EMPRESA', this.margin.left + 20, this.currentY + 9, { align: 'center' });
    
    // Título do relatório
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RELATÓRIO DE FROTA ELÉTRICA', this.pageWidth / 2, this.currentY + 9, { align: 'center' });
    
    this.currentY += 25;
    
    // Período do relatório
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Período: ${period}`, this.margin.left, this.currentY);
    
    // Data de geração
    const now = new Date();
    this.doc.text(`Gerado em: ${formatDateBR(now)}`, this.pageWidth - this.margin.right, this.currentY, { align: 'right' });
    
    this.currentY += 15;
    
    // Linha separadora
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin.left, this.currentY, this.pageWidth - this.margin.right, this.currentY);
    this.currentY += 10;
  }

  /**
   * Adiciona seção de resumo executivo
   */
  private addSummarySection(summary: any): void {
    // Título da seção com linha decorativa
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(41, 128, 185);
    this.doc.text('RESUMO EXECUTIVO', this.margin.left, this.currentY);
    
    // Linha decorativa sob o título
    this.doc.setDrawColor(41, 128, 185);
    this.doc.setLineWidth(0.8);
    this.doc.line(this.margin.left, this.currentY + 2, this.margin.left + 60, this.currentY + 2);
    this.currentY += 15;
    
    // Cards de métricas com design melhorado
    const cardWidth = (this.pageWidth - this.margin.left - this.margin.right - 20) / 3;
    const cardHeight = 35;
    const cardSpacing = 10;
    
    const metrics = [
      {
        title: 'CONSUMO TOTAL',
        value: formatConsumption(summary.totalConsumption),
        badge: 'ENERGIA',
        icon: '⚡',
        color: [52, 152, 219],
        lightColor: [230, 242, 255]
      },
      {
        title: 'DISTÂNCIA TOTAL',
        value: formatDistance(summary.totalDistance),
        badge: 'PERCURSO',
        icon: '🚛',
        color: [46, 204, 113],
        lightColor: [230, 255, 242]
      },
      {
        title: 'EFICIÊNCIA MÉDIA',
        value: formatEfficiency(summary.avgConsumptionPerKm),
        badge: 'PERFORMANCE',
        icon: '📊',
        color: [155, 89, 182],
        lightColor: [248, 230, 255]
      }
    ];
    
    metrics.forEach((metric, index) => {
      const x = this.margin.left + (cardWidth + cardSpacing) * index;
      
      // Fundo do card com gradiente simulado
      this.doc.setFillColor(255, 255, 255);
      this.doc.roundedRect(x, this.currentY, cardWidth, cardHeight, 3, 3, 'F');
      
      // Borda superior colorida (accent)
      this.doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
      this.doc.roundedRect(x, this.currentY, cardWidth, 3, 3, 3, 'F');
      
      // Sombra do card
      this.doc.setFillColor(240, 240, 240);
      this.doc.roundedRect(x + 1, this.currentY + 1, cardWidth, cardHeight, 3, 3, 'F');
      
      // Fundo principal do card
      this.doc.setFillColor(255, 255, 255);
      this.doc.roundedRect(x, this.currentY, cardWidth, cardHeight, 3, 3, 'F');
      
      // Borda superior colorida
      this.doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
      this.doc.roundedRect(x, this.currentY, cardWidth, 3, 3, 3, 'F');
      
      // Badge colorido
      this.doc.setFillColor(metric.lightColor[0], metric.lightColor[1], metric.lightColor[2]);
      this.doc.roundedRect(x + 5, this.currentY + 6, 25, 6, 2, 2, 'F');
      
      // Texto do badge
      this.doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
      this.doc.setFontSize(6);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.badge, x + 17.5, this.currentY + 10, { align: 'center' });
      
      // Ícone maior e mais destacado
      this.doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
      this.doc.circle(x + cardWidth - 12, this.currentY + 10, 4, 'F');
      
      // Círculo interno do ícone
      this.doc.setFillColor(255, 255, 255);
      this.doc.circle(x + cardWidth - 12, this.currentY + 10, 2.5, 'F');
      
      // Título da métrica
      this.doc.setTextColor(52, 58, 64);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.title, x + 5, this.currentY + 18);
      
      // Valor da métrica com destaque
      this.doc.setTextColor(33, 37, 41);
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.value, x + 5, this.currentY + 28);
      
      // Linha de separação sutil
      this.doc.setDrawColor(248, 249, 250);
      this.doc.setLineWidth(0.3);
      if (index < metrics.length - 1) {
        this.doc.line(x + cardWidth + cardSpacing/2, this.currentY + 5, x + cardWidth + cardSpacing/2, this.currentY + cardHeight - 5);
      }
    });
    
    this.currentY += cardHeight + 20;
  }

  /**
   * Adiciona tabela de dados detalhados
   */
  private addDetailedDataTable(detailedData: any[]): void {
    // Título da seção
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(41, 128, 185);
    this.doc.text('DADOS DETALHADOS', this.margin.left, this.currentY);
    this.currentY += 10;
    
    // Configurações da tabela
    const tableWidth = this.pageWidth - this.margin.left - this.margin.right;
    const colWidths = [30, 35, 35, 30, 30, 30]; // Larguras das colunas
    const rowHeight = 8;
    const headerHeight = 10;
    
    // Cabeçalho da tabela
    const headers = ['Data', 'Dist. Acum. (km)', 'Cons. Acum. (kWh)', 'Dist. Diária (km)', 'Cons. Diária (kWh)', 'Eficiência (kWh/km)'];
    
    // Fundo do cabeçalho
    this.doc.setFillColor(52, 58, 64);
    this.doc.rect(this.margin.left, this.currentY, tableWidth, headerHeight, 'F');
    
    // Texto do cabeçalho
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    
    let currentX = this.margin.left;
    headers.forEach((header, index) => {
      this.doc.text(header, currentX + colWidths[index] / 2, this.currentY + 6, { align: 'center' });
      currentX += colWidths[index];
    });
    
    this.currentY += headerHeight;
    
    // Linhas de dados
    this.doc.setTextColor(33, 37, 41);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    
    detailedData.forEach((row, rowIndex) => {
      // Verificar se precisa de nova página
      if (this.currentY + rowHeight > this.pageHeight - this.margin.bottom - 20) {
        this.doc.addPage();
        this.currentY = this.margin.top;
      }
      
      // Fundo alternado das linhas
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(248, 249, 250);
        this.doc.rect(this.margin.left, this.currentY, tableWidth, rowHeight, 'F');
      }
      
      // Dados da linha
      const rowData = [
        formatDateBR(new Date(row.date)),
        formatDistanceValue(row.accumulatedDistance),
        formatConsumptionValue(row.accumulatedConsumption),
        formatDistanceValue(row.distance),
        formatConsumptionValue(row.consumption),
        formatEfficiencyValue(row.consumptionPerKm)
      ];
      
      currentX = this.margin.left;
      rowData.forEach((data, colIndex) => {
        this.doc.text(data, currentX + colWidths[colIndex] / 2, this.currentY + 5, { align: 'center' });
        currentX += colWidths[colIndex];
      });
      
      this.currentY += rowHeight;
    });
    
    // Borda da tabela
    this.doc.setDrawColor(233, 236, 239);
    this.doc.rect(this.margin.left, this.currentY - (detailedData.length * rowHeight) - headerHeight, tableWidth, (detailedData.length * rowHeight) + headerHeight, 'S');
    
    // Linhas verticais
    currentX = this.margin.left;
    colWidths.forEach((width, index) => {
      if (index < colWidths.length - 1) {
        currentX += width;
        this.doc.line(currentX, this.currentY - (detailedData.length * rowHeight) - headerHeight, currentX, this.currentY);
      }
    });
    
    this.currentY += 10;
  }

  /**
   * Adiciona rodapé do relatório
   */
  private addFooter(): void {
    const footerY = this.pageHeight - this.margin.bottom;
    
    // Linha separadora
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin.left, footerY - 10, this.pageWidth - this.margin.right, footerY - 10);
    
    // Texto do rodapé
    this.doc.setTextColor(108, 117, 125);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Relatório gerado automaticamente pelo Sistema de Gestão de Frota Elétrica', this.margin.left, footerY - 3);
    
    // Número da página
    const pageNumber = this.doc.internal.getCurrentPageInfo().pageNumber;
    this.doc.text(`Página ${pageNumber}`, this.pageWidth - this.margin.right, footerY - 3, { align: 'right' });
  }

  /**
   * Verifica se precisa de nova página
   */
  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin.bottom - 20) {
      this.doc.addPage();
      this.currentY = this.margin.top;
    }
  }

  /**
   * Obtém o documento PDF gerado
   */
  public getDocument(): jsPDF {
    return this.doc;
  }

  /**
   * Salva o PDF
   */
  public save(filename?: string): void {
    this.doc.save(filename || this.options.filename);
  }
}

// Instância padrão do gerador de template
export const pdfTemplateGenerator = new PDFTemplateGenerator();