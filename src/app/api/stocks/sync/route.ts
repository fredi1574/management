import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/error-handler";

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
    const errors: Record<string, string> = {};

    // 2. Fetch prices from Yahoo Finance
    for (const ticker of tickers) {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
          { next: { revalidate: 0 } }
        );
        
        if (!response.ok) {
          throw new Error(`Yahoo Finance API returned ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.chart?.result?.[0]) {
          throw new Error(`Invalid response structure for ${ticker}`);
        }

        const meta = data.chart.result[0].meta;
        const price = meta.regularMarketPrice;
        const longName = meta.longName || meta.shortName || null;
        
        if (price) {
          results[ticker] = price;
          
          // 3. Update currentValue and name in the database
          const purchases = await prisma.stockPurchase.findMany({
            where: { ticker },
          });

          await Promise.all(
            purchases.map((p) =>
              prisma.stockPurchase.update({
                where: { id: p.id },
                data: {
                  currentValue: p.quantity * price,
                  name: longName,
                },
              })
            )
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        errors[ticker] = message;
        console.error(`[Stock Sync] Failed to fetch price for ${ticker}:`, message);
      }
    }

    return NextResponse.json(
      {
        message: "Stock sync completed",
        updated: Object.keys(results).length,
        updatedTickers: Object.keys(results),
        prices: results,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
      },
      { status: Object.keys(errors).length > 0 ? 207 : 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to sync stock prices");
  }
}
