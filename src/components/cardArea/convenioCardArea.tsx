"use client";

import { useEffect, useState, useMemo } from "react";
import { Municipio } from "@/interfaces/municipioInterfaces";
import { ConvenioCard } from "./convenioCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { MunicipioFilter } from "../municipioFilter";
import { useSearch } from "../layout";
import { useAuth } from "@/contexts/authContext";
import { Loading, ErrorMessage, EmptyState } from "@/components/ui/feedback";
import { apiService } from "@/services/api";
import { Search } from "lucide-react";

// Constantes
const ITEMS_PER_PAGE = 6;

export default function ConveniosCardsArea() {
  const { searchQuery } = useSearch();
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const [selectedMunicipios, setSelectedMunicipios] = useState<string[]>([]);

  // Carregar dados
  // src/components/cardArea/convenioCardArea.tsx (trecho principal)
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await apiService.getMunicipios();
      console.log("Municípios carregados:", data.map(m => m.municipio));
      setMunicipios(data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar dados dos municípios");
      console.error("Erro ao buscar municípios:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  // Voltar para primeira página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMunicipios]);

  // Filtragem de dados com useMemo para performance
  const filteredConvenios = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();

    return municipios
      .filter(
        (m) =>
          selectedMunicipios.length === 0 ||
          selectedMunicipios.includes(m.municipio)
      )
      .flatMap((municipio) =>
        municipio.convenios
          .filter(
            (convenio) =>
              convenio.convenio.toLowerCase().includes(searchLower) ||
              convenio.objeto.toLowerCase().includes(searchLower)
          )
          .map((convenio) => ({
            ...convenio,
            municipio: municipio.municipio,
          }))
      );
  }, [municipios, selectedMunicipios, searchQuery]);

  // Paginação
  const paginatedConvenios = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredConvenios.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredConvenios, currentPage]);

  // Agrupamento por município
  const conveniosPorMunicipio = useMemo(() => {
    return paginatedConvenios.reduce((acc, convenio) => {
      if (!acc[convenio.municipio]) {
        acc[convenio.municipio] = [];
      }
      acc[convenio.municipio].push(convenio);
      return acc;
    }, {} as Record<string, typeof paginatedConvenios>);
  }, [paginatedConvenios]);

  // Total de páginas
  const totalPages = Math.ceil(filteredConvenios.length / ITEMS_PER_PAGE);

  // Navegação de páginas
  const handlePreviousPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePageChange = (page: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[50vh]">
        <Loading text="Carregando convênios..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900">
      <MunicipioFilter
        selected={selectedMunicipios}
        setSelected={setSelectedMunicipios}
      />

      {/* Estado vazio */}
      {filteredConvenios.length === 0 && (
        <EmptyState
          title="Nenhum convênio encontrado"
          description={
            searchQuery
              ? `Não encontramos resultados para "${searchQuery}".`
              : "Não há convênios disponíveis para visualização."
          }
          icon={<Search className="h-12 w-12 text-gray-500" />}
        />
      )}

      {/* Lista de convênios agrupados por município */}
      {Object.entries(conveniosPorMunicipio).map(([municipio, convenios]) => (
        <div key={municipio} className="mb-8">
          <h2 className="text-2xl font-bold text-white">{municipio}</h2>
          <p className="text-gray-400 mb-4">
            Acompanhamento de convênios do município
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {convenios.map((conv, index) => (
              <ConvenioCard
                key={`${municipio}-${conv.convenio}-${index}`}
                data={conv}
                municipio={conv.municipio}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Paginação */}
      {filteredConvenios.length > 0 && totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={handlePreviousPage}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={handlePageChange(index + 1)}
                  isActive={currentPage === index + 1}
                  className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={handleNextPage}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
