import { NextResponse } from "next/server";
import { getMetalsPrices } from "@/lib/metals-api";

export const revalidate = 60;

export async function GET() {
  try {
    const prices = await getMetalsPrices();
    return NextResponse.json(prices);
  } catch {
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}
