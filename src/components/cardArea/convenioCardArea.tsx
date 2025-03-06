"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Municipio } from "../../interfaces/municipioInterfaces";
import { ConvenioCard } from "./convenioCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useSearch } from "../layout"; // Importe o contexto de busca
import { MunicipioFilter } from "../municipioFilter";
import { useAuth } from "@/contexts/authContext";

export default function ConveniosCardsArea() {
  const { searchQuery } = useSearch(); // Acesse o contexto de busca
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { user } = useAuth();
  const [selectedMunicipios, setSelectedMunicipios] = useState<string[]>([]);

  useEffect(() => {
    axios
      .get<Municipio[]>("http://localhost:5000/")
      .then((response) => {
        setMunicipios(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar municípios:", error);
        setLoading(false);
      });
  }, []);

  // Filtra os convênios com base na pesquisa
  const allConvenios = municipios
    .filter(
      (m) =>
        selectedMunicipios.length === 0 ||
        selectedMunicipios.includes(m.municipio)
    )
    .flatMap((municipio) =>
      municipio.convenios
        .map((convenio) => ({
          ...convenio,
          municipio: municipio.municipio,
        }))
        .filter((convenio) => {
          const searchLower = searchQuery.toLowerCase();
          return (
            convenio.convenio.toLowerCase().includes(searchLower) ||
            convenio.objeto.toLowerCase().includes(searchLower)
          );
        })
    );

  const currentConvenios = allConvenios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const conveniosPorMunicipio = currentConvenios.reduce((acc, convenio) => {
    if (!acc[convenio.municipio]) {
      acc[convenio.municipio] = [];
    }
    acc[convenio.municipio].push(convenio);
    return acc;
  }, {} as Record<string, typeof currentConvenios>);

  // Resetar página quando a pesquisa mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return <p className="text-white p-6">Carregando...</p>;
  }

  return (
    <div className="p-6 bg-gray-900">
      <MunicipioFilter
        selected={selectedMunicipios}
        setSelected={setSelectedMunicipios}
      />
      {/* Mensagem se nenhum resultado for encontrado */}
      {allConvenios.length === 0 && (
        <p className="text-white text-center py-8">
          Nenhum convênio encontrado para "{searchQuery}"
        </p>
      )}

      {Object.entries(conveniosPorMunicipio).map(([municipio, convenios]) => (
        <div key={municipio} className="mb-8">
          <h2 className="text-2xl font-bold text-white">{municipio}</h2>
          <p className="text-gray-400 mb-4">
            Acompanhamento de convênios do município
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {convenios.map((conv, index) => (
              <ConvenioCard
                key={index}
                data={conv}
                municipio={conv.municipio}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Paginação */}
      {allConvenios.length > 0 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={(e) => {
                  e.preventDefault();
                  currentPage > 1 && setCurrentPage(currentPage - 1);
                }}
              />
            </PaginationItem>

            {Array.from({
              length: Math.ceil(allConvenios.length / itemsPerPage),
            }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(index + 1);
                  }}
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
                onClick={(e) => {
                  e.preventDefault();
                  currentPage < Math.ceil(allConvenios.length / itemsPerPage) &&
                    setCurrentPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
