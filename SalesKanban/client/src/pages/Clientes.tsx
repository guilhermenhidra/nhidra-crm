import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Contact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  
  // Buscar todos os contatos
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });
  
  // Filtrar contatos baseado no termo de busca
  const filteredContacts = contacts.filter(contact => {
    if (searchTerm === "") return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchTermLower) ||
      (contact.company?.toLowerCase() || "").includes(searchTermLower) ||
      contact.email.toLowerCase().includes(searchTermLower)
    );
  });
  
  // Função para formatar o estágio do contato
  const formatStage = (stage: string) => {
    const stageMap: Record<string, { label: string, variant: "default" | "secondary" | "outline" | "destructive" | "success" }> = {
      lead: { label: "Lead", variant: "default" },
      contatado: { label: "Contatado", variant: "secondary" },
      apresentacao: { label: "Apresentação", variant: "outline" },
      proposta: { label: "Proposta", variant: "outline" },
      fechado: { label: "Fechado", variant: "success" },
    };
    
    const stageInfo = stageMap[stage] || { label: stage, variant: "default" };
    
    return (
      <Badge variant={stageInfo.variant as any}>
        {stageInfo.label}
      </Badge>
    );
  };
  
  // Função para formatar o valor
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "—";
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  return (
    <div className="flex-1 p-8 pt-6 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar clientes..."
              className="pl-8 w-[250px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <AlertDialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
            <AlertDialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Novo Cliente
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-lg">
              <ContactForm 
                onSuccess={() => setIsAddContactOpen(false)}
                title="Novo Cliente"
              />
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-1">
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Carregando clientes...
                  </TableCell>
                </TableRow>
              ) : filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.company || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-sm">{contact.email}</span>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center mt-1">
                            <Phone className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span className="text-sm">{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatStage(contact.stage)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(contact.value)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}