import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import {
  Municipio,
  Convenio,
  MunicipioDados,
} from "../interfaces/municipioInterfaces";

// Usando constantes para evitar strings mágicas
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
  },
};

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    // Interceptor para adicionar o token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Método genérico para requisições
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api(config);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      // Tratamento centralizado de erros
      if (axiosError.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }

      throw this.handleError(axiosError);
    }
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Resposta com erro do servidor
      const errorData = error.response.data as any;
      return new Error(errorData.message || `Erro ${error.response.status}`);
    } else if (error.request) {
      // Sem resposta do servidor
      return new Error("Sem resposta do servidor. Verifique sua conexão.");
    } else {
      // Erro na configuração da requisição
      return new Error("Erro ao configurar requisição.");
    }
  }

  // Métodos específicos para diferentes endpoints
  public async getMunicipios(): Promise<Municipio[]> {
    return this.request<Municipio[]>({ method: "GET", url: "/" });
  }

  public async getConvenioDetails(
    municipio: string,
    convenio: string
  ): Promise<Convenio> {
    return this.request<Convenio>({
      method: "GET",
      url: `/${encodeURIComponent(municipio)}/${encodeURIComponent(convenio)}`,
    });
  }

  public async getMunicipiosDados(): Promise<MunicipioDados[]> {
    return this.request<MunicipioDados[]>({
      method: "GET",
      url: "/municipios/dados",
    });
  }

  public async updateMunicipioDados(
    id: string,
    data: MunicipioDados
  ): Promise<any> {
    return this.request<any>({
      method: "PUT",
      url: `/municipios/dados/${id}`,
      data,
    });
  }

  public async login(email: string, password: string): Promise<any> {
    return this.request<any>({
      method: "POST",
      url: "/login",
      data: { email, password },
    });
  }

  public async register(userData: {
    email: string;
    password: string;
    name: string;
    municipios: string[];
  }): Promise<any> {
    return this.request<any>({
      method: "POST",
      url: "/cadastrar",
      data: userData,
    });
  }

  public async uploadRelatorio(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    // Para FormData, precisamos configurar o Content-Type corretamente
    return this.request<any>({
      method: "POST",
      url: "/",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

// Exportando uma instância singleton
export const apiService = new ApiService();
