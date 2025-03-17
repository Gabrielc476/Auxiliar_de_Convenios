"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { apiService } from "@/services/api";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  X,
  AlertTriangle,
  FileUp,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UploadRelatorioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function UploadRelatorioModal({
  open,
  onOpenChange,
  onSuccess,
}: UploadRelatorioModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<
    "idle" | "processing" | "counting" | "extracting" | "creating_pendencies" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [conveniosCount, setConveniosCount] = useState<number | null>(null);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [pendenciasCreated, setPendenciasCreated] = useState<number>(0);
  const [pendenciasUpdated, setPendenciasUpdated] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setUploading(false);
    setProgress(0);
    setUploadComplete(false);
    setProcessingStatus("idle");
    setError(null);
    setConveniosCount(null);
    setProcessedCount(0);
    setPendenciasCreated(0);
    setPendenciasUpdated(0);
  };

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Check if file is PDF
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo PDF.",
          variant: "destructive",
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      // Check if file is PDF
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo PDF.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
  
    setUploading(true);
    setError(null);
    setProcessingStatus("processing");
  
    try {
      // Mostrar feedback mais claro sobre processo extenso
      toast({
        title: "Processamento iniciado",
        description: "O processamento pode levar até 2 minutos. Por favor, aguarde.",
        duration: 10000,
      });
  
      // Simulação de progresso mais realista com fases
      const simulateProgress = () => {
        let currentProgress = 0;
        const stepsMap = {
          10: "processing",
          30: "counting",
          50: "extracting",
          75: "creating_pendencies"
        };
        
        const interval = setInterval(() => {
          // Progresso mais lento para refletir o tempo real de processamento
          currentProgress += Math.random() * 1.5;
          
          // Atualizar status com base no progresso
          for (const [threshold, status] of Object.entries(stepsMap)) {
            if (currentProgress >= Number(threshold) && currentProgress < Number(threshold) + 5) {
              setProcessingStatus(status as any);
            }
          }
          
          if (currentProgress > 90) {
            clearInterval(interval);
            currentProgress = 90; // Manter em 90% até resposta real
          }
          setProgress(currentProgress);
        }, 500);
        
        return interval;
      };
  
      const progressInterval = simulateProgress();
  
      try {
        // Aumentar tempo de timeout implicitamente através do service
        const response = await apiService.uploadRelatorio(file);
        
        // Atualizar contadores com dados reais do backend
        if (response && response.statistics) {
          setConveniosCount(response.statistics.totalConvenios || 0);
          setProcessedCount(response.statistics.processedConvenios || 0);
          setPendenciasCreated(response.statistics.pendenciasCreated || 0);
          setPendenciasUpdated(response.statistics.pendenciasUpdated || 0);
        }
  
        // Upload e processamento completos
        clearInterval(progressInterval);
        setProgress(100);
        setUploadComplete(true);
        setProcessingStatus("success");
  
        // Notificar
        toast({
          title: "Processamento concluído",
          description: `${response.statistics?.totalConvenios || "Múltiplos"} convênios processados com sucesso!`,
          variant: "default",
        });
  
        // Callback de sucesso
        if (onSuccess) {
          onSuccess();
        }
      } catch (err: any) {
        clearInterval(progressInterval);
        console.error("Erro no upload:", err);
        setError(err.message || "Ocorreu um erro durante o upload.");
        setProcessingStatus("error");
        setProgress(0);
  
        toast({
          title: "Erro no upload",
          description: err.message || "Não foi possível enviar o arquivo. Verifique sua conexão.",
          variant: "destructive",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const getStatusMessage = () => {
    switch (processingStatus) {
      case "processing":
        return "Iniciando processamento do arquivo...";
      case "counting":
        return "Identificando convênios no relatório...";
      case "extracting":
        return conveniosCount 
          ? `Extraindo dados de ${processedCount}/${conveniosCount} convênios...` 
          : "Extraindo dados dos convênios...";
      case "creating_pendencies":
        return "Criando pendências automáticas...";
      case "success":
        return "Processamento concluído com sucesso!";
      case "error":
        return error || "Ocorreu um erro no processamento.";
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (processingStatus) {
      case "processing":
        return <Clock className="h-8 w-8 text-blue-400 animate-pulse" />;
      case "counting":
        return <FileText className="h-8 w-8 text-blue-400 animate-pulse" />;
      case "extracting":
        return <FileText className="h-8 w-8 text-amber-400 animate-pulse" />;
      case "creating_pendencies":
        return <ClipboardList className="h-8 w-8 text-purple-400 animate-pulse" />;
      case "success":
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 p-0 max-w-lg shadow-2xl rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <FileUp className="h-6 w-6" />
              Upload de Relatório
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-1">
              Envie o arquivo PDF do relatório para extrair dados dos convênios
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          {!uploadComplete ? (
            <>
              {!file ? (
                <div
                  className={cn(
                    "border-2 border-dashed border-gray-600 rounded-lg p-8 text-center transition-colors",
                    dragActive
                      ? "border-blue-500 bg-blue-500/10"
                      : "hover:border-gray-500"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    id="pdf-upload"
                    className="hidden"
                    onChange={handleChange}
                    accept=".pdf"
                  />

                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 bg-gray-700 rounded-full">
                      <Upload className="h-8 w-8 text-blue-400" />
                    </div>
                    <p className="text-gray-300 text-lg">
                      Arraste e solte o relatório PDF aqui
                    </p>
                    <p className="text-gray-300">
                      ou{" "}
                      <button
                        type="button"
                        className="text-blue-400 hover:text-blue-300 px-1 underline"
                        onClick={() => inputRef.current?.click()}
                      >
                        selecione do seu computador
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      Apenas arquivos PDF são suportados (max. 20MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-750 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-10 w-10 text-blue-400" />
                      <div className="overflow-hidden">
                        <p className="text-white font-medium truncate text-lg">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          PDF • {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={() => setFile(null)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {uploading && (
                    <div className="space-y-4 mt-4">
                      <div className="flex justify-between text-sm items-center">
                        <div className="flex items-center gap-2">
                          {getStatusIcon()}
                          <span className="text-gray-300 font-medium">{getStatusMessage()}</span>
                        </div>
                        <span className="text-white font-medium">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      
                      {/* Contador de convênios processados */}
                      {(processingStatus === "extracting" || processingStatus === "creating_pendencies") && (
                        <div className="bg-gray-750 p-3 rounded-lg space-y-2 border border-gray-700">
                          {conveniosCount !== null && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Convênios identificados:</span>
                              <Badge className="bg-blue-600">{conveniosCount}</Badge>
                            </div>
                          )}
                          {processedCount > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Convênios processados:</span>
                              <Badge className="bg-emerald-600">{processedCount}</Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Enviar Relatório
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      onClick={() => setFile(null)}
                      disabled={uploading}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center py-6 space-y-6 text-center">
              {getStatusIcon()}

              <h3 className="text-xl font-medium text-white mt-2">
                {getStatusMessage()}
              </h3>

              {processingStatus === "success" && (
                <>
                  <div className="bg-gray-750 p-4 rounded-lg w-full border border-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-blue-400" />
                          <h4 className="text-white font-medium text-left">Convênios</h4>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Total processados:</span>
                          <Badge className="bg-emerald-600">{conveniosCount || 0}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-purple-400" />
                          <h4 className="text-white font-medium text-left">Pendências</h4>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Criadas:</span>
                          <Badge className="bg-blue-600">{pendenciasCreated || 0}</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Atualizadas:</span>
                          <Badge className="bg-amber-600">{pendenciasUpdated || 0}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 max-w-md">
                    Todos os convênios e pendências foram processados com sucesso e já estão disponíveis no sistema.
                  </p>
                </>
              )}

              {processingStatus === "error" && (
                <p className="text-red-400 max-w-md">
                  Não foi possível processar o arquivo. Verifique se o formato está correto e tente novamente.
                </p>
              )}

              <div className="mt-4 flex gap-2">
                {processingStatus === "success" && (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleOpenChange(false);
                      if (onSuccess) onSuccess();
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Ver Convênios Atualizados
                  </Button>
                )}

                {processingStatus === "error" && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => resetState()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Tentar Novamente
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => handleOpenChange(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>

        {!uploadComplete && (
          <DialogFooter className="p-6 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
              disabled={uploading}
            >
              Cancelar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}