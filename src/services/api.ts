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
import {
  PendenciaType,
  NovaPendenciaType
} from "../interfaces/pendenciaInterfaces";
import { ReminderType, NewReminderType } from "@/interfaces/reminderInterfaces";

// Usando constantes para evitar strings mágicas
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  TIMEOUT: 120000, // Aumentado para 120 segundos
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
      return new Error(errorData.message || errorData.error || `Erro ${error.response.status}`);
    } else if (error.request) {
      // Sem resposta do servidor
      return new Error("Sem resposta do servidor. Verifique sua conexão.");
    } else {
      // Erro na configuração da requisição
      return new Error("Erro ao configurar requisição.");
    }
  }

  // Métodos específicos para diferentes endpoints

  // ----- Municípios e Convênios -----
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

  public async createMunicipio(data: MunicipioDados): Promise<any> {
    return this.request<any>({
      method: "POST",
      url: "/municipios/dados",
      data,
    });
  }

  public async addConvenio(municipio: string, data: any): Promise<any> {
    return this.request<any>({
      method: "POST",
      url: `/convenios/${encodeURIComponent(municipio)}`,
      data,
    });
  }

  // ----- Pendências -----

  // Obter todas as pendências de um convênio
  public async getPendencias(convenioId: string, municipioId?: string): Promise<PendenciaType[]> {
    try {
      console.log(`Buscando pendências: convenioId=${convenioId}, municipioId=${municipioId}`);
      let url = `/pendencias/convenio/${encodeURIComponent(convenioId)}`;
      
      if (municipioId) {
        url += `?municipio_id=${encodeURIComponent(municipioId)}`;
      }
      
      // Lidar explicitamente com 404 e outros erros
      try {
        const response = await this.api.get(url);
        
        // Verificar se a resposta é um array
        if (Array.isArray(response.data)) {
          return response.data;
        } else {
          console.warn("Resposta da API não é um array:", response.data);
          return []; // Retornar array vazio
        }
      } catch (error) {
        // Se for 404, retorna array vazio em vez de lançar erro
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          console.log("Endpoint não encontrado (404). Retornando array vazio.");
          return [];
        }
        throw error; // Re-lança outros erros
      }
    } catch (error) {
      console.error("Erro ao buscar pendências:", error);
      return []; // Retornar array vazio em caso de erro
    }
  }

  // Obter uma pendência específica pelo ID
  public async getPendenciaById(pendenciaId: string): Promise<PendenciaType> {
    return this.request<PendenciaType>({
      method: "GET",
      url: `/pendencias/${pendenciaId}`,
    });
  }

  // Criar uma nova pendência
  public async createPendencia(data: NovaPendenciaType): Promise<PendenciaType> {
    return this.request<PendenciaType>({
      method: "POST",
      url: "/pendencias",
      data,
    });
  }

  // Atualizar uma pendência existente
  public async updatePendencia(
    pendenciaId: string, 
    data: Partial<PendenciaType>
  ): Promise<PendenciaType> {
    return this.request<PendenciaType>({
      method: "PUT",
      url: `/pendencias/${pendenciaId}`,
      data,
    });
  }

  // Excluir uma pendência
  public async deletePendencia(pendenciaId: string): Promise<any> {
    return this.request<any>({
      method: "DELETE",
      url: `/pendencias/${pendenciaId}`,
    });
  }

  // ----- Autenticação -----
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
  // ----- Lembretes -----
  
  // Get all reminders
  public async getReminders(): Promise<ReminderType[]> {
    return this.request<ReminderType[]>({
      method: "GET",
      url: "/reminders"
    });
  }

  // Create a new reminder
  public async createReminder(reminder: NewReminderType): Promise<ReminderType> {
    return this.request<ReminderType>({
      method: "POST",
      url: "/reminders",
      data: reminder
    });
  }

  // Update a reminder
  public async updateReminder(id: string, reminder: Partial<ReminderType>): Promise<ReminderType> {
    return this.request<ReminderType>({
      method: "PUT",
      url: `/reminders/${id}`,
      data: reminder
    });
  }

  // Delete a reminder
  public async deleteReminder(id: string): Promise<any> {
    return this.request<any>({
      method: "DELETE",
      url: `/reminders/${id}`
    });
  }
}

// Exportando uma instância singleton
export const apiService = new ApiService();