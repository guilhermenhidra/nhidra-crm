import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useMutation } from "@tanstack/react-query";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Phone, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type Contact } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ContactForm from "@/components/ContactForm";
import { AlertDialogCancel, AlertDialogHeader, AlertDialogAction, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

// Get color for value display
const getValueColor = (value: number | null | undefined) => {
  if (!value) return "bg-gray-100 text-gray-800";
  if (value < 10000) return "bg-blue-100 text-blue-800";
  if (value < 20000) return "bg-green-100 text-green-800";
  if (value < 30000) return "bg-purple-100 text-purple-800";
  return "bg-orange-100 text-orange-800";
};

interface ContactCardProps {
  contact: Contact;
  index: number;
}

export default function ContactCard({ contact, index }: ContactCardProps) {
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Format relative time
  const timeAgo = contact.updatedAt 
    ? formatDistanceToNow(new Date(contact.updatedAt), { 
        addSuffix: true, 
        locale: ptBR 
      })
    : "agora";

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contato excluído",
        description: "O contato foi excluído com sucesso.",
      });
      setIsDeleteOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao excluir contato: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(contact.id);
  };

  return (
    <>
      <Draggable draggableId={String(contact.id)} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn(
              "contact-card bg-white rounded-md shadow p-3",
              snapshot.isDragging && "opacity-70 transform scale-[1.02]"
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{contact.name}</h3>
                <p className="text-sm text-gray-500">{contact.company}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteOpen(true)}
                    className="text-red-600"
                  >
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="mt-2">
              {contact.phone && (
                <p className="text-xs text-gray-500 flex items-center">
                  <Phone className="h-3.5 w-3.5 mr-1" />
                  {contact.phone}
                </p>
              )}
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <Mail className="h-3.5 w-3.5 mr-1" />
                {contact.email}
              </p>
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
              <span className={cn("text-xs px-2 py-0.5 rounded-full", getValueColor(contact.value))}>
                {contact.value ? `R$ ${contact.value.toFixed(2)}` : 'Sem valor'}
              </span>
              <span className="text-xs text-gray-500">
                {contact.stage === 'fechado' ? `Fechado: ${timeAgo}` : `Atualizado: ${timeAgo}`}
              </span>
            </div>
          </div>
        )}
      </Draggable>

      {/* Edit Contact Dialog */}
      <AlertDialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <AlertDialogContent className="sm:max-w-lg">
          <ContactForm 
            contact={contact}
            onSuccess={() => setIsEditOpen(false)}
            title="Editar Contato"
          />
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o contato "{contact.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
