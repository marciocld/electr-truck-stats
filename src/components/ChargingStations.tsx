import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Battery, 
  Zap, 
  MapPin, 
  Clock,
  Plus,
  AlertCircle,
  CheckCircle2,
  Settings
} from "lucide-react";

export const ChargingStations = () => {
  const stations = [
    {
      id: "CS-001",
      name: "Estação Principal",
      location: "Base Operacional",
      totalPorts: 8,
      activePorts: 5,
      availablePorts: 3,
      status: "Operacional",
      powerOutput: "150kW",
      efficiency: 98,
      statusColor: "bg-electric-green",
      vehicles: [
        { id: "ET-002", batteryLevel: 67, estimatedTime: "45 min" },
        { id: "ET-007", batteryLevel: 34, estimatedTime: "1h 20min" },
        { id: "ET-012", batteryLevel: 89, estimatedTime: "15 min" },
        { id: "ET-018", batteryLevel: 45, estimatedTime: "1h 05min" },
        { id: "ET-023", batteryLevel: 72, estimatedTime: "35 min" }
      ]
    },
    {
      id: "CS-002",
      name: "Estação Centro",
      location: "Terminal Centro",
      totalPorts: 6,
      activePorts: 2,
      availablePorts: 4,
      status: "Operacional",
      powerOutput: "120kW",
      efficiency: 96,
      statusColor: "bg-electric-green",
      vehicles: [
        { id: "ET-005", batteryLevel: 23, estimatedTime: "1h 45min" },
        { id: "ET-014", batteryLevel: 56, estimatedTime: "55 min" }
      ]
    },
    {
      id: "CS-003",
      name: "Estação Norte",
      location: "Terminal Norte",
      totalPorts: 4,
      activePorts: 1,
      availablePorts: 2,
      status: "Manutenção",
      powerOutput: "100kW",
      efficiency: 85,
      statusColor: "bg-electric-yellow",
      vehicles: [
        { id: "ET-009", batteryLevel: 78, estimatedTime: "25 min" }
      ]
    }
  ];

  const getTotalStats = () => {
    const totalPorts = stations.reduce((sum, station) => sum + station.totalPorts, 0);
    const activePorts = stations.reduce((sum, station) => sum + station.activePorts, 0);
    const availablePorts = stations.reduce((sum, station) => sum + station.availablePorts, 0);
    
    return { totalPorts, activePorts, availablePorts };
  };

  const { totalPorts, activePorts, availablePorts } = getTotalStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Estações de Carregamento</h2>
          <p className="text-muted-foreground">Monitoramento e gestão das estações de carregamento</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Estação
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Portas</p>
                <p className="text-2xl font-bold">{totalPorts}</p>
              </div>
              <Zap className="h-8 w-8 text-electric-blue" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Uso</p>
                <p className="text-2xl font-bold text-electric-yellow">{activePorts}</p>
              </div>
              <Battery className="h-8 w-8 text-electric-yellow" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold text-electric-green">{availablePorts}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-electric-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Uso</p>
                <p className="text-2xl font-bold">{Math.round((activePorts / totalPorts) * 100)}%</p>
              </div>
              <div className="h-8 w-8 bg-electric-blue/20 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-electric-blue rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {stations.map((station) => (
          <Card key={station.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{station.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {station.location}
                  </CardDescription>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${station.statusColor} text-white border-none`}
                >
                  {station.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold">{station.totalPorts}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-electric-yellow">{station.activePorts}</div>
                  <div className="text-xs text-muted-foreground">Em Uso</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-electric-green">{station.availablePorts}</div>
                  <div className="text-xs text-muted-foreground">Livres</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Eficiência</span>
                  <span className="text-sm font-bold">{station.efficiency}%</span>
                </div>
                <Progress value={station.efficiency} className="h-2" />
              </div>

              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potência:</span>
                  <span className="font-medium">{station.powerOutput}</span>
                </div>
              </div>

              {station.vehicles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Veículos Carregando:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {station.vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex justify-between items-center text-xs p-2 bg-muted/50 rounded">
                        <span className="font-medium">{vehicle.id}</span>
                        <div className="flex items-center gap-2">
                          <span>{vehicle.batteryLevel}%</span>
                          <Clock className="h-3 w-3" />
                          <span className="text-muted-foreground">{vehicle.estimatedTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar Estação
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};