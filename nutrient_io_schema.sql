-- NUTRIENT.IO DATABASE SCHEMA
-- PostgreSQL 15+
-- Run in order: Tables → Indexes → Foreign Keys → Functions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,

  -- Demographics
  date_of_birth DATE,
  sex VARCHAR(20) CHECK (sex IN ('male', 'female', 'intersex')),
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),

  -- Life stage
  life_stage VARCHAR(30) DEFAULT 'none' CHECK (life_stage IN ('none', 'pregnant_first', 'pregnant_second', 'pregnant_third', 'lactating', 'trying_to_conceive')),

  -- Activity & goals
  activity_level VARCHAR(30) DEFAULT 'sedentary' CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  primary_goal VARCHAR(50),

  -- Dietary
  diet_types TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  health_priorities TEXT[] DEFAULT '{}',

  -- Region & preferences
  region VARCHAR(50) DEFAULT 'US',
  preferred_units VARCHAR(10) DEFAULT 'metric' CHECK (preferred_units IN ('metric', 'imperial')),
  language VARCHAR(10) DEFAULT 'en',

  -- App settings
  theme VARCHAR(10) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notification_enabled BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  -- Status
  is_active BOOLEAN DEFAULT true,
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier);

-- ============================================
-- 2. NUTRIENTS MASTER TABLE
-- ============================================
CREATE TABLE nutrients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'vitamin', 'mineral', 'macro', 'amino_acid', 'other'
  unit VARCHAR(20) NOT NULL,
  display_order INTEGER DEFAULT 999,
  is_displayed_default BOOLEAN DEFAULT true,
  description TEXT,
  function_in_body TEXT,
  deficiency_symptoms TEXT,
  toxicity_symptoms TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nutrients_category ON nutrients(category);
CREATE INDEX idx_nutrients_display ON nutrients(display_order);

-- ============================================
-- 3. NUTRIENT REFERENCE VALUES (RDA/AI/UL)
-- ============================================
CREATE TABLE nutrient_reference_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrient_id UUID NOT NULL REFERENCES nutrients(id),
  sex VARCHAR(20) CHECK (sex IN ('male', 'female', 'both')),
  age_min_months INTEGER NOT NULL,
  age_max_months INTEGER,
  is_pregnant BOOLEAN DEFAULT false,
  is_lactating BOOLEAN DEFAULT false,
  rda DECIMAL(10,4),
  ai DECIMAL(10,4),
  ul DECIMAL(10,4),
  ear DECIMAL(10,4),
  reference_source VARCHAR(100),
  region VARCHAR(20) DEFAULT 'US',
  special_populations_notes TEXT,
  UNIQUE(nutrient_id, sex, age_min_months, age_max_months, is_pregnant, is_lactating, region)
);

CREATE INDEX idx_nrv_nutrient ON nutrient_reference_values(nutrient_id);
CREATE INDEX idx_nrv_demographic ON nutrient_reference_values(sex, age_min_months, age_max_months);
CREATE INDEX idx_nrv_region ON nutrient_reference_values(region);

-- ============================================
-- 4. FOODS TABLE
-- ============================================
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  description TEXT,
  data_source VARCHAR(50) NOT NULL,
  source_id VARCHAR(100),
  data_quality_score DECIMAL(3,2),
  is_verified BOOLEAN DEFAULT false,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  serving_size DECIMAL(10,3) NOT NULL,
  serving_unit VARCHAR(50) NOT NULL,
  serving_description VARCHAR(255),
  common_measures JSONB DEFAULT '{}',

  -- Denormalized nutrients for quick access
  calories DECIMAL(8,2),
  protein_g DECIMAL(8,3),
  total_fat_g DECIMAL(8,3),
  carbohydrates_g DECIMAL(8,3),
  fiber_g DECIMAL(8,3),
  sugars_g DECIMAL(8,3),

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  search_vector tsvector
);

CREATE INDEX idx_foods_name ON foods USING gin(to_tsvector('english', name));
CREATE INDEX idx_foods_brand ON foods(brand);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_source ON foods(data_source);
CREATE INDEX idx_foods_search ON foods USING gin(search_vector);

-- ============================================
-- 5. FOOD_NUTRIENTS (Detailed breakdown)
-- ============================================
CREATE TABLE food_nutrients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  nutrient_id UUID NOT NULL REFERENCES nutrients(id),
  amount DECIMAL(10,4) NOT NULL, -- per 100g
  data_points INTEGER,
  derivation_code VARCHAR(20),
  UNIQUE(food_id, nutrient_id)
);

CREATE INDEX idx_food_nutrients_food ON food_nutrients(food_id);
CREATE INDEX idx_food_nutrients_nutrient ON food_nutrients(nutrient_id);

-- ============================================
-- 6. SUPPLEMENTS TABLE
-- ============================================
CREATE TABLE supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  form VARCHAR(50),
  serving_size VARCHAR(100),
  dose_per_serving DECIMAL(10,4),
  dose_unit VARCHAR(20),
  nutrients JSONB NOT NULL DEFAULT '{}',
  directions TEXT,
  warnings TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  upc VARCHAR(50),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supplements_name ON supplements(name);
CREATE INDEX idx_supplements_brand ON supplements(brand);

-- ============================================
-- 7. MEAL ENTRIES TABLE
-- ============================================
CREATE TABLE meal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  food_id UUID NOT NULL REFERENCES foods(id),
  food_name_snapshot VARCHAR(255),
  serving_amount DECIMAL(10,3) NOT NULL,
  serving_unit VARCHAR(50) NOT NULL,
  calculated_nutrients JSONB NOT NULL DEFAULT '{}',
  total_calories DECIMAL(8,2),
  notes TEXT,
  entry_source VARCHAR(20) DEFAULT 'manual' CHECK (entry_source IN ('manual', 'recipe', 'meal_template', 'voice', 'imported')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meal_entries_user_date ON meal_entries(user_id, entry_date);
CREATE INDEX idx_meal_entries_food ON meal_entries(food_id);
CREATE INDEX idx_meal_entries_type ON meal_entries(meal_type);

-- ============================================
-- 8. SUPPLEMENT ENTRIES TABLE
-- ============================================
CREATE TABLE supplement_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplements(id),
  supplement_name_snapshot VARCHAR(255),
  entry_date DATE NOT NULL,
  taken_at TIMESTAMP,
  number_of_servings DECIMAL(4,2) DEFAULT 1,
  calculated_nutrients JSONB NOT NULL DEFAULT '{}',
  taken_with_food BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supplement_entries_user_date ON supplement_entries(user_id, entry_date);
CREATE INDEX idx_supplement_entries_supplement ON supplement_entries(supplement_id);

-- ============================================
-- 9. RECIPES TABLE
-- ============================================
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  number_of_servings DECIMAL(4,1) NOT NULL,
  serving_description VARCHAR(100),
  nutrients_per_serving JSONB NOT NULL DEFAULT '{}',
  calories_per_serving DECIMAL(8,2),
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  difficulty VARCHAR(20),
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recipes_user ON recipes(user_id);
CREATE INDEX idx_recipes_public ON recipes(is_public) WHERE is_public = true;

-- ============================================
-- 10. RECIPE ITEMS TABLE
-- ============================================
CREATE TABLE recipe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id),
  food_name_snapshot VARCHAR(255),
  amount DECIMAL(10,3) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  notes TEXT,
  order_index INTEGER
);

CREATE INDEX idx_recipe_items_recipe ON recipe_items(recipe_id);

-- ============================================
-- 11. USER GOALS TABLE
-- ============================================
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nutrient_id UUID NOT NULL REFERENCES nutrients(id),
  target_amount DECIMAL(10,4),
  min_amount DECIMAL(10,4),
  max_amount DECIMAL(10,4),
  is_custom BOOLEAN DEFAULT false,
  custom_reason TEXT,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, nutrient_id, effective_from)
);

CREATE INDEX idx_user_goals_user ON user_goals(user_id);

-- ============================================
-- 12. ALERTS TABLE
-- ============================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low', 'info')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_nutrient_id UUID REFERENCES nutrients(id),
  related_date DATE,
  action_type VARCHAR(50),
  action_payload JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  snoozed_until TIMESTAMP
);

CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_unread ON alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_alerts_priority ON alerts(priority);

-- ============================================
-- 13. SYMPTOM LOGS TABLE
-- ============================================
CREATE TABLE symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  symptoms TEXT[] DEFAULT '{}',
  custom_symptoms TEXT[] DEFAULT '{}',
  overall_severity INTEGER CHECK (overall_severity BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_hours DECIMAL(4,1),
  notes TEXT,
  potential_nutrient_correlations UUID[] DEFAULT '{}'
);

CREATE INDEX idx_symptom_logs_user_date ON symptom_logs(user_id, log_date);

-- ============================================
-- 14. HYDRATION LOGS TABLE
-- ============================================
CREATE TABLE hydration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount_ml DECIMAL(8,2) NOT NULL,
  beverage_type VARCHAR(50) DEFAULT 'water',
  sodium_mg DECIMAL(6,2),
  potassium_mg DECIMAL(6,2),
  notes TEXT
);

CREATE INDEX idx_hydration_logs_user_date ON hydration_logs(user_id, log_date);

-- ============================================
-- 15. DAILY SUMMARIES TABLE (Materialized)
-- ============================================
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  total_calories DECIMAL(8,2),
  total_nutrients JSONB NOT NULL DEFAULT '{}',
  target_percentages JSONB NOT NULL DEFAULT '{}',
  food_calories DECIMAL(8,2),
  supplement_calories DECIMAL(8,2),
  nutrient_score INTEGER,
  meals_logged INTEGER DEFAULT 0,
  supplements_logged INTEGER DEFAULT 0,
  total_water_ml DECIMAL(8,2),
  insights JSONB DEFAULT '[]',
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, summary_date)
);

CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, summary_date);
CREATE INDEX idx_daily_summaries_date ON daily_summaries(summary_date);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplements_updated_at BEFORE UPDATE ON supplements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_entries_updated_at BEFORE UPDATE ON meal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_summaries_updated_at BEFORE UPDATE ON daily_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Search vector update trigger for foods
CREATE OR REPLACE FUNCTION foods_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER foods_search_vector_trigger
  BEFORE INSERT OR UPDATE ON foods
  FOR EACH ROW
  EXECUTE FUNCTION foods_search_vector_update();

-- ============================================
-- SEED DATA: CORE NUTRIENTS
-- ============================================

INSERT INTO nutrients (name, display_name, category, unit, display_order, description) VALUES
-- Vitamins
('vitamin_a_rae', 'Vitamin A', 'vitamin', 'mcg', 1, 'Essential for vision, immune function, and cell growth'),
('vitamin_c', 'Vitamin C', 'vitamin', 'mg', 2, 'Antioxidant, supports immune system and collagen synthesis'),
('vitamin_d', 'Vitamin D', 'vitamin', 'mcg', 3, 'Supports bone health and immune function'),
('vitamin_e', 'Vitamin E', 'vitamin', 'mg', 4, 'Antioxidant that protects cells from damage'),
('vitamin_k', 'Vitamin K', 'vitamin', 'mcg', 5, 'Essential for blood clotting and bone health'),
('thiamin', 'Thiamin (B1)', 'vitamin', 'mg', 6, 'Supports energy metabolism and nerve function'),
('riboflavin', 'Riboflavin (B2)', 'vitamin', 'mg', 7, 'Supports energy production and cellular function'),
('niacin', 'Niacin (B3)', 'vitamin', 'mg', 8, 'Supports energy metabolism and DNA repair'),
('vitamin_b6', 'Vitamin B6', 'vitamin', 'mg', 9, 'Supports protein metabolism and cognitive development'),
('folate', 'Folate (B9)', 'vitamin', 'mcg', 10, 'Essential for DNA synthesis and cell division'),
('vitamin_b12', 'Vitamin B12', 'vitamin', 'mcg', 11, 'Supports nerve function and red blood cell formation'),
('pantothenic_acid', 'Pantothenic Acid (B5)', 'vitamin', 'mg', 12, 'Supports energy metabolism and hormone synthesis'),
('biotin', 'Biotin (B7)', 'vitamin', 'mcg', 13, 'Supports metabolism of fats, carbs, and proteins'),
('choline', 'Choline', 'other', 'mg', 14, 'Supports brain function and liver health'),

-- Minerals
('calcium', 'Calcium', 'mineral', 'mg', 20, 'Essential for bone health and muscle function'),
('iron', 'Iron', 'mineral', 'mg', 21, 'Essential for oxygen transport in blood'),
('magnesium', 'Magnesium', 'mineral', 'mg', 22, 'Supports muscle and nerve function, bone health'),
('phosphorus', 'Phosphorus', 'mineral', 'mg', 23, 'Supports bone health and energy production'),
('potassium', 'Potassium', 'mineral', 'mg', 24, 'Essential for heart function and fluid balance'),
('sodium', 'Sodium', 'mineral', 'mg', 25, 'Regulates fluid balance and nerve function'),
('zinc', 'Zinc', 'mineral', 'mg', 26, 'Supports immune function and wound healing'),
('copper', 'Copper', 'mineral', 'mcg', 27, 'Supports iron metabolism and connective tissue'),
('manganese', 'Manganese', 'mineral', 'mg', 28, 'Supports bone health and metabolism'),
('selenium', 'Selenium', 'mineral', 'mcg', 29, 'Antioxidant that supports thyroid function'),
('iodine', 'Iodine', 'mineral', 'mcg', 30, 'Essential for thyroid hormone production'),
('fluoride', 'Fluoride', 'mineral', 'mg', 31, 'Supports dental health'),

-- Macros
('calories', 'Calories', 'macro', 'kcal', 40, 'Energy from food'),
('protein', 'Protein', 'macro', 'g', 41, 'Essential for muscle and tissue repair'),
('carbohydrates', 'Carbohydrates', 'macro', 'g', 42, 'Primary energy source'),
('fiber', 'Fiber', 'macro', 'g', 43, 'Supports digestive health'),
('sugars', 'Sugars', 'macro', 'g', 44, 'Simple carbohydrates'),
('total_fat', 'Total Fat', 'macro', 'g', 45, 'Essential for hormone production and nutrient absorption'),
('saturated_fat', 'Saturated Fat', 'macro', 'g', 46, 'Type of fat to limit'),
('monounsaturated_fat', 'Monounsaturated Fat', 'macro', 'g', 47, 'Heart-healthy fat'),
('polyunsaturated_fat', 'Polyunsaturated Fat', 'macro', 'g', 48, 'Includes omega fatty acids'),
('cholesterol', 'Cholesterol', 'macro', 'mg', 49, 'Important for cell membranes'),

-- Omega Fatty Acids
('omega_3_ala', 'Omega-3 (ALA)', 'other', 'g', 50, 'Plant-based omega-3 fatty acid'),
('omega_3_epa', 'Omega-3 (EPA)', 'other', 'g', 51, 'Marine omega-3 fatty acid'),
('omega_3_dha', 'Omega-3 (DHA)', 'other', 'g', 52, 'Marine omega-3 for brain health'),
('omega_6_la', 'Omega-6 (LA)', 'other', 'g', 53, 'Essential fatty acid'),

-- Other
('caffeine', 'Caffeine', 'other', 'mg', 60, 'Stimulant found in coffee and tea');

-- ============================================
-- SEED DATA: SAMPLE RDA VALUES (Adult Males 19-50)
-- ============================================

INSERT INTO nutrient_reference_values (nutrient_id, sex, age_min_months, age_max_months, rda, ul, region)
SELECT 
  n.id, 'male', 228, 600, 
  CASE n.name
    WHEN 'vitamin_a_rae' THEN 900
    WHEN 'vitamin_c' THEN 90
    WHEN 'vitamin_d' THEN 15
    WHEN 'vitamin_e' THEN 15
    WHEN 'vitamin_k' THEN 120
    WHEN 'thiamin' THEN 1.2
    WHEN 'riboflavin' THEN 1.3
    WHEN 'niacin' THEN 16
    WHEN 'vitamin_b6' THEN 1.3
    WHEN 'folate' THEN 400
    WHEN 'vitamin_b12' THEN 2.4
    WHEN 'pantothenic_acid' THEN 5
    WHEN 'biotin' THEN 30
    WHEN 'choline' THEN 550
    WHEN 'calcium' THEN 1000
    WHEN 'iron' THEN 8
    WHEN 'magnesium' THEN 400
    WHEN 'phosphorus' THEN 700
    WHEN 'potassium' THEN 3400
    WHEN 'sodium' THEN 1500
    WHEN 'zinc' THEN 11
    WHEN 'copper' THEN 900
    WHEN 'manganese' THEN 2.3
    WHEN 'selenium' THEN 55
    WHEN 'iodine' THEN 150
    WHEN 'fluoride' THEN 4
    WHEN 'protein' THEN 56
    WHEN 'fiber' THEN 38
  END,
  CASE n.name
    WHEN 'vitamin_a_rae' THEN 3000
    WHEN 'vitamin_c' THEN 2000
    WHEN 'vitamin_d' THEN 100
    WHEN 'vitamin_e' THEN 1000
    WHEN 'niacin' THEN 35
    WHEN 'vitamin_b6' THEN 100
    WHEN 'folate' THEN 1000
    WHEN 'choline' THEN 3500
    WHEN 'calcium' THEN 2500
    WHEN 'iron' THEN 45
    WHEN 'magnesium' THEN 350
    WHEN 'phosphorus' THEN 4000
    WHEN 'sodium' THEN 2300
    WHEN 'zinc' THEN 40
    WHEN 'copper' THEN 10000
    WHEN 'manganese' THEN 11
    WHEN 'selenium' THEN 400
    WHEN 'iodine' THEN 1100
    WHEN 'fluoride' THEN 10
  END,
  'US'
FROM nutrients n
WHERE n.name IN ('vitamin_a_rae', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
  'thiamin', 'riboflavin', 'niacin', 'vitamin_b6', 'folate', 'vitamin_b12',
  'pantothenic_acid', 'biotin', 'choline', 'calcium', 'iron', 'magnesium',
  'phosphorus', 'potassium', 'sodium', 'zinc', 'copper', 'manganese',
  'selenium', 'iodine', 'fluoride', 'protein', 'fiber');

-- Add AI values for nutrients without RDA
INSERT INTO nutrient_reference_values (nutrient_id, sex, age_min_months, age_max_months, ai, region)
SELECT 
  n.id, 'male', 228, 600, 
  CASE n.name
    WHEN 'pantothenic_acid' THEN 5
    WHEN 'biotin' THEN 30
    WHEN 'choline' THEN 550
    WHEN 'potassium' THEN 3400
    WHEN 'sodium' THEN 1500
  END,
  'US'
FROM nutrients n
WHERE n.name IN ('pantothenic_acid', 'biotin', 'choline', 'potassium', 'sodium')
ON CONFLICT DO NOTHING;

-- ============================================
-- END OF SCHEMA
-- ============================================
