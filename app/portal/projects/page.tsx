import { currentClient, portalData } from "@/lib/portal/session";
import { NotLinked } from "@/components/portal/Bits";
import { ProjectsView } from "@/components/portal/Views";

export const metadata = { title: "المشاريع · بوابة العملاء" };

export default async function ProjectsPage() {
  const [client, data] = await Promise.all([currentClient(), portalData()]);
  return (
    <>
      {!data.linked ? <NotLinked verified={client.verified} /> : null}
      <ProjectsView data={data} />
    </>
  );
}
