import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PDFOptions } from './pdfService';

/**
 * Classe responsável pela conversão de elementos HTML para PDF
 * Utiliza html2canvas para capturar elementos e jsPDF para gerar o PDF
 */
export class HTMLToPDFConverter {
  private doc: jsPDF;
  private options: PDFOptions;

  constructor(options: PDFOptions = {}) {
    this.options = {
      filename: 'document.pdf',
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
  }

  /**
   * Gera PDF a partir de um elemento HTML
   * @param element - Elemento HTML a ser convertido
   * @param options - Opções adicionais para o PDF
   */
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

        await this.processPage(page, i);
      }

      console.log('PDF gerado com sucesso!');
      this.doc.save(this.options.filename);
    } catch (error) {
      console.error('Erro ao gerar PDF do HTML:', error);
      throw error;
    }
  }

  /**
   * Processa uma página individual
   * @param page - Elemento da página
   * @param pageIndex - Índice da página
   */
  private async processPage(page: HTMLElement, pageIndex: number): Promise<void> {
    // Configurar a página para captura
    const originalStyle = page.style.cssText;
    this.setupPageForCapture(page);

    // Obter dimensões reais da página
    const pageRect = page.getBoundingClientRect();
    const pageWidth = pageRect.width || 794;
    const pageHeight = pageRect.height || 1123;
    
    console.log(`Dimensões da página ${pageIndex + 1}: ${pageWidth}x${pageHeight}`);

    // Capturar a página com html2canvas
    const canvas = await this.capturePageAsCanvas(page);
    console.log(`Canvas da página ${pageIndex + 1} gerado:`, canvas);
    console.log(`Dimensões da página ${pageIndex + 1}:`, canvas.width, 'x', canvas.height);

    if (canvas.width === 0 || canvas.height === 0) {
      console.warn(`Página ${pageIndex + 1} tem dimensões zero, pulando...`);
      return;
    }

    const imgData = canvas.toDataURL('image/png', 1.0);
    console.log(`Imagem da página ${pageIndex + 1} gerada, tamanho:`, imgData.length);

    if (imgData.length < 100) {
      console.warn(`Imagem da página ${pageIndex + 1} muito pequena, pulando...`);
      return;
    }

    // Adicionar nova página se não for a primeira
    if (pageIndex > 0) {
      this.doc.addPage();
    }

    // Adicionar imagem ao PDF
    this.addImageToPDF(canvas, imgData);

    // Restaurar estilo original
    page.style.cssText = originalStyle;
  }

  /**
   * Configura a página para captura
   * @param page - Elemento da página
   */
  private setupPageForCapture(page: HTMLElement): void {
    page.style.display = 'block';
    page.style.visibility = 'visible';
    page.style.opacity = '1';
    page.style.position = 'relative';
    page.style.width = '100%';
    page.style.overflow = 'visible';
  }

  /**
   * Captura a página como canvas usando html2canvas
   * @param page - Elemento da página
   * @returns Canvas com a imagem da página
   */
  private async capturePageAsCanvas(page: HTMLElement): Promise<HTMLCanvasElement> {
    return await html2canvas(page, {
      scale: this.options.scale || 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: false,
      removeContainer: false,
      imageTimeout: 30000,
      ignoreElements: () => false,
      onclone: (clonedDoc) => this.setupClonedDocument(clonedDoc)
    });
  }

  /**
   * Configura o documento clonado para melhor renderização
   * @param clonedDoc - Documento clonado
   */
  private setupClonedDocument(clonedDoc: Document): void {
    const clonedPage = clonedDoc.body.firstElementChild as HTMLElement;
    if (!clonedPage) return;

    // Forçar reflow do DOM
    clonedPage.offsetHeight;
    
    // Aguardar um pouco para garantir que os estilos sejam aplicados
    setTimeout(() => {
      clonedPage.style.display = 'none';
      clonedPage.offsetHeight;
      clonedPage.style.display = 'block';
    }, 10);

    // Configurações básicas da página
    this.applyBasicPageStyles(clonedPage);
    
    // Adicionar classe especial para html2canvas
    clonedPage.classList.add('html2canvas-render');
    
    // Aplicar correções de estilo
    this.applyStyleCorrections(clonedPage);
    
    // Configurar elementos específicos
    this.setupSpecificElements(clonedPage);
  }

  /**
   * Aplica estilos básicos à página clonada
   * @param clonedPage - Página clonada
   */
  private applyBasicPageStyles(clonedPage: HTMLElement): void {
    clonedPage.style.transform = 'none';
    clonedPage.style.position = 'relative';
    clonedPage.style.width = '100%';
    clonedPage.style.display = 'block';
    clonedPage.style.visibility = 'visible';
    clonedPage.style.opacity = '1';
    clonedPage.style.overflow = 'visible';
    clonedPage.style.backgroundColor = '#ffffff';
  }

  /**
   * Aplica correções de alinhamento de texto
   * @param clonedPage - Página clonada
   */
  private applyStyleCorrections(clonedPage: HTMLElement): void {
    const fixTextAlignment = (element: HTMLElement) => {
      element.style.setProperty('line-height', 'normal', 'important');
      element.style.setProperty('vertical-align', 'baseline', 'important');
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
  }

  /**
   * Configura elementos específicos (cards, tabelas, etc.)
   * @param clonedPage - Página clonada
   */
  private setupSpecificElements(clonedPage: HTMLElement): void {
    this.setupMetricCards(clonedPage);
    this.setupTable(clonedPage);
    this.setupLogo(clonedPage);
    this.setupTitles(clonedPage);
  }

  /**
   * Configura os cards de métricas
   * @param clonedPage - Página clonada
   */
  private setupMetricCards(clonedPage: HTMLElement): void {
    const metricCards = clonedPage.querySelectorAll('.template-metric-card');
    metricCards.forEach((card) => {
      if (card instanceof HTMLElement) {
        // Resetar completamente o layout do card
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
        
        this.setupCardElements(card);
      }
    });
  }

  /**
   * Configura elementos internos dos cards
   * @param card - Card a ser configurado
   */
  private setupCardElements(card: HTMLElement): void {
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

  /**
   * Configura a tabela
   * @param clonedPage - Página clonada
   */
  private setupTable(clonedPage: HTMLElement): void {
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
  }

  /**
   * Configura o logo
   * @param clonedPage - Página clonada
   */
  private setupLogo(clonedPage: HTMLElement): void {
    const logo = clonedPage.querySelector('.template-logo');
    if (logo instanceof HTMLImageElement) {
      logo.style.height = '36px';
      logo.style.width = 'auto';
      logo.style.display = 'block';
    }
  }

  /**
   * Configura os títulos principais
   * @param clonedPage - Página clonada
   */
  private setupTitles(clonedPage: HTMLElement): void {
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
  }

  /**
   * Adiciona a imagem capturada ao PDF
   * @param canvas - Canvas com a imagem
   * @param imgData - Dados da imagem em base64
   */
  private addImageToPDF(canvas: HTMLCanvasElement, imgData: string): void {
    // Calcular dimensões proporcionais para o PDF
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

    console.log(`Adicionando imagem: ${finalWidth}x${finalHeight}mm na posição (${x}, ${y})`);
    
    // Adicionar imagem com dimensões proporcionais
    this.doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
  }

  /**
   * Obtém o documento PDF gerado
   * @returns Documento jsPDF
   */
  public getDocument(): jsPDF {
    return this.doc;
  }

  /**
   * Salva o PDF com o nome especificado
   * @param filename - Nome do arquivo (opcional)
   */
  public save(filename?: string): void {
    this.doc.save(filename || this.options.filename);
  }
}

// Instância padrão do conversor
export const htmlToPdfConverter = new HTMLToPDFConverter();