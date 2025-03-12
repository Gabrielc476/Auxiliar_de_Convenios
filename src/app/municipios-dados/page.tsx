"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Copy,
  FileEdit,
  FileText,
  Check,
  Building2,
  Phone,
  Mail,
  User,
  MapPin,
  IdentificationCard,
  ClipboardCheck,
  FileCheck,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import EditMunicipalityModal from "@/components/edit-municipality-modal";
import CertidoesModal from "@/components/certidoes-modal";
import { MunicipioDados } from "@/interfaces/municipioInterfaces";
import { useAuth } from "@/contexts/authContext";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { apiService } from "@/services/api";

interface CopyableFieldProps {
  label: string;
  value: string;
  isCopied: boolean;
  icon?: React.ElementType;
  onCopy: (text: string, label: string) => void;
}

function CopyableField({
  label,
  value,
  isCopied,
  icon: Icon,
  onCopy,
}: CopyableFieldProps) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm p-3 rounded-md bg-gray-750 hover:bg-gray-700 transition-colors group">
      <div className="flex items-center gap-3 overflow-hidden">
        {Icon && (
          <Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
        )}
        <div className="overflow-hidden">
          <span className="text-xs font-medium text-gray-400 block mb-0.5">
            {label}
          </span>
          <span className="text-white truncate block">
            {value || "Não informado"}
          </span>
        </div>
      </div>
      <button
        onClick={() => onCopy(value, label)}
        className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-600/50 transition-all"
      >
        {isCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export default function MunicipiosDadosPage() {
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});
  const [selectedMunicipio, setSelectedMunicipio] =
    useState<MunicipioDados | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [certidoesModalOpen, setCertidoesModalOpen] = useState(false);
  const [municipios, setMunicipios] = useState<MunicipioDados[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  // Buscar dados dos municípios
  useEffect(() => {
    const fetchMunicipios = async () => {
      try {
        // Usando o serviço de API centralizado
        const data = await apiService.getMunicipiosDados();

        // Adicionar ids temporários se não existirem
        const municipiosWithIds = data.map((m, index) => ({
          ...m,
          id: m.id || `temp-id-${index}`,
        }));

        setMunicipios(municipiosWithIds);
      } catch (error: any) {
        console.error("Erro ao buscar dados dos municípios:", error);
        setError(error.message || "Erro ao carregar dados");

        toast({
          title: "Erro",
          description: "Não foi possível carregar os municípios",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMunicipios();
  }, []);

  // Função para copiar para área de transferência
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedItems((prev) => ({ ...prev, [text]: true }));
        toast({
          title: "Copiado!",
          description: `${label} copiado com sucesso.`,
          duration: 2000,
        });
        setTimeout(
          () => setCopiedItems((prev) => ({ ...prev, [text]: false })),
          2000
        );
      })
      .catch(() => {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o texto.",
          variant: "destructive",
          duration: 2000,
        });
      });
  };

  // Handlers para modais
  const handleEditMunicipio = (municipio: MunicipioDados) => {
    setSelectedMunicipio(municipio);
    setEditModalOpen(true);
  };

  const handleSaveMunicipio = async (updatedMunicipio: MunicipioDados) => {
    try {
      if (updatedMunicipio.id) {
        // Usando o serviço de API centralizado para atualizar os dados
        await apiService.updateMunicipioDados(
          updatedMunicipio.id,
          updatedMunicipio
        );
      }

      setMunicipios((prev) =>
        prev.map((m) => (m.id === updatedMunicipio.id ? updatedMunicipio : m))
      );

      toast({
        title: "Dados atualizados",
        description: `Os dados de ${updatedMunicipio.municipio} foram salvos.`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar município:", error);
      toast({
        title: "Erro na atualização",
        description: error.message || "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setEditModalOpen(false);
    }
  };

  // Filtrar municípios com base nos municípios atribuídos ao usuário e termo de busca
  const filteredMunicipios = municipios
    .filter((m) =>
      user?.municipios?.length ? user.municipios.includes(m.municipio) : true
    )
    .filter(
      (m) =>
        searchTerm === "" ||
        m.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.prefeito.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="p-4 rounded-lg bg-gray-800 shadow-xl border border-gray-700 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-600 rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">
            Carregando dados dos municípios...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="p-6 rounded-lg bg-red-900/20 border border-red-700 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-gray-300">{error}</p>
          <Button
            className="mt-4 bg-red-700 hover:bg-red-800"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold">
              Dados Cadastrais dos Municípios
            </h1>
            <p className="text-gray-400 mt-1">
              Informações oficiais sobre os municípios e seus representantes
            </p>
          </div>

          <div className="w-full md:w-auto">
            <div className="relative">
              <Input
                type="search"
                placeholder="Buscar município ou prefeito..."
                className="bg-gray-800 border-gray-700 pl-10 pr-4 py-2 w-full md:w-64 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        </div>

        {filteredMunicipios.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-800 rounded-xl border border-gray-700">
            <Building2 className="h-16 w-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Nenhum município encontrado
            </h2>
            <p className="text-gray-400 text-center max-w-md">
              {searchTerm
                ? `Não foram encontrados municípios com o termo "${searchTerm}".`
                : "Não há municípios disponíveis para visualização."}
            </p>
            {searchTerm && (
              <Button
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => setSearchTerm("")}
              >
                Limpar busca
              </Button>
            )}
          </div>
        ) : (
          filteredMunicipios.map((municipio) => (
            <Card
              key={municipio.id}
              className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all overflow-hidden rounded-xl shadow-lg"
            >
              <Accordion type="single" collapsible>
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {municipio.municipio.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-xl text-white block">
                            {municipio.municipio}
                          </span>
                          <span className="text-sm text-gray-400">
                            {municipio.prefeito}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="bg-gray-700/50 text-gray-300 border-gray-600"
                        >
                          {municipio.operacional}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="px-6 pb-6 pt-2">
                      <Tabs defaultValue="info" className="w-full">
                        <TabsList className="bg-gray-700/50 mb-6">
                          <TabsTrigger
                            value="info"
                            className="data-[state=active]:bg-blue-600"
                          >
                            Informações
                          </TabsTrigger>
                          <TabsTrigger
                            value="docs"
                            className="data-[state=active]:bg-blue-600"
                          >
                            Documentos
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Seção de Dados do Município */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Dados Municipais
                              </h3>
                              <div className="bg-gray-800/50 p-0.5 rounded-lg space-y-0.5">
                                <CopyableField
                                  label="CNPJ"
                                  value={municipio.cnpj}
                                  isCopied={!!copiedItems[municipio.cnpj]}
                                  onCopy={copyToClipboard}
                                  icon={IdentificationCard}
                                />
                                <CopyableField
                                  label="Endereço"
                                  value={municipio.endereco}
                                  isCopied={!!copiedItems[municipio.endereco]}
                                  onCopy={copyToClipboard}
                                  icon={MapPin}
                                />
                                <CopyableField
                                  label="Telefone"
                                  value={municipio.telefone}
                                  isCopied={!!copiedItems[municipio.telefone]}
                                  onCopy={copyToClipboard}
                                  icon={Phone}
                                />
                                <CopyableField
                                  label="E-mail"
                                  value={municipio.e_mail}
                                  isCopied={!!copiedItems[municipio.e_mail]}
                                  onCopy={copyToClipboard}
                                  icon={Mail}
                                />
                              </div>
                            </div>

                            {/* Seção de Dados do Prefeito */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Dados do Prefeito
                              </h3>
                              <div className="bg-gray-800/50 p-0.5 rounded-lg space-y-0.5">
                                <CopyableField
                                  label="Nome"
                                  value={municipio.prefeito}
                                  isCopied={!!copiedItems[municipio.prefeito]}
                                  onCopy={copyToClipboard}
                                  icon={User}
                                />
                                <CopyableField
                                  label="CPF"
                                  value={municipio.cpf_prefeito}
                                  isCopied={
                                    !!copiedItems[municipio.cpf_prefeito]
                                  }
                                  onCopy={copyToClipboard}
                                  icon={IdentificationCard}
                                />
                                <CopyableField
                                  label="RG"
                                  value={municipio.rg_prefeito}
                                  isCopied={
                                    !!copiedItems[municipio.rg_prefeito]
                                  }
                                  onCopy={copyToClipboard}
                                  icon={IdentificationCard}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Seção de Ações */}
                          <div className="mt-8 border-t border-gray-700 pt-6">
                            <div className="flex flex-wrap gap-3">
                              <Button
                                variant="default"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleEditMunicipio(municipio)}
                              >
                                <FileEdit className="h-4 w-4 mr-2" />
                                Editar Cadastro
                              </Button>
                              <Button
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                                onClick={() => {
                                  setSelectedMunicipio(municipio);
                                  setCertidoesModalOpen(true);
                                }}
                              >
                                <FileCheck className="h-4 w-4 mr-2" />
                                Gerenciar Certidões
                              </Button>
                              <Button
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Documentos Anexados
                              </Button>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="docs" className="mt-0">
                          <div className="bg-gray-750 rounded-xl p-8 text-center">
                            <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-white text-lg font-medium mb-2">
                              Documentos do Município
                            </h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                              Esta seção está em desenvolvimento. Em breve você
                              poderá visualizar e gerenciar documentos.
                            </p>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              Solicitar Documentos
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Edição */}
      {selectedMunicipio && (
        <EditMunicipalityModal
          municipio={selectedMunicipio}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSave={handleSaveMunicipio}
        />
      )}

      {/* Modal de Certidões */}
      {selectedMunicipio && (
        <CertidoesModal
          municipio={selectedMunicipio}
          open={certidoesModalOpen}
          onOpenChange={setCertidoesModalOpen}
        />
      )}

      {/* Toaster para notificações */}
      <Toaster />
    </main>
  );
}
