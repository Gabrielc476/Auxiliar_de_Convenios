import "./globals.css"; // Seus estilos globais
import Layout from "@/components/layout"; // Seu layout que você já criou

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
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
