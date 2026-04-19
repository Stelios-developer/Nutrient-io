// Plain TypeScript types — no ORM, no database

export type UserRole = "user" | "admin";
export type UserSex = "male" | "female";
export type LifeStage = "none" | "pregnant" | "lactating";
export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extremely_active";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type NutrientCategory = "vitamin" | "mineral" | "macro" | "other";
export type AlertType =
  | "low_intake"
  | "high_intake"
  | "ul_warning"
  | "pattern"
  | "achievement"
  | "info";
export type AlertPriority = "critical" | "high" | "medium" | "low" | "info";

export interface User {
  id: number;
  unionId: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt: Date;
  dateOfBirth: string | null;
  sex: UserSex | null;
  heightCm: string | null;
  weightKg: string | null;
  lifeStage: LifeStage;
  activityLevel: ActivityLevel;
  region: string;
  onboarded: boolean;
}

export type InsertUser = Omit<User, "id" | "createdAt" | "updatedAt"> & {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface Nutrient {
  id: number;
  name: string;
  displayName: string;
  category: NutrientCategory;
  unit: string;
  displayOrder: number;
  description: string | null;
  rdaMale1940: string | null;
  rdaFemale1940: string | null;
  ulMale: string | null;
  ulFemale: string | null;
}

export interface Food {
  id: number;
  name: string;
  category: string | null;
  servingSize: string;
  servingUnit: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugars: string;
  saturatedFat: string;
  sodium: string;
  potassium: string;
  calcium: string;
  iron: string;
  magnesium: string;
  zinc: string;
  vitaminC: string;
  vitaminD: string;
  vitaminA: string;
  vitaminE: string;
  vitaminK: string;
  thiamin: string;
  riboflavin: string;
  niacin: string;
  vitaminB6: string;
  folate: string;
  vitaminB12: string;
  phosphorus: string;
  copper: string;
  manganese: string;
  selenium: string;
  iodine: string;
  choline: string;
  omega3: string;
  cholesterol: string;
  createdAt: Date;
}

export interface MealEntry {
  id: number;
  userId: number;
  entryDate: Date;
  mealType: MealType;
  foodId: number;
  foodName: string;
  servingAmount: string;
  servingUnit: string;
  calculatedNutrients: Record<string, number> | null;
  totalCalories: string;
  notes: string | null;
  createdAt: Date;
}

export interface Supplement {
  id: number;
  userId: number;
  name: string;
  dosage: string | null;
  unit: string | null;
  nutrients: Record<string, number> | null;
  createdAt: Date;
}

export interface SupplementEntry {
  id: number;
  userId: number;
  supplementId: number;
  entryDate: Date;
  servingsTaken: string;
  notes: string | null;
  createdAt: Date;
}

export interface Alert {
  id: number;
  userId: number;
  alertType: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  relatedNutrient: string | null;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: Date;
}
