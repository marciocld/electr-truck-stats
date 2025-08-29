import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Truck, 
  Battery, 
  Zap, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  MapPin
} from "lucide-react";
import { useElectricTruckData } from "@/hooks/useElectricTruckData";
import { Button } from "@/components/ui/button";
import { DeviceSelector } from "@/components/DeviceSelector";
import { formatDistance, formatConsumption, formatEfficiency, formatPercentage, formatDecimal1 } from "@/lib/formatters";

interface StatsCardsProps {
  deviceIds?: string[];
  showDeviceSelector?: boolean;
  onDeviceSelectionChange?: (deviceIds: string[]) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  deviceIds = ["1635270", "1635271", "1346649", "1346766", "1346767"], // Primeiros 5 dispositivos como padrão
  showDeviceSelector = false,
  onDeviceSelectionChange
}) => {
  const { 
    summary, 
    isLoading, 
    error, 
    lastUpdated, 
    progress,
    loadData,
    reloadData 
  } = useElectricTruckData({
    autoLoad: true,
    deviceIds
  });

  // Calcular estatísticas baseadas nos dados reais da tabela
  const stats = [
    {
      title: "Distância Total",
      value: isLoading ? "..." : formatDistance(summary.totalDistance),
      description: "Soma dos valores diários da tabela",
      icon: Truck,
      color: "text-report-blue",
      bgColor: "bg-report-light-blue",
      trend: `${summary.onlineCount + summary.offlineCount + summary.persistedCount} registros`
    },
    {
      title: "Consumo Total",
      value: isLoading ? "..." : formatConsumption(summary.totalConsumption),
      description: "Soma dos valores diários da tabela",
      icon: Battery,
      color: "text-report-gray",
      bgColor: "bg-gray-100",
      trend: `${formatDecimal1(summary.avgConsumption)} kWh/dia médio`
    },
    {
      title: "Eficiência Energética",
      value: isLoading ? "..." : formatEfficiency(summary.avgConsumptionPerKm),
      description: "Média das eficiências da tabela",
      icon: Zap,
      color: "text-report-dark-blue",
      bgColor: "bg-report-light-blue/50",
      trend: summary.avgConsumptionPerKm < 0.2 ? "Excelente eficiência" : "Boa eficiência"
    },
    {
      title: "Distância Média",
      value: isLoading ? "..." : formatDistance(summary.avgDistance),
      description: "Média dos valores diários da tabela",
      icon: MapPin, // Ícone mais apropriado
      color: "text-report-gray",
      bgColor: "bg-gray-100",
      trend: `${summary.onlineCount} online, ${summary.offlineCount} offline`
    }
  ];

  // Renderizar erro se houver
  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <CardTitle className="text-sm font-medium text-red-600">
                Erro ao carregar dados
              </CardTitle>
            </div>
            <p className="text-xs text-red-600 mb-3">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={reloadData}
              className="flex items-center gap-2 h-8 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Seleção de Dispositivos - opcional */}
      {showDeviceSelector && onDeviceSelectionChange && (
        <DeviceSelector
          selectedDevices={deviceIds}
          onSelectionChange={onDeviceSelectionChange}
          maxSelections={10}
          showSerialNumbers={true}
        />
      )}

      {/* Indicador de progresso durante carregamento */}
      {isLoading && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Coletando dados da API...
                </p>
                {progress.total > 0 && (
                  <p className="text-xs text-blue-600">
                    {progress.currentDevice && `Processando: ${progress.currentDevice} `}
                    ({progress.current}/{progress.total})
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-report-dark-blue/10 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-report-gray">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-report-dark-blue">{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {lastUpdated && (
        <div className="text-xs text-center text-gray-500 mt-4">
          <span>
            Última atualização: {lastUpdated.toLocaleString('pt-BR')}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={reloadData}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Atualizar
          </Button>
        </div>
      )}
    </div>
  );
};