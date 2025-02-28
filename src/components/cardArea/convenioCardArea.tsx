"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Municipio } from "../../interfaces/municipioInterfaces";
import { ConvenioCard } from "./convenioCard";

export default function ConveniosCardsArea() {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<Municipio[]>("http://127.0.0.1:5000") // Ajuste a URL conforme sua API
      .then((response) => {
        setMunicipios(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar municípios:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-white p-6">Carregando...</p>;
  }

  return (
    <div className="p-6 bg-gray-900">
      {municipios.map((municipio) => (
        <div key={municipio.municipio}>
          <h2 className="text-2xl font-bold text-white">
            {municipio.municipio}
          </h2>
          <p className="text-gray-400 mb-4">
            Acompanhamento de convênios do município
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {municipio.convenios.map((conv, index) => (
              <ConvenioCard key={index} data={conv} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
