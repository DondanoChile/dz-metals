import Header from "@/components/public/Header";
import Hero from "@/components/public/Hero";
import MetalsPriceTicker from "@/components/public/MetalsPriceTicker";
import StatsSection from "@/components/public/StatsSection";
import CommoditiesGrid from "@/components/public/CommoditiesGrid";
import ProcessSteps from "@/components/public/ProcessSteps";
import RegisterCTA from "@/components/public/RegisterCTA";
import OperationsMap from "@/components/public/OperationsMap";
import ContactStrip from "@/components/public/ContactStrip";
import Footer from "@/components/public/Footer";
import { db } from "@/lib/db";
import { siteStats } from "@/lib/db/schema";

async function getSiteStats() {
  try {
    const [stats] = await db.select().from(siteStats).limit(1);
    return stats ?? null;
  } catch {
    return null;
  }
}

async function getMetalsPrices() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/metals-prices`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [siteStats, initialPrices] = await Promise.all([
    getSiteStats(),
    getMetalsPrices(),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero ticker={<MetalsPriceTicker initialData={initialPrices} />} />
        <StatsSection stats={siteStats} />
        <CommoditiesGrid />
        <ProcessSteps />
        <RegisterCTA />
        <OperationsMap zones={[
          { id: "santiago",  label: "Santiago",  latitude: -33.4489, longitude: -70.6693, active_operations: 3, visible: true },
          { id: "copiapo",   label: "Copiapó",   latitude: -27.3668, longitude: -70.3323, active_operations: 2, visible: true },
          { id: "iquique",   label: "Iquique",   latitude: -20.2307, longitude: -70.1357, active_operations: 2, visible: true },
          { id: "rancagua",  label: "Rancagua",  latitude: -34.1703, longitude: -70.7444, active_operations: 1, visible: true },
        ]} />
        <ContactStrip companyInfo={null} />
      </main>
      <Footer />
    </>
  );
}
