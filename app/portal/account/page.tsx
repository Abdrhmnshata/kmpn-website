import { currentClient } from "@/lib/portal/session";
import { PageHead } from "@/components/portal/Bits";
import { PasswordForm, ProfileForm } from "@/components/portal/AccountForms";

export const metadata = { title: "حسابي · بوابة العملاء" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const [client, { reset }] = await Promise.all([currentClient(), searchParams]);
  const resetting = reset === "1";

  return (
    <>
      <PageHead title="حسابي" />
      <div className="p-split">
        {resetting ? <PasswordForm reset /> : null}
        <ProfileForm
          name={client.name}
          company={client.company}
          phone={client.phone}
          email={client.email}
        />
        {resetting ? null : <PasswordForm reset={false} />}
      </div>
    </>
  );
}
