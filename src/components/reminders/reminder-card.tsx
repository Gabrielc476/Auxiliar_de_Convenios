"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Edit, Trash2, BellRing, Calendar, MoreVertical, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ReminderType } from "@/interfaces/reminderInterfaces";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface ReminderCardProps {
  reminder: ReminderType;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (reminder: ReminderType) => Promise<void>;
  showConvenioLink?: boolean;
}

export default function ReminderCard({
  reminder,
  onDelete,
  onUpdate,
  showConvenioLink = false,
}: ReminderCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // Function to handle completion toggle
  const handleToggleComplete = async () => {
    try {
      setIsUpdating(true);
      await onUpdate({
        ...reminder,
        status: reminder.status === "completed" ? "pending" : "completed",
      });
    } catch (error) {
      console.error("Erro ao atualizar status do lembrete:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to get the priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "alta":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "media":
        return "bg-amber-500/20 text-amber-400 border-amber-500/50";
      case "baixa":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default:
        return "bg-gray-700 text-gray-300 border-gray-600";
    }
  };

  // Format relative time
  const getRelativeTime = (date: string) => {
    if (!date) return "Data não disponível";

    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  // Handle delete with loading state
  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este lembrete?")) {
      setIsDeleting(true);
      try {
        await onDelete(reminder.id);
      } catch (error) {
        console.error("Erro ao excluir lembrete:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Navigate to related convenio if available
  const handleGoToConvenio = () => {
    if (reminder.relatedConvenioId && reminder.relatedPendenciaId) {
      router.push(`/convenio/${reminder.relatedConvenioId}/${reminder.relatedPendenciaId}`);
    }
  };

  // Check if date is in the past
  const isDatePassed = new Date(reminder.reminderDate) < new Date();

  return (
    <Card
      className={cn(
        "bg-gray-800 border-gray-700 hover:shadow-lg transition-all overflow-hidden",
        reminder.status === "completed" && "border-l-4 border-l-green-500 opacity-75",
        reminder.priority === "alta" && reminder.status !== "completed" && "border-l-4 border-l-red-500",
        isDatePassed && reminder.status !== "completed" && "border-l-4 border-l-amber-500",
      )}
    >
      <div className="p-4 space-y-3">
        {/* Title & Actions */}
        <div className="flex items-center justify-between">
          <h3
            className={cn(
              "font-medium text-white",
              reminder.status === "completed" && "line-through text-gray-400",
            )}
          >
            {reminder.title}
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
              <DropdownMenuItem
                onClick={handleToggleComplete}
                className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : reminder.status === "completed" ? (
                  <Clock className="h-4 w-4 mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {reminder.status === "completed" ? "Marcar como pendente" : "Marcar como concluído"}
              </DropdownMenuItem>

              {/* Only show the link to convenio if related IDs exist and showConvenioLink is true */}
              {showConvenioLink && reminder.relatedConvenioId && reminder.relatedPendenciaId && (
                <DropdownMenuItem
                  onClick={handleGoToConvenio}
                  className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver convênio relacionado
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/30 focus:bg-red-900/30"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {isDeleting ? "Excluindo..." : "Excluir"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {reminder.description && (
          <p className={cn(
            "text-sm text-gray-400",
            reminder.status === "completed" && "line-through text-gray-500",
          )}>
            {reminder.description}
          </p>
        )}

        {/* Priority Badge */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              "border rounded-full px-3 py-1 text-xs font-medium",
              getPriorityColor(reminder.priority),
            )}
          >
            {reminder.priority === "alta"
              ? "Prioridade Alta"
              : reminder.priority === "media"
                ? "Prioridade Média"
                : "Prioridade Baixa"}
          </Badge>

          {/* Due date */}
          <div className={cn(
            "text-xs flex items-center gap-1",
            isDatePassed && reminder.status !== "completed" ? "text-amber-400" : "text-gray-400",
          )}>
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(reminder.reminderDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Status indicator */}
        {reminder.status === "completed" ? (
          <div className="text-xs bg-green-900/20 text-green-400 flex items-center gap-1 p-2 rounded-md">
            <Check className="h-3.5 w-3.5" />
            <span>Concluído {getRelativeTime(reminder.reminderDate)}</span>
          </div>
        ) : isDatePassed ? (
          <div className="text-xs bg-amber-900/20 text-amber-400 flex items-center gap-1 p-2 rounded-md">
            <Clock className="h-3.5 w-3.5" />
            <span>Atrasado {getRelativeTime(reminder.reminderDate)}</span>
          </div>
        ) : (
          <div className="text-xs bg-blue-900/20 text-blue-400 flex items-center gap-1 p-2 rounded-md">
            <BellRing className="h-3.5 w-3.5" />
            <span>Programado para {getRelativeTime(reminder.reminderDate)}</span>
          </div>
        )}
      </div>
    </Card>
  );
}