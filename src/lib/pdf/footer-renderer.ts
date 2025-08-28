import { PDFContext } from './pdfService';

/**
 * Adiciona rodapé com numeração de páginas em todas as páginas do PDF
 * @param context - Contexto do PDF
 */
export function addFooter(context: PDFContext): void {
  const { doc, pageWidth, pageHeight } = context;
  
  const pageCount = (doc as any).getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
}

/**
 * Adiciona rodapé customizado com texto específico
 * @param context - Contexto do PDF
 * @param text - Texto do rodapé
 * @param options - Opções de formatação
 */
export function addCustomFooter(
  context: PDFContext,
  text: string,
  options: {
    fontSize?: number;
    position?: 'left' | 'center' | 'right';
    yOffset?: number;
  } = {}
): void {
  const {
    fontSize = 10,
    position = 'center',
    yOffset = 10
  } = options;
  
  const { doc, pageWidth, pageHeight, margin } = context;
  const pageCount = (doc as any).getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    
    let x: number;
    let align: 'left' | 'center' | 'right';
    
    switch (position) {
      case 'left':
        x = margin.left;
        align = 'left';
        break;
      case 'right':
        x = pageWidth - margin.right;
        align = 'right';
        break;
      default:
        x = pageWidth / 2;
        align = 'center';
    }
    
    doc.text(text, x, pageHeight - yOffset, { align });
  }
}

/**
 * Adiciona rodapé com informações da empresa
 * @param context - Contexto do PDF
 * @param companyInfo - Informações da empresa
 */
export function addCompanyFooter(
  context: PDFContext,
  companyInfo: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  }
): void {
  const { doc, pageWidth, pageHeight, margin } = context;
  const pageCount = (doc as any).getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    
    const footerY = pageHeight - 15;
    let currentY = footerY;
    
    // Nome da empresa
    if (companyInfo.name) {
      doc.setFont('helvetica', 'bold');
      doc.text(companyInfo.name, pageWidth / 2, currentY, { align: 'center' });
      currentY += 4;
      doc.setFont('helvetica', 'normal');
    }
    
    // Endereço
    if (companyInfo.address) {
      doc.text(companyInfo.address, pageWidth / 2, currentY, { align: 'center' });
      currentY += 4;
    }
    
    // Contatos
    const contacts = [];
    if (companyInfo.phone) contacts.push(`Tel: ${companyInfo.phone}`);
    if (companyInfo.email) contacts.push(`Email: ${companyInfo.email}`);
    if (companyInfo.website) contacts.push(`Site: ${companyInfo.website}`);
    
    if (contacts.length > 0) {
      doc.text(contacts.join(' | '), pageWidth / 2, currentY, { align: 'center' });
    }
  }
}