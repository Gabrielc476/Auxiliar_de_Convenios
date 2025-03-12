import { useState, useEffect } from "react";
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
import { BadgeCheck, CalendarClock, Edit, Save, Tag, X } from "lucide-react";
import {
  PendenciaType,
  PendenciaSubtipo,
  PendenciaTipo,
} from "@/interfaces/pendenciaInterfaces";

interface EditPendenciaModalProps {
  pendencia: PendenciaType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (pendencia: PendenciaType) => Promise<void>;
}

export default function EditPendenciaModal({
  pendencia,
  open,
  onOpenChange,
  onSave,
}: EditPendenciaModalProps) {
  const [formData, setFormData] = useState<PendenciaType>({ ...pendencia });
  const [loading, setLoading] = useState(false);
  const [novoSubtipo, setNovoSubtipo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar dados do formulário quando a pendência mudar
  useEffect(() => {
    if (open) {
      setFormData({ ...pendencia });
      setErrors({});
    }
  }, [pendencia, open]);

  // Lista de tipos predefinidos
  const tiposPredefinidos: PendenciaTipo[] = [
    "Prestação de Contas",
    "Licitação",
    "Execução",
    "Documentação",
    "Outro",
  ];

  // Lista de subtipos predefinidos e personalizados
  const subtiposPredefinidos: PendenciaSubtipo[] = [
    "Aguardando Documentos",
    "Em Análise",
    "Urgente",
    "Concluído",
    "Pendente",
  ];

  // Manipular mudanças nos campos
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Limpar erros quando o campo é editado
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Adicionando novo subtipo personalizado
  const handleAddSubtipo = () => {
    if (novoSubtipo.trim()) {
      setFormData({
        ...formData,
        subtipo: novoSubtipo.trim(),
      });
      setNovoSubtipo("");
    }
  };

  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = "A descrição é obrigatória";
    }

    if (!formData.tipo) {
      newErrors.tipo = "O tipo é obrigatório";
    }

    if (!formData.subtipo) {
      newErrors.subtipo = "O subtipo é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvar pendência
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os campos destacados",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Atualizar data de atualização
      const updatedPendencia = {
        ...formData,
        dataAtualizacao: new Date().toISOString(),
      };

      await onSave(updatedPendencia);
      
      toast({
        title: "Pendência atualizada",
        description: "A pendência foi atualizada com sucesso",
        duration: 3000,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar pendência:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a pendência",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 p-0 max-w-xl shadow-2xl rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-xl">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Edit className="h-6 w-6" />
            Editar Pendência
          </DialogTitle>
          <DialogDescription className="text-blue-100 mt-1">
            Atualize as informações da pendência
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Input
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva a pendência brevemente"
              className="bg-gray-700 border-gray-600 text-white"
            />
            {errors.descricao && (
              <p className="text-red-500 text-sm">{errors.descricao}</p>
            )}
          </div>

          {/* Detalhes */}
          <div className="space-y-2">
            <Label htmlFor="detalhes">Detalhes</Label>
            <Textarea
              id="detalhes"
              name="detalhes"
              value={formData.detalhes}
              onChange={handleChange}
              placeholder="Descreva os detalhes da pendência"
              className="bg-gray-700 border-gray-600 text-white min-h-24"
            />
          </div>

          {/* Tipo e Subtipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo <span className="text-red-500">*</span>
              </Label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
              >
                <option value="">Selecione um tipo</option>
                {tiposPredefinidos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              {errors.tipo && (
                <p className="text-red-500 text-sm">{errors.tipo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtipo">
                Subtipo <span className="text-red-500">*</span>
              </Label>
              <select
                id="subtipo"
                name="subtipo"
                value={formData.subtipo}
                onChange={handleChange}
                className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
              >
                <option value="">Selecione um subtipo</option>
                {subtiposPredefinidos.map((subtipo) => (
                  <option key={subtipo} value={subtipo}>
                    {subtipo}
                  </option>
                ))}
                {/* Adicionar opção para o subtipo atual, se não estiver na lista predefinida */}
                {formData.subtipo && !subtiposPredefinidos.includes(formData.subtipo as PendenciaSubtipo) && (
                  <option key={formData.subtipo} value={formData.subtipo}>
                    {formData.subtipo}
                  </option>
                )}
              </select>
              {errors.subtipo && (
                <p className="text-red-500 text-sm">{errors.subtipo}</p>
              )}
            </div>
          </div>

          {/* Novo Subtipo */}
          <div className="space-y-2">
            <Label htmlFor="novoSubtipo">Adicionar Subtipo Personalizado</Label>
            <div className="flex space-x-2">
              <Input
                id="novoSubtipo"
                value={novoSubtipo}
                onChange={(e) => setNovoSubtipo(e.target.value)}
                placeholder="Digite um novo subtipo"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button
                type="button"
                onClick={handleAddSubtipo}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                disabled={!novoSubtipo.trim()}
              >
                <Tag className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Responsável e Data Limite */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                name="responsavel"
                value={formData.responsavel || ""}
                onChange={handleChange}
                placeholder="Nome do responsável"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataLimite">Data Limite</Label>
              <Input
                id="dataLimite"
                name="dataLimite"
                type="date"
                value={
                  formData.dataLimite
                    ? new Date(formData.dataLimite).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleChange}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <Label htmlFor="prioridade">Prioridade</Label>
            <select
              id="prioridade"
              name="prioridade"
              value={formData.prioridade}
              onChange={handleChange}
              className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
            >
              <option value="aberta">Aberta</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-700 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}