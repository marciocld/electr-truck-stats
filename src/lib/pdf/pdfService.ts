import jsPDF from 'jspdf';
import { PDFOptions, ReportData, PDFContext } from './types';
import { formatDateBR } from './formatters';
import { addHeader, addCompanyLogo } from './header-renderer';
import { addSummarySection } from './summary-renderer';
import { addDetailedDataTable } from './table-renderer';
import { addFooter } from './footer-renderer';
import { HTMLToPDFConverter } from './html-to-pdf';

// Re-exportar tipos para manter compatibilidade
export type { PDFOptions, ReportData, PDFContext } from './types';


export class PDFService {
  private context: PDFContext;
  private htmlConverter: HTMLToPDFConverter;

  constructor(options: PDFOptions = {}) {
    const defaultOptions: PDFOptions = {
      filename: 'relatorio-eletrico.pdf',
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      quality: 1.0,
      scale: 2,
      ...options
    };

    const doc = new jsPDF({
      orientation: defaultOptions.orientation,
      unit: defaultOptions.unit,
      format: defaultOptions.format
    });

    this.context = {
      doc,
      options: defaultOptions,
      currentY: defaultOptions.margin!.top,
      pageWidth: doc.internal.pageSize.getWidth(),
      pageHeight: doc.internal.pageSize.getHeight(),
      margin: defaultOptions.margin!
    };

    this.htmlConverter = new HTMLToPDFConverter(defaultOptions);
  }

  // Método principal para gerar PDF
  public async generatePDF(data: ReportData, options?: PDFOptions): Promise<void> {
    try {
      // Aplicar opções personalizadas se fornecidas
      if (options) {
        this.context.options = { ...this.context.options, ...options };
        this.context.doc = new jsPDF({
          orientation: this.context.options.orientation,
          unit: this.context.options.unit,
          format: this.context.options.format
        });
        this.context.pageWidth = this.context.doc.internal.pageSize.getWidth();
        this.context.pageHeight = this.context.doc.internal.pageSize.getHeight();
        this.context.margin = this.context.options.margin!;
        this.context.currentY = this.context.margin.top;
      }

      // Adicionar cabeçalho
      addHeader(this.context, data.period);
      
      // Adicionar seção de resumo
      addSummarySection(this.context, data.summary);
      
      // Adicionar dados detalhados
      addDetailedDataTable(this.context, data.detailedData);
      
      // Adicionar rodapé com numeração
      addFooter(this.context);
      
      // Salvar PDF
      this.context.doc.save(this.context.options.filename);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }

  // Método alternativo para converter HTML para PDF
  public async generatePDFFromHTML(element: HTMLElement, options: PDFOptions = {}): Promise<void> {
    return await this.htmlConverter.generatePDFFromHTML(element, options);
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
          this.context.doc.addImage(imgData, 'PNG', x, y, width, height);
          resolve();
        };
        
        img.onerror = reject;
        img.src = logoUrl;
      });
    } catch (error) {
      console.error('Erro ao adicionar logo:', error);
      // Fallback para texto
      this.context.doc.setFontSize(12);
      this.context.doc.setFont('helvetica', 'bold');
      this.context.doc.text('LOGO DA EMPRESA', x, y + height / 2);
    }
  }
}

// Instância padrão do serviço
export const pdfService = new PDFService();
