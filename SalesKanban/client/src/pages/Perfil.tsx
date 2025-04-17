import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Pencil, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Esquema de validação do perfil
const profileSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().optional(),
  position: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().max(500, { message: "A bio deve ter no máximo 500 caracteres" }).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Perfil() {
  const [isEditing, setIsEditing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Valores iniciais do formulário
  const defaultValues: Partial<ProfileFormValues> = {
    name: "Usuário CRM",
    email: "usuario@empresa.com",
    phone: "(11) 98765-4321",
    position: "Gerente de Vendas",
    company: "Empresa Tech",
    bio: "Gerente de vendas com mais de 5 anos de experiência em liderança de equipes comerciais e desenvolvimento de estratégias de negócios.",
  };
  
  // Inicializar o formulário
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });
  
  // Função para lidar com a alteração da foto
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Função para cancelar a edição da foto
  const cancelPhotoChange = () => {
    setPhotoPreview(null);
    setSelectedFile(null);
  };
  
  // Função para salvar o perfil
  const onSubmit = (data: ProfileFormValues) => {
    console.log("Perfil atualizado:", data);
    console.log("Nova foto:", selectedFile);
    
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
    });
    
    setIsEditing(false);
  };
  
  return (
    <div className="flex-1 p-8 pt-6 overflow-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(!isEditing)}
          className="gap-2"
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" /> Cancelar
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" /> Editar
            </>
          )}
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-6">
        {/* Coluna da foto de perfil */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>Esta imagem será exibida em seu perfil</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={photoPreview || ""} />
              <AvatarFallback className="text-2xl">
                {form.watch("name")?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <div className="space-y-2 w-full">
                <Label htmlFor="photo">Alterar foto</Label>
                <Input 
                  id="photo" 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                />
                
                {photoPreview && (
                  <div className="flex justify-center mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={cancelPhotoChange}
                      className="text-red-500"
                    >
                      Remover
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Coluna das informações pessoais */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize suas informações de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografia</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          disabled={!isEditing}
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Breve descrição sobre você. Máximo de 500 caracteres.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {isEditing && (
                  <Button type="submit" className="w-full md:w-auto flex gap-2">
                    <Save className="h-4 w-4" /> Salvar Alterações
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}