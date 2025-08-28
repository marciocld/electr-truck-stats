import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, Building } from 'lucide-react';
import companyLogo from '@/assets/company-logo.png';
import { pdfService, PDFOptions } from '@/lib/pdfService';

// Mock data for demonstration
const generateMockData = (period: string) => ({
  period,
  summary: {
    totalConsumption: 2847.5,
    totalDistance: 15420,
    avgConsumptionPerKm: 0.185,
    avgConsumption: 284.75,
    avgDistance: 1542,
  },
  detailedData: [
    {
      date: '2024-01-01',
      accumulatedDistance: 1250,
      accumulatedConsumption: 231.2,
      distance: 1250,
      consumption: 231.2,
      consumptionPerKm: 0.185,
    },
    {
      date: '2024-01-02',
      accumulatedDistance: 2480,
      accumulatedConsumption: 459.1,
      distance: 1230,
      consumption: 227.9,
      consumptionPerKm: 0.185,
    },
    {
      date: '2024-01-03',
      accumulatedDistance: 3450,
      accumulatedConsumption: 638.3,
      distance: 970,
      consumption: 179.2,
      consumptionPerKm: 0.185,
    },
    {
      date: '2024-01-04',
      accumulatedDistance: 4620,
      accumulatedConsumption: 854.7,
      distance: 1170,
      consumption: 216.4,
      consumptionPerKm: 0.185,
    },
    {
      date: '2024-01-05',
      accumulatedDistance: 6070,
      accumulatedConsumption: 1123.0,
      distance: 1450,
      consumption: 268.3,
      consumptionPerKm: 0.185,
    },
    {
      date: '2024-01-06',
      accumulatedDistance: 7510,
      accumulatedConsumption: 1389.4,
      distance: 1440,
      consumption: 266.4,
      consumptionPerKm: 0.185,
    },
  ],
});

// Função para formatar data no padrão brasileiro
const formatDateBR = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const ReportGenerator = () => {
  const [period, setPeriod] = useState('Janeiro 2024');
  const [showPreview, setShowPreview] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);
  
  const reportData = generateMockData(period);

  // Função para gerar PDF usando o serviço personalizado
  const handleGeneratePDF = async (options?: PDFOptions) => {
    if (!templateRef.current) {
      console.error('Template ref não encontrado');
      alert('Erro: Template não encontrado. Tente novamente.');
      return;
    }
    
    try {
      setIsGeneratingPDF(true);
      
      console.log('Template ref encontrado:', templateRef.current);
      console.log('Dimensões do template:', templateRef.current.offsetWidth, 'x', templateRef.current.offsetHeight);
      console.log('Conteúdo do template:', templateRef.current.innerHTML.substring(0, 200) + '...');
      
      const pdfOptions: PDFOptions = {
        filename: `relatorio-consumo-${period.toLowerCase().replace(' ', '-')}.pdf`,
        orientation: 'portrait',
        format: 'a4',
        scale: 2,
        quality: 1,
        ...options
      };

      // Usar conversão HTML para PDF para manter a aparência exata do template
      await pdfService.generatePDFFromHTML(templateRef.current, pdfOptions);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end items-center print:hidden">
          <Button 
            onClick={() => handleGeneratePDF()}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGeneratingPDF ? 'Gerando PDF...' : 'Gerar PDF'}
          </Button>
        </div>


        
        {/* Template Preview */}
        <div 
          ref={templateRef}
          data-template-ref="true"
          className="space-y-8 max-w-4xl mx-auto" 
          style={{ 
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            position: 'relative',
            backgroundColor: '#ffffff', // Background branco para o PDF
            padding: '0',
            width: '210mm', // Largura exata do A4
            height: 'auto',
            maxWidth: '210mm'
          }}
        >
          {/* Primeira Página - Resumo */}
          <div 
            className="bg-white p-12 shadow-lg print:shadow-none print:p-0 print:m-0" 
            style={{ 
              minHeight: '297mm',
              display: 'block',
              visibility: 'visible',
              opacity: 1,
              position: 'relative',
              backgroundColor: '#ffffff',
              padding: '15mm', // Margens reduzidas para dar mais espaço à tabela
              margin: '0',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              width: '210mm', // Largura exata do A4
              boxSizing: 'border-box'
            }}
            data-page="1"
          >
            {/* Header Corporativo */}
            <div 
              className="relative mb-16"
              style={{
                position: 'relative',
                marginBottom: '64px',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              {/* Logo e identificação da empresa */}
              <div 
                className="flex items-center justify-between mb-8"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '32px'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <img 
                    src={companyLogo} 
                    alt="Logo da Empresa" 
                    style={{
                      height: '40px',
                      width: 'auto',
                      display: 'block'
                    }}
                  />
                  <div 
                    style={{
                      borderLeft: '2px solid #e5e7eb',
                      paddingLeft: '16px'
                    }}
                  >
                    <div 
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '4px'
                      }}
                    >
                      Relatório Corporativo
                    </div>
                    <div 
                      style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        fontWeight: '400'
                      }}
                    >
                      Análise de Consumo Energético
                    </div>
                  </div>
                </div>
                
                <div 
                  style={{
                    textAlign: 'right',
                    padding: '16px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div 
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '4px'
                    }}
                  >
                    Período de Análise
                  </div>
                  <div 
                    style={{
                      fontSize: '18px',
                      color: '#111827',
                      fontWeight: '700',
                      marginBottom: '2px'
                    }}
                  >
                    {period}
                  </div>
                  <div 
                    style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      fontWeight: '400'
                    }}
                  >
                    Gerado em {new Date().toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Título principal */}
              <div 
                style={{
                  textAlign: 'center',
                  paddingBottom: '32px'
                }}
              >
                <h1 
                  style={{
                    fontSize: '32px',
                    fontWeight: '300',
                    color: '#111827',
                    letterSpacing: '0.5px',
                    margin: '0 0 8px 0',
                    lineHeight: '1.2'
                  }}
                >
                  RELATÓRIO DE DESEMPENHO
                </h1>
                <div 
                  style={{
                    width: '80px',
                    height: '2px',
                    backgroundColor: '#3b82f6',
                    margin: '16px auto 0 auto'
                  }}
                ></div>
              </div>
            </div>

            {/* Seção de Indicadores */}
            <div className="mb-16">
              <div 
                style={{
                  marginBottom: '40px',
                  textAlign: 'left'
                }}
              >
                <h2 
                  style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  Indicadores Chave
                </h2>
                <div 
                  style={{
                    width: '60px',
                    height: '3px',
                    backgroundColor: '#3b82f6',
                    marginBottom: '24px'
                  }}
                ></div>
                <p 
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '400',
                    lineHeight: '1.5',
                    margin: '0'
                  }}
                >
                  Principais métricas de performance e eficiência operacional do período analisado.
                </p>
              </div>
              
              {/* Grid de cards reorganizados em 3x2 */}
              <div className="space-y-8">
                {/* Primeira linha - 3 cards principais */}
                <div className="grid grid-cols-3 gap-8">
                  <div 
                    className="bg-white border border-border rounded-lg p-6 text-center"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '28px 20px',
                      textAlign: 'center',
                      display: 'block',
                      visibility: 'visible',
                      opacity: 1,
                      position: 'relative',
                      borderTop: '4px solid #22c55e'
                    }}
                  >
                    <h3 
                      style={{
                        color: '#6b7280',
                        fontSize: '11px',
                        marginBottom: '16px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        margin: '0 0 16px 0'
                      }}
                    >
                      Distância Total
                    </h3>
                    <p 
                      style={{
                        color: '#111827',
                        fontSize: '42px',
                        fontWeight: '300',
                        margin: '0 0 4px 0',
                        lineHeight: '1',
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      {reportData.summary.totalDistance.toLocaleString('pt-BR')}
                    </p>
                    <p 
                      style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        margin: '0',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Quilômetros
                    </p>
                  </div>

                  <div 
                    className="bg-white border border-border rounded-lg p-6 text-center"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '28px 20px',
                      textAlign: 'center',
                      display: 'block',
                      visibility: 'visible',
                      opacity: 1,
                      position: 'relative',
                      borderTop: '4px solid #3b82f6'
                    }}
                  >
                    <h3 
                      style={{
                        color: '#6b7280',
                        fontSize: '11px',
                        marginBottom: '16px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        margin: '0 0 16px 0'
                      }}
                    >
                      Consumo Total
                    </h3>
                    <p 
                      style={{
                        color: '#111827',
                        fontSize: '42px',
                        fontWeight: '300',
                        margin: '0 0 4px 0',
                        lineHeight: '1',
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      {reportData.summary.totalConsumption.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </p>
                    <p 
                      style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        margin: '0',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Kilowatt-hora
                    </p>
                  </div>

                  <div 
                    className="bg-white border border-border rounded-lg p-6 text-center"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '28px 20px',
                      textAlign: 'center',
                      display: 'block',
                      visibility: 'visible',
                      opacity: 1,
                      position: 'relative',
                      borderTop: '4px solid #f59e0b'
                    }}
                  >
                    <h3 
                      style={{
                        color: '#6b7280',
                        fontSize: '11px',
                        marginBottom: '16px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        margin: '0 0 16px 0'
                      }}
                    >
                      Eficiência Energética
                    </h3>
                    <p 
                      style={{
                        color: '#111827',
                        fontSize: '42px',
                        fontWeight: '300',
                        margin: '0 0 4px 0',
                        lineHeight: '1',
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      {reportData.summary.avgConsumptionPerKm.toFixed(3)}
                    </p>
                    <p 
                      style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        margin: '0',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      kWh por km
                    </p>
                  </div>
                </div>

                {/* Segunda linha - 2 cards centralizados */}
                <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                  <div 
                    className="bg-white border border-border rounded-lg p-6 text-center"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '28px 20px',
                      textAlign: 'center',
                      display: 'block',
                      visibility: 'visible',
                      opacity: 1,
                      position: 'relative',
                      borderTop: '4px solid #8b5cf6'
                    }}
                  >
                    <h3 
                      style={{
                        color: '#6b7280',
                        fontSize: '11px',
                        marginBottom: '16px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        margin: '0 0 16px 0'
                      }}
                    >
                      Distância Média
                    </h3>
                    <p 
                      style={{
                        color: '#111827',
                        fontSize: '42px',
                        fontWeight: '300',
                        margin: '0 0 4px 0',
                        lineHeight: '1',
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      {reportData.summary.avgDistance.toLocaleString('pt-BR')}
                    </p>
                    <p 
                      style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        margin: '0',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Quilômetros
                    </p>
                  </div>

                  <div 
                    className="bg-white border border-border rounded-lg p-6 text-center"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '28px 20px',
                      textAlign: 'center',
                      display: 'block',
                      visibility: 'visible',
                      opacity: 1,
                      position: 'relative',
                      borderTop: '4px solid #ef4444'
                    }}
                  >
                    <h3 
                      style={{
                        color: '#6b7280',
                        fontSize: '11px',
                        marginBottom: '16px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        margin: '0 0 16px 0'
                      }}
                    >
                      Consumo Médio
                    </h3>
                    <p 
                      style={{
                        color: '#111827',
                        fontSize: '42px',
                        fontWeight: '300',
                        margin: '0 0 4px 0',
                        lineHeight: '1',
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      {reportData.summary.avgConsumption.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </p>
                    <p 
                      style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        margin: '0',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Kilowatt-hora
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Segunda Página - Dados Detalhados */}
          <div 
            className="bg-white p-12 shadow-lg print:shadow-none print:p-0 print:m-0" 
            style={{ 
              minHeight: '297mm',
              display: 'block',
              visibility: 'visible',
              opacity: 1,
              position: 'relative',
              backgroundColor: '#ffffff',
              padding: '15mm', // Margens reduzidas para dar mais espaço à tabela
              margin: '0',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              width: '210mm', // Largura exata do A4
              boxSizing: 'border-box'
            }}
            data-page="2"
          >
            {/* Header da segunda página simplificado */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
                paddingBottom: '16px',
                borderBottom: '2px solid #e5e7eb'
              }}
            >
              <h2 
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0'
                }}
              >
                Dados Detalhados
              </h2>
              <div 
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textAlign: 'right'
                }}
              >
                <div>Página 2 de 2</div>
                <div>{reportData.detailedData.length} registros</div>
              </div>
            </div>
            {/* Tabela redesenhada com melhor legibilidade */}
            <div 
              className="border border-border rounded-xl overflow-hidden print:border-gray-300"
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
              }}
            >
              <table 
                className="w-full"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}
              >
                <thead 
                  style={{
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
                  }}
                >
                  <tr>
                    <th 
                      style={{
                        padding: '14px 12px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#1e293b',
                        borderBottom: '2px solid #cbd5e1',
                        width: '16%',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Data
                    </th>
                    <th 
                      style={{
                        padding: '14px 12px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#1e293b',
                        borderBottom: '2px solid #cbd5e1',
                        width: '17%',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Dist. Acum. (km)
                    </th>
                    <th 
                      style={{
                        padding: '14px 12px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#1e293b',
                        borderBottom: '2px solid #cbd5e1',
                        width: '17%',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Cons. Acum. (kWh)
                    </th>
                    <th 
                      style={{
                        padding: '14px 12px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#1e293b',
                        borderBottom: '2px solid #cbd5e1',
                        width: '16%',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Distância (km)
                    </th>
                    <th 
                      style={{
                        padding: '14px 12px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#1e293b',
                        borderBottom: '2px solid #cbd5e1',
                        width: '16%',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Consumo (kWh)
                    </th>
                    <th 
                      style={{
                        padding: '14px 12px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#1e293b',
                        borderBottom: '2px solid #cbd5e1',
                        width: '18%',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Eficiência (kWh/km)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.detailedData.map((row, index) => (
                    <tr 
                      key={index}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                        borderBottom: '1px solid #e2e8f0'
                      }}
                    >
                      <td 
                        style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          fontSize: '14px',
                          color: '#111827',
                          fontWeight: '600'
                        }}
                      >
                        {formatDateBR(row.date)}
                      </td>
                      <td 
                        style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#4b5563',
                          fontWeight: '500'
                        }}
                      >
                        {row.accumulatedDistance.toLocaleString('pt-BR')}
                      </td>
                      <td 
                        style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#4b5563',
                          fontWeight: '500'
                        }}
                      >
                        {row.accumulatedConsumption.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td 
                        style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#111827',
                          fontWeight: '600'
                        }}
                      >
                        {row.distance.toLocaleString('pt-BR')}
                      </td>
                      <td 
                        style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#111827',
                          fontWeight: '600'
                        }}
                      >
                        {row.consumption.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td 
                        style={{
                          padding: '10px 8px',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#3b82f6',
                          fontWeight: '600'
                        }}
                      >
                        {row.consumptionPerKm.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Rodapé da segunda página simplificado */}
            <div 
              style={{
                marginTop: '40px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center'
              }}
            >
              <div 
                style={{
                  fontSize: '11px',
                  color: '#9ca3af'
                }}
              >
               • Dados baseados em telemetria do veículo
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-electric-hover transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Configurações do relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="period" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período do relatório
            </Label>
            <Input
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Ex: Janeiro 2024"
            />
          </div>

          <div className="pt-4 space-y-2">
            <Button 
              className="w-full" 
              onClick={() => setShowPreview(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Visualizar template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Cards */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl">
          <Card className="hover:shadow-electric-hover transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {reportData.summary.totalDistance.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">km</div>
                <div className="text-xs text-muted-foreground mt-1">Distância Total</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-electric-hover transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {reportData.summary.avgDistance.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">km</div>
                <div className="text-xs text-muted-foreground mt-1">Distância Média</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-electric-hover transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {reportData.summary.totalConsumption.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">kWh</div>
                <div className="text-xs text-muted-foreground mt-1">Consumo Total</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-electric-hover transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {reportData.summary.avgConsumption.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">kWh</div>
                <div className="text-xs text-muted-foreground mt-1">Consumo Médio</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-electric-hover transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {reportData.summary.avgConsumptionPerKm.toFixed(3)}
                </div>
                <div className="text-sm text-muted-foreground">kWh/km</div>
                <div className="text-xs text-muted-foreground mt-1">Consumo Médio por KM</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
