import "./globals.css"; // Seus estilos globais
import Layout from "@/components/layout"; // Seu layout que você já criou
import { AuthProvider } from "@/contexts/authContext";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Dashboard",
  description: "Aplicação de Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="pt-BR">
        <body>
          <Layout>{children}</Layout>
          <Toaster />
        </body>
      </html>
    </AuthProvider>
  );
}
