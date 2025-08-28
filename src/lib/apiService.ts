/**
 * Serviço de API para integração com MachineLink Plus
 * Baseado no APIClient Python original
 * 
 * Autor: Adaptado para React/TypeScript
 */

import { formatDateLocal, formatDateForAPI } from './formatters';

export interface LoginResponse {
  success: boolean;
  data?: {
    userInfoClient?: {
      access_token: string;
    };
  };
  errMessage?: string;
}

export interface HistoricalDataResponse {
  success: boolean;
  data?: {
    payload?: {
      rows: Array<[string, number, number]>; // [timestamp, mileage, consumption]
    };
  };
  errMessage?: string;
}

export interface ProcessedDayData {
  machineSerial: string;
  date: string;
  status: 'Online' | 'Offline' | 'Erro' | 'Persistido';
  totalMileage: number;
  totalConsumption: number;
  dailyMileage: number;
  dailyConsumption: number;
  consumptionPerKm: number;
}

export interface DeviceMapping {
  [deviceId: string]: string; // deviceId -> serialNumber
}

// Configurações da API baseadas no config.py
const API_CONFIG = {
  BASE_URL: 'https://machinelink-plus.rootcloud.com/rmms',
  USERNAME: 'engenhariairmen',
  PASSWORD: 'QvQB/6nCjBh1Id8in21fEC/bggvoo6kEINyLLLdWIfA==',
  LOGIN_TIMEOUT: 300000, // 5 minutos
  REQUEST_TIMEOUT: 600000, // 10 minutos
  TOKEN_EXPIRATION_MINUTES: 40,
  API_DELAY_SECONDS: 2,
  TIMEZONE_OFFSET_HOURS: -3, // BRT (Brasília)
};

// URLs da API
const API_URLS = {
  LOGIN: `${API_CONFIG.BASE_URL}/auth/login`,
  HISTORICAL_DATA: `${API_CONFIG.BASE_URL}/metrics/historian-data`,
};

// Mapeamento de dispositivos (baseado no arquivo JSON)
const DEVICE_MAPPING: DeviceMapping = {
  "1346649": "KT090AE20444",
  "1346766": "KT090AE20561",
  "1346767": "KT090AE20562",
  "1346768": "KT090AE20563",
  "1346769": "KT090AE20564",
  "1437204": "KT090AE20171",
  "1346389": "KT090AE20172",
  "1346390": "KT090AE20173",
  "1346391": "KT090AE20174",
  "1346388": "KT090AE20170",
  "1346392": "KT090AE20175",
  "1346393": "KT090AE20176",
  "1346394": "KT090AE20177",
  "1346455": "KT090AE20235",
  "1346459": "KT090AE20239",
  "1346461": "KT090AE20241",
  "1346462": "KT090AE20242",
  "1346463": "KT090AE20243",
  "1346648": "KT090AE20443",
  "1346653": "KT090AE20448",
  "1346464": "KT090AE20244",
  "1346535": "KT090AE20316",
  "1346536": "KT090AE20317",
  "1347951": "KT090AE30714",
  "1347950": "KT090AE30713",
  "1346053": "KT090AE10374",
  "1346361": "KT090AE20136",
  "1347037": "KT090AE20834",
  "1347046": "KT090AE20843",
  "1347047": "KT090AE20844",
  "1347042": "KT090AE20839",
  "1347043": "KT090AE20840",
  "1347044": "KT090AE20841",
  "1347498": "KT090AE30036",
  "1347914": "KT090AE30647",
  "1347912": "KT090AE30645",
  "1347944": "KT090AE30707",
  "1347945": "KT090AE30708",
  "1635270": "LFXAH97W8R3012999",
  "1635271": "LFXAH97W9R3013000"
};

export class APIService {
  private accessToken: string | null = null;
  private tokenExpirationTime: Date | null = null;



  /**
   * Autentica na API MachineLink Plus e retorna token de acesso
   */
  async login(): Promise<string | null> {
    const payload = {
      username: API_CONFIG.USERNAME,
      password: API_CONFIG.PASSWORD,
      encrypted: true
    };

    const headers = {
      'Content-Type': 'application/json',
      'language': 'en-US'
    };

    console.log('Realizando autenticação na API...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.LOGIN_TIMEOUT);

      const response = await fetch(API_URLS.LOGIN, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LoginResponse = await response.json();

      if (!data || typeof data !== 'object') {
        console.error('Formato de resposta da API inválido.');
        return null;
      }

      if (data.success) {
        if (!data.data?.userInfoClient?.access_token) {
          console.error('Estrutura de dados inválida na resposta da API.');
          return null;
        }

        console.log('Autenticação realizada com sucesso.');
        this.accessToken = data.data.userInfoClient.access_token;
        this.tokenExpirationTime = new Date(Date.now() + API_CONFIG.TOKEN_EXPIRATION_MINUTES * 60 * 1000);
        return this.accessToken;
      }

      console.error(`Falha na autenticação: ${data.errMessage || 'Erro desconhecido'}`);
      return null;

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Timeout na requisição de login');
        } else {
          console.error(`Falha na requisição de login: ${error.message}`);
        }
      }
      return null;
    }
  }

  /**
   * Garante que temos um token de acesso válido, renovando se necessário
   */
  async ensureValidToken(): Promise<string | null> {
    if (!this.accessToken || (this.tokenExpirationTime && new Date() >= this.tokenExpirationTime)) {
      console.log('Token de acesso expirado ou ausente. Renovando...');
      return await this.login();
    }
    return this.accessToken;
  }

  /**
   * Recupera dados históricos para um dispositivo em uma data específica
   */
  async getHistoricalData(
    deviceId: string, 
    date: Date, 
    includePreviousDays: number = 0
  ): Promise<Array<[string, number, number]> | null> {
    const token = await this.ensureValidToken();
    if (!token) {
      console.error('Token de acesso inválido ou expirado.');
      return null;
    }

    try {
      // Calcular timestamps para consulta na API
      // A consulta deve ser feita considerando o período diário brasileiro (03:00 UTC até 02:59 UTC do dia seguinte)
      const startTimeLocal = new Date(date);
      startTimeLocal.setDate(startTimeLocal.getDate() - includePreviousDays);
      
      const endTimeLocal = new Date(date);

      // Formatar datas para o formato esperado pela API usando função consolidada
      const startTimeStr = formatDateForAPI(startTimeLocal, false); // Data de início
      const endTimeStr = formatDateForAPI(endTimeLocal, true);       // Data de fim

      const url = `${API_URLS.HISTORICAL_DATA}/${deviceId}?` +
        `startTime=${startTimeStr}&endTime=${endTimeStr}&` +
        `pageIndex=1&pageSize=200000&` +
        `properties=mileage,total_electric_consumption`;

      const headers = {
        'access_token': token,
        'Content-Type': 'application/json'
      };

      console.log(`Buscando dados históricos para dispositivo ${deviceId} em ${formatDateLocal(date)}`);
      console.log(`🔍 API Request - startTime: ${startTimeStr}, endTime: ${endTimeStr}`);
      console.log(`📅 Período BRT: ${formatDateLocal(startTimeLocal)} 00:00 até ${formatDateLocal(endTimeLocal)} 23:59`);

      // Delay entre requisições para evitar sobrecarga da API
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.API_DELAY_SECONDS * 1000));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HistoricalDataResponse = await response.json();

      if (!data || typeof data !== 'object') {
        console.error(`Resposta da API inválida para dispositivo ${deviceId}`);
        return null;
      }

      if (data.success) {
        if (!data.data || typeof data.data !== 'object') {
          console.error(`Estrutura de dados inválida para dispositivo ${deviceId}`);
          return null;
        }

        if (data.data.payload === null || data.data.payload === undefined) {
          console.log(`Nenhum dado encontrado para dispositivo ${deviceId} em ${formatDateLocal(date)}.`);
          return null;
        }

        const rows = data.data.payload.rows || [];

        if (!Array.isArray(rows)) {
          console.error(`Formato de dados inválido para dispositivo ${deviceId}`);
          return null;
        }

        console.log(`Dados obtidos com sucesso para dispositivo ${deviceId}`);
        return rows;
      }

      console.error(`Falha na requisição para dispositivo ${deviceId}: ${data.errMessage || 'Erro desconhecido'}`);
      return null;

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`Timeout na requisição para dispositivo ${deviceId}`);
        } else {
          console.error(`Falha na requisição para dispositivo ${deviceId}: ${error.message}`);
        }
      }
      return null;
    }
  }

  /**
   * Obtém o número de série para um ID de dispositivo
   */
  getSerialNumber(deviceId: string): string {
    return DEVICE_MAPPING[deviceId] || 'Série desconhecida';
  }

  /**
   * Retorna todos os dispositivos disponíveis
   */
  getAllDevices(): string[] {
    return Object.keys(DEVICE_MAPPING);
  }

  /**
   * Verifica se um dispositivo está mapeado
   */
  isDeviceMapped(deviceId: string): boolean {
    return deviceId in DEVICE_MAPPING;
  }
}

// Instância singleton do serviço
export const apiService = new APIService();
