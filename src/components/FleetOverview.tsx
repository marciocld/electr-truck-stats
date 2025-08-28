import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Truck, 
  Battery, 
  MapPin, 
  Clock,
  Settings,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export const FleetOverview = () => {
  const trucks = [
    {
      id: "ET-001",
      model: "Volvo FE Electric",
      batteryLevel: 95,
      status: "Em Trânsito",
      location: "São Paulo - Santos",
      driver: "João Silva",
      lastUpdate: "5 min",
      statusColor: "bg-electric-blue",
      statusIcon: Truck
    },
    {
      id: "ET-002",
      model: "Mercedes eActros",
      batteryLevel: 67,
      status: "Carregando",
      location: "Terminal Centro",
      driver: "Maria Santos",
      lastUpdate: "2 min",
      statusColor: "bg-electric-yellow",
      statusIcon: Battery
    },
    {
      id: "ET-003",
      model: "Scania 25P",
      batteryLevel: 89,
      status: "Disponível",
      location: "Base Principal",
      driver: "-",
      lastUpdate: "1 min",
      statusColor: "bg-electric-green",
      statusIcon: CheckCircle
    },
    {
      id: "ET-004",
      model: "DAF CF Electric",
      batteryLevel: 23,
      status: "Manutenção",
      location: "Oficina Técnica",
      driver: "-",
      lastUpdate: "15 min",
      statusColor: "bg-destructive",
      statusIcon: AlertTriangle
    },
    {
      id: "ET-005",
      model: "Iveco eDaily",
      batteryLevel: 78,
      status: "Em Trânsito",
      location: "Rio de Janeiro",
      driver: "Carlos Lima",
      lastUpdate: "3 min",
      statusColor: "bg-electric-blue",
      statusIcon: Truck
    },
    {
      id: "ET-006",
      model: "BYD T3",
      batteryLevel: 91,
      status: "Disponível",
      location: "Base Secundária",
      driver: "-",
      lastUpdate: "7 min",
      statusColor: "bg-electric-green",
      statusIcon: CheckCircle
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Visão Geral da Frota</h2>
          <p className="text-muted-foreground">Monitoramento em tempo real de todos os veículos</p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trucks.map((truck) => {
          const StatusIcon = truck.statusIcon;
          return (
            <Card key={truck.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{truck.id}</CardTitle>
                    <CardDescription>{truck.model}</CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${truck.statusColor} text-white border-none`}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {truck.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Bateria</span>
                    <span className="text-sm font-bold">{truck.batteryLevel}%</span>
                  </div>
                  <Progress 
                    value={truck.batteryLevel} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{truck.location}</span>
                  </div>
                  
                  {truck.driver !== "-" && (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-muted rounded-full flex items-center justify-center">
                        <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                      </div>
                      <span>{truck.driver}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Atualizado há {truck.lastUpdate}</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};