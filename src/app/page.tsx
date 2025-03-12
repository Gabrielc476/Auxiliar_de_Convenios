"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/authContext";
import { ErrorMessage } from "@/components/ui/feedback";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const { user, login, isLoading, error, clearError } = useAuth();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user) {
      router.push("/dashboardPage");
    }
  }, [user, router]);

  // Handler genérico para campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpar erros quando o usuário começa a digitar
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Acesso ao Sistema
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2">
              E-mail
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-gray-700 text-white"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-300 mb-2">
              Senha
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="bg-gray-700 text-white"
              required
              disabled={isLoading}
            />
          </div>

          {error && <ErrorMessage message={error} />}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-300">
            Não tem uma conta?{" "}
            <Link
              href="/cadastro"
              className="text-blue-400 hover:text-blue-300"
            >
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
