import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, FileText, Download } from 'lucide-react';
import { PDFOptions } from '@/lib/pdf/pdfService';

interface PDFSettingsProps {
  onGeneratePDF: (options: PDFOptions) => void;
  onGeneratePDFFromHTML: (options: PDFOptions) => void;
  isGenerating: boolean;
}

export const PDFSettings: React.FC<PDFSettingsProps> = ({
  onGeneratePDF,
  onGeneratePDFFromHTML,
  isGenerating
}) => {
  const [settings, setSettings] = useState<PDFOptions>({
    filename: 'relatorio-consumo.pdf',
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    quality: 1,
    scale: 2
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSettingChange = (key: keyof PDFOptions, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMarginChange = (side: keyof typeof settings.margin, value: string) => {
    setSettings(prev => ({
      ...prev,
      margin: {
        ...prev.margin!,
        [side]: parseInt(value) || 0
      }
    }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Configurações do PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configurações Básicas */}
        <div className="space-y-3">
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
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Configurações Avançadas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Configurações Avançadas</Label>
            <Switch
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
          </div>

          {showAdvanced && (
            <div className="space-y-3 pt-2 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="unit">Unidade</Label>
                  <Select
                    value={settings.unit}
                    onValueChange={(value) => handleSettingChange('unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm">Milímetros</SelectItem>
                      <SelectItem value="cm">Centímetros</SelectItem>
                      <SelectItem value="in">Polegadas</SelectItem>
                      <SelectItem value="pt">Pontos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quality">Qualidade</Label>
                  <Input
                    id="quality"
                    type="number"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={settings.quality}
                    onChange={(e) => handleSettingChange('quality', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="scale">Escala (HTML)</Label>
                <Input
                  id="scale"
                  type="number"
                  min="1"
                  max="4"
                  step="0.5"
                  value={settings.scale}
                  onChange={(e) => handleSettingChange('scale', parseFloat(e.target.value))}
                />
              </div>

              {/* Margens */}
              <div>
                <Label>Margens</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label htmlFor="margin-top" className="text-xs">Topo</Label>
                    <Input
                      id="margin-top"
                      type="number"
                      value={settings.margin?.top}
                      onChange={(e) => handleMarginChange('top', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin-right" className="text-xs">Direita</Label>
                    <Input
                      id="margin-right"
                      type="number"
                      value={settings.margin?.right}
                      onChange={(e) => handleMarginChange('right', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin-bottom" className="text-xs">Baixo</Label>
                    <Input
                      id="margin-bottom"
                      type="number"
                      value={settings.margin?.bottom}
                      onChange={(e) => handleMarginChange('bottom', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin-left" className="text-xs">Esquerda</Label>
                    <Input
                      id="margin-left"
                      type="number"
                      value={settings.margin?.left}
                      onChange={(e) => handleMarginChange('left', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={() => onGeneratePDF(settings)}
            disabled={isGenerating}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Gerando...' : 'Gerar PDF'}
          </Button>
          <Button
            onClick={() => onGeneratePDFFromHTML(settings)}
            disabled={isGenerating}
            variant="outline"
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
