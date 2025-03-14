"use client";

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
import {
  Calendar,
  Landmark,
  Building2,
  Phone,
  Mail,
  FileText,
  Save,
  X,
  Edit,
  Loader2,
} from "lucide-react";
import { Convenio, Dado } from "@/interfaces/municipioInterfaces";
import { apiService } from "@/services/api";
import type { UpdateConvenioData } from "@/services/api";

interface EditConvenioModalProps {
  convenio: Convenio;
  municipio: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedConvenio: Convenio) => void;
}

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  required?: boolean;
  icon?: React.ReactNode;
  placeholder?: string;
}

const InputField = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  icon,
  placeholder,
}: InputFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-gray-300 flex items-center gap-1.5">
      {icon}
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <div className="relative">
      {type === "textarea" ? (
        <Textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="bg-gray-700 border-gray-600 text-white min-h-20"
        />
      ) : (
        <Input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="bg-gray-700 border-gray-600 text-white"
        />
      )}
    </div>
  </div>
);

export default function EditConvenioModal({
  convenio,
  municipio,
  open,
  onOpenChange,
  onSave,
}: EditConvenioModalProps) {
  // Initialize form data from convenio prop
  const [formData, setFormData] = useState<Convenio>({ ...convenio });
  const [dadosArray, setDadosArray] = useState<Dado[]>([...convenio.dados]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when the convenio prop changes
  useEffect(() => {
    if (open) {
      setFormData({ ...convenio });
      setDadosArray([...convenio.dados]);
      setErrors({});
    }
  }, [convenio, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "convenio" || name === "objeto") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      // Handle fields within dados[0]
      const dadosCopy = [...dadosArray];
      if (dadosCopy[0]) {
        dadosCopy[0] = { ...dadosCopy[0], [name]: value };
        setDadosArray(dadosCopy);
      }
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.convenio.trim()) {
      newErrors.convenio = "O número do convênio é obrigatório";
    }

    if (!formData.objeto.trim()) {
      newErrors.objeto = "O objeto do convênio é obrigatório";
    }

    // Validate dados fields that are required
    if (dadosArray[0]) {
      if (!dadosArray[0].valor_repasse.trim()) {
        newErrors.valor_repasse = "O valor do repasse é obrigatório";
      }

      if (!dadosArray[0].vigencia_convenio.trim()) {
        newErrors.vigencia_convenio = "A vigência do convênio é obrigatória";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      // Merge form data with dados array
      const updatedConvenio: Convenio = {
        ...formData,
        dados: dadosArray,
      };

      // Call API to update convenio
      try {
        await apiService.updateConvenio(municipio, convenio.convenio, updatedConvenio);
      } catch (error) {
        console.error("API call failed:", error);
        throw new Error("Falha ao atualizar o convênio. Tente novamente.");
      }

      // Call the onSave callback with the updated convenio
      onSave(updatedConvenio);
      
      toast({
        title: "Convênio atualizado",
        description: "Os dados do convênio foram atualizados com sucesso!",
        duration: 3000,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atualizar convênio:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar o convênio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 p-0 max-w-3xl shadow-2xl rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-xl">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Edit className="h-6 w-6" />
            Editar Convênio
          </DialogTitle>
          <DialogDescription className="text-blue-100 mt-1">
            Atualize as informações do convênio {formData.convenio} de {municipio}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-400 flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Informações Básicas
              </h3>

              <InputField
                id="convenio"
                label="Número do Convênio"
                value={formData.convenio}
                onChange={handleChange}
                required
                icon={<FileText className="h-4 w-4 text-gray-400" />}
                placeholder="Ex: 0000/2024"
              />
              {errors.convenio && (
                <p className="text-red-500 text-sm mt-1">{errors.convenio}</p>
              )}

              <div className="space-y-2">
                <Label 
                  htmlFor="objeto" 
                  className="text-gray-300 flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4 text-gray-400" />
                  Objeto do Convênio <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="objeto"
                  name="objeto"
                  value={formData.objeto}
                  onChange={handleChange}
                  required
                  placeholder="Descreva o objeto do convênio"
                  className="bg-gray-700 border-gray-600 text-white min-h-20"
                />
                {errors.objeto && (
                  <p className="text-red-500 text-sm">{errors.objeto}</p>
                )}
              </div>
            </div>

            {/* Informações Financeiras */}
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-400 flex items-center gap-2 text-lg">
                <Landmark className="h-5 w-5" />
                Informações Financeiras
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  id="valor_repasse"
                  label="Valor do Repasse"
                  value={dadosArray[0]?.valor_repasse || ""}
                  onChange={handleChange}
                  required
                  icon={<Landmark className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: R$ 100.000,00"
                />
                {errors.valor_repasse && (
                  <p className="text-red-500 text-sm">{errors.valor_repasse}</p>
                )}

                <InputField
                  id="valor_contrapartida"
                  label="Valor da Contrapartida"
                  value={dadosArray[0]?.valor_contrapartida || ""}
                  onChange={handleChange}
                  icon={<Landmark className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: R$ 10.000,00"
                />

                <InputField
                  id="percentual_recurso_repassado"
                  label="Percentual Repassado"
                  value={dadosArray[0]?.percentual_recurso_repassado || ""}
                  onChange={handleChange}
                  icon={<Landmark className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: 50%"
                />

                <InputField
                  id="valor_desbloqueado_empresa"
                  label="Valor Desbloqueado à Empresa"
                  value={dadosArray[0]?.valor_desbloqueado_empresa || ""}
                  onChange={handleChange}
                  icon={<Landmark className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: R$ 50.000,00"
                />

                <InputField
                  id="percentual_execucao_obra"
                  label="Percentual de Execução"
                  value={dadosArray[0]?.percentual_execucao_obra || ""}
                  onChange={handleChange}
                  icon={<Landmark className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: 30%"
                />

                <InputField
                  id="valor_contrato_empresa"
                  label="Valor do Contrato"
                  value={dadosArray[0]?.valor_contrato_empresa || ""}
                  onChange={handleChange}
                  icon={<Landmark className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: R$ 110.000,00"
                />
              </div>
            </div>

            {/* Datas e Prazos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-400 flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Datas e Prazos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  id="vigencia_convenio"
                  label="Vigência do Convênio"
                  value={dadosArray[0]?.vigencia_convenio || ""}
                  onChange={handleChange}
                  required
                  icon={<Calendar className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: 31/12/2025"
                />
                {errors.vigencia_convenio && (
                  <p className="text-red-500 text-sm">{errors.vigencia_convenio}</p>
                )}

                <InputField
                  id="vigencia_contrato_empresa"
                  label="Vigência do Contrato"
                  value={dadosArray[0]?.vigencia_contrato_empresa || ""}
                  onChange={handleChange}
                  icon={<Calendar className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: 31/12/2025"
                />

                <InputField
                  id="prazo_pagamento_empresa"
                  label="Prazo para Pagamento"
                  value={dadosArray[0]?.prazo_pagamento_empresa || ""}
                  onChange={handleChange}
                  icon={<Calendar className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: 31/12/2025"
                />

                <InputField
                  id="vigencia_lac"
                  label="Vigência LAC"
                  value={dadosArray[0]?.vigencia_lac || ""}
                  onChange={handleChange}
                  icon={<Calendar className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: 31/12/2025"
                />
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-400 flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Informações Adicionais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  id="dados_bancarios"
                  label="Dados Bancários"
                  value={dadosArray[0]?.dados_bancarios || ""}
                  onChange={handleChange}
                  icon={<Landmark className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: BB AG: 1000 CC: 10000-1"
                />

                <InputField
                  id="processo_licitatorio"
                  label="Processo Licitatório"
                  value={dadosArray[0]?.processo_licitatorio || ""}
                  onChange={handleChange}
                  icon={<FileText className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: Pregão 001/2024"
                />

                <InputField
                  id="empresa_executora"
                  label="Empresa Executora"
                  value={dadosArray[0]?.empresa_executora || ""}
                  onChange={handleChange}
                  icon={<Building2 className="h-4 w-4 text-gray-400" />}
                  placeholder="Ex: Construtora XYZ Ltda"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 pt-4 border-t border-gray-700 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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