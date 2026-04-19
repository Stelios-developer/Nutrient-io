import type {
  User,
  Food,
  MealEntry,
  Supplement,
  SupplementEntry,
  Alert,
  Nutrient,
} from "@db/schema";

// ─── ID counters ───────────────────────────────────────────────────────────────
let userIdCounter = 2;
let mealIdCounter = 1;
let supplementIdCounter = 1;
let supplementEntryIdCounter = 1;
let alertIdCounter = 1;

// ─── Users ─────────────────────────────────────────────────────────────────────
const usersById: Map<number, User> = new Map();
const usersByUnionId: Map<string, User> = new Map();

const demoUser: User = {
  id: 1,
  unionId: "local-demo",
  name: null,
  email: null,
  avatar: null,
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignInAt: new Date(),
  dateOfBirth: null,
  sex: null,
  heightCm: null,
  weightKg: null,
  lifeStage: "none",
  activityLevel: "moderately_active",
  region: "US",
  onboarded: false,
};
usersById.set(demoUser.id, demoUser);
usersByUnionId.set(demoUser.unionId, demoUser);

export const usersStore = {
  findById: (id: number): User | undefined => usersById.get(id),
  findByUnionId: (unionId: string): User | undefined =>
    usersByUnionId.get(unionId),
  upsert: (data: Partial<User> & { unionId: string }): User => {
    const existing = usersByUnionId.get(data.unionId);
    if (existing) {
      const updated: User = {
        ...existing,
        ...data,
        updatedAt: new Date(),
        lastSignInAt: new Date(),
      } as User;
      usersById.set(updated.id, updated);
      usersByUnionId.set(updated.unionId, updated);
      return updated;
    }
    const newUser: User = {
      id: userIdCounter++,
      unionId: data.unionId,
      name: data.name ?? null,
      email: data.email ?? null,
      avatar: data.avatar ?? null,
      role: data.role ?? "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignInAt: new Date(),
      dateOfBirth: data.dateOfBirth ?? null,
      sex: data.sex ?? null,
      heightCm: data.heightCm ?? null,
      weightKg: data.weightKg ?? null,
      lifeStage: data.lifeStage ?? "none",
      activityLevel: data.activityLevel ?? "moderately_active",
      region: data.region ?? "US",
      onboarded: data.onboarded ?? false,
    };
    usersById.set(newUser.id, newUser);
    usersByUnionId.set(newUser.unionId, newUser);
    return newUser;
  },
  update: (id: number, patch: Partial<User>): User | undefined => {
    const existing = usersById.get(id);
    if (!existing) return undefined;
    const updated: User = { ...existing, ...patch, updatedAt: new Date() };
    usersById.set(id, updated);
    usersByUnionId.set(updated.unionId, updated);
    return updated;
  },
};

// ─── Nutrients ─────────────────────────────────────────────────────────────────
export const nutrientsData: Nutrient[] = [
  // Macros
  { id: 1, name: "calories", displayName: "Calories", category: "macro", unit: "kcal", displayOrder: 1, description: "Total energy", rdaMale1940: "2500", rdaFemale1940: "2000", ulMale: null, ulFemale: null },
  { id: 2, name: "protein", displayName: "Protein", category: "macro", unit: "g", displayOrder: 2, description: "Essential for muscle repair and growth", rdaMale1940: "56", rdaFemale1940: "46", ulMale: null, ulFemale: null },
  { id: 3, name: "carbs", displayName: "Carbohydrates", category: "macro", unit: "g", displayOrder: 3, description: "Primary energy source", rdaMale1940: "130", rdaFemale1940: "130", ulMale: null, ulFemale: null },
  { id: 4, name: "fat", displayName: "Total Fat", category: "macro", unit: "g", displayOrder: 4, description: "Essential for hormone production", rdaMale1940: "78", rdaFemale1940: "65", ulMale: null, ulFemale: null },
  { id: 5, name: "fiber", displayName: "Dietary Fiber", category: "macro", unit: "g", displayOrder: 5, description: "Supports digestive health", rdaMale1940: "38", rdaFemale1940: "25", ulMale: null, ulFemale: null },
  { id: 6, name: "sugars", displayName: "Sugars", category: "macro", unit: "g", displayOrder: 6, description: "Simple carbohydrates", rdaMale1940: "50", rdaFemale1940: "50", ulMale: null, ulFemale: null },
  { id: 7, name: "saturatedFat", displayName: "Saturated Fat", category: "macro", unit: "g", displayOrder: 7, description: "Limit for heart health", rdaMale1940: "22", rdaFemale1940: "20", ulMale: "22", ulFemale: "20" },
  { id: 8, name: "cholesterol", displayName: "Cholesterol", category: "macro", unit: "mg", displayOrder: 8, description: "Dietary cholesterol", rdaMale1940: "300", rdaFemale1940: "300", ulMale: "300", ulFemale: "300" },
  // Minerals
  { id: 9, name: "sodium", displayName: "Sodium", category: "mineral", unit: "mg", displayOrder: 20, description: "Regulates fluid balance", rdaMale1940: "1500", rdaFemale1940: "1500", ulMale: "2300", ulFemale: "2300" },
  { id: 10, name: "potassium", displayName: "Potassium", category: "mineral", unit: "mg", displayOrder: 21, description: "Supports heart and muscle function", rdaMale1940: "3400", rdaFemale1940: "2600", ulMale: null, ulFemale: null },
  { id: 11, name: "calcium", displayName: "Calcium", category: "mineral", unit: "mg", displayOrder: 22, description: "Builds strong bones and teeth", rdaMale1940: "1000", rdaFemale1940: "1000", ulMale: "2500", ulFemale: "2500" },
  { id: 12, name: "iron", displayName: "Iron", category: "mineral", unit: "mg", displayOrder: 23, description: "Carries oxygen in the blood", rdaMale1940: "8", rdaFemale1940: "18", ulMale: "45", ulFemale: "45" },
  { id: 13, name: "magnesium", displayName: "Magnesium", category: "mineral", unit: "mg", displayOrder: 24, description: "Supports over 300 enzyme reactions", rdaMale1940: "400", rdaFemale1940: "310", ulMale: "350", ulFemale: "350" },
  { id: 14, name: "zinc", displayName: "Zinc", category: "mineral", unit: "mg", displayOrder: 25, description: "Immune function and wound healing", rdaMale1940: "11", rdaFemale1940: "8", ulMale: "40", ulFemale: "40" },
  { id: 15, name: "phosphorus", displayName: "Phosphorus", category: "mineral", unit: "mg", displayOrder: 26, description: "Bone health and energy production", rdaMale1940: "700", rdaFemale1940: "700", ulMale: "4000", ulFemale: "4000" },
  { id: 16, name: "copper", displayName: "Copper", category: "mineral", unit: "mg", displayOrder: 27, description: "Iron metabolism and nerve function", rdaMale1940: "0.9", rdaFemale1940: "0.9", ulMale: "10", ulFemale: "10" },
  { id: 17, name: "manganese", displayName: "Manganese", category: "mineral", unit: "mg", displayOrder: 28, description: "Antioxidant and bone formation", rdaMale1940: "2.3", rdaFemale1940: "1.8", ulMale: "11", ulFemale: "11" },
  { id: 18, name: "selenium", displayName: "Selenium", category: "mineral", unit: "μg", displayOrder: 29, description: "Antioxidant protection", rdaMale1940: "55", rdaFemale1940: "55", ulMale: "400", ulFemale: "400" },
  { id: 19, name: "iodine", displayName: "Iodine", category: "mineral", unit: "μg", displayOrder: 30, description: "Thyroid hormone production", rdaMale1940: "150", rdaFemale1940: "150", ulMale: "1100", ulFemale: "1100" },
  // Vitamins
  { id: 20, name: "vitaminA", displayName: "Vitamin A", category: "vitamin", unit: "μg", displayOrder: 40, description: "Vision, immune function, skin health", rdaMale1940: "900", rdaFemale1940: "700", ulMale: "3000", ulFemale: "3000" },
  { id: 21, name: "vitaminC", displayName: "Vitamin C", category: "vitamin", unit: "mg", displayOrder: 41, description: "Antioxidant and immune support", rdaMale1940: "90", rdaFemale1940: "75", ulMale: "2000", ulFemale: "2000" },
  { id: 22, name: "vitaminD", displayName: "Vitamin D", category: "vitamin", unit: "μg", displayOrder: 42, description: "Calcium absorption and bone health", rdaMale1940: "15", rdaFemale1940: "15", ulMale: "100", ulFemale: "100" },
  { id: 23, name: "vitaminE", displayName: "Vitamin E", category: "vitamin", unit: "mg", displayOrder: 43, description: "Antioxidant, protects cell membranes", rdaMale1940: "15", rdaFemale1940: "15", ulMale: "1000", ulFemale: "1000" },
  { id: 24, name: "vitaminK", displayName: "Vitamin K", category: "vitamin", unit: "μg", displayOrder: 44, description: "Blood clotting and bone metabolism", rdaMale1940: "120", rdaFemale1940: "90", ulMale: null, ulFemale: null },
  { id: 25, name: "thiamin", displayName: "Thiamin (B1)", category: "vitamin", unit: "mg", displayOrder: 45, description: "Energy metabolism", rdaMale1940: "1.2", rdaFemale1940: "1.1", ulMale: null, ulFemale: null },
  { id: 26, name: "riboflavin", displayName: "Riboflavin (B2)", category: "vitamin", unit: "mg", displayOrder: 46, description: "Energy production and growth", rdaMale1940: "1.3", rdaFemale1940: "1.1", ulMale: null, ulFemale: null },
  { id: 27, name: "niacin", displayName: "Niacin (B3)", category: "vitamin", unit: "mg", displayOrder: 47, description: "DNA repair and energy metabolism", rdaMale1940: "16", rdaFemale1940: "14", ulMale: "35", ulFemale: "35" },
  { id: 28, name: "vitaminB6", displayName: "Vitamin B6", category: "vitamin", unit: "mg", displayOrder: 48, description: "Protein metabolism and brain function", rdaMale1940: "1.3", rdaFemale1940: "1.3", ulMale: "100", ulFemale: "100" },
  { id: 29, name: "folate", displayName: "Folate (B9)", category: "vitamin", unit: "μg", displayOrder: 49, description: "Cell division and DNA synthesis", rdaMale1940: "400", rdaFemale1940: "400", ulMale: "1000", ulFemale: "1000" },
  { id: 30, name: "vitaminB12", displayName: "Vitamin B12", category: "vitamin", unit: "μg", displayOrder: 50, description: "Nerve function and red blood cell formation", rdaMale1940: "2.4", rdaFemale1940: "2.4", ulMale: null, ulFemale: null },
  // Other
  { id: 31, name: "choline", displayName: "Choline", category: "other", unit: "mg", displayOrder: 60, description: "Brain development and liver function", rdaMale1940: "550", rdaFemale1940: "425", ulMale: "3500", ulFemale: "3500" },
  { id: 32, name: "omega3", displayName: "Omega-3", category: "other", unit: "g", displayOrder: 61, description: "Heart and brain health", rdaMale1940: "1.6", rdaFemale1940: "1.1", ulMale: null, ulFemale: null },
];

// ─── Foods ─────────────────────────────────────────────────────────────────────
export const foodsData: Food[] = [
  { id: 1, name: "Chicken Breast (cooked)", category: "Protein", servingSize: "100", servingUnit: "g", calories: "165", protein: "31", carbs: "0", fat: "3.6", fiber: "0", sugars: "0", saturatedFat: "1", sodium: "74", potassium: "256", calcium: "15", iron: "1", magnesium: "29", zinc: "1", vitaminC: "0", vitaminD: "0.1", vitaminA: "9", vitaminE: "0.3", vitaminK: "0", thiamin: "0.07", riboflavin: "0.12", niacin: "13.7", vitaminB6: "0.9", folate: "4", vitaminB12: "0.3", phosphorus: "220", copper: "0.05", manganese: "0.02", selenium: "27", iodine: "5", choline: "85", omega3: "0.03", cholesterol: "85", createdAt: new Date() },
  { id: 2, name: "Salmon (cooked)", category: "Protein", servingSize: "100", servingUnit: "g", calories: "208", protein: "20", carbs: "0", fat: "13", fiber: "0", sugars: "0", saturatedFat: "3.1", sodium: "59", potassium: "363", calcium: "9", iron: "0.8", magnesium: "29", zinc: "0.6", vitaminC: "0", vitaminD: "14.5", vitaminA: "50", vitaminE: "3.5", vitaminK: "0.5", thiamin: "0.2", riboflavin: "0.4", niacin: "8.6", vitaminB6: "0.8", folate: "25", vitaminB12: "3.2", phosphorus: "252", copper: "0.26", manganese: "0.02", selenium: "36", iodine: "10", choline: "94", omega3: "2.26", cholesterol: "63", createdAt: new Date() },
  { id: 3, name: "Eggs (large)", category: "Protein", servingSize: "50", servingUnit: "g", calories: "72", protein: "6.3", carbs: "0.4", fat: "4.8", fiber: "0", sugars: "0.2", saturatedFat: "1.6", sodium: "71", potassium: "69", calcium: "28", iron: "0.9", magnesium: "6", zinc: "0.6", vitaminC: "0", vitaminD: "1.1", vitaminA: "74", vitaminE: "0.5", vitaminK: "0.1", thiamin: "0.03", riboflavin: "0.26", niacin: "0.03", vitaminB6: "0.09", folate: "22", vitaminB12: "0.56", phosphorus: "99", copper: "0.01", manganese: "0.01", selenium: "15.4", iodine: "26", choline: "147", omega3: "0.03", cholesterol: "186", createdAt: new Date() },
  { id: 4, name: "Brown Rice (cooked)", category: "Grains", servingSize: "100", servingUnit: "g", calories: "112", protein: "2.3", carbs: "24", fat: "0.8", fiber: "1.8", sugars: "0.4", saturatedFat: "0.2", sodium: "5", potassium: "79", calcium: "3", iron: "0.5", magnesium: "43", zinc: "0.6", vitaminC: "0", vitaminD: "0", vitaminA: "0", vitaminE: "0.1", vitaminK: "1.2", thiamin: "0.1", riboflavin: "0.01", niacin: "1.5", vitaminB6: "0.15", folate: "4", vitaminB12: "0", phosphorus: "77", copper: "0.09", manganese: "0.97", selenium: "9.8", iodine: "0", choline: "8.5", omega3: "0.02", cholesterol: "0", createdAt: new Date() },
  { id: 5, name: "Oats (cooked)", category: "Grains", servingSize: "100", servingUnit: "g", calories: "71", protein: "2.5", carbs: "12", fat: "1.5", fiber: "1.7", sugars: "0.3", saturatedFat: "0.3", sodium: "49", potassium: "61", calcium: "8", iron: "0.7", magnesium: "26", zinc: "0.6", vitaminC: "0", vitaminD: "0", vitaminA: "0", vitaminE: "0.1", vitaminK: "0.5", thiamin: "0.09", riboflavin: "0.02", niacin: "0.2", vitaminB6: "0.03", folate: "5", vitaminB12: "0", phosphorus: "90", copper: "0.07", manganese: "0.56", selenium: "7", iodine: "0", choline: "10", omega3: "0.03", cholesterol: "0", createdAt: new Date() },
  { id: 6, name: "Sweet Potato (baked)", category: "Vegetables", servingSize: "100", servingUnit: "g", calories: "90", protein: "2", carbs: "21", fat: "0.1", fiber: "3.3", sugars: "6.5", saturatedFat: "0", sodium: "36", potassium: "475", calcium: "38", iron: "0.6", magnesium: "27", zinc: "0.3", vitaminC: "19.6", vitaminD: "0", vitaminA: "961", vitaminE: "0.3", vitaminK: "2.5", thiamin: "0.08", riboflavin: "0.06", niacin: "1.5", vitaminB6: "0.29", folate: "6", vitaminB12: "0", phosphorus: "54", copper: "0.16", manganese: "0.26", selenium: "0.2", iodine: "0", choline: "13", omega3: "0.01", cholesterol: "0", createdAt: new Date() },
  { id: 7, name: "Broccoli (raw)", category: "Vegetables", servingSize: "100", servingUnit: "g", calories: "34", protein: "2.8", carbs: "7", fat: "0.4", fiber: "2.6", sugars: "1.7", saturatedFat: "0.1", sodium: "33", potassium: "316", calcium: "47", iron: "0.7", magnesium: "21", zinc: "0.4", vitaminC: "89.2", vitaminD: "0", vitaminA: "31", vitaminE: "0.8", vitaminK: "101.6", thiamin: "0.07", riboflavin: "0.12", niacin: "0.6", vitaminB6: "0.17", folate: "63", vitaminB12: "0", phosphorus: "66", copper: "0.05", manganese: "0.21", selenium: "2.5", iodine: "0", choline: "18.7", omega3: "0.02", cholesterol: "0", createdAt: new Date() },
  { id: 8, name: "Spinach (raw)", category: "Vegetables", servingSize: "100", servingUnit: "g", calories: "23", protein: "2.9", carbs: "3.6", fat: "0.4", fiber: "2.2", sugars: "0.4", saturatedFat: "0.1", sodium: "79", potassium: "558", calcium: "99", iron: "2.7", magnesium: "79", zinc: "0.5", vitaminC: "28.1", vitaminD: "0", vitaminA: "469", vitaminE: "2", vitaminK: "482.9", thiamin: "0.08", riboflavin: "0.19", niacin: "0.7", vitaminB6: "0.2", folate: "194", vitaminB12: "0", phosphorus: "49", copper: "0.13", manganese: "0.9", selenium: "1", iodine: "0", choline: "19.3", omega3: "0.14", cholesterol: "0", createdAt: new Date() },
  { id: 9, name: "Banana (medium)", category: "Fruits", servingSize: "118", servingUnit: "g", calories: "105", protein: "1.3", carbs: "27", fat: "0.4", fiber: "3.1", sugars: "14.4", saturatedFat: "0.1", sodium: "1", potassium: "422", calcium: "6", iron: "0.3", magnesium: "32", zinc: "0.2", vitaminC: "10.3", vitaminD: "0", vitaminA: "4", vitaminE: "0.1", vitaminK: "0.6", thiamin: "0.04", riboflavin: "0.07", niacin: "0.8", vitaminB6: "0.43", folate: "23.6", vitaminB12: "0", phosphorus: "26", copper: "0.09", manganese: "0.32", selenium: "1.2", iodine: "2", choline: "11.6", omega3: "0.03", cholesterol: "0", createdAt: new Date() },
  { id: 10, name: "Apple (medium)", category: "Fruits", servingSize: "182", servingUnit: "g", calories: "95", protein: "0.5", carbs: "25", fat: "0.3", fiber: "4.4", sugars: "19", saturatedFat: "0.1", sodium: "2", potassium: "195", calcium: "11", iron: "0.2", magnesium: "9", zinc: "0.1", vitaminC: "8.4", vitaminD: "0", vitaminA: "5", vitaminE: "0.3", vitaminK: "4", thiamin: "0.02", riboflavin: "0.05", niacin: "0.2", vitaminB6: "0.08", folate: "5.5", vitaminB12: "0", phosphorus: "20", copper: "0.04", manganese: "0.05", selenium: "0", iodine: "0", choline: "6.2", omega3: "0.02", cholesterol: "0", createdAt: new Date() },
  { id: 11, name: "Almonds", category: "Nuts & Seeds", servingSize: "28", servingUnit: "g", calories: "164", protein: "6", carbs: "6", fat: "14", fiber: "3.5", sugars: "1.2", saturatedFat: "1.1", sodium: "0", potassium: "200", calcium: "76", iron: "1.1", magnesium: "76", zinc: "0.9", vitaminC: "0", vitaminD: "0", vitaminA: "0", vitaminE: "7.3", vitaminK: "0", thiamin: "0.06", riboflavin: "0.32", niacin: "1", vitaminB6: "0.04", folate: "12.5", vitaminB12: "0", phosphorus: "136", copper: "0.29", manganese: "0.6", selenium: "1.2", iodine: "0", choline: "12.5", omega3: "0", cholesterol: "0", createdAt: new Date() },
  { id: 12, name: "Greek Yogurt (plain, nonfat)", category: "Dairy", servingSize: "100", servingUnit: "g", calories: "59", protein: "10.2", carbs: "3.6", fat: "0.4", fiber: "0", sugars: "3.6", saturatedFat: "0.1", sodium: "36", potassium: "141", calcium: "110", iron: "0.1", magnesium: "11", zinc: "0.5", vitaminC: "0", vitaminD: "0", vitaminA: "5", vitaminE: "0", vitaminK: "0.2", thiamin: "0.02", riboflavin: "0.27", niacin: "0.2", vitaminB6: "0.07", folate: "7", vitaminB12: "0.75", phosphorus: "135", copper: "0.01", manganese: "0.01", selenium: "9.7", iodine: "0", choline: "15.1", omega3: "0", cholesterol: "5", createdAt: new Date() },
  { id: 13, name: "Whole Milk", category: "Dairy", servingSize: "244", servingUnit: "ml", calories: "149", protein: "8", carbs: "12", fat: "8", fiber: "0", sugars: "12", saturatedFat: "4.6", sodium: "105", potassium: "322", calcium: "276", iron: "0.1", magnesium: "24", zinc: "1", vitaminC: "0", vitaminD: "3.2", vitaminA: "68", vitaminE: "0.1", vitaminK: "0.5", thiamin: "0.1", riboflavin: "0.44", niacin: "0.3", vitaminB6: "0.09", folate: "12", vitaminB12: "1.1", phosphorus: "222", copper: "0.03", manganese: "0.01", selenium: "8.1", iodine: "56", choline: "35", omega3: "0.16", cholesterol: "24", createdAt: new Date() },
  { id: 14, name: "Lentils (cooked)", category: "Legumes", servingSize: "100", servingUnit: "g", calories: "116", protein: "9", carbs: "20", fat: "0.4", fiber: "8", sugars: "1.8", saturatedFat: "0.1", sodium: "2", potassium: "369", calcium: "19", iron: "3.3", magnesium: "36", zinc: "1.3", vitaminC: "1.5", vitaminD: "0", vitaminA: "1", vitaminE: "0.1", vitaminK: "1.7", thiamin: "0.17", riboflavin: "0.07", niacin: "1.1", vitaminB6: "0.18", folate: "181", vitaminB12: "0", phosphorus: "180", copper: "0.25", manganese: "0.49", selenium: "2.8", iodine: "0", choline: "32.7", omega3: "0.04", cholesterol: "0", createdAt: new Date() },
  { id: 15, name: "Black Beans (cooked)", category: "Legumes", servingSize: "100", servingUnit: "g", calories: "132", protein: "8.9", carbs: "24", fat: "0.5", fiber: "8.7", sugars: "0.3", saturatedFat: "0.1", sodium: "1", potassium: "355", calcium: "27", iron: "2.1", magnesium: "70", zinc: "1", vitaminC: "0", vitaminD: "0", vitaminA: "1", vitaminE: "0.9", vitaminK: "3.4", thiamin: "0.24", riboflavin: "0.06", niacin: "0.5", vitaminB6: "0.07", folate: "149", vitaminB12: "0", phosphorus: "140", copper: "0.21", manganese: "0.44", selenium: "1.2", iodine: "0", choline: "32.1", omega3: "0.17", cholesterol: "0", createdAt: new Date() },
  { id: 16, name: "Olive Oil", category: "Fats & Oils", servingSize: "14", servingUnit: "g", calories: "119", protein: "0", carbs: "0", fat: "13.5", fiber: "0", sugars: "0", saturatedFat: "1.9", sodium: "0", potassium: "0.1", calcium: "0.1", iron: "0.1", magnesium: "0", zinc: "0", vitaminC: "0", vitaminD: "0", vitaminA: "0", vitaminE: "1.9", vitaminK: "8.1", thiamin: "0", riboflavin: "0", niacin: "0", vitaminB6: "0", folate: "0", vitaminB12: "0", phosphorus: "0", copper: "0", manganese: "0", selenium: "0", iodine: "0", choline: "0.1", omega3: "0.1", cholesterol: "0", createdAt: new Date() },
  { id: 17, name: "Avocado", category: "Fruits", servingSize: "150", servingUnit: "g", calories: "240", protein: "3", carbs: "13", fat: "22", fiber: "10", sugars: "1", saturatedFat: "3.1", sodium: "11", potassium: "728", calcium: "18", iron: "0.9", magnesium: "43", zinc: "0.9", vitaminC: "15", vitaminD: "0", vitaminA: "15", vitaminE: "3.1", vitaminK: "28.6", thiamin: "0.1", riboflavin: "0.18", niacin: "2.6", vitaminB6: "0.39", folate: "122", vitaminB12: "0", phosphorus: "100", copper: "0.24", manganese: "0.19", selenium: "0.6", iodine: "0", choline: "21", omega3: "0.22", cholesterol: "0", createdAt: new Date() },
  { id: 18, name: "Tuna (canned, in water)", category: "Protein", servingSize: "100", servingUnit: "g", calories: "116", protein: "25.5", carbs: "0", fat: "1", fiber: "0", sugars: "0", saturatedFat: "0.3", sodium: "333", potassium: "279", calcium: "14", iron: "1.3", magnesium: "30", zinc: "0.6", vitaminC: "0", vitaminD: "5.4", vitaminA: "11", vitaminE: "0.5", vitaminK: "0", thiamin: "0.04", riboflavin: "0.1", niacin: "13", vitaminB6: "0.43", folate: "3", vitaminB12: "2.5", phosphorus: "236", copper: "0.07", manganese: "0.01", selenium: "90.5", iodine: "5", choline: "35", omega3: "0.29", cholesterol: "30", createdAt: new Date() },
  { id: 19, name: "Quinoa (cooked)", category: "Grains", servingSize: "100", servingUnit: "g", calories: "120", protein: "4.4", carbs: "21.3", fat: "1.9", fiber: "2.8", sugars: "0.9", saturatedFat: "0.2", sodium: "7", potassium: "172", calcium: "17", iron: "1.5", magnesium: "64", zinc: "1.1", vitaminC: "0", vitaminD: "0", vitaminA: "1", vitaminE: "0.6", vitaminK: "0", thiamin: "0.1", riboflavin: "0.11", niacin: "0.4", vitaminB6: "0.12", folate: "42", vitaminB12: "0", phosphorus: "152", copper: "0.19", manganese: "0.63", selenium: "2.8", iodine: "0", choline: "22.7", omega3: "0.09", cholesterol: "0", createdAt: new Date() },
  { id: 20, name: "Blueberries", category: "Fruits", servingSize: "100", servingUnit: "g", calories: "57", protein: "0.7", carbs: "14.5", fat: "0.3", fiber: "2.4", sugars: "10", saturatedFat: "0", sodium: "1", potassium: "77", calcium: "6", iron: "0.3", magnesium: "6", zinc: "0.2", vitaminC: "9.7", vitaminD: "0", vitaminA: "3", vitaminE: "0.6", vitaminK: "19.3", thiamin: "0.04", riboflavin: "0.04", niacin: "0.4", vitaminB6: "0.05", folate: "6", vitaminB12: "0", phosphorus: "12", copper: "0.06", manganese: "0.34", selenium: "0.1", iodine: "0", choline: "6", omega3: "0.05", cholesterol: "0", createdAt: new Date() },
];

export const foodsById: Map<number, Food> = new Map(
  foodsData.map((f) => [f.id, f])
);

// ─── Meal Entries ───────────────────────────────────────────────────────────────
const mealEntriesList: MealEntry[] = [];

export const mealStore = {
  add: (entry: Omit<MealEntry, "id" | "createdAt">): MealEntry => {
    const newEntry: MealEntry = {
      ...entry,
      id: mealIdCounter++,
      createdAt: new Date(),
    };
    mealEntriesList.push(newEntry);
    return newEntry;
  },
  deleteById: (id: number): void => {
    const idx = mealEntriesList.findIndex((e) => e.id === id);
    if (idx !== -1) mealEntriesList.splice(idx, 1);
  },
  listByUserAndDate: (userId: number, dateStr: string): MealEntry[] =>
    mealEntriesList.filter(
      (e) =>
        e.userId === userId &&
        e.entryDate.toISOString().slice(0, 10) === dateStr
    ),
  listByUser: (userId: number): MealEntry[] =>
    mealEntriesList.filter((e) => e.userId === userId),
};

// ─── Supplements ───────────────────────────────────────────────────────────────
const supplementsList: Supplement[] = [];

export const supplementsStore = {
  add: (entry: Omit<Supplement, "id" | "createdAt">): Supplement => {
    const s: Supplement = { ...entry, id: supplementIdCounter++, createdAt: new Date() };
    supplementsList.push(s);
    return s;
  },
  deleteById: (id: number): void => {
    const idx = supplementsList.findIndex((s) => s.id === id);
    if (idx !== -1) supplementsList.splice(idx, 1);
  },
  listByUser: (userId: number): Supplement[] =>
    supplementsList.filter((s) => s.userId === userId),
  findById: (id: number): Supplement | undefined =>
    supplementsList.find((s) => s.id === id),
};

// ─── Supplement Entries ─────────────────────────────────────────────────────────
const supplementEntriesList: SupplementEntry[] = [];

export const supplementEntriesStore = {
  add: (entry: Omit<SupplementEntry, "id" | "createdAt">): SupplementEntry => {
    const se: SupplementEntry = {
      ...entry,
      id: supplementEntryIdCounter++,
      createdAt: new Date(),
    };
    supplementEntriesList.push(se);
    return se;
  },
  deleteById: (id: number): void => {
    const idx = supplementEntriesList.findIndex((e) => e.id === id);
    if (idx !== -1) supplementEntriesList.splice(idx, 1);
  },
  listByUserAndDate: (userId: number, dateStr: string): SupplementEntry[] =>
    supplementEntriesList.filter(
      (e) =>
        e.userId === userId &&
        e.entryDate.toISOString().slice(0, 10) === dateStr
    ),
  listByUser: (userId: number): SupplementEntry[] =>
    supplementEntriesList.filter((e) => e.userId === userId),
};

// ─── Alerts ─────────────────────────────────────────────────────────────────────
const alertsList: Alert[] = [];

export const alertsStore = {
  add: (entry: Omit<Alert, "id" | "createdAt">): Alert => {
    const a: Alert = { ...entry, id: alertIdCounter++, createdAt: new Date() };
    alertsList.push(a);
    return a;
  },
  listByUser: (userId: number): Alert[] =>
    alertsList.filter((a) => a.userId === userId),
  dismiss: (id: number): void => {
    const a = alertsList.find((x) => x.id === id);
    if (a) a.isDismissed = true;
  },
};
