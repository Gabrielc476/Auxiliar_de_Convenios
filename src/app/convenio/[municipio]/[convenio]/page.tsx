"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Convenio } from "@/interfaces/municipioInterfaces";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, Calendar, FileText, ClipboardList } from "lucide-react";
import { apiService } from "@/services/api";
import { Loading, ErrorMessage } from "@/components/ui/feedback";
import PendenciasArea from "@/components/pendencias/pendencias-area"; // Importando a área de pendências

// Componente reutilizável para itens de informação
interface InfoItemProps {
  label: string;
  value?: string;
}

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400">{label}</span>
    <span className="text-white font-medium">{value || "N/A"}</span>
  </div>
);

// Componente para seções de cartão
interface InfoSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const InfoSection = ({ title, icon: Icon, children }: InfoSectionProps) => (
  <Card className="bg-gray-800 border-gray-700">
    <CardHeader>
      <CardTitle className="text-white flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

export default function ConvenioDetailPage() {
  const params = useParams();
  const [data, setData] = useState<Convenio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const municipio = decodeURIComponent(params.municipio as string);
  const convenio = decodeURIComponent(params.convenio as string);

  useEffect(() => {
    const fetchData = async () => {
      if (!municipio || !convenio) {
        setError("Parâmetros inválidos");
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.getConvenioDetails(
          municipio,
          convenio
        );
        setData(response);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar detalhes do convênio");
        console.error("Erro ao buscar detalhes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [municipio, convenio]);

  if (loading) {
    return <Loading text="Carregando detalhes..." />;
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <ErrorMessage
          message={error || "Convênio não encontrado"}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const dados = data.dados[0];

  // Calcular a largura da barra de progresso
  const progressWidth = dados?.percentual_execucao_obra || "0%";

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-4 bg-gray-800 text-gray-300">
            CONVÊNIO
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            {data.convenio}
          </h1>
          <p className="text-gray-400 text-lg">{data.objeto}</p>
        </div>

        {/* Barra de Progresso */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Execução da Obra
            </h2>
            <Badge className="bg-green-500 text-white">
              {dados?.percentual_execucao_obra}
            </Badge>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        {/* Área de Pendências (Nova seção) */}
        <PendenciasArea 
          convenioId={data.convenio} 
          municipioId={municipio} 
        />

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seção Financeira */}
          <InfoSection title="Informações Financeiras" icon={Landmark}>
            <InfoItem label="Valor do Processo" value={dados?.valor_repasse} />
            <InfoItem
              label="Valor de Contrapartida"
              value={dados?.valor_contrapartida}
            />
            <InfoItem
              label="Valor Contratado"
              value={dados?.valor_contrato_empresa}
            />
          </InfoSection>

          {/* Datas Importantes */}
          <InfoSection title="Datas Importantes" icon={Calendar}>
            <InfoItem
              label="Vigência do Convênio"
              value={dados?.vigencia_convenio}
            />
            <InfoItem
              label="Vigência do Contrato"
              value={dados?.vigencia_contrato_empresa}
            />
            <InfoItem
              label="Prazo para Pagamento"
              value={dados?.prazo_pagamento_empresa}
            />
          </InfoSection>

          {/* Processos */}
          <InfoSection title="Processos" icon={ClipboardList}>
            <InfoItem
              label="Processo Licitatório"
              value={dados?.processo_licitatorio}
            />
            <InfoItem label="Número do LAC" value={dados?.vigencia_lac} />
          </InfoSection>

          {/* Empresa */}
          <InfoSection title="Empresa Contratada" icon={FileText}>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Empresa Executora</p>
              <p className="text-white font-medium">
                {dados?.empresa_executora}
              </p>
            </div>
          </InfoSection>
        </div>

        {/* Município */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          Município de {municipio}
        </div>
      </div>
    </div>
  );
}