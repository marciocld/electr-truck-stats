/**
 * Processador de dados para transformação e cálculo de valores diários
 * Baseado no DataProcessor Python original
 * 
 * Autor: Adaptado para React/TypeScript
 */

import { ProcessedDayData, apiService } from './apiService';
import { dataPersistence } from './dataPersistence';
import { formatDateLocal, createBrazilianDate } from './formatters';

export interface DailyDataSummary {
  totalDistance: number;
  totalConsumption: number;
  avgConsumptionPerKm: number;
  avgDistance: number;
  avgConsumption: number;
  onlineCount: number;
  offlineCount: number;
  persistedCount: number;
  errorCount: number;
}

export class DataProcessor {
  /**
   * Processa dados históricos brutos e extrai o último valor válido > 0
   */
  static processHistoricalData(
    historicalData: Array<[string, number, number]>,
    machineSerial: string,
    currentDate: Date
  ): ProcessedDayData | null {
    const dailyData: Array<{
      timestamp: Date;
      mileage: number;
      totalElectricConsumption: number;
    }> = [];

    // Processar cada linha de dados históricos
    for (const row of historicalData) {
      if (!row || row.length < 2) {
        continue;
      }

      try {
        // CORREÇÃO: Para dados diários, manter a data da API sem conversão de timezone
        // A API já envia os dados no contexto do dia brasileiro correto
        const utcTime = new Date(row[0]);
        const brTime = utcTime; // Manter o timestamp original para preservar a data
        
        // Log para debug da correção de timezone
        if (dailyData.length === 0) { // Apenas no primeiro registro para não poluir o log
          console.log(`🕐 Timestamp original: ${row[0]} → Data processada: ${formatDateLocal(currentDate)}`);
        }
        
        // Extrair valores das propriedades
        const mileage = row.length > 1 ? (row[1] || 0) : 0;
        const consumption = row.length > 2 ? (row[2] || 0) : 0;
        
        dailyData.push({
          timestamp: brTime,
          mileage,
          totalElectricConsumption: consumption
        });
      } catch (error) {
        console.warn('Erro ao processar linha de dados:', error);
        continue;
      }
    }

    if (dailyData.length > 0) {
      // Encontrar o último registro com valores válidos MAIORES QUE ZERO
      let validValues: typeof dailyData[0] | null = null;
      
      for (let i = dailyData.length - 1; i >= 0; i--) {
        const dataPoint = dailyData[i];
        if (
          dataPoint.mileage != null && 
          !isNaN(dataPoint.mileage) && 
          dataPoint.mileage > 0 &&  // DEVE SER > 0
          dataPoint.totalElectricConsumption != null && 
          !isNaN(dataPoint.totalElectricConsumption) &&
          dataPoint.totalElectricConsumption > 0  // DEVE SER > 0
        ) {
          validValues = dataPoint;
          break;
        }
      }

      if (validValues) {
        const mileage = validValues.mileage;
        const consumption = validValues.totalElectricConsumption;
        
        console.log(`✅ Dados válidos processados para ${formatDateLocal(currentDate)}: Quilometragem=${mileage}, Consumo=${consumption}`);
        
        const resultData: ProcessedDayData = {
          machineSerial,
          date: formatDateLocal(currentDate),
          status: 'Online',
          totalMileage: mileage,
          totalConsumption: consumption,
          dailyMileage: 0, // Será calculado posteriormente
          dailyConsumption: 0, // Será calculado posteriormente
          consumptionPerKm: 0 // Será calculado posteriormente
        };
        
        // Atualizar dados de persistência com o último valor conhecido (para continuidade)
        dataPersistence.updateLastValidData(machineSerial, resultData);
        
        return resultData;
      } else {
        console.log(`⚠️  Nenhum valor válido > 0 encontrado para ${formatDateLocal(currentDate)}`);
        return this.handleNoValidData(machineSerial, currentDate);
      }
    } else {
      // Se não há dados válidos no dia, verificar persistência
      return this.handleNoValidData(machineSerial, currentDate);
    }
  }

  /**
   * Gerencia casos onde não há dados válidos, usando persistência quando possível
   */
  private static handleNoValidData(machineSerial: string, currentDate: Date): ProcessedDayData {
    const currentDateStr = formatDateLocal(currentDate);
    
    // Verificar se deve usar dados persistidos (sempre que possível para continuidade)
    if (dataPersistence.shouldPersistData(machineSerial, currentDateStr)) {
      const persistedRow = dataPersistence.createPersistedRow(machineSerial, currentDateStr);
      if (persistedRow) {
        console.log(`📋 Usando dados persistidos para ${currentDateStr}: Km=${persistedRow.totalMileage}, Consumo=${persistedRow.totalConsumption}`);
        return persistedRow;
      }
    }
    
    // Se não há dados persistidos, criar linha offline
    console.log(`❌ Criando linha offline para ${currentDateStr}`);
    return this.createEmptyDailyRow(machineSerial, currentDate, 'Offline');
  }

  /**
   * Cria uma linha vazia para dias sem dados com status específico
   */
  static createEmptyDailyRow(
    machineSerial: string, 
    currentDate: Date, 
    status: 'Offline' | 'Erro' = 'Offline'
  ): ProcessedDayData {
    const emptyRow = {
      machineSerial,
      date: formatDateLocal(currentDate),
      status,
      totalMileage: 0,
      totalConsumption: 0,
      dailyMileage: 0,
      dailyConsumption: 0,
      consumptionPerKm: 0
    };
    
    // Persistir também dados vazios para manter continuidade
    if (status === 'Offline') {
      dataPersistence.updateLastValidData(machineSerial, emptyRow);
    }
    
    return emptyRow;
  }

  /**
   * Calcula os valores diários (diferença entre dias consecutivos) para quilometragem e consumo
   */
  static calculateDailyValues(data: ProcessedDayData[]): ProcessedDayData[] {
    // Ordenar por série e data
    const sortedData = [...data].sort((a, b) => {
      const serialCompare = a.machineSerial.localeCompare(b.machineSerial);
      if (serialCompare !== 0) return serialCompare;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Calcular diferenças para cada dispositivo separadamente
    const deviceGroups = new Map<string, ProcessedDayData[]>();
    
    // Agrupar por dispositivo
    for (const row of sortedData) {
      if (!deviceGroups.has(row.machineSerial)) {
        deviceGroups.set(row.machineSerial, []);
      }
      deviceGroups.get(row.machineSerial)!.push(row);
    }

    const processedData: ProcessedDayData[] = [];

    // Processar cada dispositivo
    for (const [machineSerial, deviceData] of deviceGroups) {
      console.log(`📊 Processando dispositivo ${machineSerial} com ${deviceData.length} registros`);
      
      if (deviceData.length > 0) {
        console.log(`📊 Valores totais: [${deviceData.map(d => d.totalMileage).join(', ')}]`);
        console.log(`📊 Datas ordenadas: [${deviceData.map(d => d.date).join(', ')}]`);
      }

      for (let i = 0; i < deviceData.length; i++) {
        const currentRow = { ...deviceData[i] };
        
        if (i === 0) {
          // CORREÇÃO: Para o primeiro dia, calcular diferença com valor base zero se não houver histórico
          // Isso evita que dados históricos contaminem o cálculo diário
          currentRow.dailyMileage = currentRow.totalMileage;
          currentRow.dailyConsumption = currentRow.totalConsumption;
          console.log(`📊 Primeiro dia ${currentRow.date}: usando valores totais como diários (Km=${currentRow.dailyMileage}, Consumo=${currentRow.dailyConsumption}) [HISTÓRICO]`);
        } else {
          // Calcular diferença com o dia anterior
          const previousRow = deviceData[i - 1];
          const dailyMileage = Math.max(0, currentRow.totalMileage - previousRow.totalMileage);
          const dailyConsumption = Math.max(0, currentRow.totalConsumption - previousRow.totalConsumption);
          
          currentRow.dailyMileage = dailyMileage;
          currentRow.dailyConsumption = dailyConsumption;
          
          console.log(`📊 Dia ${currentRow.date}: Total=${currentRow.totalMileage}, Anterior=${previousRow.totalMileage}, Diário=${dailyMileage}`);
        }

        // Calcular consumo por quilômetro
        currentRow.consumptionPerKm = currentRow.dailyMileage > 0 
          ? currentRow.dailyConsumption / currentRow.dailyMileage 
          : 0;

        processedData.push(currentRow);
      }

      if (deviceData.length > 0) {
        const calculatedData = deviceData.map((_, i) => 
          processedData.find(p => p.machineSerial === machineSerial && p.date === deviceData[i].date)?.dailyMileage || 0
        );
        console.log(`📊 Valores diários calculados: [${calculatedData.join(', ')}]`);
        console.log(`📊 Datas processadas: [${processedData.filter(p => p.machineSerial === machineSerial).map(p => p.date).join(', ')}]`);
      }
    }

    return processedData;
  }

  /**
   * Coleta dados para um dispositivo específico em um período
   */
  static async collectDeviceData(
    deviceId: string,
    startDate: Date,
    endDate: Date,
    includePreviousDays: number = 3
  ): Promise<ProcessedDayData[]> {
    const allData: ProcessedDayData[] = [];
    const machineSerial = apiService.getSerialNumber(deviceId);
    
    if (!apiService.isDeviceMapped(deviceId)) {
      console.warn(`Dispositivo ${deviceId} não encontrado no mapeamento de séries`);
    }

    // Definir a data de início real, considerando os dias históricos necessários
    const historicalStartDate = new Date(startDate);
    historicalStartDate.setDate(historicalStartDate.getDate() - includePreviousDays);
    
    let currentDate = new Date(historicalStartDate);
    
    console.log(`🚀 Iniciando coleta para dispositivo ${deviceId} (${machineSerial})`);
    console.log(`📅 Período solicitado: ${formatDateLocal(startDate)} a ${formatDateLocal(endDate)}`);
    console.log(`📅 Período com históricos: ${formatDateLocal(currentDate)} a ${formatDateLocal(endDate)} (${includePreviousDays} dias históricos)`);
    const dayBeforeStart = new Date(startDate.getTime() - 24*60*60*1000);
    console.log(`ℹ️  Dias históricos (${formatDateLocal(currentDate)} a ${formatDateLocal(dayBeforeStart)}) serão removidos do relatório final`);

    while (currentDate <= endDate) {
      try {
        // Obter dados históricos
        const historicalData = await apiService.getHistoricalData(deviceId, currentDate);

        if (historicalData === null) {
          // Se não há dados, criar linha offline
          console.warn(`Dispositivo ${deviceId} (${machineSerial}) offline em ${formatDateLocal(currentDate)} - criando linha com valores padrão`);
          
          const dailyRow = DataProcessor.createEmptyDailyRow(machineSerial, currentDate, 'Offline');
          allData.push(dailyRow);
        } else {
          // Processar dados do dia
          const dailyRow = DataProcessor.processHistoricalData(historicalData, machineSerial, currentDate);
          if (dailyRow) {
            allData.push(dailyRow);
          }
        }

      } catch (error) {
        console.error(`Erro ao processar dados para dispositivo ${deviceId} em ${formatDateLocal(currentDate)}:`, error);
        
        // Criar linha de erro com valores padrão
        const dailyRow = DataProcessor.createEmptyDailyRow(machineSerial, currentDate, 'Erro');
        allData.push(dailyRow);
      }
      
      // Avançar para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (allData.length === 0) {
      console.warn(`Nenhum dado processado para dispositivo ${deviceId} durante o período especificado.`);
      return [];
    }

    console.log(`Dados coletados para dispositivo ${deviceId} com ${allData.length} registros`);
    console.log(`🗓️  Datas coletadas: [${allData.map(d => d.date).join(', ')}]`);
    
    return allData;
  }

  /**
   * Coleta dados para múltiplos dispositivos
   */
  static async collectMultipleDevicesData(
    deviceIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<ProcessedDayData[]> {
    const allDevicesData: ProcessedDayData[] = [];
    
    console.log(`Iniciando coleta para ${deviceIds.length} dispositivos`);
    
    // Processar dispositivos sequencialmente para evitar sobrecarga da API
    for (const deviceId of deviceIds) {
      try {
        const deviceData = await this.collectDeviceData(deviceId, startDate, endDate);
        allDevicesData.push(...deviceData);
      } catch (error) {
        console.error(`Erro ao coletar dados do dispositivo ${deviceId}:`, error);
      }
    }
    
    // Calcular valores diários para todos os dados
    const processedData = this.calculateDailyValues(allDevicesData);
    
    console.log(`Coleta concluída: ${processedData.length} registros processados`);
    
    return processedData;
  }

  /**
   * Calcula resumo dos dados coletados baseado nos valores diários da tabela
   */
  static calculateSummary(data: ProcessedDayData[]): DailyDataSummary {
    if (data.length === 0) {
      return {
        totalDistance: 0,
        totalConsumption: 0,
        avgConsumptionPerKm: 0,
        avgDistance: 0,
        avgConsumption: 0,
        onlineCount: 0,
        offlineCount: 0,
        persistedCount: 0,
        errorCount: 0
      };
    }

    // Filtrar apenas dados com valores válidos para cálculos (ambos > 0)
    const validData = data.filter(d => d.dailyMileage > 0 && d.dailyConsumption > 0);
    
    console.log(`📊 Calculando resumo com ${validData.length} registros válidos de ${data.length} total`);
    
    // DISTÂNCIA TOTAL = Soma de "Distância (km)" da tabela
    const totalDistance = validData.reduce((sum, d) => sum + d.dailyMileage, 0);
    
    // CONSUMO TOTAL = Soma de "Consumo (kWh)" da tabela  
    const totalConsumption = validData.reduce((sum, d) => sum + d.dailyConsumption, 0);
    
    // DISTÂNCIA MÉDIA = Média de "Distância (km)" da tabela
    const avgDistance = validData.length > 0 ? totalDistance / validData.length : 0;
    
    // CONSUMO MÉDIO = Média de "Consumo (kWh)" da tabela
    const avgConsumption = validData.length > 0 ? totalConsumption / validData.length : 0;
    
    // EFICIÊNCIA ENERGÉTICA = Média de "Eficiência (kWh/km)" da tabela
    const avgConsumptionPerKm = validData.length > 0 
      ? validData.reduce((sum, d) => sum + d.consumptionPerKm, 0) / validData.length 
      : 0;
    
    // Contadores de status
    const onlineCount = data.filter(d => d.status === 'Online').length;
    const offlineCount = data.filter(d => d.status === 'Offline').length;
    const persistedCount = data.filter(d => d.status === 'Persistido').length;
    const errorCount = data.filter(d => d.status === 'Erro').length;

    console.log(`📈 Resumo calculado:`);
    console.log(`   • Distância Total: ${totalDistance.toFixed(0)} km (soma dos valores diários)`);
    console.log(`   • Consumo Total: ${totalConsumption.toFixed(2)} kWh (soma dos valores diários)`);
    console.log(`   • Distância Média: ${avgDistance.toFixed(0)} km/dia (média dos valores diários)`);
    console.log(`   • Consumo Médio: ${avgConsumption.toFixed(2)} kWh/dia (média dos valores diários)`);
    console.log(`   • Eficiência Média: ${avgConsumptionPerKm.toFixed(3)} kWh/km (média das eficiências)`);

    return {
      totalDistance,
      totalConsumption,
      avgConsumptionPerKm,
      avgDistance,
      avgConsumption,
      onlineCount,
      offlineCount,
      persistedCount,
      errorCount
    };
  }



  /**
   * Filtra dados por período específico (remove dados históricos usados apenas para cálculo)
   */
  static filterDataByPeriod(data: ProcessedDayData[], startDate: Date, endDate: Date): ProcessedDayData[] {
    // Normalizar datas para comparação (apenas ano-mês-dia, sem horário)
    // Usar formatação local para evitar problemas de timezone
    const startDateStr = formatDateLocal(startDate);
    const endDateStr = formatDateLocal(endDate);
    
    console.log(`🔍 Filtrando período: ${startDateStr} a ${endDateStr}`);
    
    const filteredData = data.filter(d => {
      // Comparar apenas as strings de data (YYYY-MM-DD)
      const dataDateStr = d.date; // Já está no formato YYYY-MM-DD
      const isInPeriod = dataDateStr >= startDateStr && dataDateStr <= endDateStr;
      
      if (!isInPeriod) {
        console.log(`📅 Removendo data fora do período: ${dataDateStr} (${d.machineSerial})`);
      }
      
      return isInPeriod;
    });
    
    console.log(`📊 Filtragem de período: ${data.length} registros → ${filteredData.length} no período`);
    return filteredData;
  }

  /**
   * Filtra linhas com valores zero do relatório final
   * Remove registros onde distância diária OU consumo diário são zero
   */
  static filterValidDataForReport(data: ProcessedDayData[]): ProcessedDayData[] {
    const filteredData = data.filter(d => {
      // Manter apenas registros com valores diários > 0
      const hasValidDistance = d.dailyMileage > 0;
      const hasValidConsumption = d.dailyConsumption > 0;
      
      // Para incluir no relatório, deve ter AMBOS os valores > 0
      const isValid = hasValidDistance && hasValidConsumption;
      
      if (!isValid) {
        console.log(`🚫 Removendo do relatório ${d.date} (${d.machineSerial}): Km diário=${d.dailyMileage}, Consumo diário=${d.dailyConsumption}`);
      }
      
      return isValid;
    });
    
    console.log(`📊 Relatório: ${data.length} registros → ${filteredData.length} registros válidos (${data.length - filteredData.length} removidos)`);
    
    return filteredData;
  }

  /**
   * Agrupa dados por dispositivo
   */
  static groupDataByDevice(data: ProcessedDayData[]): Map<string, ProcessedDayData[]> {
    const deviceGroups = new Map<string, ProcessedDayData[]>();
    
    for (const row of data) {
      if (!deviceGroups.has(row.machineSerial)) {
        deviceGroups.set(row.machineSerial, []);
      }
      deviceGroups.get(row.machineSerial)!.push(row);
    }
    
    return deviceGroups;
  }

  /**
   * Obtém estatísticas por dispositivo
   */
  static getDeviceStatistics(data: ProcessedDayData[]): Map<string, DailyDataSummary> {
    const deviceGroups = this.groupDataByDevice(data);
    const deviceStats = new Map<string, DailyDataSummary>();
    
    for (const [machineSerial, deviceData] of deviceGroups) {
      const summary = this.calculateSummary(deviceData);
      deviceStats.set(machineSerial, summary);
    }
    
    return deviceStats;
  }
}

// DataProcessor já foi exportado como classe acima
