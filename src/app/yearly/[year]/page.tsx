import { YearlyView } from "../YearlyView";

export default async function DynamicYearlyPage({ params }: { params: Promise<{ year: string }> }) {
    const { year } = await params;
    const yearNumber = parseInt(year);

    return <YearlyView year={yearNumber} />;
}
