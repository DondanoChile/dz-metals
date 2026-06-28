import type { MetalPrice } from "@/types/metals";

const METALS_API_BASE = "https://metals-api.com/api";

const SYMBOL_MAP: Record<string, { name: string; namEs: string }> = {
  XAU: { name: "Gold", namEs: "oro" },
  XCU: { name: "Copper", namEs: "cobre" },
  XAG: { name: "Silver", namEs: "plata" },
  MO: { name: "Molybdenum", namEs: "molibdeno" },
};

const MOCK_DATA: MetalPrice[] = [
  {
    symbol: "XAU",
    name: "oro",
    price_usd: 1985.5,
    change_pct: 0.42,
    updated_at: new Date().toISOString(),
  },
  {
    symbol: "XCU",
    name: "cobre",
    price_usd: 8450.0,
    change_pct: -0.18,
    updated_at: new Date().toISOString(),
  },
  {
    symbol: "XAG",
    name: "plata",
    price_usd: 23.75,
    change_pct: 0.61,
    updated_at: new Date().toISOString(),
  },
  {
    symbol: "MO",
    name: "molibdeno",
    price_usd: 37200.0,
    change_pct: -0.05,
    updated_at: new Date().toISOString(),
  },
];

interface MetalsApiResponse {
  success: boolean;
  timestamp: number;
  base: string;
  rates: Record<string, number>;
}

export async function getMetalsPrices(): Promise<MetalPrice[]> {
  const apiKey = process.env.METALS_API_KEY;

  if (!apiKey) {
    console.warn("[metals-api] METALS_API_KEY not set — returning mock data");
    return MOCK_DATA;
  }

  const symbols = Object.keys(SYMBOL_MAP).join(",");

  try {
    const response = await fetch(
      `${METALS_API_BASE}/latest?access_key=${apiKey}&base=USD&symbols=${symbols}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`Metals API responded with status ${response.status}`);
    }

    const data: MetalsApiResponse = await response.json();

    if (!data.success) {
      throw new Error("Metals API returned success=false");
    }

    const prices: MetalPrice[] = Object.entries(SYMBOL_MAP).map(
      ([symbol, { namEs }]) => {
        const rate = data.rates[symbol];
        // Rates are relative to base USD, so price = 1 / rate for USD per unit
        const price_usd = rate ? 1 / rate : 0;

        return {
          symbol,
          name: namEs,
          price_usd: Math.round(price_usd * 100) / 100,
          change_pct: 0, // Metals API basic plan doesn't include change %
          updated_at: new Date(data.timestamp * 1000).toISOString(),
        };
      }
    );

    return prices;
  } catch (error) {
    console.error("[metals-api] Failed to fetch prices:", error);
    console.warn("[metals-api] Falling back to mock data");
    return MOCK_DATA;
  }
}

export async function getMetalPrice(symbol: string): Promise<MetalPrice | null> {
  const prices = await getMetalsPrices();
  return prices.find((p) => p.symbol === symbol) ?? null;
}
