import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Battery, 
  Zap, 
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Users
} from "lucide-react";

export const StatsCards = () => {
  const stats = [
    {
      title: "Frota Total",
      value: "30",
      description: "Caminhões elétricos ativos",
      icon: Truck,
      color: "text-electric-blue",
      bgColor: "bg-electric-blue/10",
      trend: "+2 este mês"
    },
    {
      title: "Autonomia Média",
      value: "485 km",
      description: "Por carga completa",
      icon: Battery,
      color: "text-electric-green",
      bgColor: "bg-electric-green/10",
      trend: "+15km vs mês anterior"
    },
    {
      title: "Economia Mensal",
      value: "R$ 47.2k",
      description: "Vs combustível diesel",
      icon: DollarSign,
      color: "text-electric-purple",
      bgColor: "bg-electric-purple/10",
      trend: "23% de economia"
    },
    {
      title: "Eficiência Energética",
      value: "0.8 kWh/km",
      description: "Consumo médio",
      icon: Zap,
      color: "text-electric-yellow",
      bgColor: "bg-electric-yellow/10",
      trend: "Excelente performance"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden hover:shadow-electric-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <Badge variant="secondary" className="mt-2 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.trend}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};