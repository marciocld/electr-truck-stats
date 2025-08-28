import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

export class PDFService {
  private doc: jsPDF;
  private options: PDFOptions;
  private currentY: number = 0;
  private pageWidth: number = 0;
  private pageHeight: number = 0;
  private margin: { top: number; right: number; bottom: number; left: number };

  constructor(options: PDFOptions = {}) {
    this.options = {
      filename: 'relatorio-consumo.pdf',
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      margin: { top: 0, right: 0, bottom: 0, left: 0 }, // Sem margens - template controla
      quality: 1,
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

  // Método para adicionar cabeçalho
  private addHeader(period: string): void {
    // Logo da empresa (placeholder)
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LOGO DA EMPRESA', this.margin.left, this.currentY);
    
    // Título do relatório
    this.doc.setFontSize(24);
    this.doc.text('Relatório de Consumo', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    // Período
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Período: ${period}`, this.pageWidth - this.margin.right, this.currentY, { align: 'right' });
    
    this.currentY += 25;
    
    // Linha separadora
    this.doc.setDrawColor(0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin.left, this.currentY, this.pageWidth - this.margin.right, this.currentY);
    this.currentY += 15;
  }

  // Método para adicionar seção de resumo
  private addSummarySection(data: ReportData['summary']): void {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Resumo do período', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 15;

    // Grid de cards de resumo
    const cardWidth = (this.pageWidth - this.margin.left - this.margin.right - 20) / 2;
    const cardHeight = 40;
    const startX = this.margin.left;

    // Primeira linha - Distâncias
    this.addSummaryCard('Distância total', `${data.totalDistance.toFixed(0)} km`, startX, this.currentY, cardWidth, cardHeight);
    this.addSummaryCard('Distância média', `${data.avgDistance.toFixed(0)} km`, startX + cardWidth + 10, this.currentY, cardWidth, cardHeight);
    this.currentY += cardHeight + 10;

    // Segunda linha - Consumos (3 cards)
    const smallCardWidth = (this.pageWidth - this.margin.left - this.margin.right - 20) / 3;
    this.addSummaryCard('Consumo total', `${data.totalConsumption.toFixed(2)} kWh`, startX, this.currentY, smallCardWidth, cardHeight);
    this.addSummaryCard('Consumo médio', `${data.avgConsumption.toFixed(2)} kWh`, startX + smallCardWidth + 5, this.currentY, smallCardWidth, cardHeight);
    this.addSummaryCard('Consumo médio por km', `${data.avgConsumptionPerKm.toFixed(3)} kWh/km`, startX + (smallCardWidth + 5) * 2, this.currentY, smallCardWidth, cardHeight);
    
    this.currentY += cardHeight + 20;
  }

  // Método para adicionar card de resumo
  private addSummaryCard(title: string, value: string, x: number, y: number, width: number, height: number): void {
    // Borda do card
    this.doc.setDrawColor(200);
    this.doc.setFillColor(255, 255, 255);
    this.doc.roundedRect(x, y, width, height, 3, 3, 'FD');
    
    // Título
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100);
    this.doc.text(title, x + width / 2, y + 8, { align: 'center' });
    
    // Valor
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0);
    this.doc.text(value, x + width / 2, y + 25, { align: 'center' });
  }

  // Método para adicionar tabela de dados detalhados
  private addDetailedDataTable(data: ReportData['detailedData']): void {
    // Nova página para dados detalhados
    this.doc.addPage();
    this.currentY = this.margin.top;

    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Dados detalhados', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 15;

    // Cabeçalho da tabela
    const headers = ['Data', 'Distancia acumulada', 'Cons. acum.', 'Distância', 'Consumo', 'Cons/km'];
    const columnWidths = [25, 25, 25, 25, 25, 25];
    const startX = this.margin.left;

    // Cabeçalho
    this.doc.setFillColor(240, 240, 240);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    let currentX = startX;
    headers.forEach((header, index) => {
      this.doc.rect(currentX, this.currentY, columnWidths[index], 10, 'F');
      this.doc.text(header, currentX + columnWidths[index] / 2, this.currentY + 7, { align: 'center' });
      currentX += columnWidths[index];
    });
    
    this.currentY += 10;

    // Dados da tabela
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    data.forEach((row, index) => {
      // Verificar se precisa de nova página
      if (this.currentY > this.pageHeight - this.margin.bottom - 15) {
        this.doc.addPage();
        this.currentY = this.margin.top;
      }

      currentX = startX;
      const rowData = [
        this.formatDateBR(row.date),
        row.accumulatedDistance.toFixed(0),
        row.accumulatedConsumption.toFixed(2),
        row.distance.toFixed(0),
        row.consumption.toFixed(2),
        row.consumptionPerKm.toFixed(3)
      ];

      rowData.forEach((cell, cellIndex) => {
        this.doc.text(cell, currentX + columnWidths[cellIndex] / 2, this.currentY + 5, { align: 'center' });
        currentX += columnWidths[cellIndex];
      });

      this.currentY += 8;
    });
  }

  // Método para formatar data no padrão brasileiro
  private formatDateBR(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  // Método principal para gerar PDF
  public async generatePDF(data: ReportData, options?: PDFOptions): Promise<void> {
    try {
      // Aplicar opções personalizadas se fornecidas
      if (options) {
        this.options = { ...this.options, ...options };
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

      // Adicionar cabeçalho
      this.addHeader(data.period);
      
      // Adicionar seção de resumo
      this.addSummarySection(data.summary);
      
      // Adicionar dados detalhados
      this.addDetailedDataTable(data.detailedData);
      
      // Adicionar rodapé com numeração
      this.addFooter();
      
      // Salvar PDF
      this.doc.save(this.options.filename);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }

  // Método alternativo para converter HTML para PDF
  public async generatePDFFromHTML(element: HTMLElement, options: PDFOptions = {}): Promise<void> {
    try {
      console.log('Iniciando geração de PDF do HTML...');
      console.log('Elemento:', element);

      // Aplicar opções personalizadas se fornecidas
      if (options) {
        this.options = { ...this.options, ...options };
        this.doc = new jsPDF({
          orientation: this.options.orientation,
          unit: this.options.unit,
          format: this.options.format
        });
      }

      // Aguardar mais tempo para garantir que o DOM esteja completamente renderizado
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capturar cada página individualmente
      const pages = element.querySelectorAll('[data-page]');
      console.log('Páginas encontradas:', pages.length);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        console.log(`Processando página ${i + 1}:`, page);

        // Configurar a página para captura - SEM forçar altura
        const originalStyle = page.style.cssText;
        page.style.display = 'block';
        page.style.visibility = 'visible';
        page.style.opacity = '1';
        page.style.position = 'relative';
        page.style.width = '100%';
        // Remover height forçado para permitir altura natural
        page.style.overflow = 'visible';

        // Obter dimensões reais da página - SEM forçar altura mínima
        const pageRect = page.getBoundingClientRect();
        const pageWidth = pageRect.width || 794;
        const pageHeight = pageRect.height || 1123;
        
        console.log(`Dimensões da página ${i + 1}: ${pageWidth}x${pageHeight}`);

        // Capturar a página com dimensões naturais
        const canvas = await html2canvas(page, {
          scale: this.options.scale || 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          // Remover width e height forçados para permitir dimensões naturais
          scrollX: 0,
          scrollY: 0,
          // Remover windowWidth e windowHeight forçados
          foreignObjectRendering: false,
          removeContainer: false,
          imageTimeout: 30000,
          ignoreElements: (element) => {
            return false;
          },

                      // Configurações para melhor renderização de sombras e bordas
            onclone: (clonedDoc) => {
              const clonedPage = clonedDoc.body.firstElementChild as HTMLElement;
              if (clonedPage) {
                // Forçar reflow do DOM
                clonedPage.offsetHeight;
                
                // Aguardar um pouco para garantir que os estilos sejam aplicados
                setTimeout(() => {
                  // Forçar recálculo de layout
                  clonedPage.style.display = 'none';
                  clonedPage.offsetHeight;
                  clonedPage.style.display = 'block';
                }, 10);
              // Configurações básicas da página - SEM forçar altura
              clonedPage.style.transform = 'none';
              clonedPage.style.position = 'relative';
              clonedPage.style.width = '100%';
              // Remover height forçado para permitir altura natural
              clonedPage.style.display = 'block';
              clonedPage.style.visibility = 'visible';
              clonedPage.style.opacity = '1';
              clonedPage.style.overflow = 'visible';
              clonedPage.style.backgroundColor = '#ffffff';
              
                             // Adicionar classe especial para html2canvas
               clonedPage.classList.add('html2canvas-render');
               
               // Função para corrigir alinhamento de texto - SEM forçar altura
               const fixTextAlignment = (element: HTMLElement) => {
                 element.style.setProperty('line-height', 'normal', 'important');
                 element.style.setProperty('vertical-align', 'baseline', 'important');
                 // Remover height e min-height forçados para permitir altura natural
                 element.style.setProperty('margin', '0', 'important');
                 element.style.setProperty('padding-top', '0', 'important');
                 element.style.setProperty('padding-bottom', '0', 'important');
               };
              
                             // Garantir que todos os elementos tenham estilos inline preservados
               const allElements = clonedPage.querySelectorAll('*');
               allElements.forEach((element) => {
                 if (element instanceof HTMLElement) {
                   // Preservar estilos inline existentes
                   const computedStyle = window.getComputedStyle(element);
                   const importantStyles = [
                     'color', 'background-color', 'background', 'border', 'border-radius',
                     'padding', 'margin', 'font-size', 'font-weight', 'text-align',
                     'display', 'position', 'width', 'height', 'box-shadow'
                   ];
                   
                   importantStyles.forEach(style => {
                     const value = computedStyle.getPropertyValue(style);
                     if (value && value !== 'initial' && value !== 'normal') {
                       element.style.setProperty(style, value, 'important');
                     }
                   });
                   
                   // Aplicar correção de alinhamento
                   fixTextAlignment(element);
                 }
               });
              
              // Preservar especificamente os cards de métricas com sombras e bordas
              const metricCardsInitial = clonedPage.querySelectorAll('.template-metric-card');
              metricCardsInitial.forEach((card) => {
                if (card instanceof HTMLElement) {
                  // Usar CSS classes ao invés de inline styles para melhor estabilidade
                  card.classList.add('html2canvas-render');
                  
                                     // Apenas os estilos essenciais inline - SEM altura fixa para permitir alinhamento natural
                   card.style.setProperty('background-color', '#ffffff', 'important');
                   card.style.setProperty('border', '1px solid #e5e7eb', 'important');
                   card.style.setProperty('border-radius', '8px', 'important');
                   card.style.setProperty('box-shadow', '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 'important');
                   card.style.setProperty('display', 'flex', 'important');
                   card.style.setProperty('flex-direction', 'column', 'important');
                   // Remover height e min-height forçados para permitir altura natural
                   card.style.setProperty('justify-content', 'flex-start', 'important');
                   card.style.setProperty('padding', '24px 20px', 'important');
                   card.style.setProperty('box-sizing', 'border-box', 'important');
                   card.style.setProperty('gap', '16px', 'important');
                }
              });
              
                             // Preservar tabela usando classes CSS
               const table = clonedPage.querySelector('.template-table');
               if (table instanceof HTMLElement) {
                                   table.style.cssText = `
                    width: 100% !important;
                    border-collapse: collapse !important;
                    font-size: 13px !important;
                    line-height: normal !important;
                    vertical-align: baseline !important;
                    box-sizing: border-box !important;
                    margin: 0 !important;
                    display: table !important;
                    position: relative !important;
                  `;
               }
              
                             // Preservar cabeçalho da tabela
               const tableHeaders = clonedPage.querySelectorAll('.template-table th');
               tableHeaders.forEach((th) => {
                 if (th instanceof HTMLElement) {
                                       th.style.cssText = `
                      background-color: #f9fafb !important;
                      border-bottom: 2px solid #111827 !important;
                      padding: 16px 12px !important;
                      text-align: center !important;
                      font-size: 11px !important;
                      font-weight: 700 !important;
                      color: #111827 !important;
                      text-transform: uppercase !important;
                      letter-spacing: 1px !important;
                      line-height: normal !important;
                      vertical-align: middle !important;
                      box-sizing: border-box !important;
                      margin: 0 !important;
                      display: table-cell !important;
                      position: relative !important;
                    `;
                 }
               });
              
                             // Preservar linhas da tabela
               const tableRows = clonedPage.querySelectorAll('.template-table tr');
               tableRows.forEach((tr) => {
                 if (tr instanceof HTMLElement) {
                                       tr.style.cssText = `
                      line-height: normal !important;
                      vertical-align: baseline !important;
                      box-sizing: border-box !important;
                      margin: 0 !important;
                      display: table-row !important;
                      position: relative !important;
                    `;
                 }
               });
               
               // Preservar células da tabela
               const tableCells = clonedPage.querySelectorAll('.template-table td');
               tableCells.forEach((td) => {
                 if (td instanceof HTMLElement) {
                   const row = td.parentElement;
                   const rowIndex = Array.from(row?.parentElement?.children || []).indexOf(row!);
                   const cellIndex = Array.from(row?.children || []).indexOf(td);
                   
                                       td.style.cssText = `
                      padding: 14px 12px !important;
                      text-align: center !important;
                      font-size: 13px !important;
                      border-bottom: ${rowIndex === (row?.parentElement?.children.length || 0) - 1 ? 'none' : '1px solid #e5e7eb'} !important;
                      background-color: ${rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb'} !important;
                      line-height: normal !important;
                      vertical-align: middle !important;
                      box-sizing: border-box !important;
                      margin: 0 !important;
                      display: table-cell !important;
                      position: relative !important;
                    `;
                   
                   // Aplicar cores específicas baseadas na posição
                   if (cellIndex === 0) {
                     td.style.color = '#111827 !important';
                     td.style.fontWeight = '600 !important';
                   } else if (cellIndex === 1 || cellIndex === 2) {
                     td.style.color = '#6b7280 !important';
                     td.style.fontWeight = '500 !important';
                   } else if (cellIndex === 3 || cellIndex === 4) {
                     td.style.color = '#111827 !important';
                     td.style.fontWeight = '600 !important';
                   } else if (cellIndex === 5) {
                     td.style.color = '#111827 !important';
                     td.style.fontWeight = '700 !important';
                   }
                 }
               });
              
              // Preservar logo
              const logo = clonedPage.querySelector('.template-logo');
              if (logo instanceof HTMLImageElement) {
                logo.style.height = '36px';
                logo.style.width = 'auto';
                logo.style.display = 'block';
              }
              
              // Preservar títulos principais
              const mainTitles = clonedPage.querySelectorAll('.template-main-title h1');
              mainTitles.forEach((title) => {
                if (title instanceof HTMLElement) {
                  title.style.fontSize = '28px';
                  title.style.fontWeight = '700';
                  title.style.color = '#111827';
                  title.style.letterSpacing = '-0.5px';
                  title.style.margin = '0';
                  title.style.lineHeight = '1.1';
                  title.style.textAlign = 'center';
                }
              });
              
              // Configurar elementos específicos dos cards para melhor alinhamento
              const metricCards = clonedPage.querySelectorAll('.template-metric-card');
              metricCards.forEach((card) => {
                if (card instanceof HTMLElement) {
                                     // Resetar completamente o layout do card - SEM altura fixa
                                       card.style.cssText = `
                      background-color: #ffffff !important;
                      border: 1px solid #e5e7eb !important;
                      border-radius: 8px !important;
                      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
                      display: flex !important;
                      flex-direction: column !important;
                      padding: 24px 20px !important;
                      box-sizing: border-box !important;
                      gap: 16px !important;
                      justify-content: flex-start !important;
                      position: relative !important;
                      overflow: visible !important;
                      align-items: stretch !important;
                    `;
                  
                    // Configurar header
                   const header = card.querySelector('.template-metric-header');
                   if (header instanceof HTMLElement) {
                                                                                       header.style.cssText = `
                         display: flex !important;
                         justify-content: space-between !important;
                         align-items: center !important;
                         margin: 0 !important;
                         padding: 0 !important;
                         line-height: normal !important;
                         box-sizing: border-box !important;
                         width: 100% !important;
                         flex-shrink: 0 !important;
                         flex: none !important;
                       `;
                   }
                  
                  // Configurar título
                  const title = card.querySelector('.template-metric-title');
                  if (title instanceof HTMLElement) {
                                                                                   title.style.cssText = `
                        font-size: 12px !important;
                        color: #6b7280 !important;
                        font-weight: 600 !important;
                        text-transform: uppercase !important;
                        letter-spacing: 0.5px !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        flex: 1 !important;
                        display: flex !important;
                        align-items: center !important;
                        gap: 6px !important;
                        line-height: normal !important;
                        box-sizing: border-box !important;
                        width: auto !important;
                      `;
                  }
                  
                  // Configurar badge
                  const badge = card.querySelector('.template-metric-badge');
                  if (badge instanceof HTMLElement) {
                                                                                   badge.style.cssText = `
                        background-color: #f3f4f6 !important;
                        color: #374151 !important;
                        padding: 10px 14px !important;
                        border-radius: 12px !important;
                        font-size: 10px !important;
                        font-weight: 600 !important;
                        text-transform: uppercase !important;
                        letter-spacing: 0.5px !important;
                        margin: 0 0 0 8px !important;
                        white-space: nowrap !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 6px !important;
                        line-height: normal !important;
                        box-sizing: border-box !important;
                        flex-shrink: 0 !important;
                        width: auto !important;
                      `;
                  }
                  
                  // Configurar valor principal
                  const value = card.querySelector('.template-metric-value');
                  if (value instanceof HTMLElement) {
                                                                                   value.style.cssText = `
                        font-size: 32px !important;
                        font-weight: 700 !important;
                        color: #111827 !important;
                        line-height: 1 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        font-family: system-ui, -apple-system, sans-serif !important;
                        flex: none !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        box-sizing: border-box !important;
                        width: 100% !important;
                        flex-shrink: 0 !important;
                      `;
                  }
                  
                  // Configurar unidade
                  const unit = card.querySelector('.template-metric-unit');
                  if (unit instanceof HTMLElement) {
                                                                                   unit.style.cssText = `
                        font-size: 12px !important;
                        color: #6b7280 !important;
                        font-weight: 500 !important;
                        text-transform: lowercase !important;
                        text-align: center !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        line-height: 1.2 !important;
                        box-sizing: border-box !important;
                        width: 100% !important;
                        flex: none !important;
                        flex-shrink: 0 !important;
                      `;
                  }
                  
                                     // Configurar ícones
                   const icons = card.querySelectorAll('.template-metric-icon, .template-badge-icon');
                   icons.forEach((icon) => {
                     if (icon instanceof HTMLElement) {
                       icon.style.cssText = `
                         width: 14px !important;
                         height: 14px !important;
                         flex-shrink: 0 !important;
                         display: inline-block !important;
                         vertical-align: middle !important;
                         align-self: center !important;
                         line-height: normal !important;
                         margin: 0 !important;
                         padding: 0 !important;
                         color: #6b7280 !important;
                       `;
                     }
                   });
                }
              });
            }
          }
        });

        console.log(`Canvas da página ${i + 1} gerado:`, canvas);
        console.log(`Dimensões da página ${i + 1}:`, canvas.width, 'x', canvas.height);

        if (canvas.width === 0 || canvas.height === 0) {
          console.warn(`Página ${i + 1} tem dimensões zero, pulando...`);
          continue;
        }

        const imgData = canvas.toDataURL('image/png', 1.0);
        console.log(`Imagem da página ${i + 1} gerada, tamanho:`, imgData.length);

        if (imgData.length < 100) {
          console.warn(`Imagem da página ${i + 1} muito pequena, pulando...`);
          continue;
        }

        // Adicionar nova página se não for a primeira
        if (i > 0) {
          this.doc.addPage();
        }

        // Calcular dimensões proporcionais para o PDF - SEM forçar altura
        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm
        
        // Calcular proporção da imagem
        const imgRatio = canvas.width / canvas.height;
        const pdfRatio = pdfWidth / pdfHeight;
        
        let finalWidth, finalHeight;
        
        // Permitir que a imagem mantenha suas proporções naturais
        if (imgRatio > pdfRatio) {
          // Imagem é mais larga - ajustar pela largura
          finalWidth = pdfWidth;
          finalHeight = pdfWidth / imgRatio;
        } else {
          // Imagem é mais alta - ajustar pela altura
          finalHeight = pdfHeight;
          finalWidth = pdfHeight * imgRatio;
        }
        
        // Centralizar a imagem na página
        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;

        console.log(`Adicionando imagem ${i + 1}: ${finalWidth}x${finalHeight}mm na posição (${x}, ${y})`);
        
        // Adicionar imagem com dimensões proporcionais
        this.doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

        // Restaurar estilo original
        page.style.cssText = originalStyle;
      }

      console.log('PDF gerado com sucesso!');
      this.doc.save(this.options.filename);
    } catch (error) {
      console.error('Erro ao gerar PDF do HTML:', error);
      throw error;
    }
  }

  // Método para adicionar rodapé com numeração de páginas
  private addFooter(): void {
    const pageCount = (this.doc as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100);
      this.doc.text(
        `Página ${i} de ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }

  // Método para adicionar logo da empresa
  public async addCompanyLogo(logoUrl: string, x: number, y: number, width: number, height: number): Promise<void> {
    try {
      // Carregar imagem da logo
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const imgData = canvas.toDataURL('image/png');
          this.doc.addImage(imgData, 'PNG', x, y, width, height);
          resolve();
        };
        
        img.onerror = reject;
        img.src = logoUrl;
      });
    } catch (error) {
      console.error('Erro ao adicionar logo:', error);
      // Fallback para texto
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('LOGO DA EMPRESA', x, y + height / 2);
    }
  }
}

// Instância padrão do serviço
export const pdfService = new PDFService();
