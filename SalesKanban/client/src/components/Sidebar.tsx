import { useState } from "react";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  User, 
  ChevronRight, 
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

// Tipo para os itens do menu
type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

// Array com os itens principais do menu
const mainMenuItems: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "CRM", href: "/", icon: ChevronRight },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Eventos", href: "/eventos", icon: Calendar },
];

// Array com os itens de configuração
const bottomMenuItems: MenuItem[] = [
  { name: "Configurações", href: "/configuracoes", icon: Settings },
  { name: "Perfil", href: "/perfil", icon: User },
];

export default function Sidebar() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Função para verificar se o item está ativo
  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  // Função para alternar o estado da barra lateral
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Componente para renderizar um item do menu
  const MenuItem = ({ item }: { item: MenuItem }) => {
    const handleClick = (e: React.MouseEvent) => {
      // Navegamos programaticamente
      window.location.href = item.href;
      if (isMobile || !isMobile) {
        setIsOpen(false);
      }
      // Prevenir o comportamento padrão para evitar a renderização dupla
      e.preventDefault();
    };

    return (
      <div
        key={item.name}
        onClick={handleClick}
        className={cn(
          "flex items-center px-2 py-3 rounded-md transition-colors hover:bg-accent cursor-pointer",
          isActive(item.href) 
            ? "bg-primary text-primary-foreground" 
            : "text-foreground hover:bg-accent hover:text-accent-foreground",
          !isOpen && "justify-center"
        )}
      >
        <item.icon className={cn("h-5 w-5 flex-shrink-0", isOpen && "mr-3")} />
        {isOpen && <span>{item.name}</span>}
      </div>
    );
  };

  return (
    <>
      {/* Botão de menu para mobile */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50"
        >
          {isOpen ? <X /> : <Menu />}
        </Button>
      )}

      {/* Overlay para fechar o menu em dispositivos móveis */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Barra lateral */}
      <aside
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={cn(
          "fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 flex flex-col",
          isOpen ? "w-64" : isMobile ? "-translate-x-full" : "w-16",
          isMobile && "shadow-xl"
        )}
      >
        {/* Logo/título */}
        <div className="px-4 py-6 flex justify-center items-center">
          {isOpen ? (
            <h1 className="text-xl font-bold text-primary">CRM Vendas</h1>
          ) : (
            <h1 className="text-xl font-bold text-primary">CRM</h1>
          )}
        </div>

        {/* Itens principais do menu */}
        <nav className="flex-1 px-2 space-y-1">
          {mainMenuItems.map((item) => (
            <MenuItem key={item.name} item={item} />
          ))}
        </nav>

        {/* Seção inferior com perfil e configurações */}
        <div className="border-t border-border p-2 space-y-1 mb-4">
          {bottomMenuItems.map((item) => (
            <MenuItem key={item.name} item={item} />
          ))}
          
          <Separator className="my-2" />
          
          {/* Perfil do usuário */}
          <div
            onClick={() => window.location.href = "/perfil"}
            className={cn(
              "flex items-center px-2 py-2 rounded-md hover:bg-accent cursor-pointer",
              !isOpen && "justify-center"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt="Foto de perfil" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {isOpen && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Usuário</p>
              </div>
            )}
          </div>
          
          {/* Botão para contrair/expandir a barra lateral (apenas em desktop) */}
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleSidebar} 
              className={cn(
                "w-full mt-2 flex justify-center",
                !isOpen && "px-0"
              )}
            >
              {isOpen ? (
                <>
                  <ChevronRight className="h-5 w-5 rotate-180" />
                  <span className="ml-2">Recolher</span>
                </>
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}