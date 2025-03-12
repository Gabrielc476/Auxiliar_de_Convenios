// src/components/municipioFilter.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/authContext";
import { apiService } from "@/services/api";

interface MunicipioFilterProps {
  selected: string[];
  setSelected: (municipios: string[]) => void;
}

export const MunicipioFilter = ({
  selected,
  setSelected,
}: MunicipioFilterProps) => {
  const { user } = useAuth();
  const [availableMunicipios, setAvailableMunicipios] = useState<string[]>([]);

  // Buscar todos os municípios disponíveis
  useEffect(() => {
    const fetchMunicipios = async () => {
      try {
        const data = await apiService.getMunicipios();
        // Extrair nomes únicos de municípios
        const municipioNames = [...new Set(data.map(m => m.municipio))];
        setAvailableMunicipios(municipioNames);
      } catch (error) {
        console.error("Erro ao buscar municípios:", error);
      }
    };

    fetchMunicipios();
  }, []);

  // Combinar municípios do usuário com todos disponíveis (sem duplicatas)
  const allMunicipios = [...new Set([
    ...(user?.municipios || []),
    ...availableMunicipios
  ])];

  // Se não há municípios, não renderiza nada
  if (allMunicipios.length === 0) return null;

  const toggleMunicipio = (municipio: string) => {
    const newSelected = selected.includes(municipio)
      ? selected.filter((m) => m !== municipio)
      : [...selected, municipio];
    setSelected(newSelected);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {allMunicipios.map((municipio) => {
        const isSelected = selected.includes(municipio);

        return (
          <Button
            key={municipio}
            variant={isSelected ? "default" : "outline"}
            className={`transition-colors ${
              isSelected
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => toggleMunicipio(municipio)}
          >
            {municipio}
          </Button>
        );
      })}
    </div>
  );
};