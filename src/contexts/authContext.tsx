"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";

// Definição de tipos
interface User {
  email: string;
  nome: string;
  municipios: string[];
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Valor padrão do contexto
const defaultContext: AuthContextType = {
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  clearError: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true, // Inicialmente carregando para verificar token existente
    error: null,
  });
  const router = useRouter();

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      console.log(
        "Verificando autenticação, token:",
        token ? "Presente" : "Ausente"
      );

      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Configurar o token nos headers do axios para todas as requisições futuras
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const userData = localStorage.getItem("userData");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log("Usuário recuperado do localStorage:", parsedUser.email);

          setState({
            user: parsedUser,
            isLoading: false,
            error: null,
          });
        } else {
          console.log("Token presente, mas dados do usuário ausentes");
          setState({ user: null, isLoading: false, error: null });
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setState({ user: null, isLoading: false, error: null });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Usar o serviço de API aprimorado
      const data = await apiService.login(email, password);

      // Salvar token e dados do usuário
      localStorage.setItem("token", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      setState({
        user: data.user,
        isLoading: false,
        error: null,
      });

      router.push("/dashboardPage");
    } catch (error: any) {
      setState({
        user: null,
        isLoading: false,
        error: error.message || "Credenciais inválidas ou erro de conexão",
      });
    }
  };

  const logout = () => {
    console.log("Realizando logout");
    // Limpar token e dados do localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    // Limpar headers de autorização
    delete axios.defaults.headers.common["Authorization"];

    // Atualizar estado
    setState({ user: null, isLoading: false, error: null });

    // Redirecionar para login
    router.push("/");
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};
