"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, Plus, Search, Clock, Loader2, ClipboardList } from "lucide-react"
import type { PendenciaType, NovaPendenciaType } from "@/interfaces/pendenciaInterfaces"
import PendenciaCard from "./pendencia-card"
import AddPendenciaModal from "./add-pendencia-modal"
import { EmptyState } from "@/components/ui/feedback"
import { apiService } from "@/services/api"
import { Badge } from "@/components/ui/badge"

interface PendenciasAreaProps {
  convenioId: string
  municipioId: string
}

export default function PendenciasArea({ convenioId, municipioId }: PendenciasAreaProps) {
  // Estado para armazenar pendências
  const [pendencias, setPendencias] = useState<PendenciaType[]>([])
  const [filteredPendencias, setFilteredPendencias] = useState<PendenciaType[]>([])
  const [selectedTab, setSelectedTab] = useState("todas")
  const [searchTerm, setSearchTerm] = useState("")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar pendências do backend
  useEffect(() => {
    const fetchPendencias = async () => {
      try {
        setLoading(true)
        console.log(`Buscando pendências para convênio: ${convenioId}, município: ${municipioId}`)

        // Tentar obter as pendências
        const data = await apiService.getPendencias(convenioId, municipioId)

        // Verificar se data é um array
        if (Array.isArray(data)) {
          console.log(`${data.length} pendências encontradas`)
          // Garantir que cada pendência tenha um ID único
          const processedData = data.map((pendencia, index) => ({
            ...pendencia,
            // Se não tiver ID, usar um temporário
            id: pendencia.id || `temp-id-${index}-${Date.now()}`,
          }))
          setPendencias(processedData)
        } else {
          console.warn("Resposta da API não é um array:", data)
          setPendencias([])
        }

        setError(null)
      } catch (err: any) {
        console.error("Erro ao buscar pendências:", err)
        setPendencias([])
      } finally {
        setLoading(false)
      }
    }

    fetchPendencias()
  }, [convenioId, municipioId])

  // Aplicar filtragem sempre que os dados ou critérios de filtro mudam
  useEffect(() => {
    filterPendencias()
  }, [pendencias, selectedTab, searchTerm])

  // Função para filtrar pendências
  const filterPendencias = () => {
    if (!pendencias || pendencias.length === 0) {
      setFilteredPendencias([])
      return
    }

    let filtered = [...pendencias]

    // Filtrar por status (tab)
    if (selectedTab === "abertas") {
      filtered = filtered.filter((p) => p.status === "aberta")
    } else if (selectedTab === "concluidas") {
      filtered = filtered.filter((p) => p.status === "concluida")
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.descricao?.toLowerCase().includes(term) ||
          p.detalhes?.toLowerCase().includes(term) ||
          p.tipo?.toLowerCase().includes(term) ||
          p.subtipo?.toLowerCase().includes(term) ||
          (p.responsavel && p.responsavel.toLowerCase().includes(term)),
      )
    }

    // Ordenar por prioridade e data de criação
    filtered.sort((a, b) => {
      // Primeiro por prioridade (alta > média > baixa)
      const prioridadeOrder = { alta: 3, media: 2, baixa: 1 }
      const prioridadeA = prioridadeOrder[a.prioridade as keyof typeof prioridadeOrder] || 0
      const prioridadeB = prioridadeOrder[b.prioridade as keyof typeof prioridadeOrder] || 0

      if (prioridadeA !== prioridadeB) {
        return prioridadeB - prioridadeA
      }

      // Depois por data (mais recente primeiro)
      return new Date(b.dataCriacao || Date.now()).getTime() - new Date(a.dataCriacao || Date.now()).getTime()
    })

    setFilteredPendencias(filtered)
  }

  // Manipulador para adicionar pendências
  const handleAddPendencia = async (novaPendencia: NovaPendenciaType) => {
    try {
      const pendenciaCriada = await apiService.createPendencia(novaPendencia)

      // Garantir que a pendência criada tenha um ID
      const pendenciaComId = {
        ...pendenciaCriada,
        id: pendenciaCriada.id || `new-id-${Date.now()}`,
      }

      setPendencias((prev) => [...prev, pendenciaComId])
      toast({
        title: "Pendência adicionada",
        description: "A pendência foi adicionada com sucesso!",
        duration: 3000,
      })
    } catch (err: any) {
      console.error("Erro ao adicionar pendência:", err)
      toast({
        title: "Erro ao adicionar pendência",
        description: err.message || "Ocorreu um erro ao adicionar a pendência",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Manipulador para atualizar pendências
  // Manipulador para atualizar pendências
const handleUpdatePendencia = async (pendenciaAtualizada: PendenciaType) => {
  try {
    // Extrair o ID e os dados a serem atualizados
    const { id, ...updateData } = pendenciaAtualizada;
    
    // Verificar se é um ID temporário (começa com "temp-id")
    if (id.startsWith("temp-id")) {
      // Para IDs temporários, criar uma nova pendência em vez de atualizar
      const novaPendencia: NovaPendenciaType = {
        convenioId: updateData.convenioId,
        municipioId: updateData.municipioId,
        tipo: updateData.tipo as PendenciaType,
        subtipo: updateData.subtipo,
        descricao: updateData.descricao,
        detalhes: updateData.detalhes,
        responsavel: updateData.responsavel,
        dataLimite: updateData.dataLimite,
        prioridade: updateData.prioridade as "baixa" | "media" | "alta",
      };
      
      // Criar nova pendência
      const response = await apiService.createPendencia(novaPendencia);
      
      // Atualizar a lista local substituindo o item com ID temporário pelo novo
      setPendencias((prev) => prev.map((p) => 
        p.id === id ? { ...response, id: response.id || id } : p
      ));
      
      toast({
        title: "Pendência criada",
        description: "As alterações foram salvas com sucesso!",
        duration: 3000,
      });
    } else {
      // Para IDs reais, proceder com a atualização normal
      const updated = await apiService.updatePendencia(id, updateData);
      
      // Garantir que a pendência atualizada tenha o mesmo ID
      const updatedWithId = {
        ...updated,
        id: id || updated.id,
      };
      
      setPendencias((prev) => prev.map((p) => (p.id === id ? updatedWithId : p)));
      
      toast({
        title: "Pendência atualizada",
        description: "As alterações foram salvas com sucesso!",
        duration: 3000,
      });
    }
  } catch (err: any) {
    console.error("Erro ao atualizar pendência:", err);
    toast({
      title: "Erro ao atualizar pendência",
      description: err.message || "Ocorreu um erro ao salvar as alterações",
      variant: "destructive",
      duration: 3000,
    });
  }
};

  // Manipulador para excluir pendências
  const handleDeletePendencia = async (id: string) => {
    // Confirmar antes de excluir
    if (window.confirm("Tem certeza que deseja excluir esta pendência?")) {
      try {
        await apiService.deletePendencia(id)
        setPendencias((prev) => prev.filter((p) => p.id !== id))

        toast({
          title: "Pendência excluída",
          description: "A pendência foi removida com sucesso!",
          variant: "destructive",
          duration: 3000,
        })
      } catch (err: any) {
        console.error("Erro ao excluir pendência:", err)
        toast({
          title: "Erro ao excluir pendência",
          description: err.message || "Ocorreu um erro ao excluir a pendência",
          variant: "destructive",
          duration: 3000,
        })
      }
    }
  }

  // Contagem de pendências para o cabeçalho
  const abertas = pendencias?.filter((p) => p.status === "aberta")?.length || 0
  const concluidas = pendencias?.filter((p) => p.status === "concluida")?.length || 0
  const total = pendencias?.length || 0

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800 shadow-xl mb-8 overflow-hidden">
        <CardHeader className="border-b border-gray-800 pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-amber-500" />
            Pendências do Convênio
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <div className="absolute inset-0 h-10 w-10 rounded-full border-t-2 border-blue-500 animate-ping opacity-20"></div>
            </div>
            <p className="text-gray-300 font-medium">Carregando pendências...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-xl mb-8 overflow-hidden">
      <CardHeader className="border-b border-gray-800 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-amber-500" />
              Pendências do Convênio
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Acompanhe e gerencie todas as pendências relacionadas a este convênio
            </CardDescription>
          </div>

          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Pendência
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-gray-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Abertas</p>
                <p className="text-2xl font-bold text-blue-400">{abertas}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Concluídas</p>
                <p className="text-2xl font-bold text-emerald-400">{concluidas}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Pesquisa */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-800/50 p-4 rounded-lg">
            <TabsList className="grid grid-cols-3 w-full md:w-auto bg-gray-700">
              <TabsTrigger
                value="todas"
                className="data-[state=active]:bg-gray-600 text-gray-300 data-[state=active]:text-white"
              >
                Todas
                <Badge variant="outline" className="ml-2 bg-gray-700 text-gray-300 border-gray-600">
                  {total}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="abertas"
                className="data-[state=active]:bg-blue-600 text-gray-300 data-[state=active]:text-white"
              >
                Abertas
                <Badge variant="outline" className="ml-2 bg-blue-900/30 text-blue-300 border-blue-700">
                  {abertas}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="concluidas"
                className="data-[state=active]:bg-emerald-600 text-gray-300 data-[state=active]:text-white"
              >
                Concluídas
                <Badge variant="outline" className="ml-2 bg-emerald-900/30 text-emerald-300 border-emerald-700">
                  {concluidas}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar pendências..."
                className="bg-gray-700 border-gray-600 text-white pl-9 pr-4 w-full focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Conteúdo das tabs */}
          <TabsContent value="todas" className="m-0 mt-4">
            {renderTabContent(filteredPendencias)}
          </TabsContent>

          <TabsContent value="abertas" className="m-0 mt-4">
            {renderTabContent(filteredPendencias)}
          </TabsContent>

          <TabsContent value="concluidas" className="m-0 mt-4">
            {renderTabContent(filteredPendencias)}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Modal para adicionar pendências */}
      <AddPendenciaModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSave={handleAddPendencia}
        convenioId={convenioId}
        municipioId={municipioId}
      />
    </Card>
  )

  // Função auxiliar para renderizar o conteúdo da tab
  function renderTabContent(pendencias: PendenciaType[]) {
    if (!pendencias || pendencias.length === 0) {
      return (
        <EmptyState
          icon={
            selectedTab === "concluidas" ? (
              <CheckCircle className="h-12 w-12 text-emerald-500 opacity-30" />
            ) : selectedTab === "abertas" ? (
              <Clock className="h-12 w-12 text-blue-500 opacity-30" />
            ) : (
              <ClipboardList className="h-12 w-12 text-gray-500 opacity-30" />
            )
          }
          title={`Nenhuma pendência ${selectedTab === "todas" ? "" : selectedTab === "abertas" ? "aberta" : "concluída"}`}
          description={
            searchTerm
              ? `Nenhuma pendência ${selectedTab === "todas" ? "" : selectedTab === "abertas" ? "aberta" : "concluída"} encontrada com o termo "${searchTerm}".`
              : `Não há pendências ${selectedTab === "todas" ? "" : selectedTab === "abertas" ? "abertas" : "concluídas"} para este convênio.`
          }
          action={
            <Button
              onClick={() => setAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 transition-colors mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Pendência
            </Button>
          }
          className="py-16 bg-gray-800/30 rounded-lg"
        />
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendencias.map((pendencia, index) => (
          <PendenciaCard
            key={pendencia.id || `pendencia-${index}`}
            pendencia={pendencia}
            onDelete={handleDeletePendencia}
            onUpdate={handleUpdatePendencia}
          />
        ))}
      </div>
    )
  }
}

