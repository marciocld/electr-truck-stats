import { PDFContext, ReportData } from './pdfService';
import { formatDistance, formatConsumption, formatConsumptionPerKm } from './formatters';

/**
 * Renderiza a seção de resumo do relatório
 * @param context - Contexto do PDF
 * @param data - Dados do resumo
 */
export function addSummarySection(context: PDFContext, data: ReportData['summary']): void {
  const { doc, pageWidth, margin } = context;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo do período', pageWidth / 2, context.currentY, { align: 'center' });
  context.currentY += 15;

  // Grid de cards de resumo
  const cardWidth = (pageWidth - margin.left - margin.right - 20) / 2;
  const cardHeight = 40;
  const startX = margin.left;

  // Primeira linha - Distâncias
  addSummaryCard(
    context,
    'Distância total',
    formatDistance(data.totalDistance),
    startX,
    context.currentY,
    cardWidth,
    cardHeight
  );
  
  addSummaryCard(
    context,
    'Distância média',
    formatDistance(data.avgDistance),
    startX + cardWidth + 10,
    context.currentY,
    cardWidth,
    cardHeight
  );
  
  context.currentY += cardHeight + 10;

  // Segunda linha - Consumos (3 cards)
  const smallCardWidth = (pageWidth - margin.left - margin.right - 20) / 3;
  
  addSummaryCard(
    context,
    'Consumo total',
    formatConsumption(data.totalConsumption),
    startX,
    context.currentY,
    smallCardWidth,
    cardHeight
  );
  
  addSummaryCard(
    context,
    'Consumo médio',
    formatConsumption(data.avgConsumption),
    startX + smallCardWidth + 5,
    context.currentY,
    smallCardWidth,
    cardHeight
  );
  
  addSummaryCard(
    context,
    'Consumo médio por km',
    formatConsumptionPerKm(data.avgConsumptionPerKm),
    startX + (smallCardWidth + 5) * 2,
    context.currentY,
    smallCardWidth,
    cardHeight
  );
  
  context.currentY += cardHeight + 20;
}

/**
 * Adiciona um card de resumo ao PDF
 * @param context - Contexto do PDF
 * @param title - Título do card
 * @param value - Valor a ser exibido
 * @param x - Posição X
 * @param y - Posição Y
 * @param width - Largura do card
 * @param height - Altura do card
 */
export function addSummaryCard(
  context: PDFContext,
  title: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const { doc } = context;
  
  // Borda do card
  doc.setDrawColor(200);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, width, height, 3, 3, 'FD');
  
  // Título
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(title, x + width / 2, y + 8, { align: 'center' });
  
  // Valor
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(value, x + width / 2, y + 25, { align: 'center' });
}