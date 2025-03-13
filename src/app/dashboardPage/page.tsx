"use client"

import { useState, useEffect } from "react"
import ConveniosCardsArea from "@/components/cardArea/convenioCardArea"
import { Button } from "@/components/ui/button"
import { FileUp, RefreshCw, LayoutDashboard, Bell, ChevronRight } from "lucide-react"
import UploadRelatorioModal from "@/components/upload-relatorios-modal"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/authContext"
import ReminderSummary from "@/components/reminders/reminder-summary"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [pageLoading, setPageLoading] = useState(true)

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  // Simular carregamento da página
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Função chamada quando o upload do relatório é bem-sucedido
  const handleUploadSuccess = () => {
    // Incrementa o trigger para forçar uma atualização dos dados
    setRefreshTrigger((prev) => prev + 1)

    // Fecha o modal
    setUploadModalOpen(false)

    // Exibe mensagem de sucesso
    toast({
      title: "Relatório processado com sucesso",
      description: "Os dados dos convênios foram atualizados.",
      duration: 5000,
    })
  }

  if (isLoading || pageLoading) {
    return (
      <div className="bg-gray-900 min-h-screen">
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:w-auto">
              <Skeleton className="h-7 w-64 bg-gray-700" />
              <Skeleton className="h-4 w-80 mt-2 bg-gray-700" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-36 bg-gray-700" />
              <Skeleton className="h-9 w-36 bg-gray-700" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <Skeleton className="h-64 w-full bg-gray-800" />
            </div>
            <div className="md:col-span-1">
              <Skeleton className="h-64 w-full bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Barra de navegação superior */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <LayoutDashboard className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard de Convênios</h1>
              <p className="text-gray-400 text-sm">Visualização e gerenciamento de convênios municipais</p>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Dados
            </Button>

            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setUploadModalOpen(true)}>
              <FileUp className="h-4 w-4 mr-2" />
              Enviar Relatório
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-400 mb-6">
          <span>Início</span>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-white">Dashboard</span>
        </div>

        {/* Resumo do usuário */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="text-white font-medium">{user?.name || "Usuário"}</h2>
                  <p className="text-gray-400 text-sm">{user?.email || "usuario@exemplo.com"}</p>
                </div>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center">
                <Badge className="bg-blue-600 text-white mr-2">Administrador</Badge>
                <Badge className="bg-gray-700 text-gray-300">Último acesso: Hoje</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Área com widgets e cards de convênios */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Cards de convênios à esquerda */}
          <div className="md:col-span-3 order-1">
            <ConveniosCardsArea key={refreshTrigger} />
          </div>

          {/* Widget de lembretes à direita */}
          <div className="md:col-span-1 order-2">
            <div className="sticky top-24">
              <div className="flex items-center mb-4">
                <Bell className="h-5 w-5 text-blue-500 mr-2" />
                <h2 className="text-lg font-bold text-white">Lembretes</h2>
              </div>
              <ReminderSummary />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de upload de relatório */}
      <UploadRelatorioModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} onSuccess={handleUploadSuccess} />
    </div>
  )
}

