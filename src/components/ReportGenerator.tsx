import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, Building, Printer } from 'lucide-react';
import companyLogo from '@/assets/company-logo.png';

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

export const ReportGenerator = () => {
  const [period, setPeriod] = useState('Janeiro 2024');
  const [showPreview, setShowPreview] = useState(false);
  
  const reportData = generateMockData(period);

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(false)}
          >
            ← Voltar para Configurações
          </Button>
          <Button 
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir/Salvar PDF
          </Button>
        </div>
        
        {/* Template Preview */}
        <div className="bg-white p-12 shadow-lg max-w-4xl mx-auto print:shadow-none print:p-0" style={{ minHeight: '297mm' }}>
          {/* Header */}
          <div className="flex justify-between items-start mb-12 pb-6 border-b-2 border-primary">
            <div>
              <img 
                src={companyLogo} 
                alt="Logo da Empresa" 
                className="h-16 w-auto"
              />
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Relatório de Consumo
              </h1>
              <p className="text-gray-600">
                Período: {period}
              </p>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo</h2>
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <h3 className="text-xs text-gray-600 mb-2">Distância Total</h3>
                <p className="text-2xl font-bold text-primary">{reportData.summary.totalDistance.toFixed(0)}</p>
                <p className="text-gray-500 text-xs">km</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <h3 className="text-xs text-gray-600 mb-2">Distância Média</h3>
                <p className="text-2xl font-bold text-primary">{reportData.summary.avgDistance.toFixed(0)}</p>
                <p className="text-gray-500 text-xs">km</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <h3 className="text-xs text-gray-600 mb-2">Consumo Total</h3>
                <p className="text-2xl font-bold text-primary">{reportData.summary.totalConsumption.toFixed(2)}</p>
                <p className="text-gray-500 text-xs">kWh</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <h3 className="text-xs text-gray-600 mb-2">Consumo Médio</h3>
                <p className="text-2xl font-bold text-primary">{reportData.summary.avgConsumption.toFixed(2)}</p>
                <p className="text-gray-500 text-xs">kWh</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <h3 className="text-xs text-gray-600 mb-2">Consumo Médio por KM</h3>
                <p className="text-2xl font-bold text-primary">{reportData.summary.avgConsumptionPerKm.toFixed(3)}</p>
                <p className="text-gray-500 text-xs">kWh/km</p>
              </div>
            </div>
          </div>

          {/* Detailed Data Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dados</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Dist. Acum.</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Cons. Acum.</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Distância</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Consumo</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Cons/KM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.detailedData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{row.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.accumulatedDistance.toFixed(0)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.accumulatedConsumption.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.distance.toFixed(0)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.consumption.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.consumptionPerKm.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Configurações do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="period" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período do Relatório
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
              Visualizar Template do Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
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
  );
};