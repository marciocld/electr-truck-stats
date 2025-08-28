import { PDFContext } from './pdfService';

/**
 * Renderiza o cabeçalho do relatório PDF
 * @param context - Contexto do PDF com documento e configurações
 * @param period - Período do relatório
 */
export function addHeader(context: PDFContext, period: string): void {
  const { doc, pageWidth, margin } = context;
  
  // Logo da empresa (placeholder)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LOGO DA EMPRESA', margin.left, context.currentY);
  
  // Título do relatório
  doc.setFontSize(24);
  doc.text('Relatório de Consumo', pageWidth / 2, context.currentY, { align: 'center' });
  
  // Período
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${period}`, pageWidth - margin.right, context.currentY, { align: 'right' });
  
  context.currentY += 25;
  
  // Linha separadora
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin.left, context.currentY, pageWidth - margin.right, context.currentY);
  context.currentY += 15;
}

/**
 * Adiciona logo da empresa ao PDF
 * @param context - Contexto do PDF
 * @param logoUrl - URL ou caminho da logo
 * @param x - Posição X
 * @param y - Posição Y
 * @param width - Largura da logo
 * @param height - Altura da logo
 */
export async function addCompanyLogo(
  context: PDFContext,
  logoUrl: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  try {
    const { doc } = context;
    
    // Carregar a imagem
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // Criar canvas temporário para converter a imagem
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Não foi possível criar contexto do canvas'));
            return;
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Converter para base64
          const dataURL = canvas.toDataURL('image/png');
          
          // Adicionar ao PDF
          doc.addImage(dataURL, 'PNG', x, y, width, height);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Erro ao carregar a imagem da logo'));
      };
      
      img.src = logoUrl;
    });
  } catch (error) {
    console.error('Erro ao adicionar logo:', error);
    throw error;
  }
}