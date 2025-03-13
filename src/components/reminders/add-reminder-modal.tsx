"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, Save, X, BellRing } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { NewReminderType } from "@/interfaces/reminderInterfaces";

interface AddReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (reminder: NewReminderType) => Promise<void>;
  relatedConvenioId?: string;
  relatedPendenciaId?: string;
}

export default function AddReminderModal({
  open,
  onOpenChange,
  onSave,
  relatedConvenioId,
  relatedPendenciaId,
}: AddReminderModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<"baixa" | "media" | "alta">("media");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(undefined);
    setPriority("media");
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "O título é obrigatório";
    }

    if (!date) {
      newErrors.date = "A data do lembrete é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Usar o ID do usuário autenticado
      const token = localStorage.getItem("token");
      const userDataStr = localStorage.getItem("userData");
      let userId = "current-user";
      
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          userId = userData.id || userData.email || "current-user";
        } catch (e) {
          console.error("Erro ao obter ID do usuário:", e);
        }
      }

      // Criar novo lembrete
      const newReminder: NewReminderType = {
        userId, // ID do usuário atual
        title,
        description,
        reminderDate: date!.toISOString(),
        priority,
        relatedConvenioId,
        relatedPendenciaId,
      };

      await onSave(newReminder);

      toast({
        title: "Lembrete criado",
        description: "O lembrete foi criado com sucesso!",
        duration: 3000,
      });

      handleOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao criar lembrete:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao criar o lembrete",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 p-0 max-w-md shadow-2xl rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-xl">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <BellRing className="h-6 w-6" />
            Novo Lembrete
          </DialogTitle>
          <DialogDescription className="text-blue-100 mt-1">
            Crie um lembrete personalizado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do lembrete"
              className="bg-gray-700 border-gray-600 text-white"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione detalhes ao lembrete"
              className="bg-gray-700 border-gray-600 text-white min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">
              Data do Lembrete <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 hover:bg-gray-600",
                    !date && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="bg-gray-800 text-white"
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-red-500 text-sm">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Prioridade</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={priority === "baixa" ? "default" : "outline"}
                className={
                  priority === "baixa"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-700 border-gray-600 text-gray-300"
                }
                onClick={() => setPriority("baixa")}
              >
                Baixa
              </Button>
              <Button
                type="button"
                variant={priority === "media" ? "default" : "outline"}
                className={
                  priority === "media"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-gray-700 border-gray-600 text-gray-300"
                }
                onClick={() => setPriority("media")}
              >
                Média
              </Button>
              <Button
                type="button"
                variant={priority === "alta" ? "default" : "outline"}
                className={
                  priority === "alta"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-700 border-gray-600 text-gray-300"
                }
                onClick={() => setPriority("alta")}
              >
                Alta
              </Button>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-700 flex flex-col sm:flex-row gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="w-full sm:w-auto border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Salvar Lembrete
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}