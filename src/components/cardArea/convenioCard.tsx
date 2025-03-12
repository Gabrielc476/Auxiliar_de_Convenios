"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  FileText,
  Info,
  Landmark,
  PercentCircle,
} from "lucide-react";
import { Convenio } from "@/interfaces/municipioInterfaces";

interface ConvenioCardProps {
  data: Convenio;
  municipio: string;
}

// Helper para determinar cor baseada no percentual
const getStatusColor = (percent: string): string => {
  const value = Number.parseInt(percent);
  if (value === 100) return "bg-green-500";
  if (value > 50) return "bg-yellow-500";
  return "bg-blue-500";
};

// Componente para informações com ícones
interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => (
  <div className="space-y-2">
    <div className="flex items-center text-gray-400">
      <Icon className="h-4 w-4 mr-2" />
      <span className="text-xs">{label}</span>
    </div>
    <p className="text-white font-semibold">{value}</p>
  </div>
);

export function ConvenioCard({ data, municipio }: ConvenioCardProps) {
  const dados = data.dados[0];
  const statusColor = getStatusColor(dados.percentual_execucao_obra);

  // Formatação de dados da empresa
  const empresaNome = dados.empresa_executora.includes(") ")
    ? dados.empresa_executora.split(") ")[1]
    : dados.empresa_executora;

  // Parâmetros para URL
  const municipioParam = encodeURIComponent(municipio);
  const convenioParam = encodeURIComponent(data.convenio);

  return (
    <Link href={`/convenio/${municipioParam}/${convenioParam}`}>
      <Card className="bg-gray-800 border-gray-700 overflow-hidden hover:border-gray-600 transition-all cursor-pointer">
        <div className={`h-1 ${statusColor}`} />
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Badge variant="outline" className="mb-2">
                Convênio
              </Badge>
              <h3 className="text-lg font-semibold text-white leading-tight">
                {data.convenio}
              </h3>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{data.convenio}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-gray-400">{data.objeto}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              icon={Landmark}
              label="Valor do Repasse"
              value={dados.valor_repasse}
            />
            <InfoItem
              icon={PercentCircle}
              label="Execução"
              value={dados.percentual_execucao_obra}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-gray-400">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-xs">Empresa Executora</span>
            </div>
            <p className="text-white text-sm">{empresaNome}</p>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center text-gray-400 text-xs">
            <Calendar className="h-4 w-4 mr-2" />
            Vigência até {dados.vigencia_convenio}
          </div>
          <Badge variant="secondary">{municipio}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
