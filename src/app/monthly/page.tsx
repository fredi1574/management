"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { monthNumberToName } from "@/lib/date-utils";

export default function MonthlyPage() {
  const router = useRouter();

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const monthName = monthNumberToName(now.getMonth() + 1).toLowerCase();
    router.replace(`/monthly/${year}/${monthName}`);
  }, [router]);

  return null;
}
