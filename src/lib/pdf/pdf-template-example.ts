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
  devices: ['KT090AE20444', 'KT090AE20561', 'LFXAH97W8R3012999'],
  summary: {
    totalConsumption: 156.8,
    totalDistance: 1250,
    avgConsumptionPerKm: 0.125,
    avgConsumption: 15.7,
    avgDistance: 125
  },
  detailedDataByDevice: {
    'KT090AE20444': [
      {
        date: '2024-01-01',
        deviceSerial: 'KT090AE20444',
        accumulatedDistance: 1250,
        accumulatedConsumption: 156.8,
        distance: 0,
        consumption: 0,
        consumptionPerKm: 0
      },
      {
        date: '2024-01-02',
        deviceSerial: 'KT090AE20444',
        accumulatedDistance: 1378,
        accumulatedConsumption: 172.4,
        distance: 128,
        consumption: 15.6,
        consumptionPerKm: 0.122
      }
    ],
    'KT090AE20561': [
      {
        date: '2024-01-01',
        deviceSerial: 'KT090AE20561',
        accumulatedDistance: 890,
        accumulatedConsumption: 112.3,
        distance: 0,
        consumption: 0,
        consumptionPerKm: 0
      },
      {
        date: '2024-01-02',
        deviceSerial: 'KT090AE20561',
        accumulatedDistance: 1023,
        accumulatedConsumption: 128.7,
        distance: 133,
        consumption: 16.4,
        consumptionPerKm: 0.123
      }
    ]
  },
  detailedData: [
    {
      date: '2024-01-01',
      deviceSerial: 'KT090AE20444',
      accumulatedDistance: 2140,
      accumulatedConsumption: 269.1,
      distance: 0,
      consumption: 0,
      consumptionPerKm: 0
    },
    {
      date: '2024-01-02',
      deviceSerial: 'KT090AE20444',
      accumulatedDistance: 2401,
      accumulatedConsumption: 301.1,
      distance: 261,
      consumption: 32.0,
      consumptionPerKm: 0.123
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
    devices: ['KT090AE20444', 'KT090AE20561', 'LFXAH97W8R3012999'],
    summary: {
      totalConsumption: 5230,
      totalDistance: 41500,
      avgConsumptionPerKm: 0.126,
      avgConsumption: 52.3,
      avgDistance: 415
    },
    detailedDataByDevice: {
      'KT090AE20444': largeDetailedData.slice(0, 50),
      'KT090AE20561': largeDetailedData.slice(50, 100)
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