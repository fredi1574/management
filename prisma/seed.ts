import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const incomeCategories = [
    { name: "Salary", color: "#10b981", icon: "Banknote" },
    { name: "Freelance", color: "#14b8a6", icon: "Laptop" },
    { name: "Investments", color: "#6366f1", icon: "TrendingUp" },
    { name: "Other income", color: "#64748b", icon: "PlusCircle" },
  ];

  const expenseCategories = [
    { name: "Food", color: "#f59e0b", icon: "UtensilsCrossed" },
    { name: "Rent", color: "#a855f7", icon: "Home" },
    { name: "Utilities", color: "#3b82f6", icon: "Zap" },
    { name: "Transport", color: "#06b6d4", icon: "Car" },
    { name: "Shopping", color: "#ec4899", icon: "ShoppingBag" },
    { name: "Health", color: "#ef4444", icon: "HeartPulse" },
    { name: "Other", color: "#71717a", icon: "Tag" },
  ];

  const existing = await prisma.category.count();
  if (existing > 0) return;

  await prisma.category.createMany({
    data: [
      ...incomeCategories.map((c) => ({ ...c, type: "income" })),
      ...expenseCategories.map((c) => ({ ...c, type: "expense" })),
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
