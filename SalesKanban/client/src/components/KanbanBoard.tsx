import { useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useMutation } from "@tanstack/react-query";
import { STAGES, type Contact } from "@shared/schema";
import KanbanColumn from "@/components/KanbanColumn";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface KanbanBoardProps {
  contacts: Contact[];
  isLoading: boolean;
}

export default function KanbanBoard({ contacts, isLoading }: KanbanBoardProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isNewStageOpen, setIsNewStageOpen] = useState(false);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [newStageName, setNewStageName] = useState("");

  const handleAddStage = () => {
    if (newStageName.trim()) {
      // Aqui você pode implementar a lógica para adicionar a nova etapa
      toast({
        title: "Nova etapa adicionada",
        description: `A etapa "${newStageName}" foi adicionada com sucesso.`
      });
      setNewStageName("");
      setIsNewStageOpen(false);
    }
  };

  // Organize contacts by stage
  const contactsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = contacts.filter(contact => contact.stage === stage);
    return acc;
  }, {} as Record<string, Contact[]>);

  // Move contact mutation
  const moveMutation = useMutation({
    mutationFn: async ({ contactId, stage }: { contactId: number; stage: string }) => {
      const res = await apiRequest("PATCH", `/api/contacts/${contactId}/move`, { stage });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao mover contato",
        description: error.message,
        variant: "destructive",
      });
      // Refresh to restore the original state
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    },
  });

  // Handle drag end
  const onDragEnd = (result: DropResult) => {
    setIsDragging(false);
    
    const { destination, source, draggableId } = result;

    // No destination or same destination - do nothing
    if (!destination || 
        (destination.droppableId === source.droppableId && 
        destination.index === source.index)) {
      return;
    }

    // Get the contact ID from the draggableId
    const contactId = Number(draggableId);
    
    // Move the contact to the new stage
    moveMutation.mutate({
      contactId,
      stage: destination.droppableId,
    });
  };

  // Show loading skeleton when loading
  if (isLoading) {
    return (
      <div className="flex space-x-4 overflow-x-auto pb-6 h-full">
        {STAGES.map((stage) => (
          <div key={stage} className="bg-gray-100 rounded-lg flex flex-col shadow min-w-[300px] max-w-[300px]">
            <div className="p-3 border-b border-gray-200 bg-white rounded-t-lg">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-2 flex-1 overflow-y-auto space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext
      onDragStart={() => setIsDragging(true)}
      onDragEnd={onDragEnd}
      className="h-full flex flex-col"
    >
      <div className="flex-1 p-8 pt-4 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-end gap-2 mb-6">
          <Button onClick={() => setIsNewContactOpen(true)} className="bg-[hsl(267,75%,50%)] text-white hover:bg-[hsl(267,75%,45%)]">
            <Plus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
          <Button onClick={() => setIsNewStageOpen(true)} className="bg-[hsl(150,76%,35%)] text-white hover:bg-[hsl(150,76%,30%)]">
            <Plus className="h-4 w-4 mr-2" />
            Nova Etapa
          </Button>
        </div>
        <Dialog open={isNewStageOpen} onOpenChange={setIsNewStageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Etapa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input 
                placeholder="Nome da etapa"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
              />
              <Button onClick={handleAddStage} className="w-full">
                Adicionar Etapa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="kanban-columns-container flex gap-4 overflow-x-auto pb-6 h-full mt-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            contacts={contactsByStage[stage] || []}
            isDragging={isDragging}
          />
        ))}
      </div>
      </div>
    </DragDropContext>
  );
}
