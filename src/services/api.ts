import axios from "axios";
import { Municipio } from "../interfaces/municipioInterfaces";

// Defina a URL da sua API (ajuste conforme necessário)
const API_URL = "http://localhost:5000/";

export const fetchMunicipios = async (): Promise<Municipio[]> => {
  try {
    const response = await axios.get<Municipio[]>(API_URL);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar municípios:", error);
    return [];
  }
};
