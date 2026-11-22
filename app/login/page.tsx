import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/portal/AuthShell";
import { LoginForm } from "@/components/portal/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول · كامبين",
  description: "ادخل إلى بوابة عملاء كامبين.",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; link?: string }>;
}) {
  const { next, link } = await searchParams;
  const target = next?.startsWith("/portal") || next?.startsWith("/admin") ? next : "/portal";
  const notice =
    link === "invalid"
      ? "الرابط انتهت صلاحيته أو استُخدم من قبل. سجّل دخولك، أو اطلب كودًا جديدًا من تبويب «بكود على البريد»."
      : link === "expired"
      ? "لم نستطع إكمال الدخول من الرابط (ربما فُتح في متصفح آخر أو انتهت صلاحيته). إذا كنت تؤكد بريدك فقد تم تأكيده، سجّل دخولك بكلمة المرور."
      : undefined;

  return (
    <AuthShell
      title="تسجيل الدخول"
      lead="أهلًا بعودتك."
      below={
        <>
          ليس لديك حساب؟{" "}
          <Link href="/signup" className="p-link">
            أنشئ حسابًا
          </Link>
        </>
      }
    >
      <LoginForm next={target} notice={notice} />
    </AuthShell>
  );
}
