"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Edit, Trash2, User, Calendar, MoreVertical, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { PendenciaType } from "@/interfaces/pendenciaInterfaces"
import EditPendenciaModal from "./edit-pendencia-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PendenciaCardProps {
  pendencia: PendenciaType
  onDelete: (id: string) => Promise<void>
  onUpdate: (pendencia: PendenciaType) => Promise<void>
}

export default function PendenciaCard({ pendencia, onDelete, onUpdate }: PendenciaCardProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Função para definir a cor do badge com base no tipo
  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "prestação de contas":
        return "bg-amber-500/90 hover:bg-amber-500"
      case "licitação":
        return "bg-blue-500/90 hover:bg-blue-500"
      case "execução":
        return "bg-green-500/90 hover:bg-green-500"
      case "documentação":
        return "bg-purple-500/90 hover:bg-purple-500"
      default:
        return "bg-gray-500/90 hover:bg-gray-500"
    }
  }

  // Função para definir a cor do status/subtipo
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "aguardando documentos":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
      case "em análise":
        return "bg-blue-500/20 text-blue-300 border-blue-500/50"
      case "urgente":
        return "bg-red-500/20 text-red-300 border-red-500/50"
      case "concluído":
        return "bg-green-500/20 text-green-300 border-green-500/50"
      case "pendente":
        return "bg-orange-500/20 text-orange-300 border-orange-500/50"
      default:
        return "bg-gray-700 text-gray-300 border-gray-600"
    }
  }

  // Função para definir a cor da prioridade
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade.toLowerCase()) {
      case "alta":
        return "bg-red-500/20 text-red-300 border-red-500/50"
      case "media":
        return "bg-amber-500/20 text-amber-300 border-amber-500/50"
      case "baixa":
        return "bg-blue-500/20 text-blue-300 border-blue-500/50"
      default:
        return "bg-gray-700 text-gray-300 border-gray-600"
    }
  }

  // Formatar data relativa
  const getRelativeTime = (date: string) => {
    if (!date) return "Data não disponível"

    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR,
      })
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return "Data inválida"
    }
  }

  // Manipular exclusão com estado de carregamento
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(pendencia.id)
    } catch (error) {
      console.error("Erro ao excluir pendência:", error)
      setIsDeleting(false)
    }
  }

  // Verificar se a data limite está próxima (menos de 3 dias)
  const isDeadlineNear = () => {
    if (!pendencia.dataLimite) return false

    const dataLimite = new Date(pendencia.dataLimite)
    const hoje = new Date()
    const diffTime = dataLimite.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays >= 0 && diffDays <= 3
  }

  // Verificar se a data limite já passou
  const isDeadlinePassed = () => {
    if (!pendencia.dataLimite) return false

    const dataLimite = new Date(pendencia.dataLimite)
    const hoje = new Date()

    return dataLimite < hoje
  }

  return (
    <>
      <Card
        className={cn(
          "bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-200 shadow-md overflow-hidden group hover:shadow-lg hover:translate-y-[-2px]",
          pendencia.status === "concluida" && "border-l-4 border-l-green-500",
          pendencia.prioridade === "alta" && pendencia.status !== "concluida" && "border-l-4 border-l-red-500",
        )}
      >
        <div className="p-5 space-y-4">
          {/* Cabeçalho com tipo e data */}
          <div className="flex items-center justify-between">
            <Badge
              className={cn("px-3 py-1 text-white font-medium rounded-md shadow-sm", getTipoBadgeColor(pendencia.tipo))}
            >
              {pendencia.tipo}
            </Badge>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-700/40 px-2 py-1 rounded-full">
                <Clock className="h-3.5 w-3.5" />
                <span>{getRelativeTime(pendencia.dataCriacao)}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Ações</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white shadow-xl">
                  <DropdownMenuItem
                    onClick={() => setEditModalOpen(true)}
                    className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/30 focus:bg-red-900/30 transition-colors"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2"></div>
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <h3
              className={cn(
                "text-white font-medium line-clamp-2 group-hover:text-blue-50 transition-colors",
                pendencia.status === "concluida" && "text-gray-400 line-through",
              )}
            >
              {pendencia.descricao}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-3 group-hover:text-gray-300 transition-colors">
              {pendencia.detalhes}
            </p>
          </div>

          {/* Status/Subtipo, Prioridade e Responsável */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge
              variant="outline"
              className={cn(
                "border rounded-full px-3 py-1 text-xs font-medium shadow-sm",
                getStatusColor(pendencia.subtipo),
              )}
            >
              {pendencia.subtipo}
            </Badge>

            <Badge
              variant="outline"
              className={cn(
                "border rounded-full px-3 py-1 text-xs font-medium shadow-sm",
                getPrioridadeColor(pendencia.prioridade),
              )}
            >
              {pendencia.prioridade === "alta"
                ? "Prioridade Alta"
                : pendencia.prioridade === "media"
                  ? "Prioridade Média"
                  : "Prioridade Baixa"}
            </Badge>

            {pendencia.responsavel && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-700/50 px-2.5 py-1 rounded-full">
                <User className="h-3 w-3" />
                <span>{pendencia.responsavel}</span>
              </div>
            )}
          </div>

          {/* Data limite, se existir */}
          {pendencia.dataLimite && (
            <div
              className={cn(
                "text-xs flex items-center gap-1.5 p-2.5 rounded-md",
                isDeadlinePassed()
                  ? "bg-red-900/20 text-red-300 border border-red-900/30"
                  : isDeadlineNear()
                    ? "bg-amber-900/20 text-amber-300 border border-amber-900/30"
                    : "bg-gray-700/50 text-gray-300 border border-gray-700",
              )}
            >
              <Calendar
                className={cn(
                  "h-3.5 w-3.5",
                  isDeadlinePassed() ? "text-red-400" : isDeadlineNear() ? "text-amber-400" : "text-gray-400",
                )}
              />
              <span>
                {isDeadlinePassed() ? "Prazo expirado: " : isDeadlineNear() ? "Prazo próximo: " : "Prazo: "}
                {new Date(pendencia.dataLimite).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Status da pendência */}
          {pendencia.status === "concluida" && (
            <div className="text-xs bg-green-900/20 text-green-300 border border-green-900/30 flex items-center gap-1.5 p-2.5 rounded-md">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Pendência concluída</span>
            </div>
          )}
        </div>

        {/* Barra de progresso/status na parte inferior */}
        <div
          className={cn(
            "h-1 w-full",
            pendencia.status === "concluida"
              ? "bg-gradient-to-r from-green-900/50 to-green-800/30"
              : pendencia.prioridade === "alta"
                ? "bg-gradient-to-r from-red-900/50 to-red-800/30"
                : pendencia.prioridade === "media"
                  ? "bg-gradient-to-r from-amber-900/50 to-amber-800/30"
                  : "bg-gradient-to-r from-blue-900/50 to-blue-800/30",
          )}
        ></div>
      </Card>

      {/* Modal de edição */}
      <EditPendenciaModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        pendencia={pendencia}
        onSave={onUpdate}
      />
    </>
  )
}

