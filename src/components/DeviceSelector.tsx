/**
 * Componente para seleção de dispositivos
 * Permite ao usuário escolher quais caminhões incluir na análise
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  Search, 
  CheckCircle2, 
  Circle,
  Users,
  Filter
} from 'lucide-react';
import { apiService } from '@/lib/apiService';

interface DeviceSelectorProps {
  selectedDevices: string[];
  onSelectionChange: (deviceIds: string[]) => void;
  maxSelections?: number;
  showSerialNumbers?: boolean;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedDevices,
  onSelectionChange,
  maxSelections = 10,
  showSerialNumbers = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Obter todos os dispositivos disponíveis
  const allDevices = apiService.getAllDevices();
  
  // Filtrar dispositivos baseado no termo de busca
  const filteredDevices = allDevices.filter(deviceId => {
    const serial = apiService.getSerialNumber(deviceId);
    const searchLower = searchTerm.toLowerCase();
    return (
      deviceId.includes(searchLower) ||
      serial.toLowerCase().includes(searchLower)
    );
  });

  // Manipular seleção individual
  const handleDeviceToggle = (deviceId: string) => {
    const isSelected = selectedDevices.includes(deviceId);
    
    if (isSelected) {
      // Remover da seleção
      onSelectionChange(selectedDevices.filter(id => id !== deviceId));
    } else {
      // Adicionar à seleção (respeitando limite máximo)
      if (selectedDevices.length < maxSelections) {
        onSelectionChange([...selectedDevices, deviceId]);
      }
    }
  };

  // Selecionar todos os dispositivos filtrados
  const handleSelectAll = () => {
    const devicesToAdd = filteredDevices.slice(0, maxSelections);
    onSelectionChange(devicesToAdd);
  };

  // Limpar seleção
  const handleClearAll = () => {
    onSelectionChange([]);
  };

  // Selecionar dispositivos recomendados (primeiros 5)
  const handleSelectRecommended = () => {
    const recommended = allDevices.slice(0, 5);
    onSelectionChange(recommended);
  };

  return (
    <Card className="hover:shadow-electric-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Seleção de Dispositivos
        </CardTitle>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {selectedDevices.length} de {allDevices.length} selecionados
          </Badge>
          {selectedDevices.length >= maxSelections && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Limite máximo atingido ({maxSelections})
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Barra de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID ou número de série..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Botões de ação rápida */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectRecommended}
            className="flex items-center gap-1"
          >
            <CheckCircle2 className="h-3 w-3" />
            Recomendados (5)
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={filteredDevices.length === 0}
            className="flex items-center gap-1"
          >
            <CheckCircle2 className="h-3 w-3" />
            Todos visíveis ({Math.min(filteredDevices.length, maxSelections)})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={selectedDevices.length === 0}
            className="flex items-center gap-1"
          >
            <Circle className="h-3 w-3" />
            Limpar
          </Button>
        </div>

        {/* Lista de dispositivos */}
        <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
          {filteredDevices.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum dispositivo encontrado</p>
              {searchTerm && (
                <p className="text-xs">Tente um termo de busca diferente</p>
              )}
            </div>
          ) : (
            filteredDevices.map((deviceId) => {
              const serial = apiService.getSerialNumber(deviceId);
              const isSelected = selectedDevices.includes(deviceId);
              const isDisabled = !isSelected && selectedDevices.length >= maxSelections;
              
              return (
                <div
                  key={deviceId}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                    isSelected 
                      ? 'bg-primary/5 border-primary/20' 
                      : isDisabled 
                        ? 'bg-gray-50 border-gray-200 opacity-50' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => handleDeviceToggle(deviceId)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">
                          {showSerialNumbers ? serial : `Dispositivo ${deviceId}`}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {showSerialNumbers ? `ID: ${deviceId}` : serial}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Informações adicionais */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Máximo de {maxSelections} dispositivos por consulta</p>
          <p>• Dispositivos recomendados: primeiros 5 da lista</p>
          {selectedDevices.length > 0 && (
            <p>• {selectedDevices.length} dispositivo(s) selecionado(s) para análise</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
