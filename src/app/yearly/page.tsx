"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function YearlyPage() {
  const router = useRouter();

  useEffect(() => {
    const year = new Date().getFullYear();
    router.replace(`/yearly/${year}`);
  }, [router]);

  return null;
}
