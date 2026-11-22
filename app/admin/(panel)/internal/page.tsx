import { adminSnapshot } from "@/lib/admin/data";
import { Empty, PageHead } from "@/components/portal/Bits";
import { SourceErrors } from "@/components/admin/AdminBits";
import { ClientsTable } from "@/components/admin/ClientsTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "مشاريع داخلية · لوحة المدير" };

export default async function InternalPage() {
  const { internal, errors } = await adminSnapshot({ signups: false, tickets: false });

  return (
    <>
      <PageHead
        title="مشاريع داخلية"
        lead="مشاريع كامبين نفسها، مش عملاء: مش داخلة في عدّ العملاء ولا في قايمة ربط المسجّلين. أي صف في KC عليه Relation = Internal، أو في اسمه KMPN أو كامبين، بيظهر هنا."
      />
      <SourceErrors errors={errors} />
      {internal.length ? <ClientsTable clients={internal} /> : <Empty>مفيش مشاريع داخلية.</Empty>}
    </>
  );
}
