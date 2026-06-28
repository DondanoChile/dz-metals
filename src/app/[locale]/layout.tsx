import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-cormorant",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
});

export const metadata = {
  title: "DZ Metals",
  description:
    "Intermediación privada de metales y minerales. Conectamos compradores y vendedores de oro, cobre, plata, molibdeno y más.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
  },
  themeColor: "#C9A84C",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DZM",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="bg-[#0A0A0A] text-[#F5F0E8] font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
