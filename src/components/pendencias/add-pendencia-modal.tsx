"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  Info,
  Loader2,
  Plus,
  Save,
  Tag,
  User,
  X,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle,
  HelpCircle,
} from "lucide-react"
import type { NovaPendenciaType, PendenciaSubtipo, PendenciaTipo } from "@/interfaces/pendenciaInterfaces"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

// Types
interface AddPendenciaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (novaPendencia: NovaPendenciaType) => Promise<void>
  convenioId: string
  municipioId: string
}

interface InputFieldProps {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  type?: string
  required?: boolean
  icon?: React.ReactNode
  placeholder?: string
}

// Style utilities
const styleUtils = {
  getTipoBadgeColor: (tipo: string) => {
    const colorMap: Record<string, string> = {
      "prestação de contas": "bg-amber-500 hover:bg-amber-600",
      "licitação": "bg-blue-500 hover:bg-blue-600",
      "execução": "bg-green-500 hover:bg-green-600",
      "documentação": "bg-purple-500 hover:bg-purple-600"
    }
    return colorMap[tipo.toLowerCase()] || "bg-gray-500 hover:bg-gray-600"
  },
  
  getStatusColor: (status: string) => {
    const colorMap: Record<string, string> = {
      "aguardando documentos": "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      "em análise": "bg-blue-500/20 text-blue-400 border-blue-500/50",
      "urgente": "bg-red-500/20 text-red-400 border-red-500/50",
      "concluído": "bg-green-500/20 text-green-400 border-green-500/50",
      "pendente": "bg-orange-500/20 text-orange-400 border-orange-500/50"
    }
    return colorMap[status.toLowerCase()] || "bg-gray-700 text-gray-300 border-gray-600"
  },
  
  getPrioridadeColor: (prioridade: string) => {
    const colorMap: Record<string, string> = {
      "alta": "bg-red-500/20 text-red-400 border-red-500/50",
      "media": "bg-amber-500/20 text-amber-400 border-amber-500/50",
      "baixa": "bg-blue-500/20 text-blue-400 border-blue-500/50"
    }
    return colorMap[prioridade.toLowerCase()] || "bg-gray-700 text-gray-300 border-gray-600"
  }
}

// Predefined data
const TIPOS_PREDEFINIDOS = [
  {
    value: "Prestação de Contas",
    label: "Prestação de Contas",
    icon: <FileText className="h-4 w-4" />,
    description: "Pendências relacionadas à documentação financeira e prestação de contas do convênio.",
  },
  {
    value: "Licitação",
    label: "Licitação",
    icon: <ClipboardList className="h-4 w-4" />,
    description: "Pendências relacionadas aos processos licitatórios do convênio.",
  },
  {
    value: "Execução",
    label: "Execução",
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: "Pendências relacionadas à execução física do objeto do convênio.",
  },
  {
    value: "Documentação",
    label: "Documentação",
    icon: <FileText className="h-4 w-4" />,
    description: "Pendências relacionadas a documentos administrativos do convênio.",
  },
  {
    value: "Outro",
    label: "Outro",
    icon: <Tag className="h-4 w-4" />,
    description: "Outros tipos de pendências não categorizadas.",
  },
]

const SUBTIPOS_PREDEFINIDOS = [
  { value: "Aguardando Documentos", description: "Pendência que depende do recebimento de documentos." },
  { value: "Em Análise", description: "Pendência que está em processo de análise pela equipe." },
  { value: "Urgente", description: "Pendência que requer atenção imediata." },
  { value: "Concluído", description: "Pendência que já foi resolvida, mas precisa ser registrada." },
  { value: "Pendente", description: "Pendência em estado de espera por alguma ação." },
]

const SUBTIPOS_PERSONALIZADOS = [
  { value: "Aguardando Parecer", description: "Pendência aguardando parecer técnico ou jurídico." },
  { value: "Aguardando Aprovação", description: "Pendência aguardando aprovação de superior." },
  { value: "Em Diligência", description: "Pendência em processo de diligência." },
]

// UI Components
const FormField = ({ id, label, value, onChange, type = "text", required = false, icon, placeholder }: InputFieldProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="text-sm flex items-center gap-1">
        {icon}
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {type === "text" && value && (
        <div className="text-emerald-500">
          <CheckCircle className="h-4 w-4" />
        </div>
      )}
    </div>
    <div className="relative">
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500"
      />
    </div>
  </div>
)

const TipoCard = ({ tipo, isSelected, onSelect }: { 
  tipo: typeof TIPOS_PREDEFINIDOS[0], 
  isSelected: boolean, 
  onSelect: () => void 
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onSelect}
          className={cn(
            "p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-2 hover:shadow-md",
            isSelected
              ? "bg-emerald-900/30 border-emerald-500 text-white shadow-emerald-900/20 shadow-sm"
              : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600",
          )}
        >
          <div
            className={cn(
              "p-1.5 rounded-md",
              isSelected ? styleUtils.getTipoBadgeColor(tipo.value) : "bg-gray-700",
            )}
          >
            {tipo.icon}
          </div>
          <span className="text-sm">{tipo.label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gray-800 border-gray-700 max-w-xs">
        <p className="text-xs">{tipo.description}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

const SubtipoCard = ({ subtipo, isSelected, onSelect }: { 
  subtipo: { value: string, description: string }, 
  isSelected: boolean, 
  onSelect: () => void 
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onSelect}
          className={cn(
            "p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md",
            isSelected
              ? "bg-gray-800 border-2 border-emerald-500 shadow-emerald-900/20 shadow-sm"
              : "bg-gray-800 border-gray-700 hover:border-gray-600",
          )}
        >
          <Badge
            variant="outline"
            className={cn(
              "border w-full justify-center py-1 text-xs font-medium",
              isSelected
                ? styleUtils.getStatusColor(subtipo.value)
                : "bg-gray-700 text-gray-300 border-gray-600",
            )}
          >
            {subtipo.value}
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gray-800 border-gray-700">
        <p className="text-xs">{subtipo.description}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

const PrioridadeSelector = ({ 
  prioridade, 
  onSelect 
}: { 
  prioridade: "baixa" | "media" | "alta", 
  onSelect: (p: "baixa" | "media" | "alta") => void 
}) => {
  const prioridadeConfig = {
    baixa: {
      dots: 1,
      color: "blue",
      label: "Baixa",
      desc: "Resolução flexível",
      tooltip: "Prioridade Baixa - Pode ser resolvida quando houver disponibilidade."
    },
    media: {
      dots: 2,
      color: "amber",
      label: "Média",
      desc: "Atenção necessária",
      tooltip: "Prioridade Média - Requer atenção em tempo hábil."
    },
    alta: {
      dots: 3,
      color: "red",
      label: "Alta",
      desc: "Urgente",
      tooltip: "Prioridade Alta - Requer atenção imediata e resolução urgente."
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {Object.entries(prioridadeConfig).map(([key, config]) => {
        const isSelected = prioridade === key
        const colorBase = config.color
        return (
          <TooltipProvider key={key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={() => onSelect(key as "baixa" | "media" | "alta")}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all flex flex-col items-center justify-center gap-2 hover:shadow-md",
                    isSelected
                      ? `bg-${colorBase}-900/30 border-${colorBase}-500 text-white shadow-${colorBase}-900/20 shadow-sm`
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600",
                  )}
                >
                  <div className="flex items-center justify-center gap-1 w-full">
                    {Array.from({ length: config.dots }).map((_, i) => (
                      <div key={i} className={`h-2 w-2 rounded-full bg-${colorBase}-500`}></div>
                    ))}
                  </div>
                  <span className="text-sm font-medium">{config.label}</span>
                  <span className="text-xs text-gray-400">{config.desc}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-gray-800 border-gray-700">
                <p className="text-xs">{config.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}

// Main Component
export default function AddPendenciaModal({
  open,
  onOpenChange,
  onSave,
  convenioId,
  municipioId,
}: AddPendenciaModalProps) {
  // Initial State
  const initialFormData: NovaPendenciaType = {
    convenioId,
    municipioId,
    tipo: "Prestação de Contas",
    subtipo: "Aguardando Documentos",
    descricao: "",
    detalhes: "",
    responsavel: "",
    prioridade: "media",
  }

  // State
  const [formData, setFormData] = useState<NovaPendenciaType>({ ...initialFormData })
  const [loading, setLoading] = useState(false)
  const [novoSubtipo, setNovoSubtipo] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [animatePreview, setAnimatePreview] = useState(false)
  const [activeTab, setActiveTab] = useState("predefinidos")
  const totalSteps = 2

  // Effects
  useEffect(() => {
    if (formData.dataLimite) {
      setDate(new Date(formData.dataLimite))
    } else {
      setDate(undefined)
    }
  }, [formData.dataLimite])

  useEffect(() => {
    if (step === 2) {
      setAnimatePreview(true)
      const timer = setTimeout(() => setAnimatePreview(false), 500)
      return () => clearTimeout(timer)
    }
  }, [step])

  // Form Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleAddSubtipo = () => {
    if (novoSubtipo.trim()) {
      setFormData({
        ...formData,
        subtipo: novoSubtipo.trim(),
      })
      setNovoSubtipo("")
      toast({
        title: "Subtipo adicionado",
        description: `O subtipo "${novoSubtipo.trim()}" foi adicionado com sucesso.`,
        duration: 3000,
      })
    }
  }

  const resetForm = () => {
    setFormData({ ...initialFormData })
    setNovoSubtipo("")
    setErrors({})
    setStep(1)
    setDate(undefined)
    setActiveTab("predefinidos")
  }

  // Validation
  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.descricao.trim()) newErrors.descricao = "A descrição é obrigatória"
      if (!formData.tipo) newErrors.tipo = "O tipo é obrigatório"
      if (!formData.subtipo) newErrors.subtipo = "O subtipo é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigation
  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    } else {
      toast({
        title: "Formulário inválido",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      })
    }
  }

  const handlePrevStep = () => {
    setStep(step - 1)
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(step)) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os campos destacados",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await onSave(formData)
      toast({
        title: "Pendência adicionada",
        description: "A pendência foi criada com sucesso",
        duration: 3000,
      })
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao adicionar pendência:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar a pendência",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Selection Handlers
  const handleSelectTipo = (tipo: PendenciaTipo) => {
    setFormData({ ...formData, tipo })
    if (errors.tipo) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.tipo
        return newErrors
      })
    }
  }

  const handleSelectSubtipo = (subtipo: PendenciaSubtipo | string) => {
    setFormData({ ...formData, subtipo })
    if (errors.subtipo) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.subtipo
        return newErrors
      })
    }
  }

  const handleSelectPrioridade = (prioridade: "baixa" | "media" | "alta") => {
    setFormData({ ...formData, prioridade })
  }

  // Date Handling
  const handleDateSelect = (date: Date | undefined) => {
    setDate(date)
    if (date) {
      setFormData({ ...formData, dataLimite: date.toISOString() })
    } else {
      const { dataLimite, ...rest } = formData
      setFormData(rest as NovaPendenciaType)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="bg-gray-900 text-white border-gray-800 p-0 max-w-3xl shadow-2xl rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 rounded-t-xl">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Nova Pendência
          </DialogTitle>
          <DialogDescription className="text-emerald-100 mt-1">
            Adicione uma nova pendência ao convênio
          </DialogDescription>

          {/* Progress Indicator */}
          <div className="mt-4 flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index + 1 <= step ? "bg-white flex-grow w-full" : "bg-white/30 w-8",
                    index + 1 < step ? "opacity-70" : "opacity-100",
                  )}
                  style={{ minWidth: index + 1 === step ? "100px" : "40px" }}
                />
                <span className="text-xs text-white/70 mt-1">
                  {index === 0 ? "Informações Básicas" : "Detalhes Adicionais"}
                </span>
              </div>
            ))}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Description Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="descricao" className="text-sm flex items-center gap-1">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    Descrição <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">Ajuda</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-gray-800 border-gray-700">
                        <p className="text-xs">Descreva brevemente a pendência. Este campo é obrigatório.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative">
                  <Input
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Descreva a pendência brevemente"
                    className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                  />
                  {formData.descricao && (
                    <div className="absolute right-3 top-2.5 text-emerald-500">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
                {errors.descricao && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.descricao}
                  </p>
                )}
              </div>

              {/* Details Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="detalhes" className="text-sm flex items-center gap-1">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    Detalhes
                  </Label>
                  <span className="text-xs text-gray-400">{formData.detalhes.length} caracteres</span>
                </div>
                <Textarea
                  id="detalhes"
                  name="detalhes"
                  value={formData.detalhes}
                  onChange={handleChange}
                  placeholder="Descreva os detalhes da pendência"
                  className="bg-gray-800 border-gray-700 text-white min-h-24 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Type Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-1">
                    <Tag className="h-4 w-4 text-emerald-400" />
                    Tipo <span className="text-red-500">*</span>
                  </Label>
                  <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
                    {formData.tipo || "Nenhum selecionado"}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {TIPOS_PREDEFINIDOS.map((tipo) => (
                    <TipoCard 
                      key={tipo.value}
                      tipo={tipo} 
                      isSelected={formData.tipo === tipo.value}
                      onSelect={() => handleSelectTipo(tipo.value as PendenciaTipo)}
                    />
                  ))}
                </div>
                {errors.tipo && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.tipo}
                  </p>
                )}
              </div>

              {/* Subtype Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-1">
                    <Tag className="h-4 w-4 text-emerald-400" />
                    Subtipo <span className="text-red-500">*</span>
                  </Label>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border rounded-full px-3 py-1 text-xs font-medium",
                      formData.subtipo ? styleUtils.getStatusColor(formData.subtipo) : "bg-gray-800 text-gray-300 border-gray-700",
                    )}
                  >
                    {formData.subtipo || "Nenhum selecionado"}
                  </Badge>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full bg-gray-800">
                    <TabsTrigger
                      value="predefinidos"
                      className="data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white"
                    >
                      Predefinidos
                    </TabsTrigger>
                    <TabsTrigger
                      value="personalizados"
                      className="data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white"
                    >
                      Personalizados
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="predefinidos" className="mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {SUBTIPOS_PREDEFINIDOS.map((subtipo) => (
                        <SubtipoCard
                          key={subtipo.value}
                          subtipo={subtipo}
                          isSelected={formData.subtipo === subtipo.value}
                          onSelect={() => handleSelectSubtipo(subtipo.value)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="personalizados" className="mt-2">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {SUBTIPOS_PERSONALIZADOS.map((subtipo) => (
                          <SubtipoCard
                            key={subtipo.value}
                            subtipo={subtipo}
                            isSelected={formData.subtipo === subtipo.value}
                            onSelect={() => handleSelectSubtipo(subtipo.value)}
                          />
                        ))}
                      </div>

                      {/* New Subtype Input */}
                      <div className="space-y-2">
                        <Label htmlFor="novoSubtipo" className="text-sm flex items-center gap-1">
                          <Plus className="h-4 w-4 text-emerald-400" />
                          Adicionar Novo Subtipo Personalizado
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            id="novoSubtipo"
                            value={novoSubtipo}
                            onChange={(e) => setNovoSubtipo(e.target.value)}
                            placeholder="Digite um novo subtipo"
                            className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500"
                          />
                          <Button
                            type="button"
                            onClick={handleAddSubtipo}
                            variant="outline"
                            className="border-gray-700 text-emerald-400 hover:text-white hover:bg-emerald-700 hover:border-emerald-700 transition-all"
                            disabled={!novoSubtipo.trim()}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {errors.subtipo && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.subtipo}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Additional Information */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-emerald-400" />
                  Prioridade
                </Label>
                <PrioridadeSelector 
                  prioridade={formData.prioridade} 
                  onSelect={handleSelectPrioridade} 
                />
              </div>

              {/* Responsible */}
              <FormField
                id="responsavel"
                label="Responsável"
                value={formData.responsavel || ""}
                onChange={handleChange}
                icon={<User className="h-4 w-4 text-emerald-400" />}
                placeholder="Nome do responsável"
              />

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="dataLimite" className="text-sm flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  Data Limite
                </Label>
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 hover:bg-gray-700 hover:text-white",
                          !date && "text-gray-400",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        className="bg-gray-800 text-white"
                      />
                    </PopoverContent>
                  </Popover>

                  {date && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 p-2 rounded-md">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {date < new Date() ? (
                          <span className="text-red-400">Data no passado</span>
                        ) : (
                          <span>
                            Faltam {Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div
                className={cn(
                  "mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700 transition-all duration-300",
                  animatePreview && "border-emerald-500 shadow-lg shadow-emerald-900/20",
                )}
              >
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-emerald-400" />
                  Prévia da Pendência
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn("px-3 py-1 text-white font-medium rounded-md", styleUtils.getTipoBadgeColor(formData.tipo))}
                    >
                      {formData.tipo}
                    </Badge>

                    <Badge
                      variant="outline"
                      className={cn(
                        "border rounded-full px-3 py-1 text-xs font-medium",
                        styleUtils.getStatusColor(formData.subtipo),
                      )}
                    >
                      {formData.subtipo}
                    </Badge>
                  </div>

                  <p className="text-white font-medium">{formData.descricao || "Sem descrição"}</p>

                  {formData.detalhes && <p className="text-gray-400 text-sm line-clamp-2">{formData.detalhes}</p>}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border rounded-full px-3 py-1 text-xs font-medium",
                        styleUtils.getPrioridadeColor(formData.prioridade),
                      )}
                    >
                      {formData.prioridade === "alta"
                        ? "Prioridade Alta"
                        : formData.prioridade === "media"
                          ? "Prioridade Média"
                          : "Prioridade Baixa"}
                    </Badge>

                    {formData.responsavel && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
                        <User className="h-3 w-3" />
                        <span>{formData.responsavel}</span>
                      </div>
                    )}
                  </div>

                  {formData.dataLimite && (
                    <div className="text-xs text-gray-400 flex items-center gap-1 p-2 rounded-md bg-gray-700/50">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Prazo: {new Date(formData.dataLimite).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-gray-700 flex flex-col sm:flex-row gap-2">
            {step === 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm()
                  onOpenChange(false)
                }}
                className="w-full sm:w-auto border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700"
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="w-full sm:w-auto border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700"
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
            )}

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Adicionar Pendência
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}