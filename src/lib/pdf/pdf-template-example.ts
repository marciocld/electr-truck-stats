/**
 * Exemplo de uso do Template PDF Nativo
 * Este arquivo demonstra como usar o novo sistema de geração de PDF
 */

import { PDFTemplateGenerator } from './pdf-template';
import { ReportData, PDFOptions } from './types';

/**
 * Dados de exemplo para demonstração
 */
const exampleReportData: ReportData = {
  period: '01/01/2024 - 31/01/2024',
  summary: {
    totalConsumption: 1567.8,
    totalDistance: 12450,
    avgConsumptionPerKm: 0.126,
    avgConsumption: 52.3,
    avgDistance: 415
  },
  detailedData: [
    {
      date: '2024-01-01',
      accumulatedDistance: 415,
      accumulatedConsumption: 52.3,
      distance: 415,
      consumption: 52.3,
      consumptionPerKm: 0.126
    },
    {
      date: '2024-01-02',
      accumulatedDistance: 830,
      accumulatedConsumption: 104.6,
      distance: 415,
      consumption: 52.3,
      consumptionPerKm: 0.126
    },
    {
      date: '2024-01-03',
      accumulatedDistance: 1245,
      accumulatedConsumption: 156.9,
      distance: 415,
      consumption: 52.3,
      consumptionPerKm: 0.126
    },
    {
      date: '2024-01-04',
      accumulatedDistance: 1660,
      accumulatedConsumption: 209.2,
      distance: 415,
      consumption: 52.3,
      consumptionPerKm: 0.126
    },
    {
      date: '2024-01-05',
      accumulatedDistance: 2075,
      accumulatedConsumption: 261.5,
      distance: 415,
      consumption: 52.3,
      consumptionPerKm: 0.126
    },
    {
      date: '2024-01-06',
      accumulatedDistance: 2490,
      accumulatedConsumption: 313.8,
      distance: 415,
      consumption: 52.3,
      consumptionPerKm: 0.126
    },
    {
      date: '2024-01-07',
      accumulatedDistance: 2905,
      accumulatedConsumption: 366.1,
      distance: 415,
      consumption: 52.3,
      consumptionPerKm: 0.126
    },
    {
      date: '2024-01-08',
      accumulatedDistance: 3320,
      accumulatedConsumption: 418.4,
      distance: 415,
      consumption: 52.3,
      consumptionPerKm: 0.126
    },
    {
      date: '2024-01-09',
      accumulatedDistance: 3735,
      accumulatedConsumption: 470.7,
      distance: 415,
      consumption: 52.3,
      consumptionPerKm: 0.126
    },
    {
      date: '2024-01-10',
      accumulatedDistance: 4150,
      accumulatedConsumption: 523.0,
      distance: 415,
      consumption: 52.3,
      consumptionPerKm: 0.126
    }
  ]
};

/**
 * Exemplo 1: Geração básica de PDF
 */
export async function generateBasicPDF(): Promise<void> {
  const generator = new PDFTemplateGenerator({
    filename: 'exemplo-basico.pdf',
    orientation: 'portrait',
    format: 'a4'
  });

  await generator.generatePDF(exampleReportData);
  generator.save();
  
  console.log('PDF básico gerado com sucesso!');
}

/**
 * Exemplo 2: PDF com opções customizadas
 */
export async function generateCustomPDF(): Promise<void> {
  const customOptions: PDFOptions = {
    filename: 'exemplo-customizado.pdf',
    orientation: 'portrait',
    format: 'a4',
    margin: {
      top: 25,
      right: 25,
      bottom: 25,
      left: 25
    }
  };

  const generator = new PDFTemplateGenerator(customOptions);
  await generator.generatePDF(exampleReportData);
  generator.save();
  
  console.log('PDF customizado gerado com sucesso!');
}

/**
 * Exemplo 3: Geração de múltiplos PDFs
 */
export async function generateMultiplePDFs(): Promise<void> {
  const periods = [
    { period: 'Janeiro 2024', filename: 'relatorio-janeiro-2024.pdf' },
    { period: 'Fevereiro 2024', filename: 'relatorio-fevereiro-2024.pdf' },
    { period: 'Março 2024', filename: 'relatorio-marco-2024.pdf' }
  ];

  for (const config of periods) {
    const reportData = {
      ...exampleReportData,
      period: config.period
    };

    const generator = new PDFTemplateGenerator({
      filename: config.filename
    });

    await generator.generatePDF(reportData);
    generator.save();
    
    console.log(`PDF ${config.filename} gerado com sucesso!`);
  }
}

/**
 * Exemplo 4: PDF com dados grandes (teste de paginação)
 */
export async function generateLargePDF(): Promise<void> {
  // Gerar dados para 100 dias
  const largeDetailedData = [];
  const startDate = new Date('2024-01-01');
  
  for (let i = 0; i < 100; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    largeDetailedData.push({
      date: currentDate.toISOString().split('T')[0],
      accumulatedDistance: (i + 1) * 415,
      accumulatedConsumption: (i + 1) * 52.3,
      distance: 415,
      consumption: 52.3,
      consumptionPerKm: 0.126
    });
  }

  const largeReportData: ReportData = {
    period: '01/01/2024 - 10/04/2024',
    summary: {
      totalConsumption: 5230,
      totalDistance: 41500,
      avgConsumptionPerKm: 0.126,
      avgConsumption: 52.3,
      avgDistance: 415
    },
    detailedData: largeDetailedData
  };

  const generator = new PDFTemplateGenerator({
    filename: 'exemplo-grande.pdf'
  });

  await generator.generatePDF(largeReportData);
  generator.save();
  
  console.log('PDF grande gerado com sucesso!');
}

/**
 * Exemplo 5: Comparação de tamanhos de arquivo
 */
export async function comparePDFSizes(): Promise<void> {
  console.log('Gerando PDFs para comparação de tamanhos...');
  
  // PDF com poucos dados
  const smallData = {
    ...exampleReportData,
    detailedData: exampleReportData.detailedData.slice(0, 5)
  };
  
  const smallGenerator = new PDFTemplateGenerator({
    filename: 'comparacao-pequeno.pdf'
  });
  await smallGenerator.generatePDF(smallData);
  smallGenerator.save();
  
  // PDF com muitos dados
  const largeData = {
    ...exampleReportData,
    detailedData: Array(50).fill(null).map((_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      accumulatedDistance: (i + 1) * 415,
      accumulatedConsumption: (i + 1) * 52.3,
      distance: 415,
      consumption: 52.3,
      consumptionPerKm: 0.126
    }))
  };
  
  const largeGenerator = new PDFTemplateGenerator({
    filename: 'comparacao-grande.pdf'
  });
  await largeGenerator.generatePDF(largeData);
  largeGenerator.save();
  
  console.log('PDFs de comparação gerados!');
  console.log('Verifique os tamanhos dos arquivos:');
  console.log('- comparacao-pequeno.pdf (5 linhas)');
  console.log('- comparacao-grande.pdf (50 linhas)');
}

/**
 * Função utilitária para executar todos os exemplos
 */
export async function runAllExamples(): Promise<void> {
  console.log('Executando todos os exemplos de PDF Template...');
  
  try {
    await generateBasicPDF();
    await generateCustomPDF();
    await generateMultiplePDFs();
    await generateLargePDF();
    await comparePDFSizes();
    
    console.log('Todos os exemplos foram executados com sucesso!');
  } catch (error) {
    console.error('Erro ao executar exemplos:', error);
  }
}

// Exportar dados de exemplo para uso em outros lugares
export { exampleReportData };