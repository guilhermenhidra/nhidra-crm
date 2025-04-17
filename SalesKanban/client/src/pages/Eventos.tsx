import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Interface para Evento
interface Evento {
  id: number;
  titulo: string;
  data: Date;
  horario: string;
  duracao: string;
  descricao: string;
  tipo: "reuniao" | "tarefa" | "ligacao";
  contatos: string[];
}

// Dados de exemplo
const eventosIniciais: Evento[] = [
  {
    id: 1,
    titulo: "Reunião com Empresa Tech",
    data: addDays(new Date(), 1),
    horario: "10:00",
    duracao: "1h",
    descricao: "Apresentação da proposta comercial",
    tipo: "reuniao",
    contatos: ["Ana Ferreira"]
  },
  {
    id: 2,
    titulo: "Ligação para follow-up",
    data: addDays(new Date(), 3),
    horario: "14:30",
    duracao: "30min",
    descricao: "Follow-up sobre a proposta enviada",
    tipo: "ligacao",
    contatos: ["João Oliveira"]
  },
  {
    id: 3,
    titulo: "Preparar documentação",
    data: new Date(),
    horario: "09:00",
    duracao: "2h",
    descricao: "Preparar documentação do contrato",
    tipo: "tarefa",
    contatos: []
  }
];

// Componente para o evento na timeline
interface EventoItemProps {
  evento: Evento;
  onClick: () => void;
}

function EventoItem({ evento, onClick }: EventoItemProps) {
  const getBadgeVariant = () => {
    switch (evento.tipo) {
      case "reuniao": return "default";
      case "ligacao": return "outline";
      case "tarefa": return "secondary";
      default: return "default";
    }
  };
  
  const getTipoLabel = () => {
    switch (evento.tipo) {
      case "reuniao": return "Reunião";
      case "ligacao": return "Ligação";
      case "tarefa": return "Tarefa";
      default: return "Evento";
    }
  };
  
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <Badge variant={getBadgeVariant() as any}>{getTipoLabel()}</Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {evento.horario} ({evento.duracao})
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <CardTitle className="text-base mb-1">{evento.titulo}</CardTitle>
        {evento.contatos.length > 0 && (
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Users className="h-3.5 w-3.5 mr-1" />
            {evento.contatos.join(", ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>(eventosIniciais);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Evento>>({
    titulo: "",
    data: new Date(),
    horario: "09:00",
    duracao: "1h",
    descricao: "",
    tipo: "reuniao",
    contatos: []
  });
  
  const { toast } = useToast();
  
  // Calcular o final da semana
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  
  // Obter todos os dias da semana atual
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: currentWeekEnd
  });
  
  // Mostrar a próxima semana
  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };
  
  // Mostrar a semana anterior
  const prevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };
  
  // Filtrar eventos para o dia selecionado
  const eventosNoDia = eventos.filter(evento => 
    isSameDay(new Date(evento.data), selectedDate)
  );
  
  // Resetar o formulário de novo evento
  const resetNewEventForm = () => {
    setNewEvent({
      titulo: "",
      data: new Date(),
      horario: "09:00",
      duracao: "1h",
      descricao: "",
      tipo: "reuniao",
      contatos: []
    });
  };
  
  // Adicionar novo evento
  const addNewEvent = () => {
    if (!newEvent.titulo) {
      toast({
        title: "Erro ao criar evento",
        description: "O título é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    const evento: Evento = {
      id: eventos.length + 1,
      titulo: newEvent.titulo!,
      data: newEvent.data || new Date(),
      horario: newEvent.horario || "09:00",
      duracao: newEvent.duracao || "1h",
      descricao: newEvent.descricao || "",
      tipo: newEvent.tipo as "reuniao" | "tarefa" | "ligacao" || "reuniao",
      contatos: newEvent.contatos || []
    };
    
    setEventos([...eventos, evento]);
    setIsEventDialogOpen(false);
    resetNewEventForm();
    
    toast({
      title: "Evento criado",
      description: "O evento foi adicionado com sucesso.",
    });
  };
  
  // Visualizar evento existente
  const viewEvent = (evento: Evento) => {
    setSelectedEvent(evento);
    setIsEventDialogOpen(true);
  };
  
  return (
    <div className="flex-1 p-8 pt-6 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Calendário</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          
          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center" onClick={() => {
                setSelectedEvent(null);
                resetNewEventForm();
              }}>
                <Plus className="h-5 w-5 mr-2" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {selectedEvent ? "Detalhes do Evento" : "Criar Novo Evento"}
                </DialogTitle>
                <DialogDescription>
                  {selectedEvent 
                    ? "Visualize os detalhes do evento" 
                    : "Adicione um novo evento ao seu calendário"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Título</label>
                  <Input
                    id="title"
                    value={selectedEvent ? selectedEvent.titulo : newEvent.titulo}
                    onChange={(e) => !selectedEvent && setNewEvent({...newEvent, titulo: e.target.value})}
                    readOnly={!!selectedEvent}
                    placeholder="Título do evento"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data</label>
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={!!selectedEvent}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedEvent 
                            ? format(new Date(selectedEvent.data), "PPP", { locale: ptBR })
                            : format(newEvent.data || new Date(), "PPP", { locale: ptBR })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedEvent ? new Date(selectedEvent.data) : newEvent.data}
                          onSelect={(date) => {
                            if (!selectedEvent && date) {
                              setNewEvent({...newEvent, data: date});
                            }
                            setIsDatePickerOpen(false);
                          }}
                          initialFocus
                          disabled={!!selectedEvent}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <Select
                      value={selectedEvent ? selectedEvent.tipo : newEvent.tipo}
                      onValueChange={(value) => !selectedEvent && setNewEvent({...newEvent, tipo: value as any})}
                      disabled={!!selectedEvent}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                        <SelectItem value="ligacao">Ligação</SelectItem>
                        <SelectItem value="tarefa">Tarefa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="time" className="text-sm font-medium">Horário</label>
                    <Input
                      id="time"
                      type="time"
                      value={selectedEvent ? selectedEvent.horario : newEvent.horario}
                      onChange={(e) => !selectedEvent && setNewEvent({...newEvent, horario: e.target.value})}
                      disabled={!!selectedEvent}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="duration" className="text-sm font-medium">Duração</label>
                    <Select
                      value={selectedEvent ? selectedEvent.duracao : newEvent.duracao}
                      onValueChange={(value) => !selectedEvent && setNewEvent({...newEvent, duracao: value})}
                      disabled={!!selectedEvent}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Duração" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15min">15 minutos</SelectItem>
                        <SelectItem value="30min">30 minutos</SelectItem>
                        <SelectItem value="1h">1 hora</SelectItem>
                        <SelectItem value="1h30min">1 hora e 30 minutos</SelectItem>
                        <SelectItem value="2h">2 horas</SelectItem>
                        <SelectItem value="3h">3 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contact" className="text-sm font-medium">Contatos</label>
                  <Input
                    id="contact"
                    value={selectedEvent ? selectedEvent.contatos.join(", ") : newEvent.contatos?.join(", ") || ""}
                    onChange={(e) => !selectedEvent && setNewEvent({
                      ...newEvent, 
                      contatos: e.target.value.split(",").map(c => c.trim()).filter(Boolean)
                    })}
                    disabled={!!selectedEvent}
                    placeholder="Nome dos contatos (separados por vírgula)"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Descrição</label>
                  <textarea
                    id="description"
                    className={`w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ${
                      selectedEvent ? 'opacity-70' : ''
                    }`}
                    value={selectedEvent ? selectedEvent.descricao : newEvent.descricao}
                    onChange={(e) => !selectedEvent && setNewEvent({...newEvent, descricao: e.target.value})}
                    disabled={!!selectedEvent}
                    placeholder="Detalhes do evento"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                  {selectedEvent ? "Fechar" : "Cancelar"}
                </Button>
                {!selectedEvent && (
                  <Button onClick={addNewEvent}>
                    Criar Evento
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Calendário semanal */}
      <Card className="mb-6">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>Agenda</CardTitle>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={prevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(currentWeekStart, "d 'de' MMMM", { locale: ptBR })} — 
                {format(currentWeekEnd, " d 'de' MMMM", { locale: ptBR })}
              </span>
              <Button variant="outline" size="icon" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div key={day.toString()} className="text-center">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full flex flex-col py-2 h-auto",
                    isSameDay(day, selectedDate) && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setSelectedDate(day)}
                >
                  <span className="text-sm font-medium">
                    {format(day, "EEEEEE", { locale: ptBR })}
                  </span>
                  <span className="text-2xl">
                    {format(day, "d", { locale: ptBR })}
                  </span>
                </Button>
                <div className="mt-1 h-2">
                  {eventos.some(evento => isSameDay(new Date(evento.data), day)) && (
                    <div className="w-2 h-2 rounded-full bg-primary mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de eventos do dia */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            Eventos para {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventosNoDia.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p>Nenhum evento para este dia.</p>
              <Button className="mt-4" variant="outline" onClick={() => {
                setSelectedEvent(null);
                resetNewEventForm();
                setNewEvent({...newEvent, data: selectedDate});
                setIsEventDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar evento
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {eventosNoDia
                .sort((a, b) => a.horario.localeCompare(b.horario))
                .map((evento) => (
                  <EventoItem
                    key={evento.id}
                    evento={evento}
                    onClick={() => viewEvent(evento)}
                  />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}