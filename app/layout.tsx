import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Sora, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "كامبين · حلول التحول الرقمي للمتاجر",
  description:
    "نقود رحلة التحول الرقمي لنشاطك التجاري عبر استراتيجية علامة تجارية قوية، ومتجر إلكتروني جاهز للبيع، وتسويق مبني على البيانات.",
  metadataBase: new URL("https://kmpn.agency"),
  openGraph: {
    title: "كامبين · حلول التحول الرقمي للمتاجر",
    description:
      "نقود رحلة التحول الرقمي لنشاطك التجاري عبر استراتيجية علامة تجارية قوية، ومتجر إلكتروني جاهز للبيع، وتسويق مبني على البيانات.",
    locale: "ar_EG",
    type: "website",
  },
};

/* Runs before first paint so the saved theme never flashes. */
const themeBootstrap = `
(function(){
  try {
    var t = localStorage.getItem('tw-theme');
    if (t !== 'dark' && t !== 'light') t = 'light';
    document.documentElement.setAttribute('data-tw', t);
    document.documentElement.style.background = t === 'dark' ? '#0B0B0B' : '#FAF7F2';
  } catch (e) {
    document.documentElement.setAttribute('data-tw', 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-tw="light"
      className={`${arabic.variable} ${sora.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
