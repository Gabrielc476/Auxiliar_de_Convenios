"use client";

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
import { Convenio } from "../../interfaces/municipioInterfaces";

interface ConvenioCardProps {
  data: Convenio;
}

export function ConvenioCard({ data }: ConvenioCardProps) {
  // Supondo que data.dados possui um único objeto com os campos (conforme seus modelos)
  const dados = data.dados[0];
  const percentExecucao = dados.percentual_execucao_obra;
  const valorRepasse = dados.valor_repasse;
  const vigencia = dados.vigencia_convenio;
  const empresa = dados.empresa_executora;

  const getStatusColor = (percent: string) => {
    const value = Number.parseInt(percent);
    if (value === 100) return "bg-green-500";
    if (value > 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <Card className="bg-gray-800 border-gray-700 overflow-hidden hover:border-gray-600 transition-all">
      <div className={`h-1 ${getStatusColor(percentExecucao)}`} />
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Badge variant="outline" className="mb-2">
              Convênio
            </Badge>
            {/* Exibe parte do texto do convênio – pode ser ajustado conforme necessidade */}
            <h3 className="text-lg font-semibold text-white leading-tight">
              {data.convenio.split(" ").slice(-1)[0].replace(/[()]/g, "")}
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
          <div className="space-y-2">
            <div className="flex items-center text-gray-400">
              <Landmark className="h-4 w-4 mr-2" />
              <span className="text-xs">Valor do Repasse</span>
            </div>
            <p className="text-white font-semibold">{valorRepasse}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-gray-400">
              <PercentCircle className="h-4 w-4 mr-2" />
              <span className="text-xs">Execução</span>
            </div>
            <p className="text-white font-semibold">{percentExecucao}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-gray-400">
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-xs">Empresa Executora</span>
          </div>
          {/* Exemplo de extração, caso deseje remover prefixos */}
          <p className="text-white text-sm">{empresa.split(") ")[1]}</p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center text-gray-400 text-xs">
          <Calendar className="h-4 w-4 mr-2" />
          Vigência até {vigencia}
        </div>
        <Badge variant="secondary">Lucena</Badge>
      </CardFooter>
    </Card>
  );
}
