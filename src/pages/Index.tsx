import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Truck, 
  Battery, 
  Zap, 
  Leaf, 
  TrendingUp, 
  MapPin,
  Clock,
  BarChart3,
  Users,
  DollarSign,
  FileText
} from "lucide-react";
import { StatsCards } from "@/components/StatsCards";
import { ChargingStations } from "@/components/ChargingStations";
import { FleetOverview } from "@/components/FleetOverview";
import { PerformanceChart } from "@/components/PerformanceChart";
import { ReportGenerator } from "@/components/ReportGenerator";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-electric-blue via-electric-green to-electric-purple">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Truck className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              Estatísticas de Caminhões Elétricos
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Monitore sua frota elétrica em tempo real. Dados de performance, 
              eficiência energética e impacto ambiental em um só lugar.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-lg bg-white/20 text-white border-white/30">
                <Zap className="h-4 w-4 mr-2" />
                100% Elétrico
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-lg bg-white/20 text-white border-white/30">
                <Leaf className="h-4 w-4 mr-2" />
                Zero Emissões
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-lg bg-white/20 text-white border-white/30">
                <TrendingUp className="h-4 w-4 mr-2" />
                Economia Inteligente
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="fleet" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Frota
            </TabsTrigger>
            <TabsTrigger value="charging" className="flex items-center gap-2">
              <Battery className="h-4 w-4" />
              Carregamento
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-8">
              <StatsCards />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Battery className="h-5 w-5 text-electric-green" />
                      Status da Bateria - Frota
                    </CardTitle>
                    <CardDescription>
                      Nível médio de carga da frota em tempo real
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Nível Médio</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <Progress value={87} className="h-3" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-electric-green">23</div>
                        <div className="text-sm text-muted-foreground">Carregados</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-electric-yellow">5</div>
                        <div className="text-sm text-muted-foreground">Carregando</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-electric-blue">2</div>
                        <div className="text-sm text-muted-foreground">Em Rota</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-electric-green" />
                      Impacto Ambiental
                    </CardTitle>
                    <CardDescription>
                      Redução de CO2 este mês
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-electric-green">2.4t</div>
                        <div className="text-sm text-muted-foreground">CO2 não emitido</div>
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        Equivale a plantar <span className="font-medium text-electric-green">109 árvores</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fleet">
            <FleetOverview />
          </TabsContent>

          <TabsContent value="charging">
            <ChargingStations />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceChart />
          </TabsContent>

          <TabsContent value="reports">
            <ReportGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
