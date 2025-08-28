import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, Building } from 'lucide-react';

// Mock data for demonstration
const generateMockData = (period: string) => ({
  period,
  summary: {
    totalConsumption: 2847.5,
    totalDistance: 15420,
    consumptionPerKm: 0.185,
  },
  detailedData: [
    {
      serie: 'EV001',
      date: '2024-01-01',
      accumulatedDistance: 1250,
      accumulatedConsumption: 231.2,
      distance: 1250,
      consumption: 231.2,
      consumptionPerKm: 0.185,
    },
    {
      serie: 'EV001',
      date: '2024-01-02',
      accumulatedDistance: 2480,
      accumulatedConsumption: 459.1,
      distance: 1230,
      consumption: 227.9,
      consumptionPerKm: 0.185,
    },
    {
      serie: 'EV002',
      date: '2024-01-01',
      accumulatedDistance: 980,
      accumulatedConsumption: 181.3,
      distance: 980,
      consumption: 181.3,
      consumptionPerKm: 0.185,
    },
    {
      serie: 'EV002',
      date: '2024-01-02',
      accumulatedDistance: 2150,
      accumulatedConsumption: 397.8,
      distance: 1170,
      consumption: 216.5,
      consumptionPerKm: 0.185,
    },
    {
      serie: 'EV003',
      date: '2024-01-01',
      accumulatedDistance: 1450,
      accumulatedConsumption: 268.3,
      distance: 1450,
      consumption: 268.3,
      consumptionPerKm: 0.185,
    },
    {
      serie: 'EV003',
      date: '2024-01-02',
      accumulatedDistance: 2890,
      accumulatedConsumption: 534.7,
      distance: 1440,
      consumption: 266.4,
      consumptionPerKm: 0.185,
    },
  ],
});

export const ReportGenerator = () => {
  const [period, setPeriod] = useState('Janeiro 2024');
  const [logoUrl, setLogoUrl] = useState('');
  
  const reportData = generateMockData(period);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Gerador de Relatório PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="logo" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                URL da Logo da Empresa
              </Label>
              <Input
                id="logo"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              className="w-full" 
              onClick={() => {
                // Aqui seria implementada a geração do PDF
                console.log('Gerando relatório PDF para o período:', period);
                alert(`Relatório para ${period} será gerado em breve!`);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {reportData.summary.consumptionPerKm.toFixed(3)}
              </div>
              <div className="text-sm text-muted-foreground">kWh/km</div>
              <div className="text-xs text-muted-foreground mt-1">Consumo por KM</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportGenerator;