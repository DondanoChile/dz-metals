import createNextIntlPlugin from "next-intl/plugin";
import withPWA from "next-pwa";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: [] },
  // @react-pdf/renderer must run server-side only; exclude from client bundle
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"],
  },
};

export default pwaConfig(withNextIntl(nextConfig));
