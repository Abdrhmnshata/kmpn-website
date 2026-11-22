import Link from "next/link";
import { adminSnapshot } from "@/lib/admin/data";
import { Empty, PageHead } from "@/components/portal/Bits";
import { SourceErrors } from "@/components/admin/AdminBits";
import { ClientsTable } from "@/components/admin/ClientsTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "العملاء والصلاحيات · لوحة المدير" };

/** Active contracts only; the rest of KC stays one click away (?all=1). */
export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const [{ all }, { clients, errors }] = await Promise.all([searchParams, adminSnapshot()]);
  const active = clients.filter((c) => c.status.trim().toLowerCase() === "active");
  const showAll = all === "1";
  const list = showAll ? clients : active;
  const hidden = clients.length - active.length;
  const onPortal = list.filter((c) => c.emails.length).length;

  return (
    <>
      <PageHead
        title="العملاء والصلاحيات"
        lead={`${showAll ? `كل عملاء KC (${clients.length})` : `العملاء اللي تعاقدهم ساري (${active.length})`}، منهم ${onPortal} على البوابة. دوس على العميل علشان تضيف إيميلات أو تغيّر الأقسام اللي يشوفها.`}
      />
      <SourceErrors errors={errors} />
      {list.length ? <ClientsTable clients={list} /> : <Empty>مفيش عملاء تعاقدهم ساري.</Empty>}
      {hidden ? (
        <Link href={showAll ? "/admin/clients" : "/admin/clients?all=1"} prefetch={false} className="p-link a-toggle">
          {showAll ? "اخفي العملاء اللي تعاقدهم مش ساري" : `اعرض باقي العملاء (${hidden})`}
        </Link>
      ) : null}
    </>
  );
}
