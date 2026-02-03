"use client";

import { use } from "react";
import { MonthlyView } from "../../MonthlyView";
import { monthNameToNumber } from "@/lib/date-utils";

interface PageProps {
    params: Promise<{
        year: string;
        month: string;
    }>;
}

export default function MonthlyDynamicPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const year = parseInt(resolvedParams.year);
    const month = monthNameToNumber(resolvedParams.month);

    return <MonthlyView year={year} month={month} />;
}
