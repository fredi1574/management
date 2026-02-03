import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  try {
    const { ticker } = params;
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from Yahoo Finance");
    }

    const data = await response.json();
    const meta = data.chart.result[0].meta;

    return NextResponse.json({
      ticker: meta.symbol,
      name: meta.longName || meta.shortName,
      price: meta.regularMarketPrice,
      previousClose: meta.chartPreviousClose,
      change: meta.regularMarketPrice - meta.chartPreviousClose,
      changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
      high52: meta.fiftyTwoWeekHigh,
      low52: meta.fiftyTwoWeekLow,
      dayHigh: meta.regularMarketDayHigh,
      dayLow: meta.regularMarketDayLow,
      volume: meta.regularMarketVolume,
      currency: meta.currency,
      exchange: meta.fullExchangeName,
    });
  } catch (error: any) {
    console.error("Info fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock information" },
      { status: 500 }
    );
  }
}
