import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

// Cores primárias disponíveis
const primaryColors = [
  { value: "hsl(267, 75%, 50%)", name: "Roxo" },  // Atual roxo
  { value: "hsl(214, 90%, 48%)", name: "Azul" },
  { value: "hsl(150, 76%, 47%)", name: "Verde" },
  { value: "hsl(344, 79%, 56%)", name: "Rosa" },
  { value: "hsl(17, 89%, 57%)", name: "Laranja" },
  { value: "hsl(45, 90%, 50%)", name: "Amarelo" },
];

export default function Configuracoes() {
  // Estados para as configurações do tema
  const [appearance, setAppearance] = useState("dark");
  const [primaryColor, setPrimaryColor] = useState("hsl(267, 75%, 50%)");
  const [radius, setRadius] = useState(0.6);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  
  // Função para aplicar o tema
  const applyTheme = async () => {
    try {
      // Aplicar tema via fetch
      const response = await fetch("/api/theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          variant: "professional",
          primary: primaryColor,
          appearance,
          radius
        })
      });
      
      if (response.ok) {
        toast({
          title: "Tema atualizado",
          description: "As configurações de tema foram aplicadas com sucesso.",
        });
        
        // Atualizando o arquivo theme.json via navegador
        window.location.reload();
      } else {
        toast({
          title: "Erro ao aplicar tema",
          description: "Não foi possível atualizar as configurações de tema.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao aplicar tema:", error);
      toast({
        title: "Erro ao aplicar tema",
        description: "Ocorreu um erro ao aplicar o tema.",
        variant: "destructive",
      });
    }
  };
  
  // Função para salvar configurações
  const saveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram salvas com sucesso.",
    });
  };

  return (
    <div className="flex-1 p-8 pt-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações.</p>
      </div>
      
      <Tabs defaultValue="appearance">
        <TabsList className="mb-4">
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="privacy">Privacidade</TabsTrigger>
        </TabsList>
        
        {/* Configurações de Aparência */}
        <TabsContent value="appearance">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Tema</CardTitle>
                <CardDescription>
                  Escolha entre tema claro ou escuro.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  defaultValue="dark" 
                  value={appearance}
                  onValueChange={setAppearance}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Claro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Escuro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">Sistema</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cor Primária</CardTitle>
                <CardDescription>
                  Escolha a cor principal do aplicativo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={primaryColor} onValueChange={setPrimaryColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {primaryColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {primaryColors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full transition-all ${
                        primaryColor === color.value 
                          ? "ring-2 ring-offset-2 ring-offset-background ring-primary" 
                          : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setPrimaryColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Raio de Borda</CardTitle>
                <CardDescription>
                  Ajuste o arredondamento dos elementos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Slider
                  value={[radius]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={(values) => setRadius(values[0])}
                  className="my-4"
                />
                <div className="flex justify-between">
                  <div>Sem arredondamento</div>
                  <div>Máximo</div>
                </div>
                <div className="mt-4">
                  <div
                    className="w-full h-10 bg-primary transition-all"
                    style={{ borderRadius: `${radius * 1}rem` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button className="mt-6" onClick={applyTheme}>
            Aplicar Tema
          </Button>
        </TabsContent>
        
        {/* Configurações de Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-base">Notificações no navegador</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações no navegador quando estiver online.
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-alerts" className="text-base">Alertas por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um resumo diário das atividades por email.
                  </p>
                </div>
                <Switch
                  id="email-alerts"
                  checked={emailAlerts}
                  onCheckedChange={setEmailAlerts}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sound-effects" className="text-base">Efeitos sonoros</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproduzir sons nas notificações e ações principais.
                  </p>
                </div>
                <Switch
                  id="sound-effects"
                  checked={soundEffects}
                  onCheckedChange={setSoundEffects}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Salvar configurações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Configurações de Privacidade */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacidade</CardTitle>
              <CardDescription>
                Gerencie suas configurações de privacidade.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Compartilhar estatísticas de uso</Label>
                  <p className="text-sm text-muted-foreground">
                    Ajude-nos a melhorar nosso produto enviando estatísticas anônimas.
                  </p>
                </div>
                <Switch
                  defaultChecked={true}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Cookies de terceiros</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir cookies de serviços externos.
                  </p>
                </div>
                <Switch
                  defaultChecked={false}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Histórico de atividades</Label>
                  <p className="text-sm text-muted-foreground">
                    Manter histórico de suas atividades no sistema.
                  </p>
                </div>
                <Switch
                  defaultChecked={true}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Salvar configurações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}