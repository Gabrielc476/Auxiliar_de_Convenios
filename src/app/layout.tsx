import "./globals.css"; // Seus estilos globais
import Layout from "@/components/layout"; // Seu layout que você já criou
import { AuthProvider } from "@/contexts/authContext";

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
      <html lang="en">
        <body>
          <Layout>{children}</Layout>
        </body>
      </html>
    </AuthProvider>
  );
}
