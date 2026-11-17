import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { reportClient } from "@/lib/reports/clients";
import { hasReportAccess } from "@/lib/reports/access";
import { googleConfigured } from "@/lib/reports/google";
import { readTab, reportTabs, type ParsedTab, type TabRef } from "@/lib/reports/sheet";
import { ReportView } from "@/components/report/ReportView";
import { UnlockForm } from "@/components/report/UnlockForm";
import { ReportThemeToggle } from "@/components/report/ReportThemeToggle";
import "../report.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const client = reportClient((await params).slug);
  return {
    title: client ? `تقرير الأداء · ${client.name}` : "تقرير الأداء",
    robots: { index: false, follow: false },
  };
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="page rp-page">
      <header className="rp-bar-top">
        <div className="rp-wide rp-bar-in">
          <Link href="/" aria-label="كامبين" className="logo-mask" style={{ height: 24 }} />
          <ReportThemeToggle />
        </div>
      </header>
      <main className="rp-wide">{children}</main>
    </div>
  );
}

function Problem({ title, body }: { title: string; body: string }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">{title}</h1>
        <p className="auth-lead">{body}</p>
      </div>
    </div>
  );
}

export default async function ReportPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const client = reportClient(slug);
  if (!client) notFound();

  if (!(await hasReportAccess(slug))) {
    return (
      <Shell>
        <UnlockForm slug={slug} name={client.name} />
      </Shell>
    );
  }

  if (!(await googleConfigured())) {
    return (
      <Shell>
        <Problem title="التقرير غير متاح الآن" body="نعمل على ربط التقرير ببياناته. حاول مرة أخرى بعد قليل." />
      </Shell>
    );
  }

  let tabs: TabRef[];
  let current: TabRef | undefined;
  let tab: ParsedTab;
  try {
    tabs = await reportTabs(client);
    const wanted = (await searchParams).tab;
    current = tabs.find((t) => t.title === wanted) ?? tabs[0];
    if (!current) throw new Error("no tabs");
    tab = await readTab(client, current.title);
  } catch (err) {
    console.error(`[report:${slug}]`, err);
    return (
      <Shell>
        <Problem title="تعذّر تحميل التقرير" body="حدث خطأ أثناء قراءة البيانات. حدّث الصفحة بعد دقيقة." />
      </Shell>
    );
  }

  return (
    <Shell>
      <ReportView
        clientName={client.name}
        tabs={tabs}
        current={current}
        tab={tab}
        hrefFor={(t) => `/report/${slug}?tab=${encodeURIComponent(t.title)}`}
      />
    </Shell>
  );
}
