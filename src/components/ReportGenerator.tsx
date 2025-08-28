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
            {/* Header Minimalista */}
            <div 
              className="relative mb-20"
              style={{
                position: 'relative',
                marginBottom: '80px'
              }}
            >
              {/* Logo e período em linha simples */}
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '40px'
                }}
              >
                <img 
                  src={companyLogo} 
                  alt="Logo da Empresa" 
                  style={{
                    height: '36px',
                    width: 'auto',
                    display: 'block'
                  }}
                />
                
                <div 
                  style={{
                    textAlign: 'right'
                  }}
                >
                  <div 
                    style={{
                      fontSize: '14px',
                      color: '#374151',
                      fontWeight: '600',
                      marginBottom: '2px'
                    }}
                  >
                    {period}
                  </div>
                  <div 
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      fontWeight: '400'
                    }}
                  >
                    {new Date().toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Título principal centralizado */}
              <div 
                style={{
                  textAlign: 'center',
                  marginBottom: '40px'
                }}
              >
                <h1 
                  style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#111827',
                    letterSpacing: '-0.5px',
                    margin: '0',
                    lineHeight: '1.1'
                  }}
                >
                  Relatório de Consumo Energético
                </h1>
              </div>

              {/* Linha divisória sutil */}
              <div 
                style={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: '#e5e7eb'
                }}
              ></div>
            </div>

            {/* Seção de Métricas */}
            <div className="mb-20">
              {/* Grid 2x3 mais equilibrado */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-12">
                {/* Distância Total */}
                <div 
                  style={{
                    padding: '40px 32px',
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #111827',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    display: 'block'
                  }}
                >
                  <div 
                    style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '12px'
                    }}
                  >
                    Distância Total
                  </div>
                  <div 
                    style={{
                      fontSize: '48px',
                      fontWeight: '300',
                      color: '#111827',
                      lineHeight: '1',
                      marginBottom: '8px',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {reportData.summary.totalDistance.toLocaleString('pt-BR')}
                  </div>
                  <div 
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}
                  >
                    quilômetros
                  </div>
                </div>

                {/* Consumo Total */}
                <div 
                  style={{
                    padding: '40px 32px',
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #111827',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    display: 'block'
                  }}
                >
                  <div 
                    style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '12px'
                    }}
                  >
                    Consumo Total
                  </div>
                  <div 
                    style={{
                      fontSize: '48px',
                      fontWeight: '300',
                      color: '#111827',
                      lineHeight: '1',
                      marginBottom: '8px',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {reportData.summary.totalConsumption.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </div>
                  <div 
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}
                  >
                    kilowatt-hora
                  </div>
                </div>

                {/* Eficiência */}
                <div 
                  style={{
                    padding: '40px 32px',
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #111827',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    display: 'block'
                  }}
                >
                  <div 
                    style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '12px'
                    }}
                  >
                    Eficiência Energética
                  </div>
                  <div 
                    style={{
                      fontSize: '48px',
                      fontWeight: '300',
                      color: '#111827',
                      lineHeight: '1',
                      marginBottom: '8px',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {reportData.summary.avgConsumptionPerKm.toFixed(3)}
                  </div>
                  <div 
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}
                  >
                    kWh por quilômetro
                  </div>
                </div>

                {/* Médias */}
                <div 
                  style={{
                    padding: '40px 32px',
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #111827',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    display: 'block'
                  }}
                >
                  <div 
                    style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '12px'
                    }}
                  >
                    Médias do Período
                  </div>
                  <div 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div 
                        style={{
                          fontSize: '24px',
                          fontWeight: '600',
                          color: '#111827',
                          lineHeight: '1',
                          marginBottom: '4px'
                        }}
                      >
                        {reportData.summary.avgDistance.toLocaleString('pt-BR')} km
                      </div>
                      <div 
                        style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}
                      >
                        distância média
                      </div>
                    </div>
                    <div 
                      style={{
                        width: '1px',
                        height: '40px',
                        backgroundColor: '#e5e7eb',
                        margin: '0 20px'
                      }}
                    ></div>
                    <div>
                      <div 
                        style={{
                          fontSize: '24px',
                          fontWeight: '600',
                          color: '#111827',
                          lineHeight: '1',
                          marginBottom: '4px'
                        }}
                      >
                        {reportData.summary.avgConsumption.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh
                      </div>
                      <div 
                        style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}
                      >
                        consumo médio
                      </div>
                    </div>
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
            {/* Container da tabela */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0',
                overflow: 'hidden'
              }}
            >
              <table 
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  margin: '0',
                  fontSize: '13px'
                }}
              >
                <thead>
                  <tr 
                    style={{
                      backgroundColor: '#f9fafb',
                      borderBottom: '2px solid #111827'
                    }}
                  >
                    <th 
                      style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#111827',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        width: '16%'
                      }}
                    >
                      Data
                    </th>
                    <th 
                      style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#111827',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        width: '18%'
                      }}
                    >
                      Dist. Acum. (km)
                    </th>
                    <th 
                      style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#111827',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        width: '18%'
                      }}
                    >
                      Cons. Acum. (kWh)
                    </th>
                    <th 
                      style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#111827',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        width: '16%'
                      }}
                    >
                      Distância (km)
                    </th>
                    <th 
                      style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#111827',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        width: '16%'
                      }}
                    >
                      Consumo (kWh)
                    </th>
                    <th 
                      style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#111827',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        width: '16%'
                      }}
                    >
                      Eficiência
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.detailedData.map((row, index) => (
                    <tr 
                      key={index}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        borderBottom: '1px solid #e5e7eb'
                      }}
                    >
                      <td 
                        style={{
                          padding: '14px 12px',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#111827',
                          fontWeight: '600'
                        }}
                      >
                        {formatDateBR(row.date)}
                      </td>
                      <td 
                        style={{
                          padding: '14px 12px',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}
                      >
                        {row.accumulatedDistance.toLocaleString('pt-BR')}
                      </td>
                      <td 
                        style={{
                          padding: '14px 12px',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}
                      >
                        {row.accumulatedConsumption.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td 
                        style={{
                          padding: '14px 12px',
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
                          padding: '14px 12px',
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
                          padding: '14px 12px',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#111827',
                          fontWeight: '700'
                        }}
                      >
                        {row.consumptionPerKm.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Rodapé da segunda página */}
            <div 
              style={{
                marginTop: '48px',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center'
              }}
            >
              <div 
                style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}
              >
                Dados baseados em telemetria do veículo
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
