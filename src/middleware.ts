import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const locales = ["es", "en"] as const;
const defaultLocale = "es";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

function getLocaleFromPathname(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return defaultLocale;
}

function hasSession(request: NextRequest): boolean {
  // Supabase stores the session in a cookie starting with "sb-"
  const cookies = request.cookies.getAll();
  return cookies.some(
    (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const locale = getLocaleFromPathname(pathname);
  const isPortalRoute = pathname.startsWith(`/${locale}/portal`);
  const isAdminRoute = pathname.startsWith(`/${locale}/admin`);

  if (isPortalRoute || isAdminRoute) {
    if (!hasSession(request)) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon|icons|manifest|sw\\.js|workbox-.*\\.js).*)",
  ],
};
