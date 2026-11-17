import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/portal/AuthShell";
import { SignupForm } from "@/components/portal/SignupForm";

export const metadata: Metadata = {
  title: "إنشاء حساب · كامبين",
  description: "أنشئ حسابك في بوابة عملاء كامبين لمتابعة مشاريعك وفواتيرك والدعم الفني.",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <AuthShell
      title="إنشاء حساب"
      lead="تابع مشاريعك وفواتيرك وتذاكر الدعم مع فريق كامبين من مكان واحد."
      below={
        <>
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="p-link">
            سجّل دخولك
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
