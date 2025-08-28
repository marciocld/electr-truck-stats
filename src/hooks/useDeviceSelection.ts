/**
 * Hook para gerenciar seleção de dispositivos com persistência
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'electricTruck_selectedDevices';
const DEFAULT_DEVICES = ["1635270", "1635271", "1346649", "1346766", "1346767"];

export const useDeviceSelection = (defaultDevices: string[] = DEFAULT_DEVICES) => {
  const [selectedDevices, setSelectedDevices] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validar se é um array válido
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar dispositivos salvos:', error);
    }
    return defaultDevices;
  });

  // Salvar no localStorage sempre que a seleção mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedDevices));
    } catch (error) {
      console.warn('Erro ao salvar dispositivos selecionados:', error);
    }
  }, [selectedDevices]);

  const updateSelection = (devices: string[]) => {
    setSelectedDevices(devices);
  };

  const resetToDefaults = () => {
    setSelectedDevices(defaultDevices);
  };

  const clearSelection = () => {
    setSelectedDevices([]);
  };

  return {
    selectedDevices,
    updateSelection,
    resetToDefaults,
    clearSelection,
    hasSelection: selectedDevices.length > 0
  };
};
