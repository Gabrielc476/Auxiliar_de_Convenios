"use client";

import { ReactNode, useState, useContext, createContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home,
  Layout as LayoutIcon,
  Search,
  Settings,
  FileText,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/authContext";
import { usePathname } from "next/navigation";

// Contexto para busca
interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  searchQuery: "",
  setSearchQuery: () => {},
});

export const useSearch = () => useContext(SearchContext);

// Componente para itens da navegação
interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

const NavItem = ({
  icon: Icon,
  label,
  href,
  isActive = false,
}: NavItemProps) => (
  <Link href={href} className="w-full">
    <Button
      variant="ghost"
      className={`w-full justify-start ${
        isActive
          ? "bg-gray-700 text-white"
          : "text-gray-300 hover:text-white hover:bg-gray-800"
      }`}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  </Link>
);

// Componente da Sidebar
const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Primeiro nome para o fallback do avatar
  const getInitials = () => {
    if (!user?.nome) return "U";
    const names = user.nome.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Determinar qual link está ativo
  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <Avatar className="h-12 w-12">
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="text-white text-sm font-medium truncate">
            {user?.nome || "Usuário"}
          </span>
          <span className="text-gray-400 text-xs truncate">
            {user?.email || ""}
          </span>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        <NavItem
          icon={Home}
          label="Dashboard"
          href="/dashboardPage"
          isActive={isActive("/dashboardPage")}
        />
        <NavItem
          icon={FileText}
          label="Dados Municipais"
          href="/municipios-dados"
          isActive={isActive("/municipios-dados")}
        />
        <NavItem
          icon={BarChart3}
          label="Análise"
          href="/analise"
          isActive={isActive("/analise")}
        />
      </nav>

      <Button
        variant="ghost"
        className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 mt-4"
        onClick={() => logout()}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </div>
  );
};

const Header = () => {
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <header className="bg-gray-800 p-4 flex justify-between items-center">
      <h1 className="text-white text-xl font-bold">Convênios Municipais</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-8 bg-gray-700 border-gray-600 text-white"
            placeholder="Pesquisar por número ou objeto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configurações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div className="flex min-h-screen bg-gray-900 text-white">
        {/* Sidebar Fixa */}
        <div className="fixed left-0 top-0 h-screen z-50">
          <Sidebar />
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col ml-64">
          <Header />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
          <footer className="bg-gray-800 p-4 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Sistema de Convênios. Todos os direitos
            reservados.
          </footer>
        </div>

        {/* Botões de Navegação */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="fixed left-4 bottom-4 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors">
                <ChevronLeft className="h-6 w-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Voltar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="fixed right-4 bottom-4 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors">
                <ChevronRight className="h-6 w-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Avançar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </SearchContext.Provider>
  );
}
