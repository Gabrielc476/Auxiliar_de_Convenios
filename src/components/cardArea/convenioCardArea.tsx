"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react"
import type { Municipio } from "@/interfaces/municipioInterfaces"
import { ConvenioCard } from "./convenioCard"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { MunicipioFilter } from "../municipioFilter"
import { useSearch } from "../layout"
import { useAuth } from "@/contexts/authContext"
import { Loading, ErrorMessage, EmptyState } from "@/components/ui/feedback"
import { apiService } from "@/services/api"
import { Search, Filter, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Constantes
const ITEMS_PER_PAGE = 6

export default function ConveniosCardsArea() {
  const { searchQuery } = useSearch()
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { user } = useAuth()
  const [selectedMunicipios, setSelectedMunicipios] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("municipio")

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getMunicipios()
        console.log(
          "Municípios carregados:",
          data.map((m) => m.municipio),
        )
        setMunicipios(data)
        setError(null)
      } catch (err) {
        setError("Erro ao carregar dados dos municípios")
        console.error("Erro ao buscar municípios:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Voltar para primeira página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedMunicipios, sortBy])

  // Filtragem de dados com useMemo para performance
  const filteredConvenios = useMemo(() => {
    const searchLower = searchQuery.toLowerCase()

    const result = municipios
      .filter((m) => selectedMunicipios.length === 0 || selectedMunicipios.includes(m.municipio))
      .flatMap((municipio) =>
        municipio.convenios
          .filter(
            (convenio) =>
              convenio.convenio.toLowerCase().includes(searchLower) ||
              convenio.objeto.toLowerCase().includes(searchLower),
          )
          .map((convenio) => ({
            ...convenio,
            municipio: municipio.municipio,
          })),
      )

    // Ordenação
    if (sortBy === "municipio") {
      result.sort((a, b) => a.municipio.localeCompare(b.municipio))
    } else if (sortBy === "execucao") {
      result.sort((a, b) => {
        const execA = Number.parseInt(a.dados[0].percentual_execucao_obra)
        const execB = Number.parseInt(b.dados[0].percentual_execucao_obra)
        return execB - execA // Ordem decrescente
      })
    } else if (sortBy === "valor") {
      result.sort((a, b) => {
        const valorA = Number.parseFloat(a.dados[0].valor_repasse.replace(/[^\d,]/g, "").replace(",", "."))
        const valorB = Number.parseFloat(b.dados[0].valor_repasse.replace(/[^\d,]/g, "").replace(",", "."))
        return valorB - valorA // Ordem decrescente
      })
    } else if (sortBy === "vigencia") {
      result.sort((a, b) => {
        const dateA = new Date(a.dados[0].vigencia_convenio.split("/").reverse().join("-"))
        const dateB = new Date(b.dados[0].vigencia_convenio.split("/").reverse().join("-"))
        return dateA.getTime() - dateB.getTime() // Ordem crescente
      })
    }

    return result
  }, [municipios, selectedMunicipios, searchQuery, sortBy])

  // Paginação
  const paginatedConvenios = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredConvenios.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredConvenios, currentPage])

  // Agrupamento por município
  const conveniosPorMunicipio = useMemo(() => {
    return paginatedConvenios.reduce(
      (acc, convenio) => {
        if (!acc[convenio.municipio]) {
          acc[convenio.municipio] = []
        }
        acc[convenio.municipio].push(convenio)
        return acc
      },
      {} as Record<string, typeof paginatedConvenios>,
    )
  }, [paginatedConvenios])

  // Total de páginas
  const totalPages = Math.ceil(filteredConvenios.length / ITEMS_PER_PAGE)

  // Navegação de páginas
  const handlePreviousPage = (e: React.MouseEvent) => {
    e.preventDefault()
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleNextPage = (e: React.MouseEvent) => {
    e.preventDefault()
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePageChange = (page: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentPage(page)
  }

  // Estatísticas
  const stats = useMemo(() => {
    const totalConvenios = filteredConvenios.length
    const totalMunicipios = Object.keys(
      filteredConvenios.reduce(
        (acc, conv) => {
          acc[conv.municipio] = true
          return acc
        },
        {} as Record<string, boolean>,
      ),
    ).length

    const totalValor = filteredConvenios.reduce((sum, conv) => {
      const valor = Number.parseFloat(conv.dados[0].valor_repasse.replace(/[^\d,]/g, "").replace(",", "."))
      return sum + (isNaN(valor) ? 0 : valor)
    }, 0)

    return { totalConvenios, totalMunicipios, totalValor }
  }, [filteredConvenios])

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[50vh]">
        <Loading text="Carregando convênios..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
      {/* Cabeçalho com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Convênios</p>
              <p className="text-2xl font-bold text-white">{stats.totalConvenios}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Filter className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Municípios</p>
              <p className="text-2xl font-bold text-white">{stats.totalMunicipios}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Valor Total</p>
              <p className="text-2xl font-bold text-white">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                }).format(stats.totalValor)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e ordenação */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-auto">
          <MunicipioFilter selected={selectedMunicipios} setSelected={setSelectedMunicipios} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Ordenar por:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="municipio">Município</SelectItem>
              <SelectItem value="execucao">% Execução</SelectItem>
              <SelectItem value="valor">Valor</SelectItem>
              <SelectItem value="vigencia">Vigência</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-gray-400 border-gray-700">
            {filteredConvenios.length} convênios encontrados
          </Badge>

          {filteredConvenios.length > 0 && (
            <p className="text-sm text-gray-400">
              Mostrando {Math.min(ITEMS_PER_PAGE, paginatedConvenios.length)} de {filteredConvenios.length}
            </p>
          )}
        </div>
      </div>

      {/* Estado vazio */}
      {filteredConvenios.length === 0 && (
        <Card className="bg-gray-800 border-gray-700 p-8">
          <EmptyState
            title="Nenhum convênio encontrado"
            description={
              searchQuery
                ? `Não encontramos resultados para "${searchQuery}".`
                : "Não há convênios disponíveis para visualização."
            }
            icon={<Search className="h-12 w-12 text-gray-500" />}
          />
        </Card>
      )}

      {/* Lista de convênios agrupados por município */}
      {Object.entries(conveniosPorMunicipio).map(([municipio, convenios]) => (
        <div key={municipio} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-bold text-white">{municipio}</h2>
            <Badge variant="secondary" className="ml-2 bg-gray-700 text-gray-300">
              {convenios.length} convênios
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {convenios.map((conv, index) => (
              <ConvenioCard key={`${municipio}-${conv.convenio}-${index}`} data={conv} municipio={conv.municipio} />
            ))}
          </div>
        </div>
      ))}

      {/* Paginação */}
      {filteredConvenios.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={handlePreviousPage}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, index) => {
                // Mostrar apenas 5 páginas por vez
                if (
                  totalPages <= 5 ||
                  index === 0 ||
                  index === totalPages - 1 ||
                  (index >= currentPage - 2 && index <= currentPage + 0)
                ) {
                  return (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        onClick={handlePageChange(index + 1)}
                        isActive={currentPage === index + 1}
                        className={
                          currentPage === index + 1
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                        }
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (
                  (index === 1 && currentPage > 3) ||
                  (index === totalPages - 2 && currentPage < totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={index}>
                      <span className="px-4 py-2 text-gray-400">...</span>
                    </PaginationItem>
                  )
                }
                return null
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={handleNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

