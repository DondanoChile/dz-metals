import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: [] },
  // @react-pdf/renderer must run server-side only; exclude from client bundle
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"],
  },
};

export default withNextIntl(nextConfig);
