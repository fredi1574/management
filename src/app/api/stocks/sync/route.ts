import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // 1. Get all unique tickers
    const stocks = await prisma.stockPurchase.findMany({
      select: { ticker: true },
      distinct: ["ticker"],
    });

    if (stocks.length === 0) {
      return NextResponse.json({ message: "No stocks to sync", updated: 0 });
    }

    const tickers = stocks.map((s) => s.ticker);
    const results: Record<string, number> = {};

    // 2. Fetch prices from Yahoo Finance (batching would be better, but doing sequential for simplicity)
    for (const ticker of tickers) {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
          { next: { revalidate: 0 } }
        );
        const data = await response.json();
        const meta = data.chart.result[0].meta;
        const price = meta.regularMarketPrice;
        const longName = meta.longName || meta.shortName || null;
        
        if (price) {
          results[ticker] = price;
          
          // 3. Update currentValue and name in the database
          const purchases = await prisma.stockPurchase.findMany({
            where: { ticker },
          });

          for (const p of purchases) {
            await prisma.stockPurchase.update({
              where: { id: p.id },
              data: {
                currentValue: p.quantity * price,
                name: longName,
              },
            });
          }
        }
      } catch (err) {
        console.error(`Failed to fetch price for ${ticker}:`, err);
      }
    }

    return NextResponse.json({
      message: "Prices synced successfully",
      updatedTickers: Object.keys(results),
      prices: results,
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync stock prices" },
      { status: 500 }
    );
  }
}
