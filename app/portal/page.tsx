import { currentClient, portalData } from "@/lib/portal/session";
import { DashboardView } from "@/components/portal/Views";

export default async function Dashboard() {
  const [client, data] = await Promise.all([currentClient(), portalData()]);
  return (
    <DashboardView
      name={client.firstName}
      data={data}
      verified={client.verified}
      href={(tab) => `/portal/${tab}`}
    />
  );
}
