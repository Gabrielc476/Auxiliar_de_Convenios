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
import { MunicipioDados } from "@/interfaces/municipioInterfaces";
import {
  FileCheck,
  Upload,
  Download,
  X,
  AlertTriangle,
  CheckCircle,
  FileText,
  Trash2,
  Upload as UploadIcon,
  Eye,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";

// Tipos de certidões que o município pode ter
type CertidaoTipo =
  | "CND Federal"
  | "CND Estadual"
  | "CND Municipal"
  | "FGTS"
  | "Trabalhista"
  | "Alvará de Funcionamento"
  | "Outro";

// Interface para representar uma certidão
interface Certidao {
  id: string;
  tipo: CertidaoTipo;
  nome: string;
  dataUpload: string;
  dataValidade: string;
  arquivo: string; // Caminho ou ID do arquivo
  tamanho: string;
  status: "válido" | "pendente" | "vencido";
}

interface CertidoesModalProps {
  municipio: MunicipioDados;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Componente para exibir uma certidão na lista
const CertidaoItem = ({
  certidao,
  onDownload,
  onDelete,
  onPreview,
}: {
  certidao: Certidao;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
}) => {
  const getStatusColor = (status: Certidao["status"]) => {
    switch (status) {
      case "válido":
        return "text-green-500";
      case "pendente":
        return "text-yellow-500";
      case "vencido":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: Certidao["status"]) => {
    switch (status) {
      case "válido":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pendente":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "vencido":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const isExpired = certidao.status === "vencido";
  const isPending = certidao.status === "pendente";

  return (
    <div
      className={cn(
        "flex flex-col p-4 rounded-lg border border-gray-700",
        isExpired
          ? "bg-red-900/20"
          : isPending
          ? "bg-yellow-900/20"
          : "bg-gray-750"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          {getStatusIcon(certidao.status)}
          <div>
            <h4 className="font-medium text-white">{certidao.tipo}</h4>
            <p className="text-sm text-gray-400">{certidao.nome}</p>
          </div>
        </div>
        <div
          className={cn(
            "text-xs font-medium px-2 py-1 rounded",
            certidao.status === "válido"
              ? "bg-green-900/30 text-green-400"
              : certidao.status === "pendente"
              ? "bg-yellow-900/30 text-yellow-400"
              : "bg-red-900/30 text-red-400"
          )}
        >
          {certidao.status.charAt(0).toUpperCase() + certidao.status.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
        <div>
          <span className="block text-gray-500">Upload:</span>
          <span>{certidao.dataUpload}</span>
        </div>
        <div>
          <span className="block text-gray-500">Validade:</span>
          <span className={isExpired ? "text-red-400" : ""}>
            {certidao.dataValidade}
          </span>
        </div>
        <div>
          <span className="block text-gray-500">Tamanho:</span>
          <span>{certidao.tamanho}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={() => onPreview(certidao.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Visualizar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-400 hover:text-white hover:bg-blue-700"
          onClick={() => onDownload(certidao.id)}
        >
          <Download className="h-4 w-4 mr-1" />
          Baixar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-white hover:bg-red-700"
          onClick={() => onDelete(certidao.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Componente para upload de nova certidão
const UploadCertidao = ({
  onUpload,
}: {
  onUpload: (file: File, tipo: CertidaoTipo) => void;
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<CertidaoTipo>("CND Federal");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file) return;

    setUploading(true);

    // Simulação do progresso de upload
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10;
      if (currentProgress > 100) {
        currentProgress = 100;
        clearInterval(interval);

        // Finalizar upload após 100%
        setTimeout(() => {
          onUpload(file, tipo);
          setFile(null);
          setUploading(false);
          setProgress(0);
        }, 500);
      }
      setProgress(currentProgress);
    }, 300);
  };

  const certidaoTipos: CertidaoTipo[] = [
    "CND Federal",
    "CND Estadual",
    "CND Municipal",
    "FGTS",
    "Trabalhista",
    "Alvará de Funcionamento",
    "Outro",
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
      <h3 className="text-white font-medium mb-4 flex items-center gap-2">
        <UploadIcon className="h-5 w-5 text-blue-400" />
        Anexar Nova Certidão
      </h3>

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
            id="file-upload"
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-gray-700 rounded-full">
              <Upload className="h-6 w-6 text-blue-400" />
            </div>
            <p className="text-gray-300">
              Arraste e solte arquivos aqui ou
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 px-1 underline"
                onClick={() => inputRef.current?.click()}
              >
                selecione do seu computador
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Formatos suportados: PDF, JPG, PNG, DOC, DOCX (max. 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-750 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-400" />
              <div className="overflow-hidden">
                <p className="text-white font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => setFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Tipo de Certidão
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as CertidaoTipo)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2"
            >
              {certidaoTipos.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {uploading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Enviando...</span>
                <span className="text-white font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Enviar Arquivo
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default function CertidoesModal({
  municipio,
  open,
  onOpenChange,
}: CertidoesModalProps) {
  // Estado para armazenar as certidões (dados mockados para exemplo)
  const [certidoes, setCertidoes] = useState<Certidao[]>([
    {
      id: "1",
      tipo: "CND Federal",
      nome: "Certidão Negativa de Débitos Federais",
      dataUpload: "15/02/2025",
      dataValidade: "15/08/2025",
      arquivo: "/documentos/cnd_federal.pdf",
      tamanho: "2.4 MB",
      status: "válido",
    },
    {
      id: "2",
      tipo: "CND Estadual",
      nome: "Certidão Negativa de Débitos Estaduais",
      dataUpload: "10/01/2025",
      dataValidade: "10/04/2025",
      arquivo: "/documentos/cnd_estadual.pdf",
      tamanho: "1.8 MB",
      status: "válido",
    },
    {
      id: "3",
      tipo: "FGTS",
      nome: "Certificado de Regularidade do FGTS",
      dataUpload: "05/12/2024",
      dataValidade: "05/03/2025",
      arquivo: "/documentos/crf_fgts.pdf",
      tamanho: "1.2 MB",
      status: "pendente",
    },
    {
      id: "4",
      tipo: "Trabalhista",
      nome: "Certidão Negativa de Débitos Trabalhistas",
      dataUpload: "20/11/2024",
      dataValidade: "20/02/2025",
      arquivo: "/documentos/cndt.pdf",
      tamanho: "0.9 MB",
      status: "vencido",
    },
  ]);

  // Em uma implementação real, usaríamos o apiService para buscar as certidões
  // useEffect(() => {
  //   const fetchCertidoes = async () => {
  //     try {
  //       if (municipio.id) {
  //         const response = await apiService.request<Certidao[]>({
  //           method: "GET",
  //           url: `/municipios/certidoes/${municipio.id}`
  //         });
  //         setCertidoes(response);
  //       }
  //     } catch (error) {
  //       console.error("Erro ao buscar certidões:", error);
  //       toast({
  //         title: "Erro",
  //         description: "Não foi possível carregar as certidões",
  //         variant: "destructive",
  //       });
  //     }
  //   };
  //
  //   if (open) {
  //     fetchCertidoes();
  //   }
  // }, [municipio.id, open]);

  // Função para download de certidão
  const handleDownload = async (id: string) => {
    const certidao = certidoes.find((c) => c.id === id);
    if (!certidao) return;

    toast({
      title: "Download iniciado",
      description: `Baixando ${certidao.nome}`,
      duration: 3000,
    });

    // Em uma implementação real, usaríamos o apiService
    // try {
    //   await apiService.request({
    //     method: "GET",
    //     url: `/municipios/certidoes/${id}/download`,
    //     responseType: 'blob'
    //   });
    // } catch (error) {
    //   console.error("Erro ao baixar certidão:", error);
    //   toast({
    //     title: "Erro",
    //     description: "Não foi possível baixar a certidão",
    //     variant: "destructive",
    //   });
    // }

    // Simulação para exemplo
    console.log(`Downloading certidão: ${certidao.nome}`);
  };

  // Função para excluir certidão
  const handleDelete = async (id: string) => {
    const certidao = certidoes.find((c) => c.id === id);
    if (!certidao) return;

    // Confirmar exclusão
    if (
      window.confirm(
        `Tem certeza que deseja excluir a certidão ${certidao.nome}?`
      )
    ) {
      // Em uma implementação real, usaríamos o apiService
      // try {
      //   await apiService.request({
      //     method: "DELETE",
      //     url: `/municipios/certidoes/${id}`
      //   });
      // } catch (error) {
      //   console.error("Erro ao excluir certidão:", error);
      //   toast({
      //     title: "Erro",
      //     description: "Não foi possível excluir a certidão",
      //     variant: "destructive",
      //   });
      //   return;
      // }

      // Remover da lista
      setCertidoes(certidoes.filter((c) => c.id !== id));

      toast({
        title: "Certidão excluída",
        description: `${certidao.nome} foi removida com sucesso`,
        duration: 3000,
      });
    }
  };

  // Função para visualizar certidão
  const handlePreview = async (id: string) => {
    const certidao = certidoes.find((c) => c.id === id);
    if (!certidao) return;

    // Em uma implementação real, usaríamos o apiService
    // try {
    //   const response = await apiService.request({
    //     method: "GET",
    //     url: `/municipios/certidoes/${id}/preview`,
    //     responseType: 'blob'
    //   });
    //
    //   // Criar URL para o blob e abrir em nova aba
    //   const fileURL = URL.createObjectURL(response);
    //   window.open(fileURL, '_blank');
    // } catch (error) {
    //   console.error("Erro ao visualizar certidão:", error);
    //   toast({
    //     title: "Erro",
    //     description: "Não foi possível visualizar a certidão",
    //     variant: "destructive",
    //   });
    // }

    // Simulação para exemplo
    toast({
      title: "Visualizando certidão",
      description: `Abrindo ${certidao.nome}`,
      duration: 3000,
    });
    console.log(`Previewing certidão: ${certidao.nome}`);
  };

  // Função para upload de nova certidão
  const handleUpload = async (file: File, tipo: CertidaoTipo) => {
    // Em uma implementação real, usaríamos o apiService
    // try {
    //   const formData = new FormData();
    //   formData.append('file', file);
    //   formData.append('tipo', tipo);
    //   formData.append('municipioId', municipio.id || '');
    //
    //   const response = await apiService.request<Certidao>({
    //     method: "POST",
    //     url: "/municipios/certidoes",
    //     data: formData,
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   });
    //
    //   setCertidoes([...certidoes, response]);
    // } catch (error) {
    //   console.error("Erro ao fazer upload:", error);
    //   toast({
    //     title: "Erro",
    //     description: "Não foi possível enviar a certidão",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    // Simulação para exemplo
    const hoje = new Date();
    const validade = new Date();
    validade.setMonth(validade.getMonth() + 6); // Validade de 6 meses

    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    };

    const novaCertidao: Certidao = {
      id: `${certidoes.length + 1}`,
      tipo,
      nome: file.name,
      dataUpload: formatDate(hoje),
      dataValidade: formatDate(validade),
      arquivo: `/documentos/${file.name}`,
      tamanho: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      status: "válido",
    };

    setCertidoes([...certidoes, novaCertidao]);

    toast({
      title: "Upload concluído",
      description: `${file.name} foi enviado com sucesso`,
      duration: 3000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 p-0 max-w-4xl max-h-[90vh] shadow-2xl rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <FileCheck className="h-6 w-6" />
              Certidões de {municipio.municipio}
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-1">
              Gerencie as certidões negativas e outros documentos do município
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col md:flex-row gap-6 p-6 h-full max-h-[calc(90vh-150px)]">
          {/* Lista de certidões */}
          <div className="md:w-2/3 space-y-4">
            <h3 className="font-semibold text-white text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Certidões Anexadas
            </h3>

            {certidoes.length === 0 ? (
              <div className="bg-gray-750 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <h4 className="text-white font-medium mb-2">
                  Nenhuma certidão anexada
                </h4>
                <p className="text-gray-400 text-sm">
                  Utilize o formulário ao lado para anexar certidões do
                  município.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(90vh-280px)] pr-4">
                <div className="grid gap-4">
                  {certidoes.map((certidao) => (
                    <CertidaoItem
                      key={certidao.id}
                      certidao={certidao}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      onPreview={handlePreview}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Área de upload */}
          <div className="md:w-1/3">
            <UploadCertidao onUpload={handleUpload} />
          </div>
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
