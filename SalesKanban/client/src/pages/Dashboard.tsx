import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, DollarSign, FolderMinus, Target, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Contact } from "@shared/schema";

// Dados do gráfico de exemplo
const faturamentoData = [
  { month: "Jan", valor: 4000 },
  { month: "Fev", valor: 3000 },
  { month: "Mar", valor: 5000 },
  { month: "Abr", valor: 2780 },
  { month: "Mai", valor: 1890 },
  { month: "Jun", valor: 2390 },
  { month: "Jul", valor: 3490 },
  { month: "Ago", valor: 2000 },
  { month: "Set", valor: 2780 },
  { month: "Out", valor: 1890 },
  { month: "Nov", valor: 3578 },
  { month: "Dez", valor: 5908 },
];

// Componente do cartão de estatísticas
interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center mt-1">
            <div
              className={`text-xs font-medium ${
                trend.isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState("12");
  const [selectedYear, setSelectedYear] = useState("2023");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  
  // Buscar dados de contatos para estatísticas
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });
  
  // Calcular estatísticas
  const totalLeads = contacts.length;
  const activeLeads = contacts.filter(c => c.stage !== "fechado").length;
  const closedLeads = contacts.filter(c => c.stage === "fechado").length;
  const lostLeads = totalLeads - closedLeads - activeLeads;
  
  // Calcular valores das vendas
  const totalSalesValue = contacts
    .filter(c => c.stage === "fechado")
    .reduce((sum, contact) => sum + (contact.value || 0), 0);
    
  const openSalesValue = contacts
    .filter(c => c.stage !== "fechado" && c.value !== null && c.value !== undefined)
    .reduce((sum, contact) => sum + (contact.value || 0), 0);
  
  // Calcular taxa de conversão
  const conversionRate = totalLeads > 0 
    ? ((closedLeads / totalLeads) * 100).toFixed(1) 
    : "0.0";
  
  // Função auxiliar para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  // Meses para seleção
  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];
  
  // Anos para seleção
  const years = [
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
  ];
  
  // Manipuladores do mês
  const nextMonth = () => {
    const currentMonth = parseInt(selectedMonth);
    if (currentMonth === 12) {
      setSelectedMonth("1");
      setSelectedYear((parseInt(selectedYear) + 1).toString());
    } else {
      setSelectedMonth((currentMonth + 1).toString());
    }
  };
  
  const prevMonth = () => {
    const currentMonth = parseInt(selectedMonth);
    if (currentMonth === 1) {
      setSelectedMonth("12");
      setSelectedYear((parseInt(selectedYear) - 1).toString());
    } else {
      setSelectedMonth((currentMonth - 1).toString());
    }
  };
  
  return (
    <div className="flex-1 p-8 pt-6 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Tabs defaultValue="month" onValueChange={setSelectedPeriod}>
            <TabsList>
              <TabsTrigger value="day">Dia</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="year">Ano</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Leads"
          value={totalLeads}
          description="Lead mensal"
          icon={<Users className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Leads Ativos"
          value={activeLeads}
          description="Em negociação"
          icon={<Target className="h-4 w-4" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Perdidos"
          value={lostLeads}
          description="Leads perdidos no mês"
          icon={<Trash2 className="h-4 w-4" />}
          trend={{ value: 2, isPositive: false }}
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${conversionRate}%`}
          description="De leads para clientes"
          icon={<FolderMinus className="h-4 w-4" />}
          trend={{ value: 10, isPositive: true }}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <StatCard
          title="Vendas Realizadas"
          value={formatCurrency(totalSalesValue)}
          description="Total de vendas no mês"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 20, isPositive: true }}
        />
        <StatCard
          title="Vendas em Aberto"
          value={formatCurrency(openSalesValue)}
          description="Valor de vendas em negociação"
          icon={<Calendar className="h-4 w-4" />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>
      
      {/* Gráfico de faturamento */}
      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Faturamento</CardTitle>
              <CardDescription>
                Gráfico de faturamento mensal
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={faturamentoData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${formatCurrency(value)}`, 'Valor']} />
                  <Area
                    type="monotone"
                    dataKey="valor"
                    stroke="hsl(267, 75%, 50%)"
                    fill="hsl(267, 75%, 50%, 0.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}