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
import { toast } from "@/components/ui/use-toast";
import { MunicipioDados } from "@/interfaces/municipioInterfaces";
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Save,
  X,
} from "lucide-react";
import { apiService } from "@/services/api";

interface EditMunicipalityModalProps {
  municipio: MunicipioDados;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedMunicipio: MunicipioDados) => void;
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
  maxLength?: number;
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
  maxLength,
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
        maxLength={maxLength}
        className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  </div>
);

export default function EditMunicipalityModal({
  municipio,
  open,
  onOpenChange,
  onSave,
}: EditMunicipalityModalProps) {
  const [formData, setFormData] = useState<MunicipioDados>(municipio);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.municipio.trim()) {
      newErrors.municipio = "O nome do município é obrigatório";
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = "O CNPJ é obrigatório";
    } else if (
      !/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(formData.cnpj) &&
      !/^\d{14}$/.test(formData.cnpj)
    ) {
      newErrors.cnpj = "Formato de CNPJ inválido";
    }

    if (!formData.prefeito.trim()) {
      newErrors.prefeito = "O nome do prefeito é obrigatório";
    }

    if (
      formData.telefone &&
      !/^\(\d{2}\)\s\d{4,5}\-\d{4}$/.test(formData.telefone) &&
      !/^\d{10,11}$/.test(formData.telefone)
    ) {
      newErrors.telefone = "Formato de telefone inválido";
    }

    if (
      formData.e_mail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.e_mail)
    ) {
      newErrors.e_mail = "E-mail inválido";
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
      // Aqui passamos para o callback de salvamento e deixamos o componente pai
      // decidir como processar a atualização usando o apiService
      onSave(formData);
    } catch (error: any) {
      console.error("Erro ao salvar dados:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar os dados.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5)
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
        5
      )}`;
    if (numbers.length <= 12)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
        5,
        8
      )}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
      5,
      8
    )}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCNPJ(value);
    setFormData((prev) => ({ ...prev, cnpj: formattedValue }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 p-0 max-w-3xl shadow-2xl rounded-xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Editar {formData.municipio}
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-1">
              Atualize as informações cadastrais do município
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dados municipais */}
            <div className="space-y-5">
              <h3 className="font-semibold text-blue-400 flex items-center gap-2 mb-4 text-lg">
                <Building2 className="h-5 w-5" />
                Dados do Município
              </h3>

              <InputField
                id="municipio"
                label="Nome do Município"
                value={formData.municipio}
                onChange={handleChange}
                required
                icon={<Building2 className="h-4 w-4" />}
                placeholder="Ex: São Paulo"
              />
              {errors.municipio && (
                <p className="text-red-500 text-sm mt-1">{errors.municipio}</p>
              )}

              <InputField
                id="cnpj"
                label="CNPJ"
                value={formData.cnpj}
                onChange={handleCNPJChange}
                required
                icon={<IdCard className="h-4 w-4" />}
                placeholder="Ex: 00.000.000/0000-00"
                maxLength={18}
              />
              {errors.cnpj && (
                <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>
              )}

              <InputField
                id="endereco"
                label="Endereço"
                value={formData.endereco}
                onChange={handleChange}
                icon={<MapPin className="h-4 w-4" />}
                placeholder="Ex: Av. Paulista, 1000"
              />

              <InputField
                id="telefone"
                label="Telefone"
                value={formData.telefone}
                onChange={handleChange}
                icon={<Phone className="h-4 w-4" />}
                placeholder="Ex: (11) 3000-0000"
              />
              {errors.telefone && (
                <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>
              )}

              <InputField
                id="e_mail"
                label="E-mail"
                type="email"
                value={formData.e_mail}
                onChange={handleChange}
                icon={<Mail className="h-4 w-4" />}
                placeholder="Ex: contato@municipio.gov.br"
              />
              {errors.e_mail && (
                <p className="text-red-500 text-sm mt-1">{errors.e_mail}</p>
              )}
            </div>

            {/* Dados do prefeito */}
            <div className="space-y-5">
              <h3 className="font-semibold text-blue-400 flex items-center gap-2 mb-4 text-lg">
                <User className="h-5 w-5" />
                Dados do Prefeito
              </h3>

              <InputField
                id="prefeito"
                label="Nome do Prefeito"
                value={formData.prefeito}
                onChange={handleChange}
                required
                icon={<User className="h-4 w-4" />}
                placeholder="Ex: João da Silva"
              />
              {errors.prefeito && (
                <p className="text-red-500 text-sm mt-1">{errors.prefeito}</p>
              )}

              <InputField
                id="cpf_prefeito"
                label="CPF do Prefeito"
                value={formData.cpf_prefeito}
                onChange={handleChange}
                icon={<IdCard className="h-4 w-4" />}
                placeholder="Ex: 000.000.000-00"
              />

              <InputField
                id="rg_prefeito"
                label="RG do Prefeito"
                value={formData.rg_prefeito}
                onChange={handleChange}
                icon={<IdCard className="h-4 w-4" />}
                placeholder="Ex: 00.000.000-0"
              />

              <InputField
                id="operacional"
                label="Operacional"
                value={formData.operacional}
                onChange={handleChange}
                icon={<Building2 className="h-4 w-4" />}
                placeholder="Ex: Ativo"
              />
            </div>
          </div>

          <DialogFooter className="mt-8 pt-4 border-t border-gray-700 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
