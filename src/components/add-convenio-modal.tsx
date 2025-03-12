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
import {
  FileText,
  Calendar,
  Landmark,
  Building2,
  Plus,
  X,
  Save,
  Briefcase,
} from "lucide-react";
import { apiService } from "@/services/api";

interface AddConvenioModalProps {
  municipio: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ConvenioFormData {
  convenio: string;
  objeto: string;
  valor_repasse: string;
  valor_contrapartida: string;
  percentual_recurso_repassado: string;
  valor_desbloqueado_empresa: string;
  percentual_execucao_obra: string;
  vigencia_convenio: string;
  dados_bancarios: string;
  vigencia_lac: string;
  processo_licitatorio: string;
  empresa_executora: string;
  valor_contrato_empresa: string;
  vigencia_contrato_empresa: string;
  prazo_pagamento_empresa: string;
}

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  </div>
);

export default function AddConvenioModal({
  municipio,
  open,
  onOpenChange,
  onSuccess,
}: AddConvenioModalProps) {
  const initialFormData: ConvenioFormData = {
    convenio: "",
    objeto: "",
    valor_repasse: "",
    valor_contrapartida: "",
    percentual_recurso_repassado: "0%",
    valor_desbloqueado_empresa: "R$ 0,00",
    percentual_execucao_obra: "0%",
    vigencia_convenio: "",
    dados_bancarios: "",
    vigencia_lac: "",
    processo_licitatorio: "",
    empresa_executora: "",
    valor_contrato_empresa: "",
    vigencia_contrato_empresa: "",
    prazo_pagamento_empresa: "",
  };

  const [formData, setFormData] = useState<ConvenioFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro quando campo é editado
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

    if (!formData.valor_repasse.trim()) {
      newErrors.valor_repasse = "O valor do repasse é obrigatório";
    }

    if (!formData.vigencia_convenio.trim()) {
      newErrors.vigencia_convenio = "A vigência do convênio é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setError("");
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
      // Chamar a API para adicionar o convênio
      await apiService.addConvenio(municipio, {
        convenio: formData.convenio,
        objeto: formData.objeto,
        dados: [{
          ...formData,
          outros_dados: []
        }]
      });
      
      toast({
        title: "Convênio adicionado",
        description: `Convênio ${formData.convenio} adicionado com sucesso a ${municipio}`,
        duration: 5000,
      });
      
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      console.error("Erro ao adicionar convênio:", err);
      setError(err.message || "Ocorreu um erro ao adicionar o convênio");
      
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o convênio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 p-0 max-w-3xl shadow-2xl rounded-xl overflow-auto max-h-[90vh]">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <FileText className="h-6 w-6" />
              Adicionar Convênio
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-1">
              Adicionar novo convênio para o município de {municipio}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
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
                icon={<FileText className="h-4 w-4" />}
                placeholder="Ex: 0000/2024"
              />
              {errors.convenio && (
                <p className="text-red-500 text-sm mt-1">{errors.convenio}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="objeto" className="text-gray-300 flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Objeto do Convênio <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="objeto"
                  name="objeto"
                  value={formData.objeto}
                  onChange={handleChange}
                  required
                  placeholder="Descreva o objeto do convênio"
                  className="min-h-24 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
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
                  value={formData.valor_repasse}
                  onChange={handleChange}
                  required
                  icon={<Landmark className="h-4 w-4" />}
                  placeholder="Ex: R$ 100.000,00"
                />
                {errors.valor_repasse && (
                  <p className="text-red-500 text-sm">{errors.valor_repasse}</p>
                )}

                <InputField
                  id="valor_contrapartida"
                  label="Valor da Contrapartida"
                  value={formData.valor_contrapartida}
                  onChange={handleChange}
                  icon={<Landmark className="h-4 w-4" />}
                  placeholder="Ex: R$ 10.000,00"
                />

                <InputField
                  id="percentual_recurso_repassado"
                  label="Percentual Repassado"
                  value={formData.percentual_recurso_repassado}
                  onChange={handleChange}
                  icon={<Landmark className="h-4 w-4" />}
                  placeholder="Ex: 50%"
                />

                <InputField
                  id="valor_desbloqueado_empresa"
                  label="Valor Desbloqueado à Empresa"
                  value={formData.valor_desbloqueado_empresa}
                  onChange={handleChange}
                  icon={<Landmark className="h-4 w-4" />}
                  placeholder="Ex: R$ 50.000,00"
                />

                <InputField
                  id="percentual_execucao_obra"
                  label="Percentual de Execução"
                  value={formData.percentual_execucao_obra}
                  onChange={handleChange}
                  icon={<Landmark className="h-4 w-4" />}
                  placeholder="Ex: 30%"
                />

                <InputField
                  id="valor_contrato_empresa"
                  label="Valor do Contrato"
                  value={formData.valor_contrato_empresa}
                  onChange={handleChange}
                  icon={<Landmark className="h-4 w-4" />}
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
                  value={formData.vigencia_convenio}
                  onChange={handleChange}
                  required
                  icon={<Calendar className="h-4 w-4" />}
                  placeholder="Ex: 31/12/2025"
                />
                {errors.vigencia_convenio && (
                  <p className="text-red-500 text-sm">{errors.vigencia_convenio}</p>
                )}

                <InputField
                  id="vigencia_contrato_empresa"
                  label="Vigência do Contrato"
                  value={formData.vigencia_contrato_empresa}
                  onChange={handleChange}
                  icon={<Calendar className="h-4 w-4" />}
                  placeholder="Ex: 31/12/2025"
                />

                <InputField
                  id="prazo_pagamento_empresa"
                  label="Prazo para Pagamento"
                  value={formData.prazo_pagamento_empresa}
                  onChange={handleChange}
                  icon={<Calendar className="h-4 w-4" />}
                  placeholder="Ex: 31/12/2025"
                />

                <InputField
                  id="vigencia_lac"
                  label="Vigência LAC"
                  value={formData.vigencia_lac}
                  onChange={handleChange}
                  icon={<Calendar className="h-4 w-4" />}
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
                  value={formData.dados_bancarios}
                  onChange={handleChange}
                  icon={<Landmark className="h-4 w-4" />}
                  placeholder="Ex: BB AG: 1000 CC: 10000-1"
                />

                <InputField
                  id="processo_licitatorio"
                  label="Processo Licitatório"
                  value={formData.processo_licitatorio}
                  onChange={handleChange}
                  icon={<FileText className="h-4 w-4" />}
                  placeholder="Ex: Pregão 001/2024"
                />

                <InputField
                  id="empresa_executora"
                  label="Empresa Executora"
                  value={formData.empresa_executora}
                  onChange={handleChange}
                  icon={<Briefcase className="h-4 w-4" />}
                  placeholder="Ex: Construtora XYZ Ltda"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-md text-red-400">
              {error}
            </div>
          )}

          <DialogFooter className="mt-8 pt-4 border-t border-gray-700 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              className="w-full sm:w-auto border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
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
                  <Save className="mr-2 h-4 w-4" /> Adicionar Convênio
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}