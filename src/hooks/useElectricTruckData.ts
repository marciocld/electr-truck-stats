/**
 * Hook personalizado para gerenciar dados dos caminhões elétricos
 * Integra com a API e gerencia estado da aplicação
 */

import { useState, useEffect, useCallback } from 'react';
import { ProcessedDayData, apiService } from '@/lib/apiService';
import { DataProcessor, DailyDataSummary } from '@/lib/dataProcessor';
import { dataPersistence } from '@/lib/dataPersistence';
import { formatDateLocal, createBrazilianDate } from '@/lib/formatters';

export interface ElectricTruckDataState {
  data: ProcessedDayData[];
  summary: DailyDataSummary;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  progress: {
    current: number;
    total: number;
    currentDevice: string;
  };
}

export interface UseElectricTruckDataOptions {
  startDate?: Date;
  endDate?: Date;
  deviceIds?: string[];
  autoLoad?: boolean;
}

export const useElectricTruckData = (options: UseElectricTruckDataOptions = {}) => {
  const {
    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primeiro dia do mês atual
    endDate = new Date(), // Hoje
    deviceIds = apiService.getAllDevices().slice(0, 5), // Primeiros 5 dispositivos por padrão
    autoLoad = false
  } = options;

  const [state, setState] = useState<ElectricTruckDataState>({
    data: [],
    summary: {
      totalDistance: 0,
      totalConsumption: 0,
      avgConsumptionPerKm: 0,
      avgDistance: 0,
      avgConsumption: 0,
      onlineCount: 0,
      offlineCount: 0,
      persistedCount: 0,
      errorCount: 0
    },
    isLoading: false,
    error: null,
    lastUpdated: null,
    progress: {
      current: 0,
      total: 0,
      currentDevice: ''
    }
  });

  /**
   * Carrega dados da API para os dispositivos especificados
   */
  const loadData = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: { current: 0, total: deviceIds.length, currentDevice: '' }
    }));

    try {
      console.log(`Iniciando coleta de dados para ${deviceIds.length} dispositivos`);
      console.log(`Período: ${formatDateLocal(startDate)} a ${formatDateLocal(endDate)}`);
      
      const allData: ProcessedDayData[] = [];
      
      // Processar cada dispositivo sequencialmente
      for (let i = 0; i < deviceIds.length; i++) {
        const deviceId = deviceIds[i];
        const machineSerial = apiService.getSerialNumber(deviceId);
        
        setState(prev => ({
          ...prev,
          progress: { 
            current: i + 1, 
            total: deviceIds.length, 
            currentDevice: machineSerial 
          }
        }));

        try {
          console.log(`Coletando dados para dispositivo ${deviceId} (${machineSerial})`);
          const deviceData = await DataProcessor.collectDeviceData(deviceId, startDate, endDate);
          allData.push(...deviceData);
        } catch (error) {
          console.error(`Erro ao coletar dados do dispositivo ${deviceId}:`, error);
          // Continuar com outros dispositivos mesmo se um falhar
        }
      }

      // Calcular valores diários (incluindo dados históricos para cálculos corretos)
      const processedData = DataProcessor.calculateDailyValues(allData);
      
      // Filtrar apenas dados do período solicitado (REMOVER dados históricos)
      console.log(`🔍 Aplicando filtro de período: ${formatDateLocal(startDate)} a ${formatDateLocal(endDate)}`);
      console.log(`📋 Dados antes do filtro: ${processedData.length} registros`);
      console.log(`📋 Datas disponíveis: [${processedData.map(d => d.date).join(', ')}]`);
      
      const periodData = DataProcessor.filterDataByPeriod(processedData, startDate, endDate);
      
      console.log(`📋 Dados após filtro: ${periodData.length} registros`);
      console.log(`📋 Datas filtradas: [${periodData.map(d => d.date).join(', ')}]`);
      
      // Filtrar registros com valores zero do relatório final
      const reportData = DataProcessor.filterValidDataForReport(periodData);
      
      // Calcular resumo baseado APENAS nos dados do período (sem históricos)
      const summary = DataProcessor.calculateSummary(reportData);
      
      console.log(`📊 Dados processados: ${allData.length} total → ${periodData.length} do período → ${reportData.length} válidos para relatório`);

      setState(prev => ({
        ...prev,
        data: reportData,
        summary,
        isLoading: false,
        lastUpdated: new Date(),
        progress: { current: deviceIds.length, total: deviceIds.length, currentDevice: '' }
      }));

      console.log(`Coleta concluída: ${reportData.length} registros processados`);
      console.log('Resumo:', summary);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar dados:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        progress: { current: 0, total: 0, currentDevice: '' }
      }));
    }
  }, [deviceIds, startDate, endDate]);

  /**
   * Recarrega dados forçando nova coleta da API
   */
  const reloadData = useCallback(async () => {
    // Limpar dados de persistência se necessário
    // dataPersistence.resetPersistenceData();
    await loadData();
  }, [loadData]);

  /**
   * Obtém dados agrupados por dispositivo
   */
  const getDataByDevice = useCallback(() => {
    return DataProcessor.groupDataByDevice(state.data);
  }, [state.data]);

  /**
   * Obtém estatísticas por dispositivo
   */
  const getDeviceStatistics = useCallback(() => {
    return DataProcessor.getDeviceStatistics(state.data);
  }, [state.data]);

  /**
   * Filtra dados por status
   */
  const getDataByStatus = useCallback((status: ProcessedDayData['status']) => {
    return state.data.filter(d => d.status === status);
  }, [state.data]);

  /**
   * Obtém dados para um dispositivo específico
   */
  const getDeviceData = useCallback((machineSerial: string) => {
    return state.data.filter(d => d.machineSerial === machineSerial);
  }, [state.data]);

  // Auto-load se habilitado
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  return {
    // Estado
    ...state,
    
    // Ações
    loadData,
    reloadData,
    
    // Utilitários
    getDataByDevice,
    getDeviceStatistics,
    getDataByStatus,
    getDeviceData,
    
    // Informações de persistência
    getPersistenceInfo: () => dataPersistence.getPersistenceInfo(),
    cleanOldData: (maxDaysOld?: number) => dataPersistence.cleanOldPersistenceData(maxDaysOld),
    resetPersistence: () => dataPersistence.resetPersistenceData()
  };
};
