import { adminSnapshot } from "@/lib/admin/data";
import { Empty, PageHead } from "@/components/portal/Bits";
import { SourceErrors } from "@/components/admin/AdminBits";
import { ClientsTable } from "@/components/admin/ClientsTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "العملاء والصلاحيات · لوحة المدير" };

export default async function ClientsPage() {
  const { clients, errors } = await adminSnapshot();
  const onPortal = clients.filter((c) => c.emails.length).length;

  return (
    <>
      <PageHead
        title="العملاء والصلاحيات"
        lead={`كل عملاء KC (${clients.length})، منهم ${onPortal} على البوابة. دوس على العميل علشان تضيف إيميلات أو تغيّر الأقسام اللي يشوفها.`}
      />
      <SourceErrors errors={errors} />
      {clients.length ? <ClientsTable clients={clients} /> : <Empty>مفيش عملاء.</Empty>}
    </>
  );
}
