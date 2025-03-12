import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas públicas que não requerem autenticação
const PUBLIC_ROUTES = ["/", "/cadastro"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware] Verificando rota: ${pathname}`);

  // Permitir acesso a recursos estáticos sem verificação
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Verificar se é uma rota pública
  if (PUBLIC_ROUTES.includes(pathname)) {
    console.log(`[Middleware] Rota pública: ${pathname}`);

    // Se houver token no localStorage, redirecionaria para o dashboard,
    // mas o middleware não tem acesso ao localStorage, então confiamos
    // na lógica do componente para isso
    return NextResponse.next();
  }

  // Para rotas protegidas, verificamos o token nos cookies
  // Observação: como o token está no localStorage e não nos cookies,
  // o middleware não conseguirá proteger completamente as rotas
  // A proteção principal acontecerá no nível do componente

  // No entanto, se você implementar a autenticação baseada em cookies,
  // descomente o código abaixo:
  /*
  const token = request.cookies.get("token")?.value;
  
  if (!token) {
    console.log(`[Middleware] Acesso negado à rota protegida: ${pathname}`);
    return NextResponse.redirect(new URL("/", request.url));
  }
  */

  console.log(`[Middleware] Permitindo acesso à rota: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
