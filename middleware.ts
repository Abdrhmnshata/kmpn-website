import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Keeps the client-portal session fresh and guards /portal.
 *
 * Runs only on the portal and auth routes (see `config.matcher`), so the
 * marketing pages stay static and never touch Supabase.
 *
 * It also maintains `kp_name`, a readable cookie holding the client's first
 * name, which the public header uses to show "أهلاً، …" without loading the
 * Supabase SDK on every page.
 */
const GREETING_COOKIE = "kp_name";
const GUEST_ONLY = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  // The home page is matched only to catch email links Supabase sent to the
  // Site URL instead of /auth/callback; anything else passes straight on.
  if (request.nextUrl.pathname === "/") {
    const { searchParams } = request.nextUrl;
    const fromEmail = ["code", "token_hash", "error_code"].some((p) => searchParams.has(p));
    if (!fromEmail) return NextResponse.next();
    const target = new URL("/auth/callback", request.url);
    searchParams.forEach((value, name) => target.searchParams.set(name, value));
    return NextResponse.redirect(target);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() revalidates the token with Supabase; do not trust getSession() here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const redirectTo = (target: URL) => {
    const res = NextResponse.redirect(target);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!user && path.startsWith("/portal")) {
    const target = new URL("/login", request.url);
    target.searchParams.set("next", path + request.nextUrl.search);
    const res = redirectTo(target);
    res.cookies.delete(GREETING_COOKIE);
    return res;
  }

  if (user && GUEST_ONLY.includes(path)) {
    const next = request.nextUrl.searchParams.get("next");
    return redirectTo(new URL(next?.startsWith("/portal") ? next : "/portal", request.url));
  }

  if (user) {
    const meta = (user.user_metadata ?? {}) as { full_name?: string };
    const first = (meta.full_name || user.email?.split("@")[0] || "").trim().split(/\s+/)[0];
    if (first && request.cookies.get(GREETING_COOKIE)?.value !== encodeURIComponent(first)) {
      response.cookies.set(GREETING_COOKIE, encodeURIComponent(first), {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  } else if (request.cookies.has(GREETING_COOKIE)) {
    response.cookies.delete(GREETING_COOKIE);
  }

  return response;
}

export const config = {
  matcher: ["/", "/portal/:path*", "/login", "/signup", "/forgot-password", "/auth/:path*"],
};
