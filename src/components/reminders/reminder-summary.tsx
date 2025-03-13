"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BellRing, ArrowRight, AlertCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ReminderType } from "@/interfaces/reminderInterfaces";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ReminderSummary() {
  const [upcomingReminders, setUpcomingReminders] = useState<ReminderType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        const allReminders = await apiService.getReminders();
        
        // Filter for only pending reminders, sort by date
        const pending = allReminders
          .filter(r => r.status === "pending")
          .sort((a, b) => {
            // Certifique-se de que as datas são válidas
            const dateA = new Date(a.reminderDate);
            const dateB = new Date(b.reminderDate);
            
            // Verificar se as datas são válidas
            const isValidDateA = !isNaN(dateA.getTime());
            const isValidDateB = !isNaN(dateB.getTime());
            
            if (!isValidDateA && !isValidDateB) return 0;
            if (!isValidDateA) return 1;
            if (!isValidDateB) return -1;
            
            return dateA.getTime() - dateB.getTime();
          });
        
        // Get the first 3 upcoming reminders
        setUpcomingReminders(pending.slice(0, 3));
      } catch (error) {
        console.error("Erro ao carregar lembretes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  // Function to return friendly date format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ptBR,
    });
  };

  // Handle priority classes
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "alta": return "text-red-400";
      case "media": return "text-amber-400";
      default: return "text-blue-400";
    }
  };

  // Handle navigation to reminders page
  const handleViewAllReminders = () => {
    router.push("/reminders");
  };

  return (
    <Card className="bg-gray-800 border-gray-700 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <BellRing className="h-5 w-5 text-blue-400" />
          Lembretes Próximos
        </CardTitle>
        <CardDescription>
          Seus lembretes para os próximos dias
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Clock className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : upcomingReminders.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <BellRing className="h-8 w-8 mx-auto mb-2 text-gray-500 opacity-50" />
            <p>Você não tem lembretes próximos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => {
              const isPastDate = isPast(new Date(reminder.reminderDate));
              
              return (
                <div key={reminder.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-750 hover:bg-gray-700 transition-colors">
                  <div className={cn(
                    "mt-1 p-2 rounded-full",
                    isPastDate ? "bg-amber-900/20" : "bg-blue-900/20"
                  )}>
                    {isPastDate ? (
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                    ) : (
                      <BellRing className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm truncate">{reminder.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs py-0 px-1.5",
                          getPriorityClass(reminder.priority)
                        )}
                      >
                        {reminder.priority}
                      </Badge>
                      <span className={cn(
                        "text-xs", 
                        isPastDate ? "text-amber-400" : "text-gray-400"
                      )}>
                        {formatDate(reminder.reminderDate)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full border-gray-700 text-blue-400 hover:text-white hover:bg-blue-700/20"
          onClick={handleViewAllReminders}
        >
          Ver todos os lembretes
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}