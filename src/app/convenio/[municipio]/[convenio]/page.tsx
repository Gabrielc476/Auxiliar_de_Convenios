"use client"

import type React from "react"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import type { Convenio } from "@/interfaces/municipioInterfaces"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Landmark, Calendar, FileText, ClipboardList, BarChart3, Building2, ArrowUpRight } from "lucide-react"
import { apiService } from "@/services/api"
import { Loading, ErrorMessage } from "@/components/ui/feedback"
import PendenciasArea from "@/components/pendencias/pendencias-area"

// Componente reutilizável para itens de informação
interface InfoItemProps {
  label: string
  value?: string
}

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="flex justify-between items-center py-2 group transition-all">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className="text-white font-medium group-hover:text-emerald-400 transition-colors">{value || "N/A"}</span>
  </div>
)

// Componente para seções de cartão
interface InfoSectionProps {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}

const InfoSection = ({ title, icon: Icon, children }: InfoSectionProps) => (
  <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden group">
    <CardHeader className="relative">
      <CardTitle className="text-white flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-gray-700 group-hover:bg-gray-600 transition-colors">
          <Icon className="h-4 w-4 text-emerald-400" />
        </div>
        {title}
      </CardTitle>
      <Separator className="bg-gray-700" />
    </CardHeader>
    <CardContent className="space-y-2 relative">{children}</CardContent>
  </Card>
)

export default function ConvenioDetailPage() {
  const params = useParams()
  const [data, setData] = useState<Convenio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const municipio = decodeURIComponent(params.municipio as string)
  const convenio = decodeURIComponent(params.convenio as string)

  useEffect(() => {
    const fetchData = async () => {
      if (!municipio || !convenio) {
        setError("Parâmetros inválidos")
        setLoading(false)
        return
      }

      try {
        const response = await apiService.getConvenioDetails(municipio, convenio)
        setData(response)
        setError(null)
      } catch (err) {
        setError("Erro ao carregar detalhes do convênio")
        console.error("Erro ao buscar detalhes:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [municipio, convenio])

  if (loading) {
    return <Loading text="Carregando detalhes..." />
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <ErrorMessage message={error || "Convênio não encontrado"} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  const dados = data.dados[0]

  // Calcular a largura da barra de progresso
  const progressWidth = dados?.percentual_execucao_obra || "0%"
  const progressNumeric = Number.parseInt(progressWidth) || 0

  // Determinar a cor da barra de progresso baseada no valor
  const getProgressColor = () => {
    if (progressNumeric < 30) return "bg-amber-500"
    if (progressNumeric < 70) return "bg-blue-500"
    return "bg-emerald-500"
  }

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-gray-800 text-emerald-400 border-gray-700">
              CONVÊNIO
            </Badge>
            <Separator className="flex-1 bg-gray-800" />
            <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
              {municipio}
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center gap-2">
            {data.convenio}
            <ArrowUpRight className="h-5 w-5 text-emerald-400" />
          </h1>
          <p className="text-gray-400 text-base md:text-lg">{data.objeto}</p>
        </div>

        {/* Barra de Progresso */}
        <Card className="bg-gray-800 border-gray-700 mb-8 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">Execução da Obra</h2>
              </div>
              <Badge className={`${getProgressColor()} text-white`}>{dados?.percentual_execucao_obra}</Badge>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`${getProgressColor()} h-4 rounded-full transition-all duration-1000 ease-out`}
                style={{ width: progressWidth }}
              >
                <div className="h-full w-full bg-white/10"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Área de Pendências */}
        <div className="mb-8">
          <PendenciasArea convenioId={data.convenio} municipioId={municipio} />
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seção Financeira */}
          <InfoSection title="Informações Financeiras" icon={Landmark}>
            <InfoItem label="Valor do Processo" value={dados?.valor_repasse} />
            <Separator className="bg-gray-700 my-1" />
            <InfoItem label="Valor de Contrapartida" value={dados?.valor_contrapartida} />
            <Separator className="bg-gray-700 my-1" />
            <InfoItem label="Valor Contratado" value={dados?.valor_contrato_empresa} />
          </InfoSection>

          {/* Datas Importantes */}
          <InfoSection title="Datas Importantes" icon={Calendar}>
            <InfoItem label="Vigência do Convênio" value={dados?.vigencia_convenio} />
            <Separator className="bg-gray-700 my-1" />
            <InfoItem label="Vigência do Contrato" value={dados?.vigencia_contrato_empresa} />
            <Separator className="bg-gray-700 my-1" />
            <InfoItem label="Prazo para Pagamento" value={dados?.prazo_pagamento_empresa} />
          </InfoSection>

          {/* Processos */}
          <InfoSection title="Processos" icon={ClipboardList}>
            <InfoItem label="Processo Licitatório" value={dados?.processo_licitatorio} />
            <Separator className="bg-gray-700 my-1" />
            <InfoItem label="Número do LAC" value={dados?.vigencia_lac} />
          </InfoSection>

          {/* Empresa */}
          <InfoSection title="Empresa Contratada" icon={Building2}>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Empresa Executora</p>
              <div className="bg-gray-700/50 p-3 rounded-md">
                <p className="text-white font-medium">{dados?.empresa_executora || "Não informada"}</p>
              </div>
            </div>
          </InfoSection>
        </div>

        {/* Município */}
        <div className="mt-10 text-center">
          <Separator className="bg-gray-800 mb-4" />
          <div className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            Convênio registrado para o Município de {municipio}
          </div>
        </div>
      </div>
    </div>
  )
}

