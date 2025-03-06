// components/MunicipioFilter.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/authContext";

export const MunicipioFilter = ({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (m: string[]) => void;
}) => {
  const { user } = useAuth();

  const toggleMunicipio = (municipio: string) => {
    const newSelected = selected.includes(municipio)
      ? selected.filter((m) => m !== municipio)
      : [...selected, municipio];
    setSelected(newSelected);
  };

  if (!user?.municipios?.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {user.municipios.map((municipio) => (
        <Button
          key={municipio}
          variant={selected.includes(municipio) ? "default" : "outline"}
          className={`transition-colors ${
            selected.includes(municipio)
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
          onClick={() => toggleMunicipio(municipio)}
        >
          {municipio}
        </Button>
      ))}
    </div>
  );
};
