import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

interface CategoryIconProps extends LucideProps {
    name: string;
    categoryName?: string;
}

const ICON_FALLBACK: Record<string, string> = {
    Salary: "Banknote",
    Freelance: "Laptop",
    Investments: "TrendingUp",
    "Other income": "PlusCircle",
    Food: "UtensilsCrossed",
    Rent: "Home",
    Utilities: "Zap",
    Transport: "Car",
    Shopping: "ShoppingBag",
    Health: "HeartPulse",
    Other: "Tag",
};

export function CategoryIcon({ name, categoryName, ...props }: CategoryIconProps) {
    // If name is missing (undefined/null) or the default "Tag", use the fallback map
    const effectiveName = (name && name !== "Tag")
        ? name
        : (categoryName ? ICON_FALLBACK[categoryName] || "Tag" : "Tag");

    const IconComponent = (Icons as any)[effectiveName] || Icons.Tag;

    if (effectiveName !== "Tag" && !(Icons as any)[effectiveName]) {
        console.warn(`[CategoryIcon] Icon "${effectiveName}" not found in lucide-react. Falling back to Tag.`);
    }

    return <IconComponent {...props} />;
}
