"use client";

import { useState, useEffect } from "react";
import ConveniosCardsArea from "@/components/cardArea/convenioCardArea";
import { Button } from "@/components/ui/button";
import { FileUp, RefreshCw } from "lucide-react";
import UploadRelatorioModal from "@/components/upload-relatorios-modal";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import ReminderSummary from "@/components/reminders/reminder-summary";

export default function DashboardPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Função chamada quando o upload do relatório é bem-sucedido
  const handleUploadSuccess = () => {
    // Incrementa o trigger para forçar uma atualização dos dados
    setRefreshTrigger((prev) => prev + 1);

    // Fecha o modal
    setUploadModalOpen(false);

    // Exibe mensagem de sucesso
    toast({
      title: "Relatório processado com sucesso",
      description: "Os dados dos convênios foram atualizados.",
      duration: 5000,
    });
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Barra de ações acima do conteúdo principal */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              Dashboard de Convênios
            </h1>
            <p className="text-gray-400 text-sm">
              Visualização e gerenciamento de convênios municipais
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Dados
            </Button>

            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setUploadModalOpen(true)}
            >
              <FileUp className="h-4 w-4 mr-2" />
              Enviar Relatório
            </Button>
          </div>
        </div>
      </div>

      {/* Área com widgets e cards de convênios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Widget de lembretes à direita */}
        <div className="md:col-span-1 order-2 md:order-2">
          <ReminderSummary />
        </div>
        
        {/* Cards de convênios à esquerda */}
        <div className="md:col-span-3 order-1 md:order-1">
          <ConveniosCardsArea key={refreshTrigger} />
        </div>
      </div>

      {/* Modal de upload de relatório */}
      <UploadRelatorioModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}