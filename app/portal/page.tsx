import Link from "next/link";
import { currentClient, portalData } from "@/lib/portal/session";
import { DashboardView } from "@/components/portal/Views";
import { isAdminEmail } from "@/lib/admin/auth";

export default async function Dashboard() {
  const [client, data] = await Promise.all([currentClient(), portalData()]);
  // The director's own account is not a client: no empty client cards.
  if (client.verified && isAdminEmail(client.email) && !data.linked) {
    return <DirectorHome name={client.firstName} />;
  }
  return (
    <DashboardView
      name={client.firstName}
      data={data}
      verified={client.verified}
      href={(tab) => `/portal/${tab}`}
    />
  );
}

function DirectorHome({ name }: { name: string }) {
  return (
    <>
      <h1 className="p-hello">
        مرحبًا،
        <br />
        {name}
      </h1>
      <div className="p-banner">
        <strong>إنت داخل بحساب المدير.</strong> البوابة دي للعملاء، وحسابك مش مربوط بعميل. علشان تشوف بوابة أي
        عميل زي ما هو شايفها، افتح{" "}
        <Link href="/admin/clients" prefetch={false} className="p-link">
          العملاء والصلاحيات
        </Link>{" "}
        ودوس «شوف بوابته».
      </div>
    </>
  );
}
