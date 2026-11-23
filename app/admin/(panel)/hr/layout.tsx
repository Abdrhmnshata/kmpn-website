import { PageHead } from "@/components/portal/Bits";
import { HrTabs } from "@/components/admin/HrTabs";

export const metadata = { title: "الموارد البشرية · لوحة المدير" };

/** KMPN's own team: people, leaves and payroll, kept in Notion ("KMPN HR"). */
export default function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHead title="الموارد البشرية" lead="فريق كامبين: الناس، الإجازات والمرتبات. كله محفوظ في نوشن (KMPN HR) ومحدش يشوفه غيرك." />
      <HrTabs />
      {children}
    </>
  );
}
