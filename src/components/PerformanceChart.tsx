import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Battery, 
  Zap, 
  DollarSign,
  Calendar,
  Download,
  BarChart3
} from "lucide-react";

export const PerformanceChart = () => {
  const performanceData = {
    weekly: {
      energy: [
        { day: "Seg", consumption: 840, efficiency: 92 },
        { day: "Ter", consumption: 920, efficiency: 89 },
        { day: "Qua", consumption: 780, efficiency: 94 },
        { day: "Qui", consumption: 860, efficiency: 91 },
        { day: "Sex", consumption: 950, efficiency: 88 },
        { day: "Sáb", consumption: 650, efficiency: 96 },
        { day: "Dom", consumption: 420, efficiency: 98 }
      ],
      costs: {
        current: 23400,
        previous: 28900,
        savings: 5500
      }
    }
  };

  const kpis = [
    {
      title: "Eficiência Energética",
      value: "92.4%",
      change: "+2.1%",
      trend: "up",
      icon: Zap,
      color: "text-electric-green"
    },
    {
      title: "Consumo Médio",
      value: "0.82 kWh/km",
      change: "-0.05",
      trend: "down",
      icon: Battery,
      color: "text-electric-blue"
    },
    {
      title: "Economia Semanal",
      value: "R$ 5.5k",
      change: "+19%",
      trend: "up",
      icon: DollarSign,
      color: "text-electric-purple"
    },
    {
      title: "Disponibilidade",
      value: "96.7%",
      change: "+1.2%",
      trend: "up",
      icon: BarChart3,
      color: "text-electric-yellow"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Análise de Performance</h2>
          <p className="text-muted-foreground">Métricas detalhadas de eficiência e custos operacionais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Período
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const IconComponent = kpi.icon;
          const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown;
          const trendColor = kpi.trend === "up" ? "text-electric-green" : "text-destructive";
          
          return (
            <Card key={index} className="hover:shadow-electric-hover transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`h-5 w-5 ${kpi.color}`} />
                  <Badge variant={kpi.trend === "up" ? "default" : "destructive"} className="text-xs">
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {kpi.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Consumption Chart */}
        <Card className="hover:shadow-electric-hover transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-electric-blue" />
              Consumo Energético Semanal
            </CardTitle>
            <CardDescription>
              Consumo diário em kWh e eficiência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.weekly.energy.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium">{day.day}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{day.consumption} kWh</span>
                        <span className="text-xs text-muted-foreground">{day.efficiency}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-electric-blue h-2 rounded-full transition-all"
                          style={{ width: `${(day.consumption / 1000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card className="hover:shadow-electric-hover transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-electric-green" />
              Análise de Custos
            </CardTitle>
            <CardDescription>
              Comparativo semanal de gastos operacionais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-electric-green">
                    R$ {(performanceData.weekly.costs.current / 1000).toFixed(1)}k
                  </div>
                  <div className="text-sm text-muted-foreground">Esta Semana</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">
                    R$ {(performanceData.weekly.costs.previous / 1000).toFixed(1)}k
                  </div>
                  <div className="text-sm text-muted-foreground">Semana Anterior</div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-electric-green/10 rounded-lg border border-electric-green/20">
                <div className="text-3xl font-bold text-electric-green">
                  R$ {(performanceData.weekly.costs.savings / 1000).toFixed(1)}k
                </div>
                <div className="text-sm text-electric-green font-medium">Economia Total</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round((performanceData.weekly.costs.savings / performanceData.weekly.costs.previous) * 100)}% de redução
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Combustível vs Elétrico</span>
                  <span className="font-medium">R$ 3.2k/semana</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Manutenção Reduzida</span>
                  <span className="font-medium">R$ 1.8k/semana</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Incentivos Fiscais</span>
                  <span className="font-medium">R$ 0.5k/semana</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card className="hover:shadow-electric-hover transition-all duration-300">
        <CardHeader>
          <CardTitle>Análise Detalhada por Veículo</CardTitle>
          <CardDescription>
            Performance individual dos caminhões da frota
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: "ET-001", efficiency: 94, km: 1240, consumption: 0.78, cost: 890 },
              { id: "ET-002", efficiency: 91, km: 1180, consumption: 0.82, cost: 920 },
              { id: "ET-003", efficiency: 96, km: 1350, consumption: 0.75, cost: 850 },
              { id: "ET-004", efficiency: 89, km: 1100, consumption: 0.85, cost: 980 },
              { id: "ET-005", efficiency: 93, km: 1290, consumption: 0.79, cost: 875 }
            ].map((vehicle, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="font-medium">{vehicle.id}</div>
                  <Badge variant="secondary">{vehicle.efficiency}% eficiência</Badge>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{vehicle.km} km</div>
                    <div className="text-muted-foreground">Rodados</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{vehicle.consumption} kWh/km</div>
                    <div className="text-muted-foreground">Consumo</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-electric-green">R$ {vehicle.cost}</div>
                    <div className="text-muted-foreground">Custo Semanal</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};