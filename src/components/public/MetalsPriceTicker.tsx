"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetalPrice {
  symbol: string;
  name: string;
  price_usd: number;
  change_pct: number;
  updated_at: string;
}

interface MetalsPriceTickerProps {
  initialData?: MetalPrice[] | null;
}

const REFRESH_INTERVAL = 60_000; // 60 seconds

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function PriceCard({
  metal,
  flash,
}: {
  metal: MetalPrice;
  flash: "up" | "down" | null;
}) {
  const isPositive = metal.change_pct > 0;
  const isNeutral = metal.change_pct === 0;

  return (
    <div className="flex items-center gap-4 px-7 shrink-0">
      {/* Symbol + name */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-mono tracking-[0.15em] text-[#C9A84C] uppercase">
            {metal.symbol}
          </span>
          <span className="text-[11px] text-[#9A9A8A] capitalize">
            {metal.name}
          </span>
        </div>

        {/* Price — flashes on update */}
        <div
          className={`flex items-baseline gap-2 mt-0.5 transition-colors duration-700 ${
            flash === "up"
              ? "text-emerald-300"
              : flash === "down"
              ? "text-red-300"
              : "text-[#F5F0E8]"
          }`}
        >
          <span className="font-mono text-sm tabular-nums">
            USD {formatPrice(metal.price_usd)}
          </span>
        </div>
      </div>

      {/* Change % */}
      <div
        className={`flex items-center gap-1 text-xs font-mono tabular-nums px-2 py-0.5 rounded ${
          isNeutral
            ? "text-[#9A9A8A] bg-[#9A9A8A]/10"
            : isPositive
            ? "text-emerald-400 bg-emerald-400/10"
            : "text-red-400 bg-red-400/10"
        }`}
      >
        {isNeutral ? (
          <Minus size={9} />
        ) : isPositive ? (
          <TrendingUp size={9} />
        ) : (
          <TrendingDown size={9} />
        )}
        <span>
          {isPositive ? "+" : ""}
          {metal.change_pct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function Separator() {
  return (
    <div className="shrink-0 px-1">
      <div className="h-4 w-px bg-[#C9A84C]/25" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-1.5 px-7 shrink-0 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-3 w-8 bg-[#2A2A2A] rounded" />
        <div className="h-3 w-14 bg-[#2A2A2A] rounded" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3.5 w-24 bg-[#2A2A2A] rounded" />
        <div className="h-3 w-10 bg-[#2A2A2A] rounded" />
      </div>
    </div>
  );
}

export default function MetalsPriceTicker({ initialData }: MetalsPriceTickerProps) {
  const [prices, setPrices] = useState<MetalPrice[] | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    initialData ? new Date() : null
  );
  const [progress, setProgress] = useState(100); // 100% = just updated
  const [flashMap, setFlashMap] = useState<Record<string, "up" | "down" | null>>({});
  const prevPrices = useRef<Record<string, number>>({});
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchPrices() {
    try {
      const res = await fetch("/api/metals-prices");
      if (!res.ok) return;
      const data: MetalPrice[] = await res.json();

      // Detect changes and set flash direction
      const newFlash: Record<string, "up" | "down" | null> = {};
      data.forEach((m) => {
        const prev = prevPrices.current[m.symbol];
        if (prev !== undefined && prev !== m.price_usd) {
          newFlash[m.symbol] = m.price_usd > prev ? "up" : "down";
        }
        prevPrices.current[m.symbol] = m.price_usd;
      });

      if (Object.keys(newFlash).length > 0) {
        setFlashMap(newFlash);
        setTimeout(() => setFlashMap({}), 1200);
      }

      setPrices(data);
      setLastUpdated(new Date());
      setProgress(100);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  // Countdown progress bar
  useEffect(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    const tick = 500; // update every 500ms
    const steps = REFRESH_INTERVAL / tick;
    let current = 100;

    progressRef.current = setInterval(() => {
      current -= 100 / steps;
      setProgress(Math.max(0, current));
    }, tick);

    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [lastUpdated]);

  // Fetch on mount + interval
  useEffect(() => {
    if (!initialData) {
      fetchPrices();
    } else {
      // Seed prevPrices with initial data
      initialData.forEach((m) => {
        prevPrices.current[m.symbol] = m.price_usd;
      });
    }
    const interval = setInterval(fetchPrices, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const items = loading
    ? null
    : prices && prices.length > 0
    ? prices
    : null;

  // Duplicate items for seamless infinite scroll
  const tickerItems = items ? [...items, ...items, ...items] : null;

  return (
    <div className="w-full bg-[#0E0E0E] border-t border-b border-[#1E1E1E] relative overflow-hidden">
      {/* Progress bar — glows along the bottom */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-[#1E1E1E] w-full">
        <div
          className="h-full bg-gradient-to-r from-[#C9A84C]/60 to-[#C9A84C] transition-none"
          style={{ width: `${progress}%`, transition: progress === 100 ? "none" : "width 0.5s linear" }}
        />
      </div>

      <div className="flex items-center h-12">
        {/* Left label — fixed */}
        <div className="flex items-center gap-2.5 px-5 h-full border-r border-[#1E1E1E] shrink-0 bg-[#0E0E0E] z-10">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A84C] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9A84C]" />
          </div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#9A9A8A] uppercase whitespace-nowrap">
            Live
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-[#0E0E0E] to-transparent z-10 pointer-events-none" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#0E0E0E] to-transparent z-10 pointer-events-none" />

          {loading ? (
            <div className="flex items-center h-full">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <SkeletonCard />
                  {i < 3 && <Separator />}
                </div>
              ))}
            </div>
          ) : tickerItems ? (
            <div className="flex items-center h-full animate-ticker">
              {tickerItems.map((metal, i) => (
                <div key={`${metal.symbol}-${i}`} className="flex items-center">
                  <PriceCard
                    metal={metal}
                    flash={i < (items?.length ?? 0) ? (flashMap[metal.symbol] ?? null) : null}
                  />
                  <Separator />
                </div>
              ))}
            </div>
          ) : (
            <span className="px-6 text-xs text-[#9A9A8A] font-mono">
              Precios no disponibles
            </span>
          )}
        </div>

        {/* Right timestamp — fixed */}
        {lastUpdated && (
          <div className="px-4 h-full flex items-center border-l border-[#1E1E1E] shrink-0 bg-[#0E0E0E] z-10">
            <span className="text-[10px] font-mono text-[#5A5A5A] tabular-nums">
              {lastUpdated.toLocaleTimeString("es-CL", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
