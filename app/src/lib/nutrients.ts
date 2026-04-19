export interface NutrientStatus {
  id: number;
  name: string;
  displayName: string;
  category: string;
  unit: string;
  amount: number;
  rda: number;
  ul: number | null;
  percentage: number;
  ulPercentage: number | null;
  status: string;
  score: number;
  description: string | null;
}

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  critical: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "Critical" },
  low: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", label: "Low" },
  suboptimal: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", label: "Fair" },
  adequate: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Adequate" },
  optimal: { bg: "bg-green-50", text: "text-green-700", border: "border-green-300", label: "Optimal" },
  high: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "High" },
  "very-high": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Very High" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300", label: "Warning" },
  danger: { bg: "bg-red-100", text: "text-red-800", border: "border-red-400", label: "Danger" },
};

export function getStatusColor(status: string) {
  return STATUS_COLORS[status] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", label: "Unknown" };
}

export const CATEGORY_LABELS: Record<string, string> = {
  vitamin: "Vitamins",
  mineral: "Minerals",
  macro: "Macronutrients",
  other: "Other",
};

export const CATEGORY_ICONS: Record<string, string> = {
  vitamin: "V",
  mineral: "M",
  macro: "C",
  other: "O",
};

export function formatAmount(amount: number, unit: string): string {
  if (amount === 0) return `0 ${unit}`;
  if (amount >= 1000 && unit === "mg") return `${(amount / 1000).toFixed(1)} g`;
  if (amount >= 1000 && unit === "mcg") return `${(amount / 1000).toFixed(1)} mg`;
  if (amount < 1) return `${amount.toFixed(2)} ${unit}`;
  if (amount < 10) return `${amount.toFixed(1)} ${unit}`;
  return `${Math.round(amount)} ${unit}`;
}

export function getNutrientScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

export function getNutrientScoreBg(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export const DEMO_USER_ID = 1;

export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getNutrientIcon(nutrientName: string): string {
  const icons: Record<string, string> = {
    vitaminA: "eye",
    vitaminC: "shield",
    vitaminD: "sun",
    vitaminE: "heart",
    vitaminK: "droplet",
    thiamin: "zap",
    riboflavin: "zap",
    niacin: "zap",
    vitaminB6: "zap",
    folate: "dna",
    vitaminB12: "zap",
    calcium: "bone",
    iron: "droplets",
    magnesium: "activity",
    zinc: "shield-check",
    potassium: "heart-pulse",
    sodium: "waves",
    phosphorus: "bone",
    selenium: "shield",
    iodine: "thermometer",
    choline: "brain",
    omega3: "fish",
    protein: "dumbbell",
    carbs: "wheat",
    fat: "droplet",
    fiber: "leaf",
    calories: "flame",
  };
  return icons[nutrientName] ?? "circle";
}
