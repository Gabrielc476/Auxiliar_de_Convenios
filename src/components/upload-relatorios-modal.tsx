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
} from "lucide-react";

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
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setUploading(false);
    setProgress(0);
    setUploadComplete(false);
    setProcessingStatus("idle");
    setError(null);
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

    try {
      // Setup progress simulation
      const simulateProgress = () => {
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += Math.random() * 5;
          if (currentProgress > 95) {
            clearInterval(interval);
            currentProgress = 95; // Keep at 95% until actual completion
          }
          setProgress(currentProgress);
        }, 200);
        return interval;
      };

      const progressInterval = simulateProgress();

      // Actual upload
      try {
        const response = await apiService.uploadRelatorio(file);

        // Upload successful
        clearInterval(progressInterval);
        setProgress(100);
        setUploadComplete(true);

        // Simulate backend processing
        setProcessingStatus("processing");

        // Wait for 3 seconds to simulate processing
        setTimeout(() => {
          // Set as successful
          setProcessingStatus("success");

          // Notify
          toast({
            title: "Processamento concluído",
            description: "O relatório foi processado com sucesso!",
            variant: "default",
          });

          // Call success callback if provided
          if (onSuccess) {
            onSuccess();
          }
        }, 3000);
      } catch (err: any) {
        // Handle errors
        clearInterval(progressInterval);
        console.error("Erro no upload:", err);
        setError(err.message || "Ocorreu um erro durante o upload.");
        setProcessingStatus("error");
        setProgress(0);

        toast({
          title: "Erro no upload",
          description: err.message || "Não foi possível enviar o arquivo.",
          variant: "destructive",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = () => {
    switch (processingStatus) {
      case "processing":
        return <Clock className="h-8 w-8 text-blue-400 animate-pulse" />;
      case "success":
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (processingStatus) {
      case "processing":
        return "Processando o relatório...";
      case "success":
        return "Processamento concluído com sucesso!";
      case "error":
        return error || "Ocorreu um erro no processamento.";
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
                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          Enviando arquivo...
                        </span>
                        <span className="text-white font-medium">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
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
                          <div className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                          Enviando...
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
            <div className="flex flex-col items-center py-6 space-y-4 text-center">
              {getStatusIcon()}

              <h3 className="text-xl font-medium text-white mt-2">
                {getStatusMessage()}
              </h3>

              {processingStatus === "success" && (
                <p className="text-gray-400 max-w-md">
                  Os dados foram extraídos com sucesso e os convênios foram
                  atualizados no sistema.
                </p>
              )}

              {processingStatus === "error" && (
                <p className="text-red-400 max-w-md">
                  Não foi possível processar o arquivo. Verifique se o formato
                  está correto e tente novamente.
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
