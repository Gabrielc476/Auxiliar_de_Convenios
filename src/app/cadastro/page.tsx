"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/feedback";
import { apiService } from "@/services/api";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export default function Cadastro() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpar erros quando o usuário começa a digitar
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        municipios: [],
      });

      if (response.success) {
        router.push("/");
      }
    } catch (err) {
      setError("Erro ao criar conta. Tente outro e-mail.");
      console.error("Erro no cadastro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Criar Nova Conta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray-300 mb-2">
              Nome Completo
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-gray-700 text-white"
              required
              disabled={loading}
            />
          </div>

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
              disabled={loading}
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
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && <ErrorMessage message={error} />}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Criando conta..." : "Cadastrar"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-300">
            Já tem uma conta?{" "}
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
