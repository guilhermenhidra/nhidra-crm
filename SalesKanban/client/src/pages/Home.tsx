import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import KanbanBoard from "@/components/KanbanBoard";
import FilterDropdown from "@/components/FilterDropdown";
import ContactForm from "@/components/ContactForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type Contact } from "@shared/schema";

export default function Home() {
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterMinValue, setFilterMinValue] = useState<number | undefined>(undefined);

  // Fetch all contacts
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });

  // Apply filters
  const filteredContacts = contacts.filter(contact => {
    // Filter by minimum value if specified
    if (filterMinValue !== undefined && (contact.value === null || contact.value < filterMinValue)) {
      return false;
    }
    
    // We don't have user/owner filtering implemented yet, so we skip that filter
    
    return true;
  });

  return (
    <div className="flex flex-col h-screen">

      {/* Main content */}
      <main className="flex-1 overflow-hidden h-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 h-full flex flex-col">
          <KanbanBoard contacts={filteredContacts} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
