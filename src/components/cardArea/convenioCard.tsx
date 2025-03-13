"use client"

import type React from "react"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileText, Info, Landmark, PercentCircle, ArrowUpRight, Clock } from "lucide-react"
import type { Convenio } from "@/interfaces/municipioInterfaces"
import { Progress } from "@/components/ui/progress"

interface ConvenioCardProps {
  data: Convenio
  municipio: string
}

// Helper para determinar cor baseada no percentual
const getStatusColor = (percent: string): string => {
  const value = Number.parseInt(percent)
  if (value === 100) return "bg-green-500"
  if (value > 50) return "bg-yellow-500"
  return "bg-blue-500"
}

// Helper para determinar cor do texto baseada no percentual
const getStatusTextColor = (percent: string): string => {
  const value = Number.parseInt(percent)
  if (value === 100) return "text-green-500"
  if (value > 50) return "text-yellow-500"
  return "text-blue-500"
}

// Helper para determinar cor do progresso baseada no percentual
const getProgressColor = (percent: string): string => {
  const value = Number.parseInt(percent)
  if (value === 100) return "bg-green-500"
  if (value > 50) return "bg-yellow-500"
  return "bg-blue-500"
}

// Componente para informações com ícones
interface InfoItemProps {
  icon: React.ElementType
  label: string
  value: string
  className?: string
}

const InfoItem = ({ icon: Icon, label, value, className }: InfoItemProps) => (
  <div className={`space-y-1 ${className}`}>
    <div className="flex items-center text-gray-400">
      <Icon className="h-4 w-4 mr-2" />
      <span className="text-xs">{label}</span>
    </div>
    <p className="text-white font-semibold">{value}</p>
  </div>
)

export function ConvenioCard({ data, municipio }: ConvenioCardProps) {
  const dados = data.dados[0]
  const statusColor = getStatusColor(dados.percentual_execucao_obra)
  const statusTextColor = getStatusTextColor(dados.percentual_execucao_obra)
  const progressColor = getProgressColor(dados.percentual_execucao_obra)
  const percentValue = Number.parseInt(dados.percentual_execucao_obra)

  // Formatação de dados da empresa
  const empresaNome = dados.empresa_executora.includes(") ")
    ? dados.empresa_executora.split(") ")[1]
    : dados.empresa_executora

  // Parâmetros para URL
  const municipioParam = encodeURIComponent(municipio)
  const convenioParam = encodeURIComponent(data.convenio)

  // Calcular dias restantes até a vigência
  const calcularDiasRestantes = () => {
    const partes = dados.vigencia_convenio.split("/")
    const dataVigencia = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`)
    const hoje = new Date()
    const diferenca = dataVigencia.getTime() - hoje.getTime()
    const diasRestantes = Math.ceil(diferenca / (1000 * 3600 * 24))
    return diasRestantes
  }

  const diasRestantes = calcularDiasRestantes()
  const statusVigencia =
    diasRestantes <= 30 ? "text-red-500" : diasRestantes <= 90 ? "text-yellow-500" : "text-green-500"

  return (
    <Card className="bg-gray-800 border-gray-700 overflow-hidden hover:border-blue-500 transition-all cursor-pointer group">
      <Link href={`/convenio/${municipioParam}/${convenioParam}`} className="block h-full">
        <div className={`h-1 ${statusColor}`} />
        <CardHeader className="space-y-4 p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Badge variant="outline" className="mb-2 border-gray-600">
                Convênio
              </Badge>
              <h3 className="text-lg font-semibold text-white leading-tight line-clamp-1">{data.convenio}</h3>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{data.convenio}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-gray-400 line-clamp-2 h-10">{data.objeto}</p>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={Landmark} label="Valor do Repasse" value={dados.valor_repasse} />
            <div className="space-y-1">
              <div className="flex items-center text-gray-400">
                <PercentCircle className="h-4 w-4 mr-2" />
                <span className="text-xs">Execução</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className={`font-semibold ${statusTextColor}`}>{dados.percentual_execucao_obra}</p>
                </div>
                <Progress
                  value={percentValue}
                  max={100}
                  className="h-2 bg-gray-700"
                  indicatorClassName={progressColor}
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-gray-400">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-xs">Empresa Executora</span>
            </div>
            <p className="text-white text-sm font-medium line-clamp-1">{empresaNome}</p>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 border-t border-gray-700">
          <div className="flex items-center text-gray-400 text-xs">
            <Clock className="h-4 w-4 mr-2" />
            <span className={statusVigencia}>
              {diasRestantes > 0 ? `${diasRestantes} dias restantes` : "Vigência expirada"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
              {municipio}
            </Badge>
            <ArrowUpRight className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}

