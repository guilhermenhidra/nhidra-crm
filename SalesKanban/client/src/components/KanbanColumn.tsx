import { Droppable } from "react-beautiful-dnd";
import { type Contact } from "@shared/schema";
import ContactCard from "@/components/ContactCard";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

// Map of stage colors
const stageColors: Record<string, string> = {
  lead: "bg-blue-500",
  contatado: "bg-yellow-500",
  apresentacao: "bg-purple-500",
  proposta: "bg-orange-500",
  fechado: "bg-green-500",
};

// Map of stage display names
const stageNames: Record<string, string> = {
  lead: "Lead",
  contatado: "Contatado",
  apresentacao: "Apresentação",
  proposta: "Proposta",
  fechado: "Fechado",
};

interface KanbanColumnProps {
  stage: string;
  contacts: Contact[];
  isDragging: boolean;
}

export default function KanbanColumn({ stage, contacts, isDragging }: KanbanColumnProps) {
  return (
    <div className="kanban-column bg-card rounded-lg flex flex-col min-w-[300px] max-w-[300px] h-full">
      <div className="p-3 bg-muted/50 rounded-t-lg group">
        <h2 className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center">
            <span className={cn("w-3 h-3 rounded-full mr-2", stageColors[stage])}></span>
            {stageNames[stage]}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden group-hover:flex items-center gap-1">
              <button className="p-1 hover:bg-gray-200 rounded">
                <Pencil className="h-4 w-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-200 rounded">
                <Trash2 className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {contacts.length}
            </span>
          </div>
        </h2>
      </div>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "p-3 flex-1 overflow-y-auto space-y-4 bg-background rounded-lg flex flex-col min-w-[300px] max-w-[300px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
              snapshot.isDraggingOver && "bg-accent"
            )}
          >
            {contacts.map((contact, index) => (
              <ContactCard 
                key={contact.id}
                contact={contact}
                index={index}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}