"use client";

import { ReactNode } from "react";
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
  Users,
} from "lucide-react";

const Sidebar = () => (
  <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex flex-col h-full">
    <div className="flex items-center gap-3 mb-8">
      <Avatar className="h-12 w-12">
        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
        <AvatarFallback>FT</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-white text-sm font-medium">Fulano de tal</span>
        <span className="text-gray-400 text-xs">fulano@detal@gmail.com</span>
      </div>
    </div>
    <nav className="space-y-1 flex-1">
      {[
        { icon: Home, label: "Dashboard" },
        { icon: Users, label: "Team" },
        { icon: BarChart3, label: "Analytics" },
        { icon: LayoutIcon, label: "Projects" },
      ].map((item, i) => (
        <Button
          key={i}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </nav>
    <Button
      variant="ghost"
      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
    >
      <Settings className="mr-2 h-4 w-4" />
      Settings
    </Button>
  </div>
);

const Header = () => (
  <header className="bg-gray-800 p-4 flex justify-between items-center">
    <h1 className="text-white text-xl font-bold">Dashboard</h1>
    <div className="flex items-center gap-4">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-8 bg-gray-700 border-gray-600 text-white"
          placeholder="Search..."
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
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </header>
);

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar com posição fixa */}
      <div className="fixed left-0 top-0 h-screen z-50">
        <Sidebar />
      </div>

      {/* Conteúdo principal com margem para a sidebar */}
      <div className="flex-1 flex flex-col ml-64">
        {" "}
        {/* ml-64 = margin-left igual à largura da sidebar */}
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
        <footer className="bg-gray-800 p-4 text-center text-gray-400 text-sm">
          © 2025 Dashboard Inc. All rights reserved.
        </footer>
      </div>

      {/* Botões de navegação ajustados */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="fixed left-4 bottom-4 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Previous</p>
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
            <p>Next</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
