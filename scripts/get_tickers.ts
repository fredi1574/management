import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const tickers = await prisma.stockPurchase.findMany({
    select: { ticker: true },
    distinct: ['ticker']
  })
  console.log(JSON.stringify(tickers.map(t => t.ticker)))
}

main().catch(console.error).finally(() => prisma.$disconnect())
