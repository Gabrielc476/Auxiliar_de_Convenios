"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Copy,
  FileEdit,
  FileText,
  Check,
  Building2,
  Phone,
  Mail,
  User,
  MapPin,
  CreditCard,
  ClipboardCheck,
  FileCheck,
  Plus,
  PlusCircle,
  Search,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import EditMunicipalityModal from "@/components/edit-municipality-modal"
import CertidoesModal from "@/components/certidoes-modal"
import AddMunicipioModal from "@/components/add-municipio-modal"
import AddConvenioModal from "@/components/add-convenio-modal"
import type { MunicipioDados } from "@/interfaces/municipioInterfaces"
import { useAuth } from "@/contexts/authContext"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { apiService } from "@/services/api"

interface CopyableFieldProps {
  label: string
  value: string
  isCopied: boolean
  icon?: React.ElementType
  onCopy: (text: string, label: string) => void
}

function CopyableField({ label, value, isCopied, icon: Icon, onCopy }: CopyableFieldProps) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm p-3.5 rounded-md bg-gray-750 hover:bg-gray-700 transition-colors group border-l-2 border-l-transparent hover:border-l-blue-500">
      <div className="flex items-center gap-3 overflow-hidden">
        {Icon && (
          <div className="bg-gray-800 p-2 rounded-md group-hover:bg-gray-700 transition-colors">
            <Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
          </div>
        )}
        <div className="overflow-hidden">
          <span className="text-xs font-medium text-gray-400 block mb-0.5 uppercase tracking-wide">{label}</span>
          <span className="text-white truncate block font-medium">{value || "Não informado"}</span>
        </div>
      </div>
      <button
        onClick={() => onCopy(value, label)}
        className="text-gray-500 hover:text-white p-1.5 rounded-full hover:bg-gray-600/50 transition-all"
        title="Copiar para área de transferência"
      >
        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}

export default function MunicipiosDadosPage() {
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({})
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioDados | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [certidoesModalOpen, setCertidoesModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addConvenioModalOpen, setAddConvenioModalOpen] = useState(false)
  const [municipios, setMunicipios] = useState<MunicipioDados[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  // Buscar dados dos municípios
  const fetchMunicipios = async () => {
    try {
      // Usando o serviço de API centralizado
      const data = await apiService.getMunicipiosDados()
      console.log(data)
      // Adicionar ids temporários se não existirem
      const municipiosWithIds = data.map((m, index) => ({
        ...m,
        id: m.id || `temp-id-${index}`,
      }))

      setMunicipios(municipiosWithIds)
    } catch (error: any) {
      console.error("Erro ao buscar dados dos municípios:", error)
      setError(error.message || "Erro ao carregar dados")

      toast({
        title: "Erro",
        description: "Não foi possível carregar os municípios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMunicipios()
  }, [])

  // Função para copiar para área de transferência
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedItems((prev) => ({ ...prev, [text]: true }))
        toast({
          title: "Copiado!",
          description: `${label} copiado com sucesso.`,
          duration: 2000,
        })
        setTimeout(() => setCopiedItems((prev) => ({ ...prev, [text]: false })), 2000)
      })
      .catch(() => {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o texto.",
          variant: "destructive",
          duration: 2000,
        })
      })
  }

  // Handlers para modais
  const handleEditMunicipio = (municipio: MunicipioDados) => {
    setSelectedMunicipio(municipio)
    setEditModalOpen(true)
  }

  const handleAddConvenio = (municipio: MunicipioDados) => {
    setSelectedMunicipio(municipio)
    setAddConvenioModalOpen(true)
  }

  const handleSaveMunicipio = async (updatedMunicipio: MunicipioDados) => {
    try {
      // Check if we're dealing with a temporary ID
      if (updatedMunicipio.id && updatedMunicipio.id.startsWith("temp-id")) {
        // This has a temporary ID - we need to create, not update
        console.log("Creating new municipality from temp ID:", updatedMunicipio.municipio)

        // Create the municipality
        const response = await apiService.createMunicipio({
          municipio: updatedMunicipio.municipio,
          cnpj: updatedMunicipio.cnpj,
          prefeito: updatedMunicipio.prefeito,
          endereco: updatedMunicipio.endereco,
          e_mail: updatedMunicipio.e_mail,
          telefone: updatedMunicipio.telefone,
          rg_prefeito: updatedMunicipio.rg_prefeito,
          cpf_prefeito: updatedMunicipio.cpf_prefeito,
          operacional: updatedMunicipio.operacional,
        })

        // Update local state
        setMunicipios((prev) => {
          // Find if there's any with this temp ID to replace
          const hasTempId = prev.some((m) => m.id === updatedMunicipio.id)

          if (hasTempId) {
            // Replace the one with temp ID
            return prev.map((m) => (m.id === updatedMunicipio.id ? { ...updatedMunicipio, id: response.id } : m))
          } else {
            // Add as new
            return [...prev, { ...updatedMunicipio, id: response.id }]
          }
        })

        toast({
          title: "Município criado",
          description: `${updatedMunicipio.municipio} foi criado com sucesso.`,
          duration: 3000,
        })
      } else if (updatedMunicipio.id) {
        // This has a real ID - proceed with update
        console.log("Updating existing municipality:", updatedMunicipio.id, updatedMunicipio.municipio)

        await apiService.updateMunicipioDados(updatedMunicipio.id, {
          municipio: updatedMunicipio.municipio,
          cnpj: updatedMunicipio.cnpj,
          prefeito: updatedMunicipio.prefeito,
          endereco: updatedMunicipio.endereco,
          e_mail: updatedMunicipio.e_mail,
          telefone: updatedMunicipio.telefone,
          rg_prefeito: updatedMunicipio.rg_prefeito,
          cpf_prefeito: updatedMunicipio.cpf_prefeito,
          operacional: updatedMunicipio.operacional,
        })

        // Update local state
        setMunicipios((prev) => prev.map((m) => (m.id === updatedMunicipio.id ? updatedMunicipio : m)))

        toast({
          title: "Dados atualizados",
          description: `Os dados de ${updatedMunicipio.municipio} foram salvos.`,
          duration: 3000,
        })
      } else {
        // No ID at all - this is a new municipality
        console.log("Creating brand new municipality:", updatedMunicipio.municipio)

        const response = await apiService.createMunicipio({
          municipio: updatedMunicipio.municipio,
          cnpj: updatedMunicipio.cnpj,
          prefeito: updatedMunicipio.prefeito,
          endereco: updatedMunicipio.endereco,
          e_mail: updatedMunicipio.e_mail,
          telefone: updatedMunicipio.telefone,
          rg_prefeito: updatedMunicipio.rg_prefeito,
          cpf_prefeito: updatedMunicipio.cpf_prefeito,
          operacional: updatedMunicipio.operacional,
        })

        // Add to local state
        setMunicipios((prev) => [...prev, { ...updatedMunicipio, id: response.id }])

        toast({
          title: "Município criado",
          description: `${updatedMunicipio.municipio} foi criado com sucesso.`,
          duration: 3000,
        })
      }
    } catch (error: any) {
      console.error("Erro ao processar município:", error)

      if (error.message && error.message.includes("Já existe um município")) {
        toast({
          title: "Erro",
          description: `Já existe um município cadastrado com o nome "${updatedMunicipio.municipio}". Use um nome diferente.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erro na operação",
          description: error.message || "Não foi possível salvar as alterações",
          variant: "destructive",
        })
      }
    } finally {
      setEditModalOpen(false)
    }
  }
  const handleAddMunicipio = (newMunicipio: MunicipioDados) => {
    // Aqui você implementaria a lógica para adicionar o município à lista
    setMunicipios((prev) => [...prev, newMunicipio])
  }

  const handleConvenioAdded = () => {
    // Recarregar dados após adicionar um convênio
    toast({
      title: "Convênio adicionado",
      description: "O convênio foi adicionado com sucesso",
      duration: 3000,
    })

    // Recarregar municípios (na implementação real)
    fetchMunicipios()
  }

  // Filtrar municípios com base nos municípios atribuídos ao usuário e termo de busca
  const filteredMunicipios = municipios
    .filter((m) => (user?.municipios?.length ? user.municipios.includes(m.municipio) : true))
    .filter(
      (m) =>
        searchTerm === "" ||
        m.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.prefeito.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="p-10 rounded-xl bg-gray-800 shadow-2xl border border-gray-700/50 flex flex-col items-center max-w-md w-full mx-4">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-t-blue-500 border-gray-600/30 rounded-full animate-spin"></div>
            <Building2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Carregando dados dos municípios</h3>
          <p className="text-gray-400 text-center mb-4">Aguarde enquanto buscamos as informações mais recentes</p>
          <div className="w-full bg-gray-700/50 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="p-8 rounded-xl bg-gray-800 border-l-4 border-l-red-500 border border-gray-700/50 max-w-md shadow-xl w-full">
          <div className="flex items-start gap-4">
            <div className="bg-red-500/10 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                Erro ao carregar dados
                <span className="text-sm font-normal text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md">500</span>
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">{error}</p>
              <Button
                className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 group"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 p-4 md:p-8 pt-6 md:pt-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gray-800 rounded-xl border border-gray-700/70 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent pointer-events-none"></div>
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <h1 className="text-white text-3xl font-bold tracking-tight">Dados Cadastrais dos Municípios</h1>
                </div>
                <p className="text-gray-400 max-w-2xl pl-11">
                  Informações oficiais sobre os municípios e seus representantes
                </p>
              </div>

              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Buscar município ou prefeito..."
                    className="bg-gray-750 border-gray-700/50 pl-10 pr-4 py-2.5 w-full md:w-80 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                </div>

                <Button
                  className="bg-blue-600 hover:bg-blue-700 font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 hover:translate-y-[-1px]"
                  onClick={() => setAddModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Município
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-gray-750 border-t border-gray-700/50 px-6 py-3 flex flex-wrap gap-6 justify-start md:justify-end">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-gray-400 text-sm">
                <span className="text-white font-medium">
                  {filteredMunicipios.filter((m) => m.operacional === "Ativo").length}
                </span>{" "}
                Ativos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-500"></div>
              <span className="text-gray-400 text-sm">
                <span className="text-white font-medium">
                  {filteredMunicipios.filter((m) => m.operacional !== "Ativo").length}
                </span>{" "}
                Inativos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-400 text-sm">
                <span className="text-white font-medium">{filteredMunicipios.length}</span> Total
              </span>
            </div>
          </div>
        </div>

        {filteredMunicipios.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-gray-800 rounded-xl border border-gray-700/70 shadow-lg">
            <div className="relative mb-6">
              <div className="bg-gray-750 p-6 rounded-full">
                <Building2 className="h-16 w-16 text-gray-600" />
              </div>
              {searchTerm && (
                <div className="absolute -top-2 -right-2 bg-gray-700 p-2 rounded-full">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">Nenhum município encontrado</h2>
            <p className="text-gray-400 text-center max-w-md mb-6">
              {searchTerm
                ? `Não foram encontrados municípios com o termo "${searchTerm}".`
                : "Não há municípios disponíveis para visualização."}
            </p>
            {searchTerm && (
              <Button
                className="mt-2 bg-gray-700 hover:bg-gray-600 border border-gray-600"
                onClick={() => setSearchTerm("")}
              >
                Limpar busca
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMunicipios.map((municipio) => (
              <Card
                key={municipio.id}
                className="bg-gray-800 border-gray-700/70 hover:border-gray-600 transition-all overflow-hidden rounded-xl shadow-lg"
              >
                <Accordion type="single" collapsible>
                  <AccordionItem value="details" className="border-none">
                    <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-5">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md relative overflow-hidden group-hover:shadow-blue-500/20 transition-all">
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                            {municipio.municipio.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-xl text-white block group-hover:text-blue-400 transition-colors">
                              {municipio.municipio}
                            </span>
                            <span className="text-sm text-gray-400 flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-gray-500" />
                              {municipio.prefeito}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={`${
                              municipio.operacional === "Ativo"
                                ? "bg-green-900/10 text-green-400 border-green-700/30"
                                : "bg-gray-700/50 text-gray-300 border-gray-600"
                            } px-3 py-1 rounded-full text-xs font-medium`}
                          >
                            {municipio.operacional}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-gray-500 group-data-[state=open]:rotate-90 transition-transform" />
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="overflow-hidden">
                      <div className="px-6 pb-6 pt-0">
                        <Tabs defaultValue="info" className="w-full">
                          <TabsList className="bg-gray-750 mb-8 p-1 border border-gray-700/50 rounded-lg">
                            <TabsTrigger
                              value="info"
                              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-4 py-2 transition-all"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Informações
                            </TabsTrigger>
                            <TabsTrigger
                              value="docs"
                              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-4 py-2 transition-all"
                            >
                              <ClipboardCheck className="h-4 w-4 mr-2" />
                              Documentos
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="info" className="mt-0 animate-in fade-in-50 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Seção de Dados do Município */}
                              <div className="space-y-4">
                                <h3 className="font-semibold text-blue-400 mb-4 flex items-center gap-2 bg-gray-750 px-4 py-2 rounded-lg border-l-2 border-l-blue-500 border-y border-r border-gray-700/50">
                                  <Building2 className="h-5 w-5" />
                                  Dados Municipais
                                </h3>
                                <div className="bg-gray-800/50 p-0.5 rounded-lg space-y-0.5">
                                  <CopyableField
                                    label="CNPJ"
                                    value={municipio.cnpj}
                                    isCopied={!!copiedItems[municipio.cnpj]}
                                    onCopy={copyToClipboard}
                                    icon={CreditCard}
                                  />
                                  <CopyableField
                                    label="Endereço"
                                    value={municipio.endereco}
                                    isCopied={!!copiedItems[municipio.endereco]}
                                    onCopy={copyToClipboard}
                                    icon={MapPin}
                                  />
                                  <CopyableField
                                    label="Telefone"
                                    value={municipio.telefone}
                                    isCopied={!!copiedItems[municipio.telefone]}
                                    onCopy={copyToClipboard}
                                    icon={Phone}
                                  />
                                  <CopyableField
                                    label="E-mail"
                                    value={municipio.e_mail}
                                    isCopied={!!copiedItems[municipio.e_mail]}
                                    onCopy={copyToClipboard}
                                    icon={Mail}
                                  />
                                </div>
                              </div>

                              {/* Seção de Dados do Prefeito */}
                              <div className="space-y-4">
                                <h3 className="font-semibold text-blue-400 mb-4 flex items-center gap-2 bg-gray-750 px-4 py-2 rounded-lg border-l-2 border-l-blue-500 border-y border-r border-gray-700/50">
                                  <User className="h-5 w-5" />
                                  Dados do Prefeito
                                </h3>
                                <div className="bg-gray-800/50 p-0.5 rounded-lg space-y-0.5">
                                  <CopyableField
                                    label="Nome"
                                    value={municipio.prefeito}
                                    isCopied={!!copiedItems[municipio.prefeito]}
                                    onCopy={copyToClipboard}
                                    icon={User}
                                  />
                                  <CopyableField
                                    label="CPF"
                                    value={municipio.cpf_prefeito}
                                    isCopied={!!copiedItems[municipio.cpf_prefeito]}
                                    onCopy={copyToClipboard}
                                    icon={CreditCard}
                                  />
                                  <CopyableField
                                    label="RG"
                                    value={municipio.rg_prefeito}
                                    isCopied={!!copiedItems[municipio.rg_prefeito]}
                                    onCopy={copyToClipboard}
                                    icon={CreditCard}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Seção de Ações */}
                            <div className="mt-10 border-t border-gray-700/50 pt-8">
                              <h3 className="font-semibold text-gray-300 mb-4 flex items-center gap-2">
                                <ClipboardCheck className="h-5 w-5 text-gray-400" />
                                Ações Disponíveis
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <Button
                                  variant="default"
                                  className="bg-blue-600 hover:bg-blue-700 h-auto py-3 justify-start"
                                  onClick={() => handleEditMunicipio(municipio)}
                                >
                                  <div className="bg-blue-700/50 p-2 rounded-md mr-3">
                                    <FileEdit className="h-4 w-4" />
                                  </div>
                                  <div className="text-left">
                                    <span className="block font-medium">Editar Cadastro</span>
                                    <span className="text-xs text-blue-200/70">Atualizar informações</span>
                                  </div>
                                </Button>

                                <Button
                                  variant="outline"
                                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 h-auto py-3 justify-start"
                                  onClick={() => {
                                    setSelectedMunicipio(municipio)
                                    setCertidoesModalOpen(true)
                                  }}
                                >
                                  <div className="bg-gray-700/50 p-2 rounded-md mr-3">
                                    <FileCheck className="h-4 w-4" />
                                  </div>
                                  <div className="text-left">
                                    <span className="block font-medium">Gerenciar Certidões</span>
                                    <span className="text-xs text-gray-400">Documentos oficiais</span>
                                  </div>
                                </Button>

                                <Button
                                  variant="outline"
                                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 h-auto py-3 justify-start"
                                >
                                  <div className="bg-gray-700/50 p-2 rounded-md mr-3">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div className="text-left">
                                    <span className="block font-medium">Documentos Anexados</span>
                                    <span className="text-xs text-gray-400">Visualizar arquivos</span>
                                  </div>
                                </Button>

                                <Button
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700 h-auto py-3 justify-start"
                                  onClick={() => handleAddConvenio(municipio)}
                                >
                                  <div className="bg-green-700/50 p-2 rounded-md mr-3">
                                    <PlusCircle className="h-4 w-4" />
                                  </div>
                                  <div className="text-left">
                                    <span className="block font-medium">Adicionar Convênio</span>
                                    <span className="text-xs text-green-200/70">Novo acordo</span>
                                  </div>
                                </Button>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="docs" className="mt-0 animate-in fade-in-50 duration-300">
                            <div className="bg-gray-750 rounded-lg p-10 text-center border border-gray-700/50 shadow-lg">
                              <div className="bg-gray-700/50 p-4 rounded-full inline-flex mx-auto mb-6 relative">
                                <FileText className="h-16 w-16 text-gray-500" />
                                <span className="absolute -top-1 -right-1 bg-gray-800 p-1.5 rounded-full">
                                  <Plus className="h-4 w-4 text-gray-400" />
                                </span>
                              </div>
                              <h3 className="text-white text-xl font-medium mb-3">Documentos do Município</h3>
                              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                Esta seção está em desenvolvimento. Em breve você poderá visualizar e gerenciar
                                documentos.
                              </p>
                              <Button className="bg-blue-600 hover:bg-blue-700 px-6">
                                <FileText className="h-4 w-4 mr-2" />
                                Solicitar Documentos
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {selectedMunicipio && (
        <EditMunicipalityModal
          municipio={selectedMunicipio}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSave={handleSaveMunicipio}
        />
      )}

      {/* Modal de Certidões */}
      {selectedMunicipio && (
        <CertidoesModal municipio={selectedMunicipio} open={certidoesModalOpen} onOpenChange={setCertidoesModalOpen} />
      )}

      {/* Modal de Adicionar Município */}
      <AddMunicipioModal open={addModalOpen} onOpenChange={setAddModalOpen} onSuccess={handleAddMunicipio} />

      {/* Modal de Adicionar Convênio */}
      {selectedMunicipio && (
        <AddConvenioModal
          municipio={selectedMunicipio.municipio}
          open={addConvenioModalOpen}
          onOpenChange={setAddConvenioModalOpen}
          onSuccess={handleConvenioAdded}
        />
      )}

      {/* Toaster para notificações */}
      <Toaster />
    </main>
  )
}

