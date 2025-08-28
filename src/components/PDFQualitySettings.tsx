import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Settings } from 'lucide-react';
import { PDFOptions } from '@/lib/pdf/pdfService';

interface PDFQualitySettingsProps {
  onGeneratePDF: (options: PDFOptions) => void;
  isGenerating: boolean;
  period: string;
}

export const PDFQualitySettings: React.FC<PDFQualitySettingsProps> = ({
  onGeneratePDF,
  isGenerating,
  period
}) => {
  const [settings, setSettings] = useState<PDFOptions>({
    filename: `relatorio-consumo-${period.toLowerCase().replace(' ', '-')}.pdf`,
    orientation: 'portrait',
    format: 'a4',
    scale: 2,
    quality: 1
  });

  const handleSettingChange = (key: keyof PDFOptions, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Configurações do PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="filename">Nome do arquivo</Label>
          <Input
            id="filename"
            value={settings.filename}
            onChange={(e) => handleSettingChange('filename', e.target.value)}
            placeholder="relatorio.pdf"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="orientation">Orientação</Label>
            <Select
              value={settings.orientation}
              onValueChange={(value) => handleSettingChange('orientation', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Retrato</SelectItem>
                <SelectItem value="landscape">Paisagem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="format">Formato</Label>
            <Select
              value={settings.format}
              onValueChange={(value) => handleSettingChange('format', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4</SelectItem>
                <SelectItem value="a3">A3</SelectItem>
                <SelectItem value="letter">Letter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="scale">Qualidade da Imagem (1-4)</Label>
          <Input
            id="scale"
            type="number"
            min="1"
            max="4"
            step="0.5"
            value={settings.scale}
            onChange={(e) => handleSettingChange('scale', parseFloat(e.target.value))}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Valores maiores = melhor qualidade, arquivo maior
          </p>
        </div>

        <Button
          onClick={() => onGeneratePDF(settings)}
          disabled={isGenerating}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? 'Gerando PDF...' : 'Gerar PDF'}
        </Button>
      </CardContent>
    </Card>
  );
};
