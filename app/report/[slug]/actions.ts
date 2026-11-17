"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { reportClient } from "@/lib/reports/clients";
import { reportCookie, unlockToken } from "@/lib/reports/access";

export type UnlockState = { error?: string };

export async function unlockReport(slug: string, _prev: UnlockState, form: FormData): Promise<UnlockState> {
  if (!reportClient(slug)) return { error: "هذا التقرير غير موجود." };
  const token = unlockToken(slug, String(form.get("password") ?? ""));
  if (!token) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 800));
    return { error: "كلمة المرور غير صحيحة. حاول مرة أخرى." };
  }
  (await cookies()).set(reportCookie(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/report/${slug}`,
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(`/report/${slug}`);
}
