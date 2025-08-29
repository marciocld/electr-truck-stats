import jsPDF from 'jspdf';
import { PDFOptions, ReportData } from './types';
import { formatDateBR, formatDistance, formatConsumption, formatEfficiency, formatDistanceValue, formatConsumptionValue, formatEfficiencyValue, formatDecimal1, formatDecimal2, formatInteger } from '../formatters';

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
   * Adiciona cabeçalho do relatório - matchando o design HTML
   */
  private addHeader(period: string): void {
    // Linha superior colorida (gradient simulado)
    this.doc.setFillColor(59, 130, 246); // report-blue
    this.doc.rect(this.margin.left, this.currentY - 5, this.pageWidth - this.margin.left - this.margin.right, 2, 'F');
    
    this.currentY += 5;
    
    // Header com logo e período em linha (como no HTML)
    // Logo placeholder (retângulo menor e mais discreto)
    this.doc.setFillColor(28, 25, 23); // Cor mais escura e discreta
    this.doc.rect(this.margin.left, this.currentY, 20, 8, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LOGO', this.margin.left + 10, this.currentY + 5, { align: 'center' });
    
    // Período e data no lado direito (como no HTML)
    this.doc.setTextColor(28, 25, 23); // report-dark-blue equivalent
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(period, this.pageWidth - this.margin.right, this.currentY + 3, { align: 'right' });
    
    this.doc.setTextColor(107, 114, 128); // muted color
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    const now = new Date();
    this.doc.text(formatDateBR(now), this.pageWidth - this.margin.right, this.currentY + 8, { align: 'right' });
    
    this.currentY += 20;
    
    // Título principal centralizado (como no HTML)
    this.doc.setTextColor(28, 25, 23); // report-dark-blue
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Relatório de consumo', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 15;
    
    // Linha divisória centralizada (como no HTML)
    const lineWidth = 25;
    const lineX = (this.pageWidth - lineWidth) / 2;
    this.doc.setFillColor(59, 130, 246); // report-blue
    this.doc.rect(lineX, this.currentY, lineWidth, 1.5, 'F');
    
    this.currentY += 15;
  }

  /**
   * Adiciona seção de resumo executivo - matchando o grid 2x2 do HTML
   */
  private addSummarySection(summary: any): void {
    // Grid 2x2 como no HTML
    const cardWidth = (this.pageWidth - this.margin.left - this.margin.right - 15) / 2;
    const cardHeight = 45;
    const cardSpacingX = 15;
    const cardSpacingY = 15;
    
    const metrics = [
      {
        title: 'DISTÂNCIA TOTAL',
        value: formatInteger(summary.totalDistance),
        unit: 'quilômetros percorridos',
        badge: 'KM',
        iconBg: [59, 130, 246], // electric-blue
        badgeBg: [239, 246, 255], // light blue
        badgeColor: [29, 78, 216] // darker blue
      },
      {
        title: 'CONSUMO TOTAL',
        value: formatDecimal1(summary.totalConsumption),
        unit: 'quilowatt-hora consumidos',
        badge: 'kWh',
        iconBg: [34, 197, 94], // electric-green
        badgeBg: [240, 253, 244], // light green
        badgeColor: [22, 163, 74] // darker green
      },
      {
        title: 'DISTÂNCIA MÉDIA',
        value: formatInteger(summary.avgDistance),
        unit: 'quilômetros por dia',
        badge: 'Avg',
        iconBg: [168, 85, 247], // energy-purple
        badgeBg: [250, 245, 255], // light purple
        badgeColor: [124, 58, 237] // darker purple
      },
      {
        title: 'CONSUMO MÉDIO',
        value: formatDecimal1(summary.avgConsumption),
        unit: 'quilowatt-hora por dia',
        badge: 'Avg',
        iconBg: [245, 158, 11], // battery-yellow
        badgeBg: [255, 251, 235], // light yellow
        badgeColor: [217, 119, 6] // darker yellow
      }
    ];
    
    metrics.forEach((metric, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = this.margin.left + (cardWidth + cardSpacingX) * col;
      const y = this.currentY + (cardHeight + cardSpacingY) * row;
      
      // Sombra do card (offset)
      this.doc.setFillColor(240, 240, 240);
      this.doc.roundedRect(x + 1, y + 1, cardWidth, cardHeight, 3, 3, 'F');
      
      // Fundo principal do card
      this.doc.setFillColor(255, 255, 255);
      this.doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
      
      // Borda sutil
      this.doc.setDrawColor(229, 231, 235);
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'S');
      
      // Linha superior colorida (como no HTML)
      this.doc.setFillColor(metric.iconBg[0], metric.iconBg[1], metric.iconBg[2]);
      this.doc.rect(x, y, cardWidth, 2, 'F');
      
      // Header do card - título e badge
      const headerY = y + 8;
      
      // Título da métrica
      this.doc.setTextColor(107, 114, 128); // muted-foreground
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.title, x + 6, headerY);
      
      // Badge à direita
      const badgeWidth = 20;
      const badgeHeight = 6;
      const badgeX = x + cardWidth - badgeWidth - 6;
      const badgeY = headerY - 4;
      
      this.doc.setFillColor(metric.badgeBg[0], metric.badgeBg[1], metric.badgeBg[2]);
      this.doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');
      
      this.doc.setTextColor(metric.badgeColor[0], metric.badgeColor[1], metric.badgeColor[2]);
      this.doc.setFontSize(6);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.badge, badgeX + badgeWidth/2, badgeY + 4, { align: 'center' });
      
      // Valor principal centralizado
      this.doc.setTextColor(17, 24, 39); // foreground
      this.doc.setFontSize(24);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.value, x + cardWidth/2, y + 26, { align: 'center' });
      
      // Unidade/descrição
      this.doc.setTextColor(107, 114, 128); // muted-foreground
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(metric.unit, x + cardWidth/2, y + 35, { align: 'center' });
    });
    
    this.currentY += (cardHeight + cardSpacingY) * 2 + 10;
  }

  /**
   * Adiciona tabela de dados detalhados - com estilo do HTML
   */
  private addDetailedDataTable(detailedData: any[]): void {
    // Nova página para dados detalhados
    this.doc.addPage();
    this.currentY = this.margin.top;
    
    // Header simplificado da segunda página (como no HTML)
    this.doc.setTextColor(17, 24, 39); // foreground
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Dados', this.margin.left, this.currentY);
    
    // Info da página à direita
    this.doc.setTextColor(107, 114, 128); // muted-foreground
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Página 2 de 2', this.pageWidth - this.margin.right, this.currentY - 2, { align: 'right' });
    this.doc.text(`${detailedData.length} registros`, this.pageWidth - this.margin.right, this.currentY + 3, { align: 'right' });
    
    // Linha separadora
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin.left, this.currentY + 8, this.pageWidth - this.margin.right, this.currentY + 8);
    
    this.currentY += 20;
    
    // Container da tabela com borda arredondada
    const tableWidth = this.pageWidth - this.margin.left - this.margin.right;
    const tableStartY = this.currentY;
    
    // Fundo da tabela
    this.doc.setFillColor(255, 255, 255);
    this.doc.roundedRect(this.margin.left, tableStartY, tableWidth, 10, 2, 2, 'F');
    
    // Borda da tabela
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(this.margin.left, tableStartY, tableWidth, 10, 2, 2, 'S');
    
    // Configurações da tabela (larguras proporcionais como no HTML)
    const colWidths = [
      tableWidth * 0.16, // Data - 16%
      tableWidth * 0.18, // Odômetro - 18%
      tableWidth * 0.18, // Consumo Acum - 18%
      tableWidth * 0.16, // Distância - 16%
      tableWidth * 0.16, // Consumo - 16%
      tableWidth * 0.16  // Eficiência - 16%
    ];
    const rowHeight = 8;
    const headerHeight = 12;
    
    // Cabeçalho da tabela com estilo do HTML
    const headers = ['Data', 'Odômetro (km)', 'Consumo Acumulado (kWh)', 'Distância (km)', 'Consumo (kWh)', 'Eficiência (kWh/km)'];
    
    // Fundo do cabeçalho (cinza claro como no HTML)
    this.doc.setFillColor(248, 250, 252); // template-table th background
    this.doc.rect(this.margin.left, this.currentY, tableWidth, headerHeight, 'F');
    
    // Linha inferior do cabeçalho (mais escura)
    this.doc.setFillColor(28, 25, 23); // report-dark-blue
    this.doc.rect(this.margin.left, this.currentY + headerHeight - 2, tableWidth, 2, 'F');
    
    // Texto do cabeçalho
    this.doc.setTextColor(28, 25, 23); // report-dark-blue
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    
    let currentX = this.margin.left;
    headers.forEach((header, index) => {
      this.doc.text(header, currentX + colWidths[index] / 2, this.currentY + 7, { align: 'center' });
      currentX += colWidths[index];
    });
    
    this.currentY += headerHeight;
    
    // Linhas de dados
    detailedData.forEach((row, rowIndex) => {
      // Verificar se precisa de nova página
      if (this.currentY + rowHeight > this.pageHeight - this.margin.bottom - 20) {
        this.doc.addPage();
        this.currentY = this.margin.top + 20; // espaço para header da nova página
      }
      
      // Fundo alternado das linhas (como no HTML)
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(248, 250, 252); // template-table tr:nth-child(even)
        this.doc.rect(this.margin.left, this.currentY, tableWidth, rowHeight, 'F');
      }
      
      // Dados da linha com formatação como no HTML
      const rowData = [
        formatDateBR(new Date(row.date)),
        formatInteger(row.accumulatedDistance),
        formatDecimal1(row.accumulatedConsumption),
        formatInteger(row.distance),
        formatDecimal1(row.consumption),
        formatEfficiency(row.consumptionPerKm).replace(' kWh/km', '') // remover unidade
      ];
      
      // Cores diferentes para cada tipo de dado (como no HTML)
      const textColors = [
        [17, 24, 39], // Data - escuro
        [107, 114, 128], // Odômetro - cinza
        [107, 114, 128], // Consumo Acum - cinza  
        [17, 24, 39], // Distância - escuro
        [17, 24, 39], // Consumo - escuro
        [17, 24, 39]  // Eficiência - escuro
      ];
      
      const fontWeights = ['bold', 'normal', 'normal', 'bold', 'bold', 'bold'];
      
      currentX = this.margin.left;
      rowData.forEach((data, colIndex) => {
        this.doc.setTextColor(textColors[colIndex][0], textColors[colIndex][1], textColors[colIndex][2]);
        this.doc.setFont('helvetica', fontWeights[colIndex] as 'normal' | 'bold');
        this.doc.setFontSize(8);
        this.doc.text(data, currentX + colWidths[colIndex] / 2, this.currentY + 5, { align: 'center' });
        currentX += colWidths[colIndex];
      });
      
      this.currentY += rowHeight;
    });
    
    // Borda da tabela completa
    const finalTableHeight = headerHeight + (detailedData.length * rowHeight);
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(this.margin.left, tableStartY, tableWidth, finalTableHeight, 2, 2, 'S');
    
    // Linhas verticais da tabela
    currentX = this.margin.left;
    colWidths.forEach((width, index) => {
      if (index < colWidths.length - 1) {
        currentX += width;
        this.doc.setDrawColor(233, 236, 239);
        this.doc.setLineWidth(0.2);
        this.doc.line(currentX, tableStartY, currentX, tableStartY + finalTableHeight);
      }
    });
    
    this.currentY += 15;
  }

  /**
   * Adiciona rodapé do relatório - estilo HTML
   */
  private addFooter(): void {
    // Adicionar rodapé apenas na página de dados (página 2)
    const currentPage = this.doc.internal.getCurrentPageInfo().pageNumber;
    if (currentPage < 2) return;
    
    const footerY = this.pageHeight - this.margin.bottom;
    
    // Linha separadora sutil
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin.left, footerY - 8, this.pageWidth - this.margin.right, footerY - 8);
    
    // Texto do rodapé centralizado (como no HTML)
    this.doc.setTextColor(107, 114, 128); // muted-foreground
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Dados baseados em telemetria do veículo', this.pageWidth / 2, footerY - 2, { align: 'center' });
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