import { adminSnapshot } from "@/lib/admin/data";
import { Empty, PageHead } from "@/components/portal/Bits";
import { SourceErrors } from "@/components/admin/AdminBits";
import { ClientCard } from "@/components/admin/ClientCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "العملاء والصلاحيات · لوحة المدير" };

export default async function ClientsPage() {
  const { clients, errors } = await adminSnapshot();
  const current = clients.filter((c) => c.emails.length || c.status === "Active" || c.status === "In Pipeline");
  const rest = clients.filter((c) => !current.includes(c));

  return (
    <>
      <PageHead
        title="العملاء والصلاحيات"
        lead="لكل عميل: مين يدخل بوابته، وأنهي أقسام يشوفها. القسم اللي مش متعلّم بيظهرله «قريبًا». التعديلات بتتحفظ في صف العميل في KC على نوشن."
      />
      <SourceErrors errors={errors} />
      {current.length ? (
        <div className="p-list">
          {current.map((c) => (
            <ClientCard key={c.id} c={c} />
          ))}
        </div>
      ) : (
        <Empty>مفيش عملاء.</Empty>
      )}
      {rest.length ? (
        <details className="a-rest">
          <summary>باقي العملاء في KC ({rest.length})</summary>
          <div className="p-list">
            {rest.map((c) => (
              <ClientCard key={c.id} c={c} />
            ))}
          </div>
        </details>
      ) : null}
    </>
  );
}
