import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Truck, 
  Battery, 
  Zap, 
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  RefreshCw
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
      color: "text-electric-blue",
      bgColor: "bg-electric-blue/10",
      trend: `${summary.onlineCount + summary.offlineCount + summary.persistedCount} registros`
    },
    {
      title: "Consumo Total",
      value: isLoading ? "..." : formatConsumption(summary.totalConsumption),
      description: "Soma dos valores diários da tabela",
      icon: Battery,
      color: "text-electric-green",
      bgColor: "bg-electric-green/10",
      trend: `${formatDecimal1(summary.avgConsumption)} kWh/dia médio`
    },
    {
      title: "Eficiência Energética",
      value: isLoading ? "..." : formatEfficiency(summary.avgConsumptionPerKm),
      description: "Média das eficiências da tabela",
      icon: Zap,
      color: "text-electric-yellow",
      bgColor: "bg-electric-yellow/10",
      trend: summary.avgConsumptionPerKm < 0.2 ? "Excelente eficiência" : "Boa eficiência"
    },
    {
      title: "Distância Média",
      value: isLoading ? "..." : formatDistance(summary.avgDistance),
      description: "Média dos valores diários da tabela",
      icon: DollarSign,
      color: "text-electric-purple",
      bgColor: "bg-electric-purple/10",
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden hover:shadow-electric-hover transition-all duration-200">
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ) : (
                  <>
                    {/* Header com ícone */}
                    <div className="flex items-center justify-between mb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <IconComponent className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </div>
                    
                    {/* Valor principal */}
                    <div className="text-lg font-bold mb-2">{stat.value}</div>
                    
                    {/* Badge com trend */}
                    <Badge variant="outline" className="text-xs h-5 px-2">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.trend}
                    </Badge>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informações adicionais */}
      {!isLoading && lastUpdated && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
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