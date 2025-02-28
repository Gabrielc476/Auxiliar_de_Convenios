"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Convenio } from "@/interfaces/municipioInterfaces";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, Calendar, FileText, ClipboardList } from "lucide-react";

export default function ConvenioDetailPage() {
  const params = useParams();
  const [data, setData] = useState<Convenio | null>(null);
  const [loading, setLoading] = useState(true);

  const municipio = decodeURIComponent(params.municipio as string);
  const convenio = decodeURIComponent(params.convenio as string);
  const dados = data?.dados[0];

  useEffect(() => {
    if (municipio && convenio) {
      axios
        .get(
          `http://127.0.0.1:5000/${encodeURIComponent(
            municipio
          )}/${encodeURIComponent(convenio)}`
        )
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao buscar detalhes:", error);
          setLoading(false);
        });
    }
  }, [municipio, convenio]);

  if (loading) return <p className="text-white p-6">Carregando detalhes...</p>;
  if (!data) return <p className="text-white p-6">Convênio não encontrado</p>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
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
              style={{ width: dados?.percentual_execucao_obra }}
            />
          </div>
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seção Financeira */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem
                label="Valor do Processo"
                value={dados?.valor_repasse}
              />
              <InfoItem
                label="Valor de Contrapartida"
                value={dados?.valor_contrapartida}
              />
              <InfoItem
                label="Valor Contratado"
                value={dados?.valor_contrato_empresa}
              />
            </CardContent>
          </Card>

          {/* Datas Importantes */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Datas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Processos */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Processos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem
                label="Processo Licitatório"
                value={dados?.processo_licitatorio}
              />
              <InfoItem label="Número do LAC" value={dados?.vigencia_lac} />
            </CardContent>
          </Card>

          {/* Empresa */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Empresa Contratada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">Empresa Executora</p>
                <p className="text-white font-medium">
                  {dados?.empresa_executora}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Município */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          Município de {municipio}
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400">{label}</span>
    <span className="text-white font-medium">{value || "N/A"}</span>
  </div>
);
