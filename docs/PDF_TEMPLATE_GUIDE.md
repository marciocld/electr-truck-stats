# Guia do Template PDF Nativo

Este documento explica como usar o novo sistema de geração de PDF com template nativo, que substitui a captura de imagens HTML por elementos nativos do jsPDF.

## Visão Geral

O sistema agora oferece duas opções para gerar PDFs:

1. **PDF com Imagem** (método anterior): Captura o HTML como imagem e insere no PDF
2. **PDF Template Nativo** (novo método): Usa elementos nativos do jsPDF para criar o layout

## Vantagens do Template Nativo

### ✅ Benefícios
- **Tamanho menor**: PDFs gerados são significativamente menores
- **Qualidade vetorial**: Texto e elementos são vetoriais, não pixelizados
- **Melhor performance**: Geração mais rápida
- **Texto selecionável**: O texto no PDF pode ser selecionado e copiado
- **Melhor acessibilidade**: Compatível com leitores de tela
- **Consistência**: Aparência consistente independente do navegador

### ⚠️ Limitações
- **Menos flexibilidade visual**: Layout mais simples comparado ao HTML
- **Customização limitada**: Estilos são definidos programaticamente

## Como Usar

### Na Interface do Usuário

1. Acesse o **Gerador de Relatórios**
2. Configure as datas e dispositivos
3. Clique em **"Gerar Preview"**
4. Na tela de preview, você verá dois botões:
   - **"PDF com Imagem"**: Gera PDF usando o método anterior
   - **"PDF Template Nativo"**: Gera PDF usando o novo template

### Programaticamente

```typescript
import { pdfService, ReportData } from '@/lib/pdf/pdfService';

// Dados do relatório
const reportData: ReportData = {
  period: '01/01/2024 - 31/01/2024',
  summary: {
    totalConsumption: 1500.5,
    totalDistance: 12000,
    avgConsumptionPerKm: 0.125,
    avgConsumption: 50.2,
    avgDistance: 400
  },
  detailedData: [
    {
      date: '2024-01-01',
      accumulatedDistance: 1200,
      accumulatedConsumption: 150,
      distance: 1200,
      consumption: 150,
      consumptionPerKm: 0.125
    }
    // ... mais dados
  ]
};

// Gerar PDF com template nativo
await pdfService.generatePDFFromTemplate(reportData, {
  filename: 'relatorio-template.pdf',
  orientation: 'portrait',
  format: 'a4'
});
```

## Estrutura do Template

O template nativo inclui:

### 1. Cabeçalho
- Logo da empresa (placeholder azul)
- Título do relatório
- Período do relatório
- Data de geração

### 2. Resumo Executivo
- Cards com métricas principais:
  - Consumo Total (⚡)
  - Distância Total (🚛)
  - Eficiência Média (📊)

### 3. Tabela de Dados Detalhados
- Cabeçalho com fundo escuro
- Linhas alternadas para melhor legibilidade
- Colunas:
  - Data
  - Distância Acumulada (km)
  - Consumo Acumulado (kWh)
  - Distância Diária (km)
  - Consumo Diário (kWh)
  - Eficiência (kWh/km)

### 4. Rodapé
- Linha separadora
- Texto informativo
- Numeração de páginas

## Customização

### Cores

As cores principais podem ser modificadas no arquivo `pdf-template.ts`:

```typescript
// Cores corporativas
const colors = {
  primary: [41, 128, 185],    // Azul corporativo
  success: [46, 204, 113],    // Verde
  info: [52, 152, 219],       // Azul claro
  warning: [155, 89, 182],    // Roxo
  background: [248, 249, 250], // Cinza claro
  border: [233, 236, 239],    // Cinza borda
  text: [33, 37, 41],         // Texto escuro
  textMuted: [108, 117, 125]  // Texto secundário
};
```

### Layout

Para modificar o layout, edite os métodos na classe `PDFTemplateGenerator`:

- `addHeader()`: Cabeçalho do relatório
- `addSummarySection()`: Cards de resumo
- `addDetailedDataTable()`: Tabela de dados
- `addFooter()`: Rodapé

### Fontes e Tamanhos

```typescript
// Configurações de fonte
this.doc.setFont('helvetica', 'bold');  // Negrito
this.doc.setFont('helvetica', 'normal'); // Normal
this.doc.setFontSize(18);                // Título principal
this.doc.setFontSize(14);                // Títulos de seção
this.doc.setFontSize(12);                // Texto normal
this.doc.setFontSize(9);                 // Texto pequeno
```

## Quebra de Páginas

O sistema automaticamente:
- Adiciona nova página quando necessário
- Mantém numeração consistente
- Preserva cabeçalhos e rodapés

## Formatação de Dados

Os dados são formatados usando as funções em `formatters.ts`:

- `formatDateBR()`: Datas no formato brasileiro
- `formatDistance()`: Distâncias em km
- `formatConsumption()`: Consumo em kWh
- `formatEfficiency()`: Eficiência em kWh/km

## Resolução de Problemas

### PDF não é gerado
1. Verifique se os dados estão no formato correto
2. Confirme se não há erros no console
3. Teste com dados menores primeiro

### Layout quebrado
1. Verifique as dimensões dos elementos
2. Confirme se `currentY` está sendo atualizado corretamente
3. Teste a quebra de páginas

### Texto cortado
1. Ajuste as larguras das colunas
2. Verifique os tamanhos de fonte
3. Considere quebrar texto longo

## Arquivos Relacionados

- `src/lib/pdf/pdf-template.ts`: Implementação do template
- `src/lib/pdf/pdfService.ts`: Serviço principal de PDF
- `src/components/ReportGenerator.tsx`: Interface do usuário
- `src/lib/formatters.ts`: Funções de formatação

## Próximos Passos

1. **Adicionar gráficos**: Implementar gráficos simples usando elementos do jsPDF
2. **Melhorar design**: Adicionar mais elementos visuais
3. **Configurações avançadas**: Permitir customização via interface
4. **Templates múltiplos**: Criar diferentes layouts para diferentes tipos de relatório