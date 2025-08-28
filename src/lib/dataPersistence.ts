/**
 * Sistema de persistência de dados para manter informações entre sessões
 * Baseado no DataPersister Python original
 * 
 * Autor: Adaptado para React/TypeScript
 */

import { ProcessedDayData } from './apiService';

interface PersistedDeviceData {
  machineSerial: string;
  date: string;
  mileageTotal: number;
  consumptionTotal: number;
  lastUpdated: string;
}

interface PersistenceData {
  lastValidData: { [machineSerial: string]: PersistedDeviceData };
  lastUpdated: string;
}

export class DataPersistence {
  private static readonly STORAGE_KEY = 'electricTruck_persistedData';
  private static readonly MAX_DAYS_WITHOUT_DATA = 3;
  
  private lastValidData: { [machineSerial: string]: PersistedDeviceData } = {};

  constructor() {
    this.loadPersistenceData();
  }

  /**
   * Carrega dados de persistência do localStorage
   */
  private loadPersistenceData(): void {
    try {
      const stored = localStorage.getItem(DataPersistence.STORAGE_KEY);
      if (stored) {
        const data: PersistenceData = JSON.parse(stored);
        this.lastValidData = data.lastValidData || {};
      } else {
        this.lastValidData = {};
      }
    } catch (error) {
      console.error('Erro ao carregar dados de persistência:', error);
      this.lastValidData = {};
    }
  }

  /**
   * Salva dados de persistência no localStorage
   */
  private savePersistenceData(): void {
    try {
      const data: PersistenceData = {
        lastValidData: this.lastValidData,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(DataPersistence.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados de persistência:', error);
    }
  }

  /**
   * Obtém os últimos dados válidos para um dispositivo específico
   */
  getLastValidData(machineSerial: string): PersistedDeviceData | null {
    return this.lastValidData[machineSerial] || null;
  }

  /**
   * Atualiza os últimos dados válidos para um dispositivo
   * Persiste SEMPRE o último valor conhecido (mesmo que zero) para continuidade
   */
  updateLastValidData(machineSerial: string, data: ProcessedDayData): void {
    // Persistir sempre o último valor conhecido para manter continuidade
    this.lastValidData[machineSerial] = {
      machineSerial,
      date: data.date,
      mileageTotal: data.totalMileage,
      consumptionTotal: data.totalConsumption,
      lastUpdated: new Date().toISOString()
    };
    this.savePersistenceData();
    
    if (data.totalMileage > 0 && data.totalConsumption > 0) {
      console.log(`💾 Dados válidos persistidos para ${machineSerial}: Km=${data.totalMileage}, Consumo=${data.totalConsumption}`);
    } else {
      console.log(`💾 Dados zero persistidos para ${machineSerial}: Km=${data.totalMileage}, Consumo=${data.totalConsumption} (para continuidade)`);
    }
  }

  /**
   * Cria uma linha de dados baseada nos últimos dados persistidos
   * Usa sempre o último valor conhecido (mesmo que zero) para continuidade
   */
  createPersistedRow(machineSerial: string, currentDate: string): ProcessedDayData | null {
    const lastData = this.getLastValidData(machineSerial);
    
    if (lastData) {
      return {
        machineSerial,
        date: currentDate,
        status: 'Persistido',
        totalMileage: lastData.mileageTotal,
        totalConsumption: lastData.consumptionTotal,
        dailyMileage: 0, // Será calculado posteriormente
        dailyConsumption: 0, // Será calculado posteriormente
        consumptionPerKm: 0 // Será calculado posteriormente
      };
    }
    
    return null;
  }

  /**
   * Verifica se deve persistir dados baseado na última data válida
   */
  shouldPersistData(machineSerial: string, currentDate: string): boolean {
    const lastData = this.getLastValidData(machineSerial);
    
    if (!lastData) {
      return false;
    }
    
    try {
      const lastDate = new Date(lastData.date);
      const currentDateObj = new Date(currentDate);
      const daysDiff = Math.floor((currentDateObj.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysDiff <= DataPersistence.MAX_DAYS_WITHOUT_DATA;
    } catch {
      return false;
    }
  }

  /**
   * Retorna informações sobre a persistência de dados
   */
  getPersistenceInfo(): {
    totalDevices: number;
    devices: string[];
    lastUpdated: string;
  } {
    return {
      totalDevices: Object.keys(this.lastValidData).length,
      devices: Object.keys(this.lastValidData),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Remove dados de persistência mais antigos que o especificado
   */
  cleanOldPersistenceData(maxDaysOld: number = 30): void {
    try {
      const currentDate = new Date();
      const devicesToRemove: string[] = [];
      
      for (const [machineSerial, data] of Object.entries(this.lastValidData)) {
        if (data.lastUpdated) {
          try {
            const lastUpdated = new Date(data.lastUpdated);
            const daysOld = Math.floor((currentDate.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysOld > maxDaysOld) {
              devicesToRemove.push(machineSerial);
            }
          } catch {
            // Se não conseguir parsear a data, remover
            devicesToRemove.push(machineSerial);
          }
        }
      }
      
      // Remover dispositivos antigos
      for (const machineSerial of devicesToRemove) {
        delete this.lastValidData[machineSerial];
        console.log(`Removido dados de persistência antigos para dispositivo: ${machineSerial}`);
      }
      
      if (devicesToRemove.length > 0) {
        this.savePersistenceData();
        console.log(`Limpeza concluída: ${devicesToRemove.length} dispositivos removidos`);
      }
      
    } catch (error) {
      console.error('Erro ao limpar dados de persistência antigos:', error);
    }
  }

  /**
   * Reseta todos os dados de persistência
   */
  resetPersistenceData(): void {
    this.lastValidData = {};
    this.savePersistenceData();
    console.log('Dados de persistência resetados');
  }
}

// Instância singleton do serviço
export const dataPersistence = new DataPersistence();
