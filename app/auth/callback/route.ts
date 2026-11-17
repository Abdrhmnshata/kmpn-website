import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getAuthClient } from "@/lib/supabase/auth";

/**
 * Where the links in Supabase's emails land (sign-up confirmation, login
 * link, password reset). Handles both shapes Supabase can send:
 *   ?code=…                    the default templates (PKCE, same browser)
 *   ?token_hash=…&type=…       custom templates, work from any browser
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const nextParam = searchParams.get("next") ?? "/portal";
  const next = nextParam.startsWith("/portal") ? nextParam : "/portal";

  // Supabase sends ?error=… instead of a code when the link was already used
  // or expired; nothing was confirmed then.
  if (searchParams.has("error")) {
    return NextResponse.redirect(new URL("/login?link=invalid", request.url));
  }

  const supabase = await getAuthClient();
  if (supabase) {
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;

    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : tokenHash && type
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : { error: new Error("missing code") };

    if (!error) {
      const target = type === "recovery" ? "/portal/account?reset=1" : next;
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?link=expired", request.url));
}
