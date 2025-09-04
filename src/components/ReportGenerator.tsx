import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Calendar, Building, AlertCircle, RefreshCw, Truck, Battery, Zap, TrendingUp, MapPin, Gauge } from 'lucide-react';
import companyLogo from '@/assets/company-logo.png';
import { pdfService, PDFOptions, ReportData } from '@/lib/pdf/pdfService';
import { useElectricTruckData } from '@/hooks/useElectricTruckData';
import { useDeviceSelection } from '@/hooks/useDeviceSelection';
import { DeviceSelector } from '@/components/DeviceSelector';
import { formatDistance, formatConsumption, formatEfficiency, formatDateBR, formatInteger, formatDecimal1, formatDecimal2, createBrazilianDate } from '@/lib/formatters';
import { apiService } from '@/lib/apiService';
import './ReportGenerator.css';

export const ReportGenerator = () => {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-01-31');
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);
  
  // Hook para gerenciar seleção de dispositivos com persistência
  const { selectedDevices, updateSelection, hasSelection } = useDeviceSelection();
  
  // Hook para dados da API
  const { 
    data, 
    summary, 
    isLoading, 
    error, 
    lastUpdated, 
    progress,
    loadData 
  } = useElectricTruckData({
    startDate: createBrazilianDate(startDate),
    endDate: createBrazilianDate(endDate),
    deviceIds: selectedDevices,
    autoLoad: false
  });

  // Dados mock para preview rápido
  const mockData = {
    data: [
      {
        date: '2024-01-01',
        totalMileage: 1250,
        totalConsumption: 156.8,
        dailyMileage: 0,
        dailyConsumption: 0,
        consumptionPerKm: 0,
        machineSerial: 'TRUCK001',
        status: 'Online' as const
      },
      {
        date: '2024-01-02',
        totalMileage: 1378,
        totalConsumption: 172.4,
        dailyMileage: 128,
        dailyConsumption: 15.6,
        consumptionPerKm: 0.122,
        machineSerial: 'TRUCK001',
        status: 'Online' as const
      },
      {
        date: '2024-01-03',
        totalMileage: 1400,
        totalConsumption: 175.0,
        dailyMileage: 3, // Será filtrado (≤ 5 km)
        dailyConsumption: 2.6,
        consumptionPerKm: 0.867,
        machineSerial: 'TRUCK001',
        status: 'Online' as const
      },
      {
        date: '2024-01-04',
        totalMileage: 1450,
        totalConsumption: 1200.0,
        dailyMileage: 50,
        dailyConsumption: 1025, // Será filtrado (> 1000 kWh)
        consumptionPerKm: 20.5,
        machineSerial: 'TRUCK001',
        status: 'Online' as const
      },
      {
        date: '2024-01-03',
        totalMileage: 1512,
        totalConsumption: 189.1,
        dailyMileage: 134,
        dailyConsumption: 16.7,
        consumptionPerKm: 0.125,
        machineSerial: 'TRUCK001',
        status: 'Online' as const
      },
      {
        date: '2024-01-04',
        totalMileage: 1634,
        totalConsumption: 203.8,
        dailyMileage: 122,
        dailyConsumption: 14.7,
        consumptionPerKm: 0.120,
        machineSerial: 'TRUCK001',
        status: 'Online' as const
      },
      {
        date: '2024-01-05',
        totalMileage: 1789,
        totalConsumption: 222.5,
        dailyMileage: 155,
        dailyConsumption: 18.7,
        consumptionPerKm: 0.121,
        machineSerial: 'TRUCK001',
        status: 'Online' as const
      }
    ],
    summary: {
      totalConsumption: 65.7,
      totalDistance: 539,
      avgConsumptionPerKm: 0.122,
      avgConsumption: 16.4,
      avgDistance: 134.8,
      totalRecords: 5,
      validRecords: 4,
      invalidRecords: 1
    }
  };

  // Usar dados mock se os dados reais não estão disponíveis
  const currentData = data.length > 0 ? data : mockData.data;
  const currentSummary = data.length > 0 ? summary : mockData.summary;

  // Filtrar dados: remover registros com distância ≤ 5 km OU consumo > 1000 kWh (não aparecem na tabela e cards)
  const filteredData = currentData.filter(item => 
    item.dailyMileage > 5 && item.dailyConsumption <= 1000
  );
  
  // Recalcular summary com dados filtrados
  const recalculatedSummary = filteredData.length > 0 ? {
    totalConsumption: filteredData.reduce((sum, item) => sum + item.dailyConsumption, 0),
    totalDistance: filteredData.reduce((sum, item) => sum + item.dailyMileage, 0),
    avgConsumptionPerKm: filteredData.reduce((sum, item) => sum + item.consumptionPerKm, 0) / filteredData.length,
    avgConsumption: filteredData.reduce((sum, item) => sum + item.dailyConsumption, 0) / filteredData.length,
    avgDistance: filteredData.reduce((sum, item) => sum + item.dailyMileage, 0) / filteredData.length,
  } : {
    totalConsumption: 0,
    totalDistance: 0,
    avgConsumptionPerKm: 0,
    avgConsumption: 0,
    avgDistance: 0,
  };

  // Converter dados para formato do relatório
  // Preparar dados por dispositivo
  const detailedDataByDevice: { [deviceSerial: string]: any[] } = {};
  
  // Agrupar dados por dispositivo (apenas dados filtrados)
  if (filteredData && filteredData.length > 0) {
    filteredData.forEach(item => {
      if (!detailedDataByDevice[item.machineSerial]) {
        detailedDataByDevice[item.machineSerial] = [];
      }
      
      detailedDataByDevice[item.machineSerial].push({
        date: item.date,
        deviceSerial: item.machineSerial,
        accumulatedDistance: item.totalMileage,
        accumulatedConsumption: item.totalConsumption,
        distance: item.dailyMileage,
        consumption: item.dailyConsumption,
        consumptionPerKm: item.consumptionPerKm
      });
    });
  }

  const reportData: ReportData = {
    period: `${formatDateBR(startDate)} - ${formatDateBR(endDate)}`,
    devices: selectedDevices.map(deviceId => apiService.getSerialNumber(deviceId)),
    summary: {
      totalConsumption: recalculatedSummary.totalConsumption,
      totalDistance: recalculatedSummary.totalDistance,
      avgConsumptionPerKm: recalculatedSummary.avgConsumptionPerKm,
      avgConsumption: recalculatedSummary.avgConsumption,
      avgDistance: recalculatedSummary.avgDistance,
    },
    detailedDataByDevice: detailedDataByDevice,
    detailedData: filteredData.map(d => ({
      date: d.date,
      accumulatedDistance: d.totalMileage,
      accumulatedConsumption: d.totalConsumption,
      distance: d.dailyMileage,
      consumption: d.dailyConsumption,
      consumptionPerKm: d.consumptionPerKm
    }))
  };


  // Função para carregar dados mock
  const handleLoadMockData = () => {
    setShowPreview(true);
  };

  // Função para carregar dados com as datas especificadas
  const handleLoadData = async () => {
    if (!hasSelection) {
      alert('Por favor, selecione pelo menos um dispositivo para gerar o relatório.');
      return;
    }
    
    if (createBrazilianDate(startDate) >= createBrazilianDate(endDate)) {
      alert('A data final deve ser posterior à data inicial.');
      return;
    }
    
    await loadData();
    setShowPreview(true);
  };

  // Função para gerar PDF usando o serviço personalizado (HTML para imagem)
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
        filename: `relatorio-consumo-${startDate}-${endDate}.pdf`,
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

  // Função para gerar PDF usando template nativo (sem imagens)
  const handleGeneratePDFTemplate = async (options?: PDFOptions) => {
    try {
      setIsGeneratingPDF(true);
      
      const pdfOptions: PDFOptions = {
        filename: `relatorio-consumo-template-${startDate}-${endDate}.pdf`,
        orientation: 'portrait',
        format: 'a4',
        ...options
      };

      const templateData: ReportData = {
        period: `${formatDateBR(createBrazilianDate(startDate))} - ${formatDateBR(createBrazilianDate(endDate))}`,
        devices: reportData.devices,
        summary: reportData.summary,
        detailedDataByDevice: reportData.detailedDataByDevice,
        detailedData: reportData.detailedData
      };

      // Usar template nativo para gerar PDF
      await pdfService.generatePDFFromTemplate(templateData, pdfOptions);
    } catch (error) {
      console.error('Erro ao gerar PDF com template:', error);
      alert('Erro ao gerar PDF com template. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end items-center gap-3 print:hidden">
          <Button 
            onClick={() => handleGeneratePDF()}
            disabled={isGeneratingPDF}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGeneratingPDF ? 'Gerando...' : 'PDF com Imagem'}
          </Button>
          <Button 
            onClick={() => handleGeneratePDFTemplate()}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {isGeneratingPDF ? 'Gerando...' : 'PDF Template Nativo'}
          </Button>
        </div>


        
        {/* Template Preview */}
        <div 
          ref={templateRef}
          data-template-ref="true"
          className="template-container html2canvas-render space-y-8 max-w-4xl mx-auto" 
          style={{ 
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            position: 'relative',
            padding: '0',
            width: '210mm',
            height: 'auto',
            maxWidth: '210mm'
          }}
        >
          {/* Primeira Página - Resumo */}
          <div 
            className="template-page" 
            data-page="1"
          >
            {/* Header Minimalista */}
            <div className="template-header">
              {/* Logo e período em linha simples */}
              <div className="template-header-content">
                <img 
                  src={companyLogo} 
                  alt="Logo da Empresa" 
                  className="template-logo"
                />
                
                <div className="template-period">
                  <div className="template-period-title">
                    {reportData.period}
                  </div>
                  <div className="template-period-date">
                    {new Date().toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Título principal centralizado */}
              <div className="template-main-title">
                <h1>
                  Relatório de consumo
                </h1>
              </div>

              {/* Linha divisória sutil */}
              <div className="template-divider"></div>
            </div>

            {/* Seção de Métricas */}
            <div className="mb-20">
              {/* Grid 2x2 mais equilibrado */}
              <div className="template-metrics-grid">
                {/* Distância Total */}
                <div className="template-metric-card">
                  <div className="template-metric-header">
                    <div className="template-metric-title">
                      <Truck className="template-metric-icon" />
                      Distância Total
                    </div>
                    <div className="template-metric-badge primary">
                      <MapPin className="template-badge-icon" />
                      KM
                    </div>
                  </div>
                  <div className="template-metric-value">
                    {formatInteger(reportData.summary.totalDistance)}
                  </div>
                  <div className="template-metric-unit">
                    quilômetros percorridos
                  </div>
                </div>

                {/* Consumo Total */}
                <div className="template-metric-card">
                  <div className="template-metric-header">
                    <div className="template-metric-title">
                      <Battery className="template-metric-icon" />
                      Consumo Total
                    </div>
                    <div className="template-metric-badge success">
                      <Zap className="template-badge-icon" />
                      kWh
                    </div>
                  </div>
                  <div className="template-metric-value">
                    {formatDecimal1(reportData.summary.totalConsumption)}
                  </div>
                  <div className="template-metric-unit">
                    quilowatt-hora consumidos
                  </div>
                </div>

                {/* Distância Média */}
                <div className="template-metric-card">
                  <div className="template-metric-header">
                    <div className="template-metric-title">
                      <TrendingUp className="template-metric-icon" />
                      Distância Média
                    </div>
                    <div className="template-metric-badge primary">
                      <Gauge className="template-badge-icon" />
                      Avg
                    </div>
                  </div>
                  <div className="template-metric-value">
                    {formatInteger(reportData.summary.avgDistance)}
                  </div>
                  <div className="template-metric-unit">
                    quilômetros por dia
                  </div>
                </div>

                {/* Consumo Médio */}
                <div className="template-metric-card">
                  <div className="template-metric-header">
                    <div className="template-metric-title">
                      <Battery className="template-metric-icon" />
                      Consumo Médio
                    </div>
                    <div className="template-metric-badge success">
                      <Zap className="template-badge-icon" />
                      Avg
                    </div>
                  </div>
                  <div className="template-metric-value">
                    {formatDecimal1(reportData.summary.avgConsumption)}
                  </div>
                  <div className="template-metric-unit">
                    quilowatt-hora por dia
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Segunda Página - Dados Detalhados */}
          <div 
            className="template-page" 
            data-page="2"
            style={{
              minHeight: 'auto',
              height: 'auto',
              overflow: 'visible',
              pageBreakInside: 'avoid'
            }}
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
                Dados
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

            {/* Container da tabela */}
            <div 
              className="template-table-container"
              style={{
                width: '100%',
                overflow: 'visible',
                height: 'auto',
                minHeight: 'auto'
              }}
            >
              <table 
                className="template-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                  pageBreakInside: 'auto'
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: '16%' }}>Data</th>
                    <th style={{ width: '18%' }}>Odômetro (km)</th>
                    <th style={{ width: '18%' }}>Consumo Acumulado (kWh)</th>
                    <th style={{ width: '16%' }}>Distância (km)</th>
                    <th style={{ width: '16%' }}>Consumo (kWh)</th>
                    <th style={{ width: '16%' }}>Eficiência (kWh/km)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.detailedData.map((row, index) => (
                    <tr 
                      key={index}
                      style={{
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }}
                    >
                      <td style={{ color: '#111827', fontWeight: '600', padding: '8px 4px' }}>
                        {formatDateBR(row.date)}
                      </td>
                      <td style={{ color: '#6b7280', fontWeight: '500', padding: '8px 4px' }}>
                        {formatInteger(row.accumulatedDistance)}
                      </td>
                      <td style={{ color: '#6b7280', fontWeight: '500', padding: '8px 4px' }}>
                        {formatDecimal1(row.accumulatedConsumption)}
                      </td>
                      <td style={{ color: '#111827', fontWeight: '600', padding: '8px 4px' }}>
                        {formatInteger(row.distance)}
                      </td>
                      <td style={{ color: '#111827', fontWeight: '600', padding: '8px 4px' }}>
                        {formatDecimal1(row.consumption)}
                      </td>
                      <td style={{ color: '#111827', fontWeight: '700', padding: '8px 4px' }}>
                        {formatEfficiency(row.consumptionPerKm).replace(' kWh/km', '')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Rodapé da segunda página */}
            <div className="template-footer">
              <div className="template-footer-text">
                Dados baseados em telemetria do veículo
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="hover:shadow-electric-hover transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            Configurações do relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data inicial
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data final
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Indicador de progresso */}
          {isLoading && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Coletando dados da API...
                    </p>
                    {progress.total > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-blue-600 mb-1">
                          <span>{progress.currentDevice && `${progress.currentDevice}`}</span>
                          <span>{progress.current}/{progress.total}</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Erro */}
          {error && (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-600">Erro ao carregar dados</p>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="pt-4 space-y-2">
            <Button 
              className="w-full" 
              onClick={handleLoadData}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Carregando dados...' : 'Gerar relatório'}
            </Button>
            
            <Button 
              onClick={handleLoadMockData}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Preview com dados mock
            </Button>
            
            {lastUpdated && (
              <p className="text-xs text-muted-foreground text-center">
                Última atualização: {lastUpdated.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Dispositivos */}
      <DeviceSelector
        selectedDevices={selectedDevices}
        onSelectionChange={updateSelection}
        maxSelections={10}
        showSerialNumbers={true}
      />

      {/* Preview Cards - mostrar apenas se há dados */}
      {(showPreview && data.length > 0) && (
        <div className="flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-6xl">
            {/* Distância Total */}
            <Card className="hover:shadow-electric-hover transition-all duration-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary mb-1">
                    {formatInteger(reportData.summary.totalDistance)}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">km</div>
                  <div className="text-xs text-muted-foreground">Soma dos Valores Diários</div>
                </div>
              </CardContent>
            </Card>

            {/* Distância Média */}
            <Card className="hover:shadow-electric-hover transition-all duration-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary mb-1">
                    {formatInteger(reportData.summary.avgDistance)}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">km</div>
                  <div className="text-xs text-muted-foreground">Distância Média</div>
                </div>
              </CardContent>
            </Card>

            {/* Consumo Total */}
            <Card className="hover:shadow-electric-hover transition-all duration-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary mb-1">
                    {formatDecimal2(reportData.summary.totalConsumption)}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">kWh</div>
                  <div className="text-xs text-muted-foreground">Soma dos Valores Diários</div>
                </div>
              </CardContent>
            </Card>

            {/* Consumo Médio */}
            <Card className="hover:shadow-electric-hover transition-all duration-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary mb-1">
                    {formatDecimal2(reportData.summary.avgConsumption)}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">kWh</div>
                  <div className="text-xs text-muted-foreground">Consumo Médio</div>
                </div>
              </CardContent>
            </Card>

            {/* Eficiência Energética */}
            <Card className="hover:shadow-electric-hover transition-all duration-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary mb-1">
                    {formatEfficiency(reportData.summary.avgConsumptionPerKm).replace(' kWh/km', '')}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">kWh/km</div>
                  <div className="text-xs text-muted-foreground">Média das Eficiências</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
