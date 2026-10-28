/** Data for the Al-Tawheed Wel Nour case study (from `Tawheed Case Study v3.dc.html`). */

/** Monthly Shopify orders, OCT 2024 → SEP 2026 (chart index 16…39). */
export const ORDERS = [
  303, 660, 683, 674, 583, 519, 169, 416, 320, 338, 625, 854, 1199, 1860, 1977,
  1988, 1824, 1721, 1609, 683, 841, 1211, 1437, 1440,
];

export const MON = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export const N = 40;
export const START = 16;
export const PEAK = 31;

/** Chart index → "MON YY" label. Month 0 is JUN 2023. */
export const monthLabel = (i: number) =>
  `${MON[(5 + i) % 12]} ${23 + Math.floor((5 + i) / 12)}`;

/** Right-anchored x position for chart index `i` (viewBox is 400 wide). */
export const xR = (i: number, slot = 10) => 400 - (i + 1) * slot;

export type Phase = {
  n: string;
  name: string;
  title: string;
  from: number;
  to: number;
  dates: string;
  desc: string;
  tags: string[];
  stats: [string, string, number?][];
};

export const PHASES: Phase[] = [
  {
    n: "01",
    name: "الهوية",
    title: "إعادة بناء الهوية البصرية",
    from: 0,
    to: 12,
    dates: "JUN 2023 — JUN 2024 · 13 MO",
    desc: "هوية جديدة لسلسلة التوحيد والنور - الإدارة الجديدة مع الحفاظ على نفس روح العلامة التجارية، مع تغيير كامل نقاط التواصل من شنط والتصميم على السيارات والفواتير وواجهات الفروع.",
    tags: [],
    stats: [
      ["~70", "فرع متأثر"],
      ["4+", "حملات موسمية"],
      ["+37,707", "متابع في Q4 2023", 1],
      ["360°", "طباعة + ديجيتال + فرع"],
    ],
  },
  {
    n: "02",
    name: "الجاهزية",
    title: "جاهزية الإطلاق الديجيتال",
    from: 13,
    to: 15,
    dates: "JUL — SEP 2024 · 3 MO",
    desc: "بناء Shopify من الصفر، وتجهيز GA4 و Meta Pixel قبل أول جنيه إعلاني. تجارب Meta صغيرة لاختيار الـ audiences والـ creatives.",
    tags: ["Shopify build", "GA4", "Meta Pixel", "Pretest"],
    stats: [
      ["6.3M", "ظهور اختباري"],
      ["307K", "نقرة"],
      ["388", "أوردر pretest", 1],
      ["98K", "جنيه إنفاق"],
    ],
  },
  {
    n: "03",
    name: "الإطلاق",
    title: "الإطلاق وإثبات المنتج",
    from: 16,
    to: 21,
    dates: "OCT 2024 — MAR 2025 · 6 MO",
    desc: "المتجر والتطبيق فتحوا: أول شهر 303 أوردر و 225 ألف جنيه. اختبار angles، تضعيف الإنفاق، وإضافة Google Ads. AOV من 748 لـ 1,118.",
    tags: ["المتجر + التطبيق", "Angle testing", "Google Ads"],
    stats: [
      ["3,422", "أوردر"],
      ["3.17M", "جنيه مبيعات", 1],
      ["926", "جنيه AOV"],
      ["×3.1", "ROAS Meta"],
    ],
  },
  {
    n: "04",
    name: "التوسع",
    title: "التوسع",
    from: 22,
    to: 39,
    dates: "APR 2025 — SEP 2026 · 18 MO",
    desc: "تضعيف Google Ads وفتح SEO. المبيعات الشهرية من 650 ألف لـ 3.1 مليون جنيه (×4.8). يناير 2026 ذروة التاريخ: 1,988 أوردر و 3.14M جنيه.",
    tags: ["Scale", "SEO", "Funnel optimisation"],
    stats: [
      ["20,512", "أوردر"],
      ["30.6M", "جنيه مبيعات", 1],
      ["×12.6", "ROAS مزجي"],
      ["1,988", "ذروة شهرية"],
    ],
  },
];

/** [chart index, label, raised row?] */
export const MILESTONES: [number, string, number][] = [
  [0, "بداية الـ Rebranding", 0],
  [4, "+37.7K متابع", 1],
  [13, "بناء Shopify", 0],
  [16, "إطلاق المتجر", 1],
  [22, "Google + SEO", 0],
  [PEAK, "الذروة · 1,988", 1],
];

export const AXIS: [number, string][] = [
  [0, "JUN 23"],
  [7, "2024"],
  [19, "2025"],
  [31, "2026"],
  [39, "SEP 26"],
];

export const phaseOf = (i: number) =>
  PHASES.findIndex((p) => i >= p.from && i <= p.to);

/** Tab widths mirror each phase's share of the 40-month span. */
export const TAB_COLUMNS = "13fr 3fr 6fr 18fr";
