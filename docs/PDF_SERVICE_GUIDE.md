# 📄 Guia do Serviço de PDF Personalizado

Este guia explica como usar o serviço de PDF personalizado implementado com **jsPDF** e **html2canvas** para gerar relatórios com controle total sobre o layout e formatação.

## 🚀 Instalação

As dependências já estão instaladas no projeto:

```bash
npm install jspdf html2canvas
npm install --save-dev @types/jspdf
```

## 📋 Funcionalidades

### ✅ **Recursos Implementados**

- ✅ **Geração de PDF programática** com controle total do layout
- ✅ **Conversão HTML para PDF** mantendo o design original
- ✅ **Configurações personalizáveis** (orientação, formato, margens)
- ✅ **Layout responsivo** com cards centralizados
- ✅ **Numeração de páginas** automática
- ✅ **Suporte a logos** da empresa
- ✅ **Tabelas formatadas** com dados detalhados
- ✅ **Cards de resumo** com design profissional

### 🎨 **Controles Disponíveis**

| Configuração | Opções | Padrão |
|--------------|--------|--------|
| **Orientação** | `portrait` / `landscape` | `portrait` |
| **Formato** | `a4` / `a3` / `letter` / `legal` | `a4` |
| **Unidade** | `mm` / `cm` / `in` / `pt` | `mm` |
| **Margens** | Personalizáveis (top, right, bottom, left) | `20mm` |
| **Qualidade** | `0.1` a `2.0` | `1.0` |
| **Escala HTML** | `1` a `4` | `2` |

## 💻 Como Usar

### **1. Uso Básico**

```typescript
import { pdfService } from '@/lib/pdfService';

// Gerar PDF com configurações padrão
await pdfService.generatePDF({
  period: 'Janeiro 2024',
  summary: {
    totalConsumption: 2847.5,
    totalDistance: 15420,
    avgConsumptionPerKm: 0.185,
    avgConsumption: 284.75,
    avgDistance: 1542,
  },
  detailedData: [
    // ... dados detalhados
  ]
});
```

### **2. Uso com Configurações Personalizadas**

```typescript
import { pdfService, PDFOptions } from '@/lib/pdfService';

const options: PDFOptions = {
  filename: 'meu-relatorio.pdf',
  orientation: 'landscape',
  format: 'a3',
  margin: { top: 15, right: 15, bottom: 15, left: 15 },
  quality: 1.5
};

await pdfService.generatePDF(data, options);
```

### **3. Conversão HTML para PDF**

```typescript
import { pdfService } from '@/lib/pdfService';

// Converter elemento HTML para PDF
const element = document.getElementById('template');
if (element) {
  await pdfService.generatePDFFromHTML(element, {
    filename: 'template-html.pdf',
    scale: 2,
    quality: 1
  });
}
```

## 🎯 Exemplos Práticos

### **Exemplo 1: Relatório Padrão**

```typescript
const handleGeneratePDF = async () => {
  try {
    setIsGenerating(true);
    
    await pdfService.generatePDF({
      period: 'Janeiro 2024',
      summary: reportData.summary,
      detailedData: reportData.detailedData
    });
    
    console.log('PDF gerado com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
  } finally {
    setIsGenerating(false);
  }
};
```

### **Exemplo 2: Relatório Personalizado**

```typescript
const handleGenerateCustomPDF = async () => {
  try {
    setIsGenerating(true);
    
    const customOptions: PDFOptions = {
      filename: `relatorio-${period.toLowerCase()}.pdf`,
      orientation: 'portrait',
      format: 'a4',
      margin: { top: 25, right: 20, bottom: 25, left: 20 },
      quality: 1.2
    };

    await pdfService.generatePDF(data, customOptions);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
  } finally {
    setIsGenerating(false);
  }
};
```

## 🔧 Personalização Avançada

### **Adicionar Logo da Empresa**

```typescript
// No método addHeader do PDFService
await this.addCompanyLogo(
  '/path/to/logo.png',
  this.margin.left,
  this.currentY,
  30, // largura
  15  // altura
);
```

### **Modificar Layout dos Cards**

```typescript
// No método addSummaryCard do PDFService
private addSummaryCard(title: string, value: string, x: number, y: number, width: number, height: number): void {
  // Personalizar cores
  this.doc.setDrawColor(0, 123, 255); // Azul
  this.doc.setFillColor(240, 248, 255); // Azul claro
  
  // Adicionar gradiente ou sombra
  this.doc.roundedRect(x, y, width, height, 5, 5, 'FD');
  
  // Personalizar fontes
  this.doc.setFontSize(12);
  this.doc.setFont('helvetica', 'bold');
  this.doc.setTextColor(0, 123, 255);
}
```

## 📊 Estrutura do PDF Gerado

### **Página 1: Resumo**
- Header com logo e título
- Cards de resumo centralizados
- Distâncias (2 cards)
- Consumos (3 cards)

### **Página 2+: Dados Detalhados**
- Tabela com dados diários
- Numeração de páginas
- Layout responsivo

## 🎨 Customização de Estilos

### **Cores Padrão**
```typescript
// Cores do tema elétrico
const colors = {
  primary: '#0ea5e9',      // Azul elétrico
  secondary: '#64748b',    // Cinza
  success: '#10b981',      // Verde
  warning: '#f59e0b',      // Amarelo
  danger: '#ef4444'        // Vermelho
};
```

### **Fontes**
```typescript
// Fontes disponíveis
this.doc.setFont('helvetica', 'normal');  // Normal
this.doc.setFont('helvetica', 'bold');    // Negrito
this.doc.setFont('helvetica', 'italic');  // Itálico
```

## 🚨 Tratamento de Erros

```typescript
try {
  await pdfService.generatePDF(data, options);
} catch (error) {
  if (error instanceof Error) {
    console.error('Erro específico:', error.message);
  } else {
    console.error('Erro desconhecido:', error);
  }
  
  // Mostrar mensagem para o usuário
  alert('Erro ao gerar PDF. Tente novamente.');
}
```

## 🔄 Melhorias Futuras

### **Funcionalidades Planejadas**
- [ ] **Gráficos e charts** no PDF
- [ ] **Assinatura digital** de relatórios
- [ ] **Templates personalizáveis** por empresa
- [ ] **Exportação em lote** de múltiplos relatórios
- [ ] **Compressão de PDF** para arquivos menores
- [ ] **Watermark** personalizado
- [ ] **Proteção por senha** do PDF

### **Otimizações**
- [ ] **Cache de templates** para melhor performance
- [ ] **Geração assíncrona** em background
- [ ] **Progress bar** para relatórios grandes
- [ ] **Preview em tempo real** das configurações

## 📝 Notas Importantes

1. **Compatibilidade**: Funciona em todos os navegadores modernos
2. **Performance**: Recomendado para relatórios com até 100 páginas
3. **Memória**: Para relatórios grandes, considere usar web workers
4. **Qualidade**: Escala 2x é recomendada para melhor qualidade
5. **Tamanho**: Arquivos gerados são otimizados automaticamente

## 🤝 Suporte

Para dúvidas ou problemas com o serviço de PDF:

1. Verifique os logs do console
2. Teste com configurações básicas primeiro
3. Verifique se todas as dependências estão instaladas
4. Consulte a documentação do jsPDF para funcionalidades avançadas

---

**Desenvolvido com ❤️ para o sistema de estatísticas de caminhões elétricos**
