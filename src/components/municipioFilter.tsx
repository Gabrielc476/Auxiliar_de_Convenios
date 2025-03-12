"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/authContext";

interface MunicipioFilterProps {
  selected: string[];
  setSelected: (municipios: string[]) => void;
}

export const MunicipioFilter = ({
  selected,
  setSelected,
}: MunicipioFilterProps) => {
  const { user } = useAuth();

  // Se não há usuário ou municípios, não renderiza nada
  if (!user?.municipios?.length) return null;

  const toggleMunicipio = (municipio: string) => {
    const newSelected = selected.includes(municipio)
      ? selected.filter((m) => m !== municipio)
      : [...selected, municipio];
    setSelected(newSelected);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {user.municipios.map((municipio) => {
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
