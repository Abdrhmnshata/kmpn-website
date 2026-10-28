import { getSupabase } from "./supabase/server";

export type Story = {
  slug: string;
  client: string;
  country: string;
  period: string;
  title: string;
  tags: string[];
  cats: string[];
  from: string;
  to: string;
  metric: string;
  cover: string | null;
  href: string | null;
  soon: boolean;
};

export const FILTERS = ["الكل", "هوية", "متجر", "إعلانات"];

/**
 * Seed content, taken from `Success Stories.dc.html`. Used as-is until a
 * Supabase project is wired up, and as the fallback if that query fails.
 */
export const SEED_STORIES: Story[] = [
  {
    slug: "tawheed",
    client: "التوحيد والنور · ريتيل",
    country: "مصر",
    period: "يونيو 2023 ← سبتمبر 2026",
    title: "من محلات عريقة لـ علامة تجارية واضحة، ديجيتال!",
    tags: ["هوية", "متجر", "إعلانات"],
    cats: ["هوية", "متجر", "إعلانات"],
    from: "0",
    to: "6M EGP",
    metric: "مبيعات أونلاين شهرية · خلال سنتين",
    cover: "/assets/tawheed-wall-sign.jpg",
    href: "/success-stories/tawheed",
    soon: false,
  },
  {
    slug: "oq",
    client: "OQ Originals",
    country: "مصر",
    period: "يوليو 2020 ← سبتمبر 2021",
    title: "من صفر لـ مبيعات 280 ألف شهرياً",
    tags: ["استراتيجية علامة تجارية", "شوبيفاي", "التسويق بالأداء"],
    cats: ["هوية", "متجر", "إعلانات"],
    from: "0",
    to: "280K EGP",
    metric: "مبيعات شهرية · إجمالي 1.1M EGP في 10 أشهر",
    cover: null,
    href: null,
    soon: true,
  },
  {
    slug: "s3",
    client: "RugMorph",
    country: "مصر",
    period: "أغسطس 2022 ← يناير 2026",
    title: "من 35 لـ 250 أوردر يومياً",
    tags: ["شوبيفاي", "التسويق بالأداء"],
    cats: ["متجر", "إعلانات"],
    from: "35",
    to: "250",
    metric: "أوردر يومياً · إجمالي 98M EGP في 46 شهر",
    cover: null,
    href: null,
    soon: true,
  },
  {
    slug: "s2",
    client: "Surveying Experts",
    country: "السعودية",
    period: "فبراير 2025 ← الآن",
    title: "من 14 ألف لـ 90 ألف دولار مبيعات شهرياً",
    tags: ["استراتيجية علامة تجارية", "شوبيفاي", "التسويق بالأداء"],
    cats: ["هوية", "متجر", "إعلانات"],
    from: "14K USD",
    to: "90K USD",
    metric: "مبيعات شهرية · 740K USD مبيعات مدفوعة في 9 أشهر",
    cover: null,
    href: null,
    soon: true,
  },
  {
    slug: "smartlaptop",
    client: "Smart Laptop",
    country: "مصر",
    period: "فبراير 2023 ← أغسطس 2024",
    title: "من صفر لـ 1.7 مليون مبيعات شهرياً",
    tags: ["استراتيجية علامة تجارية", "شوبيفاي", "التسويق بالأداء"],
    cats: ["هوية", "متجر", "إعلانات"],
    from: "0",
    to: "1.7M EGP",
    metric: "مبيعات شهرية · 9.3M EGP مبيعات مدفوعة في 16 شهر",
    cover: null,
    href: null,
    soon: true,
  },
  {
    slug: "kandil",
    client: "Kandil Tires",
    country: "مصر",
    period: "ديسمبر 2024 ← أغسطس 2025",
    title: "385 ألف مبيعات في أول شهرين",
    tags: ["شوبيفاي", "التسويق بالأداء"],
    cats: ["متجر", "إعلانات"],
    from: "0",
    to: "385K EGP",
    metric: "مبيعات أول شهرين · عائد 4x",
    cover: null,
    href: null,
    soon: true,
  },
  {
    slug: "cairoinsulation",
    client: "Cairo Insulation",
    country: "مصر",
    period: "يونيو 2024 ← نوفمبر 2024",
    title: "هوية جديدة وعملاء محتملين مؤهلين أكثر",
    tags: ["استراتيجية علامة تجارية", "التسويق بالأداء"],
    cats: ["هوية", "إعلانات"],
    from: "1x",
    to: "12x",
    metric: "عائد على الإنفاق · خلال 6 أشهر",
    cover: null,
    href: null,
    soon: true,
  },
  {
    slug: "xzone",
    client: "XZone",
    country: "مصر",
    period: "نوفمبر 2021 ← مارس 2022",
    title: "إطلاق في السوق بـ 2 مليون مبيعات",
    tags: ["استراتيجية علامة تجارية", "شوبيفاي", "التسويق بالأداء"],
    cats: ["هوية", "متجر", "إعلانات"],
    from: "0",
    to: "2M EGP",
    metric: "مبيعات · أول 6 أشهر",
    cover: null,
    href: null,
    soon: true,
  },
  {
    slug: "halley",
    client: "Halley International Schools",
    country: "السعودية",
    period: "مارس 2023 ← نوفمبر 2023",
    title: "زيادة 30% في تسجيلات الطلاب الجدد",
    tags: ["استراتيجية علامة تجارية", "التسويق بالأداء"],
    cats: ["هوية", "إعلانات"],
    from: "0%",
    to: "+30%",
    metric: "تسجيلات طلاب جدد · عائد 25x",
    cover: null,
    href: null,
    soon: true,
  },
];

/** Tag pill colours — same rules as the design's `tagsX` mapping. */
export function tagColors(tag: string): [string, string] {
  if (/هوية|علامة/.test(tag)) return ["#EE4037", "#FFFFFF"];
  if (/شوبيفاي|متجر/.test(tag)) return ["#32AC63", "#FFFFFF"];
  if (/تسويق|إعلان/.test(tag)) return ["#1DB4D8", "#FFFFFF"];
  return ["rgba(11,11,11,.72)", "#FAF7F2"];
}

/**
 * Slugs that have a cover file in `public/assets/slots/`. The handoff shipped
 * no artwork for Kandil Tires or Cairo Insulation, so those fall back to a
 * placeholder rather than a broken image.
 */
const SLOT_COVERS = new Set([
  "halley",
  "oq",
  "s2",
  "s3",
  "s4",
  "smartlaptop",
  "xzone",
]);

/** Cover image for a story — explicit `cover`, else the design's slot file. */
export function storyCover(s: Story): string | null {
  if (s.cover) return s.cover;
  return SLOT_COVERS.has(s.slug) ? `/assets/slots/story-cover-${s.slug}.webp` : null;
}

/**
 * Published stories. Reads Supabase when it is configured; otherwise (and on
 * any error) falls back to the seed list so the site always renders.
 */
export async function getStories(): Promise<Story[]> {
  const supabase = getSupabase();
  if (!supabase) return SEED_STORIES;

  const { data, error } = await supabase
    .from("success_stories")
    .select(
      "slug, client, country, period, title, tags, cats, from_value, to_value, metric, cover_url, href, status, sort_order",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    if (error) console.error("[stories] Supabase query failed:", error.message);
    return SEED_STORIES;
  }

  return data.map((r) => ({
    slug: r.slug,
    client: r.client,
    country: r.country ?? "",
    period: r.period ?? "",
    title: r.title,
    tags: r.tags ?? [],
    cats: r.cats ?? [],
    from: r.from_value ?? "",
    to: r.to_value ?? "",
    metric: r.metric ?? "",
    cover: r.cover_url,
    href: r.href,
    soon: r.status !== "live",
  }));
}
