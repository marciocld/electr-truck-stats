# Integração da API MachineLink Plus

## Visão Geral

Esta implementação replica o sistema de coleta e processamento de dados da aplicação Python original, adaptado para React/TypeScript. O sistema mantém a mesma lógica de autenticação, coleta de dados, persistência e cálculos.

## Arquivos Implementados

### 1. `apiService.ts`
- **Função**: Cliente da API MachineLink Plus
- **Baseado em**: `Scripts/api/api_client.py`
- **Funcionalidades**:
  - Autenticação com token de acesso
  - Renovação automática de token
  - Coleta de dados históricos
  - Mapeamento de dispositivos
  - Tratamento de erros e timeouts

### 2. `dataPersistence.ts`
- **Função**: Sistema de persistência de dados
- **Baseado em**: `Scripts/data/data_persister.py`
- **Funcionalidades**:
  - Persistência no localStorage
  - Gerenciamento de últimos dados válidos
  - Lógica de persistência por até 3 dias
  - Limpeza automática de dados antigos

### 3. `dataProcessor.ts`
- **Função**: Processamento e cálculo de métricas
- **Baseado em**: `Scripts/data/data_processor.py`
- **Funcionalidades**:
  - Cálculo de valores diários (diferença entre dias consecutivos)
  - Processamento de dados históricos
  - Cálculo de consumo por quilômetro
  - Geração de resumos e estatísticas
  - Tratamento de dados offline/erro

### 4. `useElectricTruckData.ts`
- **Função**: Hook React para gerenciamento de estado
- **Funcionalidades**:
  - Estado centralizado dos dados
  - Carregamento automático ou manual
  - Indicadores de progresso
  - Tratamento de erros
  - Utilitários para análise de dados

## Fluxo de Dados

1. **Autenticação**: O `APIService` autentica na API e gerencia tokens
2. **Coleta**: Para cada dispositivo e data, busca dados históricos
3. **Processamento**: Extrai último valor válido do dia e trata dados offline
4. **Persistência**: Salva últimos dados válidos para uso futuro
5. **Cálculos**: Calcula valores diários e métricas de eficiência
6. **Estado**: Hook atualiza componentes com dados processados

## Configurações da API

```typescript
const API_CONFIG = {
  BASE_URL: 'https://machinelink-plus.rootcloud.com/rmms',
  USERNAME: 'engenhariairmen',
  PASSWORD: 'QvQB/6nCjBh1Id8in21fEC/bggvoo6kEINyLLLdWIfA==',
  TOKEN_EXPIRATION_MINUTES: 40,
  API_DELAY_SECONDS: 2, // Delay entre requisições
  TIMEZONE_OFFSET_HOURS: -3, // BRT (Brasília)
};
```

## Tratamento de Status

O sistema implementa os mesmos status da aplicação Python:

- **Online**: Dados obtidos com sucesso da API
- **Offline**: Sem dados na API, valores zerados
- **Persistido**: Dados baseados no último valor válido (até 3 dias)
- **Erro**: Falha na requisição, valores zerados

## Uso nos Componentes

### StatsCards
- Carrega automaticamente dados dos primeiros 5 dispositivos
- Exibe métricas em tempo real
- Indicadores de progresso e tratamento de erro
- Atualização manual disponível

### ReportGenerator
- Interface para seleção de período
- Carregamento sob demanda
- Preview dos dados antes da geração do PDF
- Integração com dados reais da API

## Persistência de Dados

O sistema mantém os últimos dados válidos de cada dispositivo no localStorage:

```typescript
interface PersistedDeviceData {
  machineSerial: string;
  date: string;
  mileageTotal: number;
  consumptionTotal: number;
  lastUpdated: string;
}
```

## Cálculos Implementados

### Valores Diários
- **Quilometragem diária**: Diferença entre quilometragem total do dia atual e anterior
- **Consumo diário**: Diferença entre consumo total do dia atual e anterior
- **Consumo por km**: Consumo diário ÷ Quilometragem diária

### Métricas do Resumo
- **Total**: Soma de todos os valores diários
- **Médias**: Valores totais divididos pelo número de registros válidos
- **Eficiência**: Consumo total ÷ Distância total
- **Disponibilidade**: Percentual de registros online vs offline

## Tratamento de Erros

O sistema implementa tratamento robusto de erros:

1. **Timeout de requisições**: 10 minutos para dados históricos, 5 minutos para login
2. **Retry automático**: Token renovado automaticamente quando expira
3. **Fallback para offline**: Quando API não responde, cria registros offline
4. **Persistência inteligente**: Usa últimos dados válidos por até 3 dias
5. **Validação de dados**: Verifica estrutura e valores das respostas da API

## Performance

- **Processamento sequencial**: Evita sobrecarga da API (delay de 2s entre requisições)
- **Cache local**: Persistência reduz requisições desnecessárias
- **Indicadores visuais**: Progresso em tempo real durante coleta
- **Lazy loading**: Dados carregados apenas quando necessário

## Compatibilidade

A implementação mantém 100% de compatibilidade com a lógica da aplicação Python original:
- Mesmos cálculos e fórmulas
- Mesma estrutura de dados
- Mesmo tratamento de casos especiais
- Mesmas configurações de API e timeouts
