"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/feedback";
import { BellRing, Check, Clock, Filter, Plus, Search } from "lucide-react";
import { apiService } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { ReminderType, NewReminderType } from "@/interfaces/reminderInterfaces";
import ReminderCard from "@/components/reminders/reminder-card";
import AddReminderModal from "@/components/reminders/add-reminder-modal";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function LembretesPage() {
  const [reminders, setReminders] = useState<ReminderType[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<ReminderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Load reminders
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        const data = await apiService.getReminders();
        setReminders(data);
      } catch (error) {
        console.error("Erro ao carregar lembretes:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os lembretes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  // Filter and sort reminders
  useEffect(() => {
    let filtered = [...reminders];

    // Filter by status
    if (selectedTab === "pending") {
      filtered = filtered.filter(r => r.status === "pending");
    } else if (selectedTab === "completed") {
      filtered = filtered.filter(r => r.status === "completed");
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        r => r.title.toLowerCase().includes(term) || 
        (r.description && r.description.toLowerCase().includes(term))
      );
    }

    // Sort
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime());
    } else if (sortBy === "priority") {
      const priorityOrder = { alta: 3, media: 2, baixa: 1 };
      filtered.sort((a, b) => {
        return priorityOrder[b.priority as keyof typeof priorityOrder] - 
               priorityOrder[a.priority as keyof typeof priorityOrder];
      });
    }

    setFilteredReminders(filtered);
  }, [reminders, selectedTab, searchTerm, sortBy]);

  // Add reminder
  const handleAddReminder = async (newReminder: NewReminderType) => {
    try {
      const createdReminder = await apiService.createReminder(newReminder);
      setReminders(prev => [...prev, createdReminder]);
      toast({
        title: "Lembrete criado",
        description: "O lembrete foi adicionado com sucesso!",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Erro ao criar lembrete:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao criar o lembrete",
        variant: "destructive",
      });
    }
  };

  // Update reminder
  const handleUpdateReminder = async (updatedReminder: ReminderType) => {
    try {
      const { id, ...data } = updatedReminder;
      await apiService.updateReminder(id, data);
      
      setReminders(prev => 
        prev.map(r => r.id === id ? updatedReminder : r)
      );
      
      toast({
        title: "Lembrete atualizado",
        description: "O lembrete foi atualizado com sucesso!",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar lembrete:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar o lembrete",
        variant: "destructive",
      });
    }
  };

  // Delete reminder
  const handleDeleteReminder = async (id: string) => {
    try {
      await apiService.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Lembrete excluído",
        description: "O lembrete foi excluído com sucesso!",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Erro ao excluir lembrete:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao excluir o lembrete",
        variant: "destructive",
      });
    }
  };

  // Count reminders by status
  const pendingCount = reminders.filter(r => r.status === "pending").length;
  const completedCount = reminders.filter(r => r.status === "completed").length;
  const overdueCount = reminders.filter(r => 
    r.status === "pending" && new Date(r.reminderDate) < new Date()
  ).length;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold flex items-center gap-2">
              <BellRing className="h-7 w-7 text-blue-400" />
              Meus Lembretes
            </h1>
            <p className="text-gray-400 mt-1">
              Gerencie lembretes personalizados para suas tarefas
            </p>
          </div>

          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Lembrete
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Total de Lembretes</p>
                  <p className="text-3xl font-bold text-white mt-1">{reminders.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-900/20 flex items-center justify-center">
                  <BellRing className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Pendentes</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">{pendingCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-900/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Atrasados</p>
                  <p className="text-3xl font-bold text-amber-400 mt-1">{overdueCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-900/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Concluídos</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">{completedCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-900/20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Reminders List */}
        <Card className="bg-gray-800 border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle>Todos os Lembretes</CardTitle>
            <CardDescription>Visualize e gerencie seus lembretes personalizados</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-750 p-4 rounded-lg mb-6">
                <TabsList className="grid grid-cols-3 w-full md:w-auto bg-gray-700">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-gray-600 text-gray-300 data-[state=active]:text-white"
                  >
                    Todos
                    <Badge className="ml-2 bg-gray-600 text-white">{reminders.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="data-[state=active]:bg-blue-600 text-gray-300 data-[state=active]:text-white"
                  >
                    Pendentes
                    <Badge className="ml-2 bg-blue-700 text-white">{pendingCount}</Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="data-[state=active]:bg-green-600 text-gray-300 data-[state=active]:text-white"
                  >
                    Concluídos
                    <Badge className="ml-2 bg-green-700 text-white">{completedCount}</Badge>
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar lembretes..."
                      className="bg-gray-700 border-gray-600 text-white pl-9 pr-4 w-full focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="shrink-0 bg-gray-700 border-gray-600 hover:bg-gray-600">
                        <Filter className="h-4 w-4 text-gray-300" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                      <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as "date" | "priority")}>
                        <DropdownMenuRadioItem 
                          value="date"
                          className="cursor-pointer text-gray-200 focus:text-white focus:bg-gray-700"
                        >
                          Ordenar por data
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem 
                          value="priority"
                          className="cursor-pointer text-gray-200 focus:text-white focus:bg-gray-700"
                        >
                          Ordenar por prioridade
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Reminder cards */}
              <div>
                {loading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 border-4 border-t-blue-500 border-blue-500/30 rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-400">Carregando lembretes...</p>
                    </div>
                  </div>
                ) : filteredReminders.length === 0 ? (
                  <EmptyState
                    icon={<BellRing className="h-12 w-12 text-gray-500 opacity-30" />}
                    title="Nenhum lembrete encontrado"
                    description={
                      searchTerm
                        ? `Nenhum lembrete encontrado para "${searchTerm}".`
                        : selectedTab === "all"
                        ? "Você não tem lembretes cadastrados."
                        : selectedTab === "pending"
                        ? "Você não tem lembretes pendentes."
                        : "Você não tem lembretes concluídos."
                    }
                    action={
                      <Button
                        onClick={() => setAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Lembrete
                      </Button>
                    }
                    className="py-16 bg-gray-750 rounded-lg"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReminders.map((reminder) => (
                      <ReminderCard
                        key={reminder.id}
                        reminder={reminder}
                        onDelete={handleDeleteReminder}
                        onUpdate={handleUpdateReminder}
                        showConvenioLink={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add Reminder Modal */}
      <AddReminderModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSave={handleAddReminder}
      />
    </div>
  );
}