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

      // Aguardar um pouco para garantir que o DOM esteja renderizado
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capturar cada página individualmente
      const pages = element.querySelectorAll('[data-page]');
      console.log('Páginas encontradas:', pages.length);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        console.log(`Processando página ${i + 1}:`, page);

        // Configurar a página para captura
        const originalStyle = page.style.cssText;
        page.style.display = 'block';
        page.style.visibility = 'visible';
        page.style.opacity = '1';
        page.style.position = 'relative';
        page.style.width = '100%';
        page.style.height = 'auto';
        page.style.overflow = 'visible';

        // Capturar a página
        const canvas = await html2canvas(page, {
          scale: this.options.scale || 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null, // Permitir que o template controle o background
          logging: true,
          width: 794, // 210mm em pixels (210 * 3.7795275591)
          height: 1123, // 297mm em pixels (297 * 3.7795275591)
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
          windowHeight: 1123,
          foreignObjectRendering: false,
          removeContainer: false,
          imageTimeout: 30000,
          ignoreElements: (element) => {
            // Não ignorar elementos com sombras
            return false;
          },
          onclone: (clonedDoc) => {
            console.log(`Elemento clonado da página ${i + 1}:`, clonedDoc);
            const clonedPage = clonedDoc.body.firstElementChild as HTMLElement;
            if (clonedPage) {
              clonedPage.style.transform = 'none';
              clonedPage.style.position = 'relative';
              clonedPage.style.width = '100%';
              clonedPage.style.height = 'auto';
              clonedPage.style.display = 'block';
              clonedPage.style.visibility = 'visible';
              clonedPage.style.opacity = '1';
              clonedPage.style.overflow = 'visible';
              
              // Garantir que todos os estilos dos cards simplificados sejam preservados
              const cards = clonedPage.querySelectorAll('.bg-white.border.border-border.rounded-lg');
              cards.forEach((card) => {
                if (card instanceof HTMLElement) {
                  // Forçar estilos dos cards com degradê
                  card.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
                  card.style.border = '1px solid #e2e8f0';
                  card.style.borderRadius = '12px';
                  card.style.padding = '32px';
                  card.style.textAlign = 'center';
                  card.style.display = 'block';
                  card.style.visibility = 'visible';
                  card.style.opacity = '1';
                  card.style.position = 'relative';
                  card.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  
                  // Garantir que os títulos dos cards sejam visíveis
                  const titles = card.querySelectorAll('h3');
                  titles.forEach((title) => {
                    if (title instanceof HTMLElement) {
                      title.style.color = '#6b7280';
                      title.style.fontSize = '14px';
                      title.style.marginBottom = '12px';
                      title.style.fontWeight = '500';
                      title.style.textTransform = 'uppercase';
                      title.style.letterSpacing = '0.5px';
                      title.style.margin = '0 0 12px 0';
                    }
                  });
                  
                  // Valores principais dos cards
                  const values = card.querySelectorAll('p');
                  values.forEach((value, index) => {
                    if (value instanceof HTMLElement) {
                      if (index === 0) {
                        // Valor principal - cor verde
                        value.style.color = '#22c55e';
                        value.style.fontSize = '36px';
                        value.style.fontWeight = '700';
                        value.style.margin = '0 0 8px 0';
                        value.style.lineHeight = '1';
                      } else {
                        // Unidade
                        value.style.color = '#6b7280';
                        value.style.fontSize = '16px';
                        value.style.margin = '0';
                        value.style.fontWeight = '500';
                      }
                    }
                  });
                }
              });

              // Preservar seções com background cinza
              const insightSections = clonedPage.querySelectorAll('div[style*="background-color: rgb(248, 250, 252)"]');
              insightSections.forEach((section) => {
                if (section instanceof HTMLElement) {
                  section.style.backgroundColor = '#f8fafc';
                  section.style.border = '2px solid #e2e8f0';
                  section.style.borderRadius = '12px';
                  section.style.padding = '24px';
                }
              });
             
              // Garantir que o header seja preservado
              const header = clonedPage.querySelector('.flex.justify-between.items-start');
              if (header instanceof HTMLElement) {
                header.style.borderBottom = '2px solid #3b82f6';
                header.style.paddingBottom = '24px';
                header.style.marginBottom = '48px';
              }
              
              // Garantir que a tabela redesenhada seja preservada
              const table = clonedPage.querySelector('table');
              if (table instanceof HTMLElement) {
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';
              }
              
              // Preservar cabeçalho da tabela aprimorado
              const tableHeaders = clonedPage.querySelectorAll('th');
              tableHeaders.forEach((th) => {
                if (th instanceof HTMLElement) {
                  th.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
                  th.style.padding = '14px 12px';
                  th.style.textAlign = 'center';
                  th.style.fontSize = '12px';
                  th.style.fontWeight = '700';
                  th.style.color = '#1e293b';
                  th.style.borderBottom = '2px solid #cbd5e1';
                  th.style.textTransform = 'uppercase';
                  th.style.letterSpacing = '0.5px';
                }
              });
              
              // Preservar células da tabela simplificadas
              const tableCells = clonedPage.querySelectorAll('td');
              tableCells.forEach((td, index) => {
                if (td instanceof HTMLElement) {
                  const row = td.parentElement;
                  const rowIndex = Array.from(row?.parentElement?.children || []).indexOf(row!);
                  
                  td.style.padding = '10px 8px';
                  td.style.textAlign = 'center';
                  td.style.fontSize = '14px';
                  td.style.borderBottom = '1px solid #e2e8f0';
                  
                  // Aplicar cores baseadas na posição da coluna
                  const cellIndex = Array.from(row?.children || []).indexOf(td);
                  
                  if (cellIndex === 0) {
                    // Data - destaque
                    td.style.color = '#111827';
                    td.style.fontWeight = '600';
                  } else if (cellIndex === 1 || cellIndex === 2) {
                    // Dados acumulados - cor neutra
                    td.style.color = '#4b5563';
                    td.style.fontWeight = '500';
                  } else if (cellIndex === 3 || cellIndex === 4) {
                    // Dados do dia - destaque
                    td.style.color = '#111827';
                    td.style.fontWeight = '600';
                  } else if (cellIndex === 5) {
                    // Eficiência - azul
                    td.style.color = '#3b82f6';
                    td.style.fontWeight = '600';
                  }
                }
              });

              // Preservar gradientes e elementos decorativos
              const gradientElements = clonedPage.querySelectorAll('[style*="linear-gradient"]');
              gradientElements.forEach((element) => {
                if (element instanceof HTMLElement) {
                  // Manter os gradientes já aplicados
                  const currentStyle = element.getAttribute('style') || '';
                  if (currentStyle.includes('linear-gradient')) {
                    element.style.cssText = currentStyle;
                  }
                }
              });

              // Remover sombras de containers de tabela
              const tableContainers = clonedPage.querySelectorAll('.border.border-border.rounded-xl.overflow-hidden');
              tableContainers.forEach((container) => {
                if (container instanceof HTMLElement) {
                  container.style.boxShadow = 'none';
                  container.style.borderRadius = '8px';
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

        // Usar dimensões exatas do A4 - cobrir toda a página
        const imgWidth = 210; // A4 width in mm
        const imgHeight = 297; // A4 height in mm

        // Adicionar imagem cobrindo toda a página - template controla margens
        this.doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

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
