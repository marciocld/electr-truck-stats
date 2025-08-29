import jsPDF from 'jspdf';
import { PDFOptions, ReportData } from './types';
import { formatDateBR, formatDistance, formatConsumption, formatEfficiency, formatDistanceValue, formatConsumptionValue, formatEfficiencyValue, formatDecimal1, formatDecimal2, formatInteger } from '../formatters';
import logo from '@/assets/company-logo.png';

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
   * Adiciona cabeçalho do relatório - com logo da empresa
   */
  private addHeader(period: string): void {
    // Fundo sutil para o cabeçalho
    this.doc.setFillColor(249, 250, 251);
    this.doc.rect(0, 0, this.pageWidth, 70, 'F');
    
    // Logo da empresa com dimensões proporcionais
    try {
      const img = new Image();
      img.src = logo;
      
      // Dimensões otimizadas para profissionalismo
      const targetWidth = 40;
      let targetHeight = 25;
      
      if (img.naturalWidth && img.naturalHeight) {
        targetHeight = (img.naturalHeight * targetWidth) / img.naturalWidth;
      }
      
      // Logo com sombra sutil
      this.doc.setFillColor(255, 255, 255);
      this.doc.roundedRect(this.margin.left - 2, this.currentY - 2, targetWidth + 4, targetHeight + 4, 3, 3, 'F');
      this.doc.setDrawColor(230, 230, 230);
      this.doc.setLineWidth(0.2);
      this.doc.roundedRect(this.margin.left - 2, this.currentY - 2, targetWidth + 4, targetHeight + 4, 3, 3, 'S');
      
      this.doc.addImage(
        logo,
        'PNG',
        this.margin.left,
        this.currentY,
        targetWidth,
        targetHeight,
        undefined,
        'NONE'
      );
      
      // Informações do relatório à direita com design mais elegante
      const rightX = this.pageWidth - this.margin.right;
      const infoY = this.currentY + 2;
      
      // Container para informações do período
      this.doc.setFillColor(255, 255, 255);
      this.doc.roundedRect(rightX - 65, infoY - 3, 65, 22, 2, 2, 'F');
      this.doc.setDrawColor(230, 230, 230);
      this.doc.setLineWidth(0.2);
      this.doc.roundedRect(rightX - 65, infoY - 3, 65, 22, 2, 2, 'S');
      
      // Texto "PERÍODO" em cinza pequeno
      this.doc.setTextColor(120, 120, 120);
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('PERÍODO', rightX - 2, infoY + 2, { align: 'right' });
      
      // Período em negrito
      this.doc.setTextColor(45, 45, 45);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(period, rightX - 2, infoY + 7, { align: 'right' });
      
      // Data de geração
      this.doc.setTextColor(120, 120, 120);
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'normal');
      const now = new Date();
      this.doc.text(`Gerado em ${formatDateBR(now)}`, rightX - 2, infoY + 13, { align: 'right' });
      
      this.currentY += Math.max(targetHeight, 22);
    } catch (error) {
      // Fallback elegante
      this.doc.setFillColor(45, 45, 45);
      this.doc.roundedRect(this.margin.left, this.currentY, 40, 25, 3, 3, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('LOGO', this.margin.left + 20, this.currentY + 15, { align: 'center' });
      
      this.currentY += 25;
    }
    
    this.currentY += 25;
    
    // Título principal mais elegante
    this.doc.setTextColor(30, 30, 30);
    this.doc.setFontSize(26);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Relatório de Consumo Energético', this.margin.left, this.currentY);
    
    // Subtítulo descritivo
    this.currentY += 10;
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Análise detalhada do desempenho e eficiência da frota elétrica', this.margin.left, this.currentY);
    
    // Linha divisória mais elegante com gradiente visual
    this.currentY += 12;
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(1.5);
    this.doc.line(this.margin.left, this.currentY, this.pageWidth - this.margin.right, this.currentY);
    
    // Linha mais fina abaixo
    this.doc.setDrawColor(230, 230, 230);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin.left, this.currentY + 2, this.pageWidth - this.margin.right, this.currentY + 2);
    
    this.currentY += 18;
  }

  /**
   * Adiciona seção de resumo executivo - cards menores e sem border-top
   */
  private addSummarySection(summary: any): void {
    // Grid 2x2 com cards menores
    const cardWidth = (this.pageWidth - this.margin.left - this.margin.right - 15) / 2;
    const cardHeight = 35; // Reduzido de 45 para 35
    const cardSpacingX = 15;
    const cardSpacingY = 12; // Reduzido de 15 para 12
    
    const metrics = [
      {
        title: 'DISTÂNCIA TOTAL',
        value: formatInteger(summary.totalDistance),
        unit: 'quilômetros percorridos',
        badge: 'KM',
        badgeBg: [239, 246, 255], // light blue
        badgeColor: [29, 78, 216] // darker blue
      },
      {
        title: 'CONSUMO TOTAL',
        value: formatDecimal1(summary.totalConsumption),
        unit: 'quilowatt-hora consumidos',
        badge: 'kWh',
        badgeBg: [240, 253, 244], // light green
        badgeColor: [22, 163, 74] // darker green
      },
      {
        title: 'DISTÂNCIA MÉDIA',
        value: formatInteger(summary.avgDistance),
        unit: 'quilômetros por dia',
        badge: 'Avg',
        badgeBg: [250, 245, 255], // light purple
        badgeColor: [124, 58, 237] // darker purple
      },
      {
        title: 'CONSUMO MÉDIO',
        value: formatDecimal1(summary.avgConsumption),
        unit: 'quilowatt-hora por dia',
        badge: 'Avg',
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
      
      // Fundo principal do card (sem border-top colorido)
      this.doc.setFillColor(255, 255, 255);
      this.doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
      
      // Borda sutil
      this.doc.setDrawColor(229, 231, 235);
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'S');
      
      // Header do card - título e badge
      const headerY = y + 6; // Ajustado para card menor
      
      // Título da métrica
      this.doc.setTextColor(107, 114, 128); // muted-foreground
      this.doc.setFontSize(7); // Reduzido de 8 para 7
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.title, x + 5, headerY);
      
      // Badge à direita
      const badgeWidth = 18; // Reduzido de 20 para 18
      const badgeHeight = 5; // Reduzido de 6 para 5
      const badgeX = x + cardWidth - badgeWidth - 5;
      const badgeY = headerY - 3;
      
      this.doc.setFillColor(metric.badgeBg[0], metric.badgeBg[1], metric.badgeBg[2]);
      this.doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');
      
      this.doc.setTextColor(metric.badgeColor[0], metric.badgeColor[1], metric.badgeColor[2]);
      this.doc.setFontSize(5); // Reduzido de 6 para 5
      this.doc.setFont('helvetica', 'bold');
      // Centralizar verticalmente o texto no badge
      const textCenterY = badgeY + badgeHeight/2 + 1.5; // Ajuste fino para centralização
      this.doc.text(metric.badge, badgeX + badgeWidth/2, textCenterY, { align: 'center' });
      
      // Valor principal centralizado
      this.doc.setTextColor(17, 24, 39); // foreground
      this.doc.setFontSize(20); // Reduzido de 24 para 20
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.value, x + cardWidth/2, y + 20, { align: 'center' }); // Ajustado para card menor
      
      // Unidade/descrição
      this.doc.setTextColor(107, 114, 128); // muted-foreground
      this.doc.setFontSize(6); // Reduzido de 7 para 6
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(metric.unit, x + cardWidth/2, y + 28, { align: 'center' }); // Ajustado para card menor
    });
    
    this.currentY += (cardHeight + cardSpacingY) * 2 + 8; // Reduzido o espaçamento final
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
    const headerHeight = 16;
    
    // Cabeçalho da tabela com estilo do HTML e texto quebrado
    const headers = [
      { text: 'Data', lines: ['Data'] },
      { text: 'Odômetro (km)', lines: ['Odômetro', '(km)'] },
      { text: 'Consumo Acumulado (kWh)', lines: ['Consumo', 'Acumulado', '(kWh)'] },
      { text: 'Distância (km)', lines: ['Distância', '(km)'] },
      { text: 'Consumo (kWh)', lines: ['Consumo', '(kWh)'] },
      { text: 'Eficiência (kWh/km)', lines: ['Eficiência', '(kWh/km)'] }
    ];
    
    // Fundo do cabeçalho (cinza claro como no HTML)
    this.doc.setFillColor(248, 250, 252); // template-table th background
    this.doc.rect(this.margin.left, this.currentY, tableWidth, headerHeight, 'F');
    
    // Linha inferior do cabeçalho (mais escura)
    this.doc.setFillColor(28, 25, 23); // report-dark-blue
    this.doc.rect(this.margin.left, this.currentY + headerHeight - 1, tableWidth, 1, 'F');
    
    // Texto do cabeçalho com quebra de linha
    this.doc.setTextColor(28, 25, 23); // report-dark-blue
    this.doc.setFontSize(7); // Reduzido para acomodar texto quebrado
    this.doc.setFont('helvetica', 'bold');
    
    let currentX = this.margin.left;
    headers.forEach((header, index) => {
      const centerX = currentX + colWidths[index] / 2;
      
      // Calcular posição Y para centralizar o texto verticalmente com maior espaçamento
      const lineHeight = 3.5; // Aumentado de 2.5 para 3.5 para maior espaçamento
      const totalTextHeight = header.lines.length * lineHeight;
      const startY = this.currentY + (headerHeight - totalTextHeight) / 2 + lineHeight;
      
      // Renderizar cada linha do cabeçalho
      header.lines.forEach((line, lineIndex) => {
        const lineY = startY + (lineIndex * lineHeight);
        this.doc.text(line, centerX, lineY, { align: 'center' });
      });
      
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