import { PDFContext, ReportData } from './pdfService';
import { formatDateBR, formatNumber } from './formatters';

/**
 * Renderiza a tabela de dados detalhados
 * @param context - Contexto do PDF
 * @param data - Dados detalhados para a tabela
 */
export function addDetailedDataTable(context: PDFContext, data: ReportData['detailedData']): void {
  const { doc, pageWidth, pageHeight, margin } = context;
  
  // Nova página para dados detalhados
  doc.addPage();
  context.currentY = margin.top;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados detalhados', pageWidth / 2, context.currentY, { align: 'center' });
  context.currentY += 15;

  // Configuração da tabela
  const headers = ['Data', 'Distancia acumulada', 'Cons. acum.', 'Distância', 'Consumo', 'Cons/km'];
  const columnWidths = [25, 25, 25, 25, 25, 25];
  const startX = margin.left;

  // Renderizar cabeçalho da tabela
  renderTableHeader(context, headers, columnWidths, startX);
  
  // Renderizar dados da tabela
  renderTableData(context, data, columnWidths, startX);
}

/**
 * Renderiza o cabeçalho da tabela
 * @param context - Contexto do PDF
 * @param headers - Cabeçalhos das colunas
 * @param columnWidths - Larguras das colunas
 * @param startX - Posição X inicial
 */
function renderTableHeader(
  context: PDFContext,
  headers: string[],
  columnWidths: number[],
  startX: number
): void {
  const { doc } = context;
  
  // Configurar estilo do cabeçalho
  doc.setFillColor(240, 240, 240);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  let currentX = startX;
  headers.forEach((header, index) => {
    doc.rect(currentX, context.currentY, columnWidths[index], 10, 'F');
    doc.text(header, currentX + columnWidths[index] / 2, context.currentY + 7, { align: 'center' });
    currentX += columnWidths[index];
  });
  
  context.currentY += 10;
}

/**
 * Renderiza os dados da tabela
 * @param context - Contexto do PDF
 * @param data - Dados a serem renderizados
 * @param columnWidths - Larguras das colunas
 * @param startX - Posição X inicial
 */
function renderTableData(
  context: PDFContext,
  data: ReportData['detailedData'],
  columnWidths: number[],
  startX: number
): void {
  const { doc, pageHeight, margin } = context;
  
  // Configurar estilo dos dados
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  data.forEach((row, index) => {
    // Verificar se precisa de nova página
    if (context.currentY > pageHeight - margin.bottom - 15) {
      doc.addPage();
      context.currentY = margin.top;
    }

    let currentX = startX;
    const rowData = [
      formatDateBR(row.date),
      formatNumber(row.accumulatedDistance, 0),
      formatNumber(row.accumulatedConsumption, 2),
      formatNumber(row.distance, 0),
      formatNumber(row.consumption, 2),
      formatNumber(row.consumptionPerKm, 3)
    ];

    rowData.forEach((cell, cellIndex) => {
      doc.text(cell, currentX + columnWidths[cellIndex] / 2, context.currentY + 5, { align: 'center' });
      currentX += columnWidths[cellIndex];
    });

    context.currentY += 8;
  });
}

/**
 * Renderiza uma tabela customizada com configurações específicas
 * @param context - Contexto do PDF
 * @param headers - Cabeçalhos das colunas
 * @param data - Dados da tabela (array de arrays)
 * @param columnWidths - Larguras das colunas
 * @param options - Opções de renderização
 */
export function renderCustomTable(
  context: PDFContext,
  headers: string[],
  data: string[][],
  columnWidths: number[],
  options: {
    startX?: number;
    headerHeight?: number;
    rowHeight?: number;
    fontSize?: number;
    headerFontSize?: number;
  } = {}
): void {
  const {
    startX = context.margin.left,
    headerHeight = 10,
    rowHeight = 8,
    fontSize = 9,
    headerFontSize = 10
  } = options;
  
  const { doc, pageHeight, margin } = context;
  
  // Renderizar cabeçalho
  doc.setFillColor(240, 240, 240);
  doc.setFontSize(headerFontSize);
  doc.setFont('helvetica', 'bold');
  
  let currentX = startX;
  headers.forEach((header, index) => {
    doc.rect(currentX, context.currentY, columnWidths[index], headerHeight, 'F');
    doc.text(header, currentX + columnWidths[index] / 2, context.currentY + headerHeight / 2 + 2, { align: 'center' });
    currentX += columnWidths[index];
  });
  
  context.currentY += headerHeight;
  
  // Renderizar dados
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  
  data.forEach((row) => {
    // Verificar se precisa de nova página
    if (context.currentY > pageHeight - margin.bottom - 15) {
      doc.addPage();
      context.currentY = margin.top;
    }

    currentX = startX;
    row.forEach((cell, cellIndex) => {
      doc.text(cell, currentX + columnWidths[cellIndex] / 2, context.currentY + rowHeight / 2 + 1, { align: 'center' });
      currentX += columnWidths[cellIndex];
    });

    context.currentY += rowHeight;
  });
}