async function inspectTicker(ticker) {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`);
    const data = await response.json();
    console.log(`--- ${ticker} ---`);
    console.log(JSON.stringify(data.chart.result[0].meta, null, 2));
  } catch (err) {
    console.error(`Error fetching ${ticker}:`, err.message);
  }
}

inspectTicker('AAPL');
inspectTicker('VOO');
