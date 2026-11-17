import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/portal/AuthShell";
import { ForgotForm } from "@/components/portal/ForgotForm";

export const metadata: Metadata = {
  title: "نسيت كلمة المرور · كامبين",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="نسيت كلمة المرور؟"
      lead="اكتب بريدك وسنرسل لك رابطًا لتعيين كلمة مرور جديدة."
      below={
        <Link href="/login" className="p-link">
          الرجوع لتسجيل الدخول
        </Link>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
