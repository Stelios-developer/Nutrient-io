# NUTRIENT.IO: The Ultimate Micronutrient Tracking Platform
## Complete Product Blueprint & Technical Specification

**Version**: 1.0  
**Date**: April 2024  
**Author**: Product Strategy & Engineering Team

---

# TABLE OF CONTENTS

1. [Product Vision](#1-product-vision)
2. [Feature Set](#2-feature-set)
3. [User Personas](#3-user-personas)
4. [Nutrition Science Logic](#4-nutrition-science-logic)
5. [User Input & Onboarding](#5-user-input--onboarding)
6. [App Information Architecture](#6-app-information-architecture)
7. [UX/UI Design System](#7-uxui-design-system)
8. [Core Calculations](#8-core-calculations)
9. [Database & Data Model](#9-database--data-model)
10. [Food and Nutrient Data Sources](#10-food-and-nutrient-data-sources)
11. [Rule-Based Guidance Features](#11-rule-based-guidance-features)
12. [Alerts & Insight Engine](#12-alerts--insight-engine)
13. [Technical Stack](#13-technical-stack)
14. [API Design](#14-api-design)
15. [Engineering Plan](#15-engineering-plan)
16. [Monetization](#16-monetization)
17. [Launch Plan](#17-launch-plan)
18. [Example Screens](#18-example-screens)
19. [Developer Output](#19-developer-output)
20. [Final Build Recommendation](#20-final-build-recommendation)

---


---

# 4. NUTRITION SCIENCE LOGIC

## Reference Value Definitions

### RDA (Recommended Dietary Allowance)
- **Definition**: Average daily intake level sufficient to meet nutrient requirements of 97-98% of healthy individuals in a specific life stage/sex group
- **Use**: Primary target for individuals
- **Source**: Institute of Medicine/National Academies

### AI (Adequate Intake)
- **Definition**: Recommended average daily intake level based on observed/experimentally determined approximations when RDA cannot be determined
- **Use**: Target when no RDA exists (e.g., biotin, pantothenic acid, choline)
- **Note**: Less certain than RDA

### EAR (Estimated Average Requirement)
- **Definition**: Intake level estimated to meet requirements of 50% of healthy individuals
- **Use**: Population planning, not individual target
- **App Use**: Behind-the-scenes for confidence calculations

### DV (Daily Value)
- **Definition**: Reference amounts on food labels, based on general 2000-calorie diet
- **Use**: Food label comparison only
- **App Use**: Secondary reference, not personalized

### UL (Tolerable Upper Intake Level)
- **Definition**: Maximum daily intake unlikely to cause adverse health effects
- **Use**: Safety ceiling, not target
- **Critical**: Exceeding UL regularly may cause toxicity

## Default Standards Strategy

### Primary Display: RDA/AI
- Show RDA when available
- Fall back to AI when no RDA
- Use DV only for food label context

### Regional Adaptations
| Region | Primary Standard | Notes |
|--------|-----------------|-------|
| United States | DRI (RDA/AI/UL) | National Academies |
| European Union | EFSA PRIs | Population Reference Intakes |
| UK | DRVs | Dietary Reference Values |
| Australia/NZ | NRVs | Nutrient Reference Values |
| Canada | DRIs | Same as US |

### Default Selection: DRI (US/Canada)
**Rationale**:
- Most comprehensive database
- Widely researched and cited
- Regularly updated
- Covers all life stages

## Missing Data Handling

### Confidence Scoring System
```
Confidence Level | Criteria
----------------|----------
High (●●●)      | Direct match, recent analysis, full nutrient profile
Medium (●●○)    | Similar food extrapolation, partial data
Low (●○○)       | Recipe-based calculation, multiple assumptions
Estimated (○○○) | Generic category average, significant uncertainty
```

### Missing Nutrient Protocol
1. **Search similar foods** (same category, similar composition)
2. **Extrapolate from ingredients** (for branded/composite foods)
3. **Mark as estimated** with confidence flag
4. **Exclude from critical calculations** if confidence < Medium
5. **Show user**: "Some nutrients estimated" with expand for details

## Conflicting Data Resolution

### Hierarchy of Sources
1. **USDA FoodData Central** (foundation foods, SR Legacy)
2. **Branded food databases** (manufacturer data)
3. **Regional databases** (EuroFIR, Food Standards Australia)
4. **User-submitted** (verified by admin)
5. **Calculated from ingredients**

### Conflict Resolution Rules
- Most recent data wins
- Official government sources > commercial
- Analytical data > calculated
- Flag conflicts for review

## Sex/Age-Dependent Target Handling

### Life Stage Categories
```
Category              | Age Range           | Special Flags
---------------------|---------------------|---------------
Infants              | 0-12 months         | AI only, no UL
Children M/F         | 1-3, 4-8 years      | Sex-combined
Males/Females        | 9-13, 14-18, 19-30  | Sex-separated
Adults M/F           | 31-50, 51-70, 71+   | Sex-separated
Pregnancy            | All trimesters      | Increased needs
Lactation            | All stages          | Maximum needs
```

### Dynamic Target Calculation
```javascript
function calculateTarget(nutrient, user) {
  const baseValue = getRDABase(nutrient, user.sex, user.age);

  if (user.isPregnant) {
    return baseValue + getPregnancyIncrement(nutrient);
  }
  if (user.isLactating) {
    return baseValue + getLactationIncrement(nutrient);
  }
  if (user.activityLevel === 'athlete' && nutrient === 'iron') {
    return baseValue * 1.3; // 30% increase for endurance athletes
  }

  return baseValue;
}
```

## Variable Daily Target Handling

### Nutrients with Wide Ranges
| Nutrient | Range Factor | App Approach |
|----------|--------------|--------------|
| Sodium | 1,500-2,300mg | Default to 2,300mg, allow custom |
| Fiber | 14g per 1,000 kcal | Calculate based on calorie goal |
| Protein | 0.8-2.0g/kg | Use 0.8g default, allow goal-based override |
| Water | Highly variable | Base on weight + activity |

### User Override System
- All targets can be customized
- Show "Custom" badge when overridden
- Provide reset to default
- Warn if override goes above UL

## Supplement vs Food Handling

### Distinction Method
```
Entry Type      | Source Tracking | Bioavailability Note
---------------|-----------------|---------------------
Food            | Natural source  | Standard absorption
Fortified Food  | Added nutrient  | May vary by form
Supplement      | Pill/powder     | Form-specific notes
```

### Bioavailability Considerations
| Nutrient | Food Form | Supplement Form | Absorption Factor |
|----------|-----------|-----------------|-------------------|
| Iron     | Heme      | Ferrous sulfate | Heme 2-3x better |
| Iron     | Non-heme  | Ferrous bisglycinate | Varies |
| Calcium  | Food      | Carbonate/citrate | Citrate better |
| Folate   | Food      | Folic acid | Folic acid 1.7x |
| B12      | Food      | Cyanocobalamin | Similar |

### Display Strategy
- Show total intake prominently
- Show food vs supplement breakdown on detail
- Note bioavailability where relevant

## Intake Status Classification System

### Enhanced Color Coding
```
Status        | Range                    | Color    | Icon
--------------|--------------------------|----------|------
Critical Low  | < 25% RDA/AI             | Dark Red | ⚠️
Low           | 25-49% RDA/AI            | Red      | ↓
Suboptimal    | 50-74% RDA/AI            | Orange   | →
Adequate      | 75-89% RDA/AI            | Yellow   | ↗
Optimal       | 90-110% RDA/AI           | Green    | ✓
High          | 111-150% RDA/AI          | Blue     | ↑
Near UL       | > 80% UL (if UL exists)  | Purple   | ⚡
Excess        | > UL                     | Magenta  | 🚫
```

### UL Proximity Warnings
```
UL Proximity  | Action
--------------|--------
< 50% UL      | No warning
50-80% UL     | Info note: "Approaching limit"
80-100% UL    | Warning: "Near upper safe limit"
> 100% UL     | Alert: "Exceeds safe limit"
> 150% UL     | Critical: "Potential toxicity risk"
```

### Daily Nutrient Scoring Algorithm
```javascript
function calculateNutrientScore(dailyIntake, targets) {
  let totalScore = 0;
  let maxScore = 0;

  for (const [nutrient, intake] of Object.entries(dailyIntake)) {
    const target = targets[nutrient].rda;
    const ul = targets[nutrient].ul;

    let nutrientScore = 0;
    const percentage = (intake / target) * 100;

    // Scoring logic
    if (percentage >= 90 && percentage <= 110) {
      nutrientScore = 100; // Optimal
    } else if (percentage >= 75 && percentage < 90) {
      nutrientScore = 80; // Adequate
    } else if (percentage >= 50 && percentage < 75) {
      nutrientScore = 60; // Suboptimal
    } else if (percentage >= 25 && percentage < 50) {
      nutrientScore = 40; // Low
    } else if (percentage < 25) {
      nutrientScore = 20; // Critical
    } else if (percentage > 110 && percentage <= 150) {
      nutrientScore = 70; // High but acceptable
    } else if (ul && intake > ul) {
      nutrientScore = 0; // Excess penalty
    }

    // Weight by importance
    const weight = getNutrientWeight(nutrient);
    totalScore += nutrientScore * weight;
    maxScore += 100 * weight;
  }

  return Math.round((totalScore / maxScore) * 100);
}
```

---

# 5. USER INPUT & ONBOARDING

## Onboarding Flow (12 Steps)

### Step 1: Welcome
**Screen**: "Discover Your Nutritional Profile"
**Content**: 
- App purpose in one sentence
- "3 minutes to personalize your experience"
- Get Started CTA

### Step 2: Basic Demographics
**Fields**:
- Age (dropdown: 1-100+)
- Sex (Male, Female, Intersex)
- Height (ft/in or cm)
- Current Weight (lbs or kg)
- Goal Weight (optional)

**Logic**: Calculate BMI, determine life stage category

### Step 3: Life Stage
**Conditional**: If female and 12-55 years
**Options**:
- Not pregnant or lactating
- Pregnant (trimester selection)
- Lactating/breastfeeding
- Trying to conceive

**Logic**: Apply pregnancy/lactation nutrient increments

### Step 4: Activity Level
**Options** (with descriptions):
- **Sedentary**: Desk job, little exercise
- **Lightly Active**: Light exercise 1-3 days/week
- **Moderately Active**: Moderate exercise 3-5 days/week
- **Very Active**: Hard exercise 6-7 days/week
- **Extremely Active**: Physical job + hard training

**Logic**: Adjust calorie targets, some mineral needs

### Step 5: Primary Goal
**Options**:
- Maintain current health
- Lose weight
- Build muscle
- Improve energy
- Support athletic performance
- Manage a health condition
- Optimize longevity
- Support pregnancy

**Logic**: Prioritize certain nutrients in dashboard

### Step 6: Diet Type
**Options** (select all that apply):
- No specific diet
- Vegetarian
- Vegan
- Pescatarian
- Ketogenic/Low-carb
- Paleo
- Mediterranean
- Gluten-free
- Dairy-free
- Low-FODMAP
- Other (text input)

**Logic**: Filter food suggestions, flag common gaps

### Step 7: Allergies & Intolerances
**Options** (select all):
- None
- Peanuts
- Tree nuts
- Shellfish
- Fish
- Eggs
- Dairy
- Soy
- Wheat/Gluten
- Sesame
- Other (text input)

**Logic**: Filter food database, safety warnings

### Step 8: Health Priorities
**Question**: "Which areas are most important to you?" (Rank top 3)
**Options**:
- Energy & vitality
- Immune system
- Bone health
- Heart health
- Brain health & cognition
- Digestive health
- Skin health
- Sleep quality
- Athletic recovery
- Hormone balance
- Blood sugar control

**Logic**: Customize dashboard priority nutrients

### Step 9: Current Supplement Use
**Question**: "Do you currently take any supplements?"
**Options**:
- None
- Multivitamin
- Vitamin D
- Omega-3/Fish oil
- Protein powder
- B-complex
- Magnesium
- Iron
- Calcium
- Probiotic
- Other (specify)

**Logic**: Pre-populate supplement section, check for excess risks

### Step 10: Region/Location
**Purpose**: Determine nutrient reference standards, food database priority
**Options**:
- United States
- Canada
- United Kingdom
- European Union
- Australia/New Zealand
- Other

**Logic**: Set default nutrient standards, localize food database

### Step 11: Hydration Needs
**Question**: "How much water do you typically drink daily?"
**Slider**: 0-5+ liters
**Logic**: Calculate recommended intake based on weight + activity

### Step 12: Account Creation
**Fields**:
- Email
- Password
- Optional: Name

**Completion**: 
- "Your personalized nutrition profile is ready!"
- Brief tutorial prompt
- Go to dashboard CTA

## Personalization Logic

### Target Calculation Matrix
```javascript
const userProfile = {
  age: 32,
  sex: 'female',
  weight: 65, // kg
  height: 165, // cm
  isPregnant: false,
  isLactating: false,
  activityLevel: 'moderately_active',
  dietType: ['vegetarian'],
  region: 'US'
};

function generateTargets(profile) {
  const targets = {};

  // Base DRI values
  for (const nutrient of nutrients) {
    targets[nutrient] = {
      rda: getDRI(nutrient, profile.sex, profile.age),
      ul: getUL(nutrient, profile.sex, profile.age),
      unit: getUnit(nutrient)
    };
  }

  // Apply life stage adjustments
  if (profile.isPregnant) {
    targets.folate.rda += 200; // mcg
    targets.iron.rda += 9; // mg
    targets.calcium.rda = 1000; // mg (no change)
    // ... etc
  }

  if (profile.isLactating) {
    targets.folate.rda += 100;
    targets.iron.rda += 0; // actually returns to normal
    targets.calcium.rda = 1000;
    // ... etc
  }

  // Activity adjustments
  if (profile.activityLevel === 'extremely_active') {
    targets.iron.rda *= 1.3; // 30% increase
    targets.magnesium.rda *= 1.2;
  }

  // Diet-specific flags
  if (profile.dietType.includes('vegan')) {
    targets.vitamin_b12.flag = 'critical'; // Must supplement
    targets.iron.flag = 'attention'; // Lower bioavailability
    targets.zinc.flag = 'attention';
    targets.calcium.flag = 'attention';
  }

  return targets;
}
```

### Dashboard Prioritization
Based on health priorities selection:
| Priority | Top Nutrients Displayed |
|----------|------------------------|
| Energy | B12, Iron, Magnesium, CoQ10 |
| Immune | Vitamin C, D, Zinc, Selenium |
| Bone Health | Calcium, Vitamin D, K, Magnesium |
| Heart Health | Omega-3, Potassium, Magnesium, Fiber |
| Brain Health | Omega-3, B12, Folate, Choline |
| Athletic Recovery | Protein, Magnesium, Zinc, Vitamin C |

---

# 6. APP INFORMATION ARCHITECTURE

## Navigation Structure

### Primary Tabs (Bottom Navigation)
1. **Home** - Daily overview
2. **Log** - Quick add food/supplement
3. **Dashboard** - Detailed nutrients
4. **Trends** - Historical analysis
5. **Profile** - Settings & goals

## Screen Specifications

### 1. HOME SCREEN

**Purpose**: Daily summary and quick actions

**Key Components**:
- Date selector (today default, swipe to change)
- Daily nutrient score (0-100)
- Macro summary card (calories, protein, carbs, fat)
- Critical nutrients row (3-5 key nutrients)
- Quick log buttons (breakfast, lunch, dinner, snack, supplement)
- Today's meals list
- Daily insight card

**Displayed Metrics**:
- Calories consumed / goal
- Protein, carbs, fat grams and %
- Top 3 nutrient gaps
- Water intake progress
- Supplement status

**Actions**:
- Tap meal type → Log meal
- Tap nutrient → See details
- Swipe date → Change day
- Pull down → Refresh

**Empty State**:
- "Start your day with nutrition"
- "Log your first meal" CTA
- Illustration of healthy food

**Error State**:
- "Couldn't load today's data"
- Retry button
- Offline mode indicator

---

### 2. LOG MEAL SCREEN

**Purpose**: Add food to a meal

**Key Components**:
- Meal type selector (breakfast/lunch/dinner/snack)
- Time picker
- Search bar (prominent)
- Recent foods list
- Favorites section
- Browse categories
- Current meal summary (foods added)

**Search Functionality**:
- Instant search (debounced 300ms)
- Filters: All, Recent, Favorites, Custom, Brand
- Results show: name, brand, calories per serving
- Tap to select serving size

**Serving Size Selector**:
- Common servings (1 cup, 100g, 1 piece)
- Custom amount input
- Visual reference (when available)
- Nutrient preview for selected amount

**Actions**:
- Add food → Add to meal
- Create custom food → Custom food form
- Save meal → Name and save
- Done → Return to home

**Empty State**:
- "Search for foods to add"
- Popular foods suggestions
- Browse categories

---

### 3. ADD FOOD DETAIL SCREEN

**Purpose**: View and confirm food nutrients

**Key Components**:
- Food name and brand
- Serving size selector
- Amount input
- Full nutrient table (collapsible sections)
- Add to meal button
- Favorite toggle

**Nutrient Display**:
- Calories (prominent)
- Macronutrients (protein, carbs, fat, fiber)
- Vitamins (A, C, D, E, K, B-complex)
- Minerals (calcium, iron, magnesium, zinc, etc.)
- Confidence indicator

**Actions**:
- Change serving → Update values
- Add to meal → Confirm
- Favorite → Save for quick access
- Report issue → Flag data

---

### 4. ADD SUPPLEMENT SCREEN

**Purpose**: Log supplement intake

**Key Components**:
- Supplement selector (search or browse)
- Dose input (mg, mcg, IU)
- Frequency selector (once, twice, custom)
- Timing (with meal, empty stomach, etc.)
- Brand and form (optional)
- Notes field

**Supplement Database**:
- Common supplements pre-loaded
- Generic entries (Vitamin D3 1000 IU)
- Brand-specific (Nature Made Vitamin D3)
- User-created supplements

**Safety Checks**:
- UL warning if dose high
- Interaction notes (e.g., "Iron absorption reduced by calcium")
- Duplicate detection

**Actions**:
- Save → Add to daily log
- Add reminder → Set notification
- Create custom → Custom supplement form

---

### 5. NUTRIENT DASHBOARD SCREEN

**Purpose**: Comprehensive nutrient status

**Key Components**:
- Date range selector (today/7 days/30 days)
- View toggle (all/macro/micro/electrolytes)
- Nutrient category tabs
- Sort options (by % of target, alphabetically, by gap)
- Search/filter

**Nutrient Card**:
- Name and unit
- Current / Target / UL
- Progress bar with color coding
- % of target
- Source breakdown (food vs supplement)
- Trend mini-chart (7-day)

**Categories**:
- **Macros**: Calories, protein, carbs, fat, fiber
- **Vitamins**: A, C, D, E, K, B1, B2, B3, B6, B12, folate
- **Minerals**: Calcium, iron, magnesium, zinc, selenium, iodine
- **Electrolytes**: Sodium, potassium, magnesium, chloride
- **Other**: Omega-3, choline, caffeine

**Actions**:
- Tap nutrient → Detailed view
- Tap gap → Food suggestions
- Export → Generate report
- Customize → Reorder/hide nutrients

**Empty State**:
- "Log meals to see your nutrients"
- Quick log CTA

---

### 6. NUTRIENT DETAIL SCREEN

**Purpose**: Deep dive into single nutrient

**Key Components**:
- Nutrient name and description
- Current status (color coded)
- Today's intake vs target
- 7/30/90-day trend chart
- Top food sources (today)
- Recommended foods to fill gap
- Function in body
- Deficiency symptoms
- UL warning (if applicable)

**Chart Types**:
- Line chart: Daily intake over time
- Bar chart: Average by meal type
- Pie chart: Source breakdown

**Actions**:
- View foods → List of contributing foods
- Add food → Suggestions to increase
- Set custom target → Override RDA
- Learn more → Educational content

---

### 7. TRENDS SCREEN

**Purpose**: Historical analysis and patterns

**Key Components**:
- Time range selector (7/30/90/365 days)
- Metric selector (nutrient score, specific nutrient, calories)
- Main trend chart
- Key insights cards
- Comparison to targets
- Best/worst days

**Insights Generated**:
- "Your magnesium has been low 5 of 7 days"
- "Vitamin D intake improved 40% this month"
- "You meet protein target 92% of the time"
- "Weekend calcium drops by average 30%"

**Actions**:
- Change metric → Update chart
- Export data → CSV/PDF
- Share progress → Social/clipboard

---

### 8. INSIGHTS SCREEN

**Purpose**: Smart recommendations and alerts

**Key Components**:
- Active alerts section
- Recommendations list
- Weekly summary card
- Achievement badges
- Pattern discoveries

**Alert Types**:
- Critical: Excess intake, severe deficiency
- Warning: Approaching UL, consistent low intake
- Info: Optimization suggestions, new patterns

**Recommendation Cards**:
- Nutrient gap identified
- Why it matters (1 sentence)
- Top 3 foods to fill gap
- Easy action button

**Actions**:
- Dismiss alert → Remove from list
- Take action → Go to relevant screen
- View all → Full alerts history

---

### 9. PROFILE SCREEN

**Purpose**: User settings and preferences

**Key Components**:
- Profile header (name, avatar, member since)
- Account settings
- Nutrition goals
- Health profile
- App preferences
- Data management
- Support & feedback

**Sections**:
- **My Goals**: View/edit all nutrient targets
- **Health Profile**: Update demographics, life stage
- **Dietary Preferences**: Diet type, allergies
- **Display Settings**: Units, theme, nutrient order
- **Notifications**: Alert preferences
- **Data**: Export, delete, sync

**Actions**:
- Edit profile → Update info
- Customize dashboard → Reorder nutrients
- Export data → Generate file
- Contact support → Email/FAQ

---

### 10. GOALS SCREEN

**Purpose**: Manage nutrient targets

**Key Components**:
- List of all nutrients with targets
- Edit mode toggle
- Reset to defaults
- Custom goal creation

**Nutrient Row**:
- Name
- Current target
- UL (if exists)
- Edit button
- Custom indicator

**Edit Flow**:
- Tap nutrient → Edit modal
- Adjust target (slider or input)
- See % change from default
- Save or cancel
- Warning if above UL

---

### 11. SETTINGS SCREEN

**Purpose**: App configuration

**Options**:
- Units (metric/imperial)
- Theme (light/dark/system)
- Language
- Region/standards
- Notification settings
- Privacy settings
- About/Legal

---

# 7. UX/UI DESIGN SYSTEM

## Visual Style

### Design Philosophy
- **Scientific precision** meets **human warmth**
- Data-rich but never overwhelming
- Clean, modern, trustworthy
- Accessible to all users

### Inspiration
- Apple Health (clean data visualization)
- Headspace (friendly, approachable)
- Notion (flexible, organized)
- Cronometer (nutrient density)

## Color System

### Primary Palette
```css
--primary-50: #E6F4EA;   /* Lightest green */
--primary-100: #C8E6C9;  /* Light green */
--primary-500: #4CAF50;  /* Primary green */
--primary-600: #43A047;  /* Dark green */
--primary-700: #388E3C;  /* Darker green */
--primary-900: #1B5E20;  /* Darkest green */
```

### Semantic Colors
```css
/* Status Colors */
--status-critical: #D32F2F;    /* Dark red - <25% */
--status-low: #F44336;         /* Red - 25-49% */
--status-suboptimal: #FF9800;  /* Orange - 50-74% */
--status-adequate: #FFC107;    /* Yellow - 75-89% */
--status-optimal: #4CAF50;     /* Green - 90-110% */
--status-high: #2196F3;        /* Blue - 111-150% */
--status-near-ul: #9C27B0;     /* Purple - >80% UL */
--status-excess: #E91E63;      /* Magenta - >UL */

/* Neutral Colors */
--neutral-100: #FFFFFF;
--neutral-200: #F5F5F5;
--neutral-300: #E0E0E0;
--neutral-400: #BDBDBD;
--neutral-500: #9E9E9E;
--neutral-600: #757575;
--neutral-700: #616161;
--neutral-800: #424242;
--neutral-900: #212121;
```

### Dark Mode Colors
```css
--dm-background: #121212;
--dm-surface: #1E1E1E;
--dm-surface-elevated: #2D2D2D;
--dm-text-primary: #FFFFFF;
--dm-text-secondary: #B0B0B0;
--dm-border: #404040;
```

## Typography

### Font Stack
```css
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
```

### Type Scale
```
Style          | Size | Weight | Line Height | Use Case
---------------|------|--------|-------------|------------------
Display        | 32px | 700    | 1.2         | Large numbers
H1             | 28px | 700    | 1.3         | Screen titles
H2             | 24px | 600    | 1.3         | Section headers
H3             | 20px | 600    | 1.4         | Card titles
H4             | 18px | 600    | 1.4         | Subsection
Body Large     | 17px | 400    | 1.5         | Primary content
Body           | 15px | 400    | 1.5         | Secondary content
Body Small     | 13px | 400    | 1.5         | Captions, metadata
Caption        | 12px | 500    | 1.4         | Labels, badges
Overline       | 11px | 600    | 1.2         | Uppercase labels
```

## Components

### Cards
```css
.card {
  background: var(--neutral-100);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--neutral-300);
}

.card-elevated {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
```

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
}

/* Secondary Button */
.btn-secondary {
  background: var(--neutral-200);
  color: var(--neutral-800);
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--primary-600);
  padding: 12px 16px;
}
```

### Progress Rings
```
Component: Circular progress indicator
- Outer ring: Background track (neutral-300)
- Inner ring: Progress (status color)
- Center: Percentage text
- Size variants: 40px (small), 64px (medium), 120px (large)
- Animation: Smooth 500ms transition on value change
```

### Nutrient Progress Bar
```
Component: Horizontal bar with segments
- Background: neutral-200
- Filled: status color based on % of target
- Height: 8px (compact), 12px (default)
- Border radius: 4px
- Optional: Segment markers for 25%, 50%, 75%, 100%
```

## Data Visualization

### Charts

#### Line Chart (Trends)
- Smooth curves (tension 0.4)
- Target line (dashed, neutral-400)
- Data points on hover
- Color: primary-500
- Fill: gradient opacity 0.1

#### Bar Chart (Daily Comparison)
- Rounded tops (radius 4px)
- Color by status
- Grouped by category
- Value labels on top

#### Donut Chart (Macro Distribution)
- Inner radius 60%
- Segment labels
- Center: total calories
- Colors: protein (blue), carbs (green), fat (orange)

### Nutrient Rings (Signature Component)
```
Layout: Grid of circular progress indicators
Each ring shows:
- Outer: Nutrient icon
- Ring: Progress toward target
- Center: Percentage
- Below: Name and amount

Color logic:
- <50%: Red
- 50-89%: Orange/Yellow
- 90-110%: Green
- >UL: Purple/Magenta
```

## Status Color Application

### Nutrient Status Display
```
Status        | Background    | Text       | Icon
--------------|---------------|------------|------
Critical Low  | red-50        | red-700    | alert-circle
Low           | red-50        | red-600    | arrow-down
Suboptimal    | orange-50     | orange-700 | minus
Adequate      | yellow-50     | yellow-800 | arrow-up-right
Optimal       | green-50      | green-700  | check-circle
High          | blue-50       | blue-700   | arrow-up
Near UL       | purple-50     | purple-700 | alert-triangle
Excess        | magenta-50    | magenta-700| x-circle
```

## Accessibility

### Requirements
- WCAG 2.1 AA compliance minimum
- Color not sole indicator (icons + text)
- Minimum touch target: 44x44px
- Focus indicators for keyboard navigation
- Screen reader optimized labels

### Color Contrast
- All text on backgrounds: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 against adjacent colors

### Motion
- Respect `prefers-reduced-motion`
- Essential animations < 300ms
- No auto-playing content

## Dark Mode

### Implementation
- System preference detection
- Manual toggle in settings
- Smooth transition (300ms)
- All components have dark variants

### Dark Mode Adjustments
- Reduce shadow intensity
- Increase border contrast
- Adjust status colors for visibility
- Use surface elevation (dp-1, dp-2, dp-3)

## Quick Logging UX

### Design Principles
1. **Speed**: Log in < 10 seconds
2. **Smart defaults**: Recent foods first
3. **Minimal taps**: 3 taps to log common food
4. **Visual confirmation**: Immediate feedback

### Quick Log Patterns
- **+ Button**: Always visible, expands to meal types
- **Recent Foods**: First 5 in search
- **Swipe Actions**: Swipe meal to duplicate
- **Long Press**: Quick add favorite

## Notification Style

### In-App Notifications
```
Toast notifications:
- Position: Top center
- Duration: 3 seconds
- Types: Success (green), Warning (orange), Error (red), Info (blue)
- Animation: Slide down + fade
```

### Push Notifications
- Nutrient gap reminders (end of day)
- Supplement timing reminders
- Weekly summary
- Achievement unlocks
- UL warnings (immediate)

---

---

# 8. CORE CALCULATIONS

## Daily Nutrient Totals

### Basic Aggregation
```javascript
function calculateDailyTotals(mealEntries, supplementEntries, date) {
  const totals = {};

  // Initialize all tracked nutrients to 0
  TRACKED_NUTRIENTS.forEach(nutrient => {
    totals[nutrient] = {
      amount: 0,
      unit: NUTRIENT_UNITS[nutrient],
      sources: {
        food: 0,
        supplement: 0
      }
    };
  });

  // Aggregate food entries
  mealEntries.forEach(entry => {
    const food = getFood(entry.foodId);
    const multiplier = entry.servingAmount / food.servingSize;

    Object.entries(food.nutrients).forEach(([nutrient, amount]) => {
      if (totals[nutrient]) {
        const contribution = amount * multiplier;
        totals[nutrient].amount += contribution;
        totals[nutrient].sources.food += contribution;
      }
    });
  });

  // Aggregate supplement entries
  supplementEntries.forEach(entry => {
    const supplement = getSupplement(entry.supplementId);
    const doseAmount = entry.dose;

    Object.entries(supplement.nutrients).forEach(([nutrient, amountPerDose]) => {
      if (totals[nutrient]) {
        const contribution = amountPerDose * entry.numberOfDoses;
        totals[nutrient].amount += contribution;
        totals[nutrient].sources.supplement += contribution;
      }
    });
  });

  return totals;
}
```

## Weekly Averages

### Rolling 7-Day Calculation
```javascript
function calculateWeeklyAverage(dailyTotals, endDate) {
  const nutrientSums = {};
  const nutrientCounts = {};

  // Sum last 7 days
  for (let i = 0; i < 7; i++) {
    const date = subtractDays(endDate, i);
    const dayTotals = dailyTotals[date];

    if (dayTotals) {
      Object.entries(dayTotals).forEach(([nutrient, data]) => {
        nutrientSums[nutrient] = (nutrientSums[nutrient] || 0) + data.amount;
        nutrientCounts[nutrient] = (nutrientCounts[nutrient] || 0) + 1;
      });
    }
  }

  // Calculate averages
  const averages = {};
  Object.entries(nutrientSums).forEach(([nutrient, sum]) => {
    averages[nutrient] = {
      average: sum / (nutrientCounts[nutrient] || 1),
      daysTracked: nutrientCounts[nutrient]
    };
  });

  return averages;
}
```

## Percentage Calculations

### Target Percentage
```javascript
function calculateTargetPercentage(intake, target) {
  if (!target || target === 0) return null;
  return Math.round((intake / target) * 100);
}

function getStatusFromPercentage(percentage, ul = null, intake = 0) {
  // Check UL first
  if (ul && intake > ul) {
    return { status: 'excess', color: 'magenta', severity: 'critical' };
  }
  if (ul && intake > ul * 0.8) {
    return { status: 'near-ul', color: 'purple', severity: 'warning' };
  }

  // Standard ranges
  if (percentage < 25) {
    return { status: 'critical-low', color: 'dark-red', severity: 'critical' };
  }
  if (percentage < 50) {
    return { status: 'low', color: 'red', severity: 'warning' };
  }
  if (percentage < 75) {
    return { status: 'suboptimal', color: 'orange', severity: 'attention' };
  }
  if (percentage < 90) {
    return { status: 'adequate', color: 'yellow', severity: 'good' };
  }
  if (percentage <= 110) {
    return { status: 'optimal', color: 'green', severity: 'excellent' };
  }
  if (percentage <= 150) {
    return { status: 'high', color: 'blue', severity: 'good' };
  }

  return { status: 'very-high', color: 'purple', severity: 'attention' };
}
```

## Recipe Nutrient Calculation

### Per-Serving Calculation
```javascript
function calculateRecipeNutrients(ingredients, numberOfServings) {
  const totals = {};

  // Sum all ingredients
  ingredients.forEach(ingredient => {
    const food = getFood(ingredient.foodId);
    const multiplier = ingredient.amount / food.servingSize;

    Object.entries(food.nutrients).forEach(([nutrient, amount]) => {
      totals[nutrient] = (totals[nutrient] || 0) + (amount * multiplier);
    });
  });

  // Divide by servings
  const perServing = {};
  Object.entries(totals).forEach(([nutrient, total]) => {
    perServing[nutrient] = {
      amount: total / numberOfServings,
      unit: NUTRIENT_UNITS[nutrient],
      totalRecipe: total
    };
  });

  return perServing;
}
```

## Serving Size Scaling

### Linear Scaling
```javascript
function scaleNutrients(baseNutrients, baseServing, targetServing) {
  const multiplier = targetServing / baseServing;

  const scaled = {};
  Object.entries(baseNutrients).forEach(([nutrient, amount]) => {
    scaled[nutrient] = amount * multiplier;
  });

  return scaled;
}

// Example: 100g → 150g
// scaleNutrients({ protein: 20, carbs: 30 }, 100, 150)
// Returns: { protein: 30, carbs: 45 }
```

## Net Electrolyte View

### Balance Calculation
```javascript
function calculateElectrolyteBalance(dailyTotals) {
  const sodium = dailyTotals.sodium?.amount || 0;
  const potassium = dailyTotals.potassium?.amount || 0;
  const magnesium = dailyTotals.magnesium?.amount || 0;
  const calcium = dailyTotals.calcium?.amount || 0;

  return {
    sodium,
    potassium,
    magnesium,
    calcium,
    naKRatio: sodium / (potassium || 1), // Sodium:Potassium ratio
    balance: {
      status: sodium > potassium * 2 ? 'imbalanced' : 'balanced',
      recommendation: sodium > potassium * 2 
        ? 'Increase potassium-rich foods'
        : 'Electrolyte balance is good'
    }
  };
}
```

## Confidence Score

### Data Quality Scoring
```javascript
function calculateConfidenceScore(foodEntry) {
  const food = getFood(foodEntry.foodId);
  let score = 0;
  let maxScore = 0;

  const factors = [
    { name: 'sourceReliability', weight: 30,
      score: food.source === 'USDA' ? 100 : food.source === 'branded' ? 70 : 50 },
    { name: 'completeness', weight: 25,
      score: (Object.keys(food.nutrients).length / TOTAL_TRACKED_NUTRIENTS) * 100 },
    { name: 'recency', weight: 20,
      score: food.lastUpdated > Date.now() - 31536000000 ? 100 : 70 },
    { name: 'verification', weight: 15,
      score: food.isVerified ? 100 : 50 },
    { name: 'sampleSize', weight: 10,
      score: food.numberOfSamples > 10 ? 100 : food.numberOfSamples > 1 ? 70 : 50 }
  ];

  factors.forEach(factor => {
    score += factor.score * factor.weight;
    maxScore += 100 * factor.weight;
  });

  const finalScore = score / maxScore;

  if (finalScore >= 0.8) return { level: 'high', score: finalScore };
  if (finalScore >= 0.6) return { level: 'medium', score: finalScore };
  if (finalScore >= 0.4) return { level: 'low', score: finalScore };
  return { level: 'estimated', score: finalScore };
}
```

## Bioavailability Adjustments

### Iron Absorption
```javascript
function calculateAbsorbedIron(intake, enhancers, inhibitors) {
  const { hemeIron, nonHemeIron } = intake;

  // Heme iron: 15-35% absorption
  const hemeAbsorption = hemeIron * 0.25; // 25% average

  // Non-heme iron: 2-20% absorption, affected by enhancers/inhibitors
  let nonHemeMultiplier = 0.10; // Base 10%

  // Enhancers
  if (enhancers.vitaminC > 25) nonHemeMultiplier += 0.05; // +5% with vitamin C
  if (enhancers.meatFactor) nonHemeMultiplier += 0.03;

  // Inhibitors
  if (inhibitors.phytates > 100) nonHemeMultiplier -= 0.03;
  if (inhibitors.polyphenols > 50) nonHemeMultiplier -= 0.02;
  if (inhibitors.calcium > 300) nonHemeMultiplier -= 0.02;

  // Clamp to realistic range
  nonHemeMultiplier = Math.max(0.02, Math.min(0.20, nonHemeMultiplier));

  const nonHemeAbsorption = nonHemeIron * nonHemeMultiplier;

  return {
    totalAbsorbed: hemeAbsorption + nonHemeAbsorption,
    hemeAbsorbed: hemeAbsorption,
    nonHemeAbsorbed: nonHemeAbsorption,
    absorptionRate: ((hemeAbsorption + nonHemeAbsorption) / (hemeIron + nonHemeIron)) * 100
  };
}
```

---

# 9. DATABASE & DATA MODEL

## Entity Relationship Overview

```
[users] 1---* [meal_entries]
      | 1---* [supplement_entries]
      | 1---* [recipes]
      | 1---* [symptom_logs]
      | 1---* [hydration_logs]
      | 1---* [goals]
      | 1---* [alerts]
      |
[foods] 1---* [food_nutrients] *---1 [nutrients]
      | 1---* [servings]
      |
[supplements] 1---* [supplement_nutrients] *---1 [nutrients]
      |
[recipes] 1---* [recipe_items] *---1 [foods]
      |
[nutrients] 1---* [nutrient_reference_values]
```

## Table Specifications

### 1. USERS
```sql
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
  life_stage VARCHAR(30) CHECK (life_stage IN ('none', 'pregnant_first', 'pregnant_second', 'pregnant_third', 'lactating', 'trying_to_conceive')),

  -- Activity & goals
  activity_level VARCHAR(30) CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  primary_goal VARCHAR(50),

  -- Dietary
  diet_types TEXT[], -- ['vegan', 'gluten_free']
  allergies TEXT[],
  health_priorities TEXT[],

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
```

### 2. FOODS
```sql
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  description TEXT,

  -- Source & quality
  data_source VARCHAR(50) NOT NULL, -- 'USDA', 'branded', 'user_submitted', 'calculated'
  source_id VARCHAR(100), -- Original ID from source
  data_quality_score DECIMAL(3,2), -- 0.00 to 1.00
  is_verified BOOLEAN DEFAULT false,

  -- Category
  category VARCHAR(100),
  subcategory VARCHAR(100),

  -- Serving info
  serving_size DECIMAL(10,3) NOT NULL,
  serving_unit VARCHAR(50) NOT NULL,
  serving_description VARCHAR(255), -- e.g., "1 cup, diced"

  -- Common measures (JSON for flexibility)
  common_measures JSONB, -- [{"amount": 1, "unit": "cup", "gram_weight": 240}]

  -- Nutrients (denormalized for performance)
  calories DECIMAL(8,2),
  protein_g DECIMAL(8,3),
  total_fat_g DECIMAL(8,3),
  carbohydrates_g DECIMAL(8,3),
  fiber_g DECIMAL(8,3),
  sugars_g DECIMAL(8,3),

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Search
  search_vector tsvector
);

CREATE INDEX idx_foods_name ON foods USING gin(to_tsvector('english', name));
CREATE INDEX idx_foods_brand ON foods(brand);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_source ON foods(data_source);
CREATE INDEX idx_foods_search ON foods USING gin(search_vector);
```

### 3. FOOD_NUTRIENTS (Detailed Nutrient Breakdown)
```sql
CREATE TABLE food_nutrients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  nutrient_id UUID NOT NULL REFERENCES nutrients(id),

  amount DECIMAL(10,4) NOT NULL,
  -- amount is per 100g of food

  data_points INTEGER, -- Number of samples
  derivation_code VARCHAR(20), -- How value was derived

  UNIQUE(food_id, nutrient_id)
);

CREATE INDEX idx_food_nutrients_food ON food_nutrients(food_id);
CREATE INDEX idx_food_nutrients_nutrient ON food_nutrients(nutrient_id);
```

### 4. NUTRIENTS (Master List)
```sql
CREATE TABLE nutrients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'vitamin', 'mineral', 'macro', 'amino_acid', 'other'

  -- Unit
  unit VARCHAR(20) NOT NULL, -- 'mg', 'mcg', 'IU', 'g'

  -- Display
  display_order INTEGER,
  is_displayed_default BOOLEAN DEFAULT true,
  icon_url TEXT,

  -- Description
  description TEXT,
  function_in_body TEXT,
  deficiency_symptoms TEXT,
  toxicity_symptoms TEXT,

  -- Food sources (top sources for recommendations)
  top_food_sources UUID[] REFERENCES foods(id),

  -- Meta
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nutrients_category ON nutrients(category);
CREATE INDEX idx_nutrients_display ON nutrients(display_order);
```

### 5. NUTRIENT_REFERENCE_VALUES (RDA/AI/UL by demographic)
```sql
CREATE TABLE nutrient_reference_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrient_id UUID NOT NULL REFERENCES nutrients(id),

  -- Demographics
  sex VARCHAR(20) CHECK (sex IN ('male', 'female', 'both')),
  age_min_months INTEGER NOT NULL,
  age_max_months INTEGER,

  -- Life stage modifiers
  is_pregnant BOOLEAN DEFAULT false,
  is_lactating BOOLEAN DEFAULT false,

  -- Values
  rda DECIMAL(10,4), -- NULL if only AI exists
  ai DECIMAL(10,4),  -- NULL if RDA exists
  ul DECIMAL(10,4),  -- NULL if no UL established
  ear DECIMAL(10,4), -- For statistical use

  -- Source
  reference_source VARCHAR(100), -- 'IOM_DRI_2011', etc.
  region VARCHAR(20) DEFAULT 'US', -- 'US', 'EU', 'UK', etc.

  -- Notes
  special_populations_notes TEXT,

  UNIQUE(nutrient_id, sex, age_min_months, age_max_months, is_pregnant, is_lactating, region)
);

CREATE INDEX idx_nrv_nutrient ON nutrient_reference_values(nutrient_id);
CREATE INDEX idx_nrv_demographic ON nutrient_reference_values(sex, age_min_months, age_max_months);
CREATE INDEX idx_nrv_region ON nutrient_reference_values(region);
```

### 6. MEAL_ENTRIES
```sql
CREATE TABLE meal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Entry details
  entry_date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Food reference
  food_id UUID NOT NULL REFERENCES foods(id),
  food_name_snapshot VARCHAR(255), -- In case food is later modified

  -- Serving
  serving_amount DECIMAL(10,3) NOT NULL,
  serving_unit VARCHAR(50) NOT NULL,

  -- Calculated nutrients (denormalized for performance)
  calculated_nutrients JSONB NOT NULL, -- { "nutrient_id": amount, ... }
  total_calories DECIMAL(8,2),

  -- Optional
  notes TEXT,

  -- Source
  entry_source VARCHAR(20) DEFAULT 'manual' CHECK (entry_source IN ('manual', 'recipe', 'meal_template', 'voice', 'imported')),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meal_entries_user_date ON meal_entries(user_id, entry_date);
CREATE INDEX idx_meal_entries_food ON meal_entries(food_id);
CREATE INDEX idx_meal_entries_type ON meal_entries(meal_type);
```

### 7. SUPPLEMENTS
```sql
CREATE TABLE supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  form VARCHAR(50), -- 'tablet', 'capsule', 'powder', 'liquid', 'gummy'

  -- Dosage
  serving_size VARCHAR(100), -- "2 capsules"
  dose_per_serving DECIMAL(10,4),
  dose_unit VARCHAR(20),

  -- Nutrients (per serving)
  nutrients JSONB NOT NULL, -- { "nutrient_id": amount, ... }

  -- Instructions
  directions TEXT,
  warnings TEXT,

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),

  -- Source
  upc VARCHAR(50),
  created_by UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supplements_name ON supplements(name);
CREATE INDEX idx_supplements_brand ON supplements(brand);
```

### 8. SUPPLEMENT_ENTRIES
```sql
CREATE TABLE supplement_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Supplement reference
  supplement_id UUID NOT NULL REFERENCES supplements(id),
  supplement_name_snapshot VARCHAR(255),

  -- Entry details
  entry_date DATE NOT NULL,
  taken_at TIMESTAMP,

  -- Dosage taken
  number_of_servings DECIMAL(4,2) DEFAULT 1,

  -- Calculated nutrients
  calculated_nutrients JSONB NOT NULL,

  -- Context
  taken_with_food BOOLEAN,
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supplement_entries_user_date ON supplement_entries(user_id, entry_date);
CREATE INDEX idx_supplement_entries_supplement ON supplement_entries(supplement_id);
```

### 9. RECIPES
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,

  -- Servings
  number_of_servings DECIMAL(4,1) NOT NULL,
  serving_description VARCHAR(100), -- "1 cup" or "1 slice"

  -- Calculated nutrients per serving
  nutrients_per_serving JSONB NOT NULL,
  calories_per_serving DECIMAL(8,2),

  -- Metadata
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  difficulty VARCHAR(20),
  tags TEXT[],

  -- Sharing
  is_public BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recipes_user ON recipes(user_id);
CREATE INDEX idx_recipes_public ON recipes(is_public) WHERE is_public = true;
```

### 10. RECIPE_ITEMS
```sql
CREATE TABLE recipe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  -- Food reference
  food_id UUID NOT NULL REFERENCES foods(id),
  food_name_snapshot VARCHAR(255),

  -- Amount
  amount DECIMAL(10,3) NOT NULL,
  unit VARCHAR(50) NOT NULL,

  -- Optional
  notes TEXT,
  order_index INTEGER
);

CREATE INDEX idx_recipe_items_recipe ON recipe_items(recipe_id);
```

### 11. USER_GOALS
```sql
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nutrient_id UUID NOT NULL REFERENCES nutrients(id),

  -- Goal values
  target_amount DECIMAL(10,4),
  min_amount DECIMAL(10,4),
  max_amount DECIMAL(10,4),

  -- Is this a custom override?
  is_custom BOOLEAN DEFAULT false,
  custom_reason TEXT,

  -- Active period
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, nutrient_id, effective_from)
);

CREATE INDEX idx_user_goals_user ON user_goals(user_id);
```

### 12. ALERTS
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Alert details
  alert_type VARCHAR(50) NOT NULL, -- 'low_intake', 'high_intake', 'ul_approaching', 'pattern_detected'
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low', 'info')),

  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Related data
  related_nutrient_id UUID REFERENCES nutrients(id),
  related_date DATE,

  -- Action
  action_type VARCHAR(50), -- 'view_nutrient', 'add_food', 'none'
  action_payload JSONB,

  -- Status
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP,

  -- Timing
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,

  -- Snooze
  snoozed_until TIMESTAMP
);

CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_unread ON alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_alerts_priority ON alerts(priority);
```

### 13. SYMPTOM_LOGS
```sql
CREATE TABLE symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  log_date DATE NOT NULL,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Symptoms (predefined list + custom)
  symptoms TEXT[], -- ['fatigue', 'headache', 'muscle_cramps']
  custom_symptoms TEXT[],

  -- Severity (1-10)
  overall_severity INTEGER CHECK (overall_severity BETWEEN 1 AND 10),

  -- Context
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_hours DECIMAL(4,1),

  -- Notes
  notes TEXT,

  -- Correlation (filled later by analysis)
  potential_nutrient_correlations UUID[]
);

CREATE INDEX idx_symptom_logs_user_date ON symptom_logs(user_id, log_date);
```

### 14. HYDRATION_LOGS
```sql
CREATE TABLE hydration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  log_date DATE NOT NULL,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  amount_ml DECIMAL(8,2) NOT NULL,

  -- Type
  beverage_type VARCHAR(50) DEFAULT 'water', -- 'water', 'coffee', 'tea', 'juice', 'soda', 'sports_drink'

  -- Optional electrolyte content (if known)
  sodium_mg DECIMAL(6,2),
  potassium_mg DECIMAL(6,2),

  notes TEXT
);

CREATE INDEX idx_hydration_logs_user_date ON hydration_logs(user_id, log_date);
```

### 15. DAILY_SUMMARIES (Materialized for performance)
```sql
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,

  -- Aggregated data
  total_calories DECIMAL(8,2),
  total_nutrients JSONB NOT NULL, -- All nutrients with amounts
  target_percentages JSONB NOT NULL, -- All nutrients with % of target

  -- Sources
  food_calories DECIMAL(8,2),
  supplement_calories DECIMAL(8,2),

  -- Scores
  nutrient_score INTEGER, -- 0-100
  meals_logged INTEGER,
  supplements_logged INTEGER,

  -- Hydration
  total_water_ml DECIMAL(8,2),

  -- Generated insights
  insights JSONB, -- Array of insight objects

  -- Status
  is_complete BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, summary_date)
);

CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, summary_date);
CREATE INDEX idx_daily_summaries_date ON daily_summaries(summary_date);
```

---

---

# 10. FOOD AND NUTRIENT DATA SOURCES

## Primary Data Sources

### 1. USDA FoodData Central (US)
**URL**: https://fdc.nal.usda.gov/

**Strengths**:
- 350,000+ foods
- 150+ nutrients per food (most comprehensive)
- Regularly updated
- Free API access
- Standard reference foods (analytically measured)

**Data Types**:
- Foundation Foods: Analytically measured, ~1,000 items
- SR Legacy: Standard Reference, ~7,800 items
- Survey Foods: FNDDS, ~10,000 items (what people actually eat)
- Branded Foods: ~300,000 items from manufacturers

**Integration Strategy**:
- Primary source for all nutrient data
- Download full database monthly
- Use API for real-time branded food search
- Cache frequently accessed foods

**API Limits**:
- 3,600 requests/hour (free tier)
- Rate limit: 1 request/second sustained

### 2. Food Standards Australia New Zealand (FSANZ)
**URL**: https://www.foodstandards.gov.au/science/monitoringnutrients/ausnut/

**Strengths**:
- Australian-specific foods
- High-quality analytical data
- ~5,300 foods

**Use Case**: Primary for AU/NZ users

### 3. EuroFIR (EU)
**URL**: https://www.eurofir.org/

**Strengths**:
- European food composition data
- 27 EU countries
- Standardized formats

**Use Case**: Primary for EU users

### 4. McCance and Widdowson's Composition of Foods (UK)
**URL**: https://www.gov.uk/government/collections/mccance-and-widdowsons-composition-of-foods-integrated-dataset

**Strengths**:
- UK-specific
- Historically authoritative
- ~3,000 foods

**Use Case**: Primary for UK users

## Data Normalization Strategy

### Nutrient Name Mapping
```javascript
const NUTRIENT_NAME_MAP = {
  // USDA names → Internal standard
  'Vitamin A, RAE': 'vitamin_a_rae',
  'Vitamin A, IU': 'vitamin_a_iu',
  'Vitamin C, total ascorbic acid': 'vitamin_c',
  'Vitamin D (D2 + D3)': 'vitamin_d',
  'Vitamin E (alpha-tocopherol)': 'vitamin_e',
  'Vitamin K (phylloquinone)': 'vitamin_k',
  'Thiamin': 'thiamin',
  'Riboflavin': 'riboflavin',
  'Niacin': 'niacin',
  'Vitamin B-6': 'vitamin_b6',
  'Folate, total': 'folate',
  'Folic acid': 'folic_acid',
  'Folate, food': 'folate_food',
  'Folate, DFE': 'folate_dfe',
  'Vitamin B-12': 'vitamin_b12',
  'Pantothenic acid': 'pantothenic_acid',
  'Choline, total': 'choline',

  // Minerals
  'Calcium, Ca': 'calcium',
  'Iron, Fe': 'iron',
  'Magnesium, Mg': 'magnesium',
  'Phosphorus, P': 'phosphorus',
  'Potassium, K': 'potassium',
  'Sodium, Na': 'sodium',
  'Zinc, Zn': 'zinc',
  'Copper, Cu': 'copper',
  'Manganese, Mn': 'manganese',
  'Selenium, Se': 'selenium',
  'Fluoride, F': 'fluoride',
  'Iodine, I': 'iodine',

  // Macros
  'Protein': 'protein',
  'Total lipid (fat)': 'total_fat',
  'Carbohydrate, by difference': 'carbohydrates',
  'Fiber, total dietary': 'fiber',
  'Sugars, total including NLEA': 'sugars',
  'Fatty acids, total saturated': 'saturated_fat',
  'Fatty acids, total monounsaturated': 'monounsaturated_fat',
  'Fatty acids, total polyunsaturated': 'polyunsaturated_fat',
  'Cholesterol': 'cholesterol',

  // Omega fatty acids
  '18:3 n-3 (ALA)': 'omega_3_ala',
  '20:5 n-3 (EPA)': 'omega_3_epa',
  '22:6 n-3 (DHA)': 'omega_3_dha',
  '18:2 n-6 (LA)': 'omega_6_la',

  // Amino acids
  'Tryptophan': 'tryptophan',
  'Threonine': 'threonine',
  'Isoleucine': 'isoleucine',
  'Leucine': 'leucine',
  'Lysine': 'lysine',
  'Methionine': 'methionine',
  'Phenylalanine': 'phenylalanine',
  'Valine': 'valine',
  'Histidine': 'histidine'
};
```

### Unit Standardization
```javascript
const UNIT_CONVERSIONS = {
  // All internal units
  'vitamin_a': 'mcg_rae', // Retinol Activity Equivalents
  'vitamin_d': 'mcg', // micrograms (not IU)
  'vitamin_e': 'mg', // alpha-tocopherol
  'vitamin_k': 'mcg',
  'vitamin_c': 'mg',
  'thiamin': 'mg',
  'riboflavin': 'mg',
  'niacin': 'mg_ne', // Niacin Equivalents
  'vitamin_b6': 'mg',
  'folate': 'mcg_dfe', // Dietary Folate Equivalents
  'vitamin_b12': 'mcg',
  'pantothenic_acid': 'mg',
  'biotin': 'mcg',
  'choline': 'mg',

  'calcium': 'mg',
  'iron': 'mg',
  'magnesium': 'mg',
  'phosphorus': 'mg',
  'potassium': 'mg',
  'sodium': 'mg',
  'zinc': 'mg',
  'copper': 'mcg',
  'manganese': 'mg',
  'selenium': 'mcg',
  'iodine': 'mcg',
  'fluoride': 'mg',

  'protein': 'g',
  'carbohydrates': 'g',
  'fiber': 'g',
  'sugars': 'g',
  'total_fat': 'g',
  'saturated_fat': 'g',
  'monounsaturated_fat': 'g',
  'polyunsaturated_fat': 'g',
  'cholesterol': 'mg',

  'omega_3_ala': 'g',
  'omega_3_epa': 'g',
  'omega_3_dha': 'g',
  'omega_6_la': 'g',

  'caffeine': 'mg'
};
```

## Duplicate Food Handling

### Deduplication Strategy
```javascript
function findDuplicateFoods(food1, food2) {
  const similarityScore = calculateSimilarity(food1, food2);

  // High similarity threshold
  if (similarityScore > 0.95) {
    return {
      isDuplicate: true,
      confidence: 'high',
      action: 'merge'
    };
  }

  // Medium similarity - flag for review
  if (similarityScore > 0.80) {
    return {
      isDuplicate: 'possible',
      confidence: 'medium',
      action: 'flag_for_review'
    };
  }

  return { isDuplicate: false };
}

function calculateSimilarity(food1, food2) {
  let score = 0;
  let weights = 0;

  // Name similarity (Jaro-Winkler)
  const nameSim = jaroWinkler(food1.name, food2.name);
  score += nameSim * 40;
  weights += 40;

  // Brand match
  if (food1.brand && food2.brand) {
    score += (food1.brand === food2.brand ? 100 : 0) * 20;
    weights += 20;
  }

  // Calorie similarity (within 10%)
  if (food1.calories && food2.calories) {
    const calDiff = Math.abs(food1.calories - food2.calories) / food1.calories;
    score += (calDiff < 0.1 ? 100 : 0) * 20;
    weights += 20;
  }

  // Category match
  if (food1.category === food2.category) {
    score += 100 * 10;
    weights += 10;
  }

  // UPC match (definitive)
  if (food1.upc && food2.upc && food1.upc === food2.upc) {
    return 1.0; // Exact match
  }

  return score / weights;
}
```

## Data Quality Maintenance

### Quality Scoring Algorithm
```javascript
function calculateDataQuality(food) {
  let score = 0;

  // Source reliability (0-30 points)
  const sourceScores = {
    'USDA_foundation': 30,
    'USDA_sr_legacy': 28,
    'USDA_fndds': 25,
    'USDA_branded': 22,
    'government_other': 25,
    'manufacturer': 20,
    'user_submitted_verified': 18,
    'user_submitted': 12,
    'calculated': 15,
    'estimated': 8
  };
  score += sourceScores[food.dataSource] || 10;

  // Nutrient completeness (0-25 points)
  const essentialNutrients = ['calories', 'protein', 'carbs', 'fat', 'fiber', 
    'calcium', 'iron', 'vitamin_c', 'vitamin_a', 'sodium'];
  const hasEssential = essentialNutrients.filter(n => food.nutrients[n] !== null).length;
  score += (hasEssential / essentialNutrients.length) * 25;

  // Additional nutrients (0-20 points)
  const additionalNutrients = ['vitamin_d', 'vitamin_e', 'vitamin_k', 'b_vitamins', 
    'magnesium', 'zinc', 'potassium'];
  const hasAdditional = additionalNutrients.filter(n => food.nutrients[n] !== null).length;
  score += (hasAdditional / additionalNutrients.length) * 20;

  // Recency (0-15 points)
  const ageInYears = (Date.now() - food.lastUpdated) / (365 * 24 * 60 * 60 * 1000);
  if (ageInYears < 1) score += 15;
  else if (ageInYears < 3) score += 10;
  else if (ageInYears < 5) score += 5;

  // Verification status (0-10 points)
  if (food.isVerified) score += 10;
  else if (food.verificationPending) score += 5;

  return Math.round(score);
}
```

### Versioning Strategy
```sql
-- Track nutrient reference updates
CREATE TABLE nutrient_reference_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_name VARCHAR(100) NOT NULL, -- 'DRI_2011', 'DRI_2019_update'
  effective_date DATE NOT NULL,
  region VARCHAR(20) NOT NULL,
  description TEXT,
  is_current BOOLEAN DEFAULT false
);

-- Historical user targets
CREATE TABLE user_goal_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  nutrient_id UUID REFERENCES nutrients(id),
  target_amount DECIMAL(10,4),
  effective_from DATE,
  effective_until DATE,
  reason_for_change TEXT
);
```

---

# 11. RULE-BASED GUIDANCE FEATURES

## Feature 1: Smart Meal Logging

### Input
- User's meal type (breakfast, lunch, dinner, snack)
- Recently logged foods
- Time of day
- User's diet type

### Rule Logic
```javascript
function suggestMealStructure(user, mealType) {
  const suggestions = {
    foods: [],
    categories: [],
    message: ''
  };

  // Time-based suggestions
  const hour = new Date().getHours();

  if (mealType === 'breakfast') {
    suggestions.categories = ['grains', 'dairy', 'fruit', 'protein'];
    suggestions.message = 'A balanced breakfast includes whole grains, protein, and fruit.';

    // Suggest based on gaps
    const gaps = getNutrientGaps(user, 'morning');
    if (gaps.includes('fiber')) {
      suggestions.foods.push({ name: 'Oatmeal', reason: 'High in fiber' });
    }
    if (gaps.includes('vitamin_c')) {
      suggestions.foods.push({ name: 'Orange juice', reason: 'Vitamin C boost' });
    }
  }

  if (mealType === 'dinner') {
    suggestions.categories = ['vegetables', 'protein', 'grains'];
    suggestions.message = 'Fill half your plate with vegetables.';

    // Evening nutrient gaps
    const gaps = getNutrientGaps(user, 'evening');
    if (gaps.includes('magnesium')) {
      suggestions.foods.push({ name: 'Salmon', reason: 'Magnesium for sleep' });
    }
  }

  // Diet-specific adjustments
  if (user.dietTypes.includes('vegan')) {
    suggestions.foods.push({ name: 'Nutritional yeast', reason: 'B12 fortification' });
  }

  return suggestions;
}
```

### UX
- Show category suggestions as chips
- Display 3-5 specific food suggestions with reasons
- "Add to meal" quick action

---

## Feature 2: Nutrient Gap Recommendations

### Input
- Current daily totals
- User targets
- Foods already logged today
- User diet preferences

### Rule Logic
```javascript
function generateGapRecommendations(user, currentTotals, targets) {
  const recommendations = [];

  // Identify gaps (< 50% of target)
  const gaps = Object.entries(targets)
    .filter(([nutrient, target]) => {
      const current = currentTotals[nutrient]?.amount || 0;
      return (current / target.rda) < 0.5;
    })
    .sort((a, b) => (currentTotals[a[0]]?.amount / a[1].rda) - (currentTotals[b[0]]?.amount / b[1].rda));

  // Top 3 gaps
  const topGaps = gaps.slice(0, 3);

  topGaps.forEach(([nutrient, target]) => {
    const current = currentTotals[nutrient]?.amount || 0;
    const needed = target.rda - current;

    // Get top food sources for this nutrient
    const topSources = getTopFoodSources(nutrient, {
      excludeAllergens: user.allergies,
      respectDiet: user.dietTypes,
      limit: 3
    });

    recommendations.push({
      nutrient: nutrient,
      displayName: NUTRIENT_DISPLAY_NAMES[nutrient],
      current: current,
      target: target.rda,
      percentage: Math.round((current / target.rda) * 100),
      needed: needed,
      importance: getNutrientImportance(nutrient, user),
      topFoods: topSources,
      quickTip: getQuickTip(nutrient)
    });
  });

  return recommendations;
}

function getTopFoodSources(nutrient, filters) {
  // Query foods high in nutrient
  // Filter by diet type and allergens
  // Sort by nutrient density (amount per 100 calories)
  // Return top 3 with serving suggestions

  const sources = queryFoods({
    nutrient: nutrient,
    minAmount: NUTRIENT_RICH_THRESHOLDS[nutrient],
    excludeAllergens: filters.excludeAllergens,
    dietTypes: filters.respectDiet
  });

  return sources.slice(0, filters.limit).map(food => ({
    name: food.name,
    amount: food.nutrients[nutrient],
    unit: food.unit,
    serving: food.servingDescription,
    calories: food.calories,
    nutrientDensity: food.nutrients[nutrient] / food.calories
  }));
}
```

### UX
- Card per gap with:
  - Nutrient name + icon
  - Progress bar (current/target)
  - "You need X more mg"
  - 3 food suggestions with "Add" buttons
  - "Why it matters" expandable

---

## Feature 3: Supplement Safety Nudges

### Input
- Current supplement entries
- Current food-derived nutrients
- User targets and ULs
- User demographics (age, sex, pregnancy)

### Rule Logic
```javascript
function checkSupplementSafety(user, supplements, foodTotals) {
  const warnings = [];

  supplements.forEach(supplement => {
    Object.entries(supplement.nutrients).forEach(([nutrient, amount]) => {
      const foodAmount = foodTotals[nutrient]?.amount || 0;
      const totalAmount = foodAmount + amount;
      const ul = getUL(nutrient, user);

      // Approaching UL
      if (ul && totalAmount > ul * 0.8 && totalAmount <= ul) {
        warnings.push({
          type: 'approaching_ul',
          priority: 'high',
          nutrient: nutrient,
          message: `${nutrient} is at ${Math.round((totalAmount/ul)*100)}% of the upper safe limit.`,
          action: 'Consider reducing dose',
          currentAmount: totalAmount,
          ul: ul
        });
      }

      // Exceeds UL
      if (ul && totalAmount > ul) {
        warnings.push({
          type: 'exceeds_ul',
          priority: 'critical',
          nutrient: nutrient,
          message: `${nutrient} exceeds the safe upper limit. Please consult a healthcare provider.`,
          action: 'Reduce or discontinue',
          currentAmount: totalAmount,
          ul: ul,
          excessAmount: totalAmount - ul
        });
      }

      // Pregnancy-specific warnings
      if (user.isPregnant) {
        if (nutrient === 'vitamin_a' && totalAmount > 3000) { // 3000 mcg RAE UL for pregnancy
          warnings.push({
            type: 'pregnancy_warning',
            priority: 'critical',
            nutrient: nutrient,
            message: 'High vitamin A can be harmful during pregnancy.',
            action: 'Switch to beta-carotene source'
          });
        }

        if (nutrient === 'iron' && supplement.numberOfDoses > 1) {
          const existingIronWarning = warnings.find(w => w.nutrient === 'iron' && w.type === 'constipation_risk');
          if (!existingIronWarning) {
            warnings.push({
              type: 'constipation_risk',
              priority: 'medium',
              nutrient: nutrient,
              message: 'High iron supplements may cause constipation.',
              action: 'Take with plenty of water and fiber'
            });
          }
        }
      }
    });
  });

  // Interaction checks
  const interactionWarnings = checkSupplementInteractions(supplements);
  warnings.push(...interactionWarnings);

  return warnings;
}

function checkSupplementInteractions(supplements) {
  const warnings = [];
  const supplementNames = supplements.map(s => s.name.toLowerCase());

  // Calcium + Iron
  const hasCalcium = supplements.some(s => s.nutrients.calcium > 0);
  const hasIron = supplements.some(s => s.nutrients.iron > 0);

  if (hasCalcium && hasIron) {
    warnings.push({
      type: 'interaction',
      priority: 'medium',
      message: 'Calcium reduces iron absorption.',
      action: 'Take iron 2 hours before or after calcium'
    });
  }

  // Vitamin D + K2 synergy
  const hasVitaminD = supplements.some(s => s.nutrients.vitamin_d > 0);
  const hasK2 = supplements.some(s => s.nutrients.vitamin_k2 > 0);

  if (hasVitaminD && !hasK2) {
    warnings.push({
      type: 'optimization',
      priority: 'low',
      message: 'Vitamin K2 helps direct calcium with vitamin D.',
      action: 'Consider adding K2'
    });
  }

  return warnings;
}
```

### UX
- Warning banner at top of supplement screen
- Red/yellow indicator on affected supplements
- Expandable details with explanation
- "Dismiss" option for acknowledged warnings

---

## Feature 4: Meal Suggestions Based on Gaps

### Input
- Current daily nutrient status
- Remaining calorie budget (if applicable)
- User food preferences/history
- Time of day

### Rule Logic
```javascript
function suggestMealsToFillGaps(user, currentTotals, targets, remainingCalories) {
  const suggestions = [];

  // Find critical gaps
  const criticalGaps = Object.entries(targets)
    .filter(([nutrient, target]) => {
      const current = currentTotals[nutrient]?.amount || 0;
      return (current / target.rda) < 0.5;
    })
    .map(([nutrient]) => nutrient);

  if (criticalGaps.length === 0) {
    return {
      message: 'Great job! You're meeting most nutrient targets.',
      suggestions: []
    };
  }

  // Find meals/recipes that address multiple gaps
  const candidateMeals = getUserMealsAndRecipes(user);

  candidateMeals.forEach(meal => {
    const mealNutrients = meal.nutrients;
    let gapsFilled = 0;
    let gapScore = 0;

    criticalGaps.forEach(gap => {
      if (mealNutrients[gap] > (targets[gap].rda * 0.2)) {
        gapsFilled++;
        gapScore += mealNutrients[gap] / targets[gap].rda;
      }
    });

    if (gapsFilled > 0) {
      suggestions.push({
        meal: meal,
        gapsFilled: gapsFilled,
        gapScore: gapScore,
        calories: meal.calories,
        efficiency: gapScore / meal.calories // Nutrients per calorie
      });
    }
  });

  // Sort by efficiency and return top 3
  return suggestions
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 3);
}
```

### UX
- "Suggested for you" section on home screen
- Card per suggestion showing:
  - Meal name + image
  - Gaps it addresses (icons)
  - Calories
  - "Log this meal" button

---

## Feature 5: Weekly Summary Generator

### Input
- 7 days of meal entries
- 7 days of supplement entries
- User targets
- Previous week's summary (for comparison)

### Rule Logic
```javascript
function generateWeeklySummary(user, weekData) {
  const summary = {
    period: { start: weekData.startDate, end: weekData.endDate },
    overallScore: 0,
    highlights: [],
    concerns: [],
    improvements: [],
    comparisons: {}
  };

  // Calculate weekly averages
  const averages = {};
  Object.keys(weekData.dailyTotals[0]).forEach(nutrient => {
    const sum = weekData.dailyTotals.reduce((acc, day) => acc + (day[nutrient]?.amount || 0), 0);
    averages[nutrient] = sum / 7;
  });

  // Overall score
  summary.overallScore = calculateNutrientScore(averages, user.targets);

  // Highlights (consistently good)
  Object.entries(averages).forEach(([nutrient, avg]) => {
    const target = user.targets[nutrient]?.rda;
    if (target && avg >= target * 0.9 && avg <= target * 1.1) {
      summary.highlights.push({
        nutrient: nutrient,
        message: `You met your ${nutrient} target every day this week!`,
        average: avg,
        target: target
      });
    }
  });

  // Concerns (consistently low)
  Object.entries(averages).forEach(([nutrient, avg]) => {
    const target = user.targets[nutrient]?.rda;
    if (target && avg < target * 0.5) {
      const daysLow = weekData.dailyTotals.filter(day => 
        (day[nutrient]?.amount || 0) < target * 0.5
      ).length;

      summary.concerns.push({
        nutrient: nutrient,
        message: `${nutrient} was low ${daysLow} out of 7 days`,
        average: avg,
        target: target,
        daysLow: daysLow,
        recommendation: getTopFoodSources(nutrient, { limit: 3 })
      });
    }
  });

  // Improvements (vs last week)
  if (weekData.previousWeek) {
    Object.entries(averages).forEach(([nutrient, avg]) => {
      const prevAvg = weekData.previousWeek.averages[nutrient];
      if (prevAvg && avg > prevAvg * 1.2) {
        summary.improvements.push({
          nutrient: nutrient,
          message: `${nutrient} improved ${Math.round(((avg - prevAvg) / prevAvg) * 100)}%`,
          previous: prevAvg,
          current: avg
        });
      }
    });
  }

  // Day-of-week patterns
  const dayPatterns = analyzeDayOfWeekPatterns(weekData.dailyTotals);
  if (dayPatterns.weekendDrop) {
    summary.concerns.push({
      type: 'pattern',
      message: 'Your nutrient intake drops by average 25% on weekends',
      recommendation: 'Try to maintain consistent eating patterns'
    });
  }

  return summary;
}
```

### UX
- Email/app notification with summary
- Visual report card (A-F grading)
- Trend arrows (improving/declining)
- Action items for next week
- Share button for social

---

# 12. ALERTS & INSIGHT ENGINE

## Alert Priority System

### Priority Levels
```javascript
const ALERT_PRIORITIES = {
  CRITICAL: {
    level: 1,
    color: '#D32F2F',
    icon: 'alert-octagon',
    requiresAcknowledgment: true,
    pushNotification: true,
    emailNotification: true,
    displayLocation: ['home', 'dashboard', 'insights']
  },
  HIGH: {
    level: 2,
    color: '#F44336',
    icon: 'alert-circle',
    requiresAcknowledgment: false,
    pushNotification: true,
    emailNotification: false,
    displayLocation: ['home', 'dashboard', 'insights']
  },
  MEDIUM: {
    level: 3,
    color: '#FF9800',
    icon: 'alert-triangle',
    requiresAcknowledgment: false,
    pushNotification: false,
    emailNotification: false,
    displayLocation: ['dashboard', 'insights']
  },
  LOW: {
    level: 4,
    color: '#FFC107',
    icon: 'info',
    requiresAcknowledgment: false,
    pushNotification: false,
    emailNotification: false,
    displayLocation: ['insights']
  },
  INFO: {
    level: 5,
    color: '#2196F3',
    icon: 'info',
    requiresAcknowledgment: false,
    pushNotification: false,
    emailNotification: false,
    displayLocation: ['insights']
  }
};
```

## Alert Types & Triggers

### 1. Critical Nutrient Excess (UL Exceeded)
**Trigger**: Any nutrient intake > UL
**Frequency**: Immediate
**Example**: "Your vitamin A intake today is 4,500 mcg, exceeding the safe upper limit of 3,000 mcg."
**Action**: Immediate notification, require acknowledgment

### 2. Approaching UL Warning
**Trigger**: Nutrient intake > 80% of UL
**Frequency**: Once per day per nutrient
**Example**: "You're at 85% of the safe upper limit for zinc."
**Action**: Dashboard warning

### 3. Consistent Deficiency Pattern
**Trigger**: Same nutrient < 50% target for 5+ days in 7
**Frequency**: Weekly
**Example**: "You've been low in magnesium 5 of the last 7 days."
**Action**: Weekly report, food suggestions

### 4. Single Day Severe Deficiency
**Trigger**: Any essential nutrient < 25% target
**Frequency**: End of day
**Example**: "Your calcium intake today was only 180mg (18% of target)."
**Action**: End-of-day summary

### 5. Electrolyte Imbalance
**Trigger**: Sodium:Potassium ratio > 3:1
**Frequency**: Daily if condition persists
**Example**: "Your sodium is 3x your potassium. Consider more fruits and vegetables."
**Action**: Dashboard insight

### 6. Omega-6:3 Ratio Imbalance
**Trigger**: Ratio > 10:1 for 3+ days
**Frequency**: Weekly
**Example**: "Your omega-6:3 ratio is 15:1. Aim for closer to 4:1."
**Action**: Weekly insights

### 7. Hydration Alert
**Trigger**: Water intake < 50% of goal by 6 PM
**Frequency**: Daily
**Example**: "You've only logged 800ml of water today."
**Action**: Push notification

### 8. Supplement Timing Reminder
**Trigger**: Scheduled supplement not logged by expected time
**Frequency**: Per supplement schedule
**Example**: "Time for your vitamin D supplement."
**Action**: Push notification

## Insight Generation Rules

### Pattern Detection
```javascript
function detectPatterns(user, daysOfData) {
  const patterns = [];

  // Weekend vs weekday pattern
  const weekdayAvg = calculateAverageForDays(daysOfData, [1,2,3,4,5]);
  const weekendAvg = calculateAverageForDays(daysOfData, [0,6]);

  Object.keys(weekdayAvg).forEach(nutrient => {
    const drop = (weekdayAvg[nutrient] - weekendAvg[nutrient]) / weekdayAvg[nutrient];
    if (drop > 0.3) {
      patterns.push({
        type: 'weekend_drop',
        nutrient: nutrient,
        severity: drop > 0.5 ? 'high' : 'medium',
        message: `Your ${nutrient} intake drops ${Math.round(drop * 100)}% on weekends`
      });
    }
  });

  // Meal timing pattern
  const breakfastNutrients = daysOfData.filter(d => d.meals.breakfast).length;
  if (breakfastNutrients < daysOfData.length * 0.5) {
    patterns.push({
      type: 'skipped_meals',
      meal: 'breakfast',
      message: 'You skip breakfast 50% of the time'
    });
  }

  // Supplement adherence
  const scheduledSupplements = user.supplementSchedule;
  scheduledSupplements.forEach(supplement => {
    const adherence = calculateAdherence(supplement, daysOfData);
    if (adherence < 0.7) {
      patterns.push({
        type: 'low_adherence',
        supplement: supplement.name,
        adherence: adherence,
        message: `You're only taking ${supplement.name} ${Math.round(adherence * 100)}% of the time`
      });
    }
  });

  return patterns;
}
```

## Alert Dismissal & Snooze Logic

```javascript
function handleAlertAction(alert, action, user) {
  switch (action) {
    case 'dismiss':
      alert.isDismissed = true;
      alert.dismissedAt = new Date();

      // Don't show again for this nutrient for 24 hours
      createDismissalRule(user, alert.nutrient, 24);
      break;

    case 'snooze':
      alert.snoozedUntil = addHours(new Date(), 4); // 4 hour snooze
      break;

    case 'snooze_day':
      alert.snoozedUntil = endOfDay(new Date());
      break;

    case 'acknowledge':
      alert.isRead = true;
      alert.acknowledgedAt = new Date();
      break;

    case 'take_action':
      // Navigate to relevant screen
      return {
        navigateTo: alert.actionPayload.screen,
        params: alert.actionPayload.params
      };
  }
}
```

## False Positive Prevention

### Strategies
1. **Minimum data threshold**: Don't generate alerts until 3+ days of data
2. **Confirmation period**: Require pattern to persist for 3+ days
3. **User feedback**: "Was this alert helpful?" to train system
4. **Context awareness**: Don't alert on days with < 50% food logging
5. **UL grace period**: Allow occasional UL exceedance (1-2x/week)

### Confidence Scoring
```javascript
function calculateAlertConfidence(alert, userHistory) {
  let confidence = 1.0;

  // Reduce confidence if user frequently dismisses this alert type
  const dismissalRate = getDismissalRate(userHistory, alert.type);
  confidence *= (1 - dismissalRate * 0.5);

  // Reduce confidence if data is sparse
  const dataCompleteness = calculateDataCompleteness(userHistory);
  confidence *= dataCompleteness;

  // Reduce confidence if it's a single-day anomaly
  if (alert.type === 'single_day_low' && !isPartOfPattern(alert, userHistory)) {
    confidence *= 0.7;
  }

  return confidence;
}
```

---

---

# 13. TECHNICAL STACK RECOMMENDATION

## Option Analysis

### Option 1: React Native + Node.js + PostgreSQL
**Mobile**: React Native (iOS + Android)
**Web**: React (shared components)
**Backend**: Node.js + Express
**Database**: PostgreSQL
**Hosting**: AWS/GCP

**Pros**:
- 70-80% code sharing mobile/web
- Large talent pool
- Mature ecosystem
- Strong TypeScript support

**Cons**:
- React Native performance gaps
- Two separate app stores

### Option 2: Flutter + Firebase
**Mobile/Web**: Flutter
**Backend**: Firebase (Firestore, Functions)
**Database**: Firestore

**Pros**:
- Single codebase all platforms
- Fast UI rendering
- Google's backing

**Cons**:
- Smaller talent pool
- Firebase vendor lock-in
- Limited complex querying

### Option 3: PWA + React + Node.js + PostgreSQL
**All Platforms**: Progressive Web App
**Backend**: Node.js + Express
**Database**: PostgreSQL

**Pros**:
- Single codebase
- No app store approval
- Instant updates
- Lower maintenance

**Cons**:
- Limited native features
- iOS restrictions
- Discoverability challenges

## Recommended Stack: React Native + Node.js + PostgreSQL

### Justification
1. **Nutrition apps require precision** - Native performance matters for calculations
2. **Offline capability critical** - Users log meals without internet
3. **Health data sensitivity** - Self-hosted PostgreSQL > Firebase
4. **Long-term maintainability** - Largest developer community
5. **Scalability** - Proven at scale

## Detailed Stack

### Frontend (Mobile)
```
Framework: React Native 0.72+
Language: TypeScript 5.0+
Navigation: React Navigation 6
State Management: Zustand + React Query
Forms: React Hook Form + Zod
Charts: Victory Native + React Native SVG
Storage: MMKV (fast key-value)
Offline: Redux Persist + NetInfo
```

### Frontend (Web - Admin/Dashboard)
```
Framework: Next.js 14 (App Router)
Language: TypeScript
Styling: Tailwind CSS
Components: shadcn/ui + Radix
Charts: Recharts
State: Zustand + React Query
```

### Backend
```
Runtime: Node.js 20 LTS
Framework: Express.js 4.18+
Language: TypeScript
API: REST + GraphQL (Apollo)
Authentication: JWT + Refresh tokens
Validation: Zod
Documentation: OpenAPI/Swagger
```

### Database
```
Primary: PostgreSQL 15+
Extensions: 
  - pg_trgm (fuzzy search)
  - postgis (if location features)
  - uuid-ossp
Cache: Redis 7+
  - Session store
  - Rate limiting
  - Query caching
Search: Elasticsearch (optional v2)
```

### Infrastructure
```
Cloud: AWS (primary) or GCP
Compute: ECS Fargate (containers)
Database: RDS PostgreSQL
Cache: ElastiCache Redis
Storage: S3 (images, exports)
CDN: CloudFront
DNS: Route 53
CI/CD: GitHub Actions
Monitoring: Datadog or New Relic
```

### DevOps
```
Containerization: Docker
Orchestration: ECS (simpler) or EKS
IaC: Terraform
CI/CD: GitHub Actions
Testing: Jest, React Testing Library, Detox (E2E)
```

---

# 14. API DESIGN

## Authentication Endpoints

### POST /auth/register
```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

// Response 201
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "profileComplete": false
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 3600
  }
}
```

### POST /auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response 200
{
  "user": { ... },
  "tokens": { ... }
}
```

### POST /auth/refresh
```json
// Request
{
  "refreshToken": "jwt_refresh_token"
}

// Response 200
{
  "accessToken": "new_jwt_access_token",
  "expiresIn": 3600
}
```

## Food Endpoints

### GET /foods/search
```json
// Query Parameters
?query=chicken breast&limit=20&offset=0&category=protein&brand=generic

// Response 200
{
  "results": [
    {
      "id": "uuid",
      "name": "Chicken breast, grilled",
      "brand": null,
      "category": "Poultry",
      "servingSize": 100,
      "servingUnit": "g",
      "servingDescription": "1 breast half",
      "calories": 165,
      "nutrients": {
        "protein": 31,
        "total_fat": 3.6,
        "carbohydrates": 0
      },
      "dataQuality": "high",
      "source": "USDA"
    }
  ],
  "total": 156,
  "hasMore": true
}
```

### GET /foods/:id
```json
// Response 200
{
  "id": "uuid",
  "name": "Chicken breast, grilled",
  "brand": null,
  "description": "Skinless, boneless",
  "category": "Poultry",
  "subcategory": "Chicken",
  "servingSize": 100,
  "servingUnit": "g",
  "servingDescription": "1 breast half",
  "commonMeasures": [
    { "amount": 1, "unit": "cup", "gramWeight": 140 },
    { "amount": 1, "unit": "piece", "gramWeight": 172 }
  ],
  "nutrients": {
    "calories": { "amount": 165, "unit": "kcal" },
    "protein": { "amount": 31, "unit": "g" },
    "total_fat": { "amount": 3.6, "unit": "g" },
    "calcium": { "amount": 15, "unit": "mg" },
    "iron": { "amount": 1, "unit": "mg" },
    // ... all nutrients
  },
  "dataQuality": "high",
  "source": "USDA",
  "sourceId": "171444",
  "isVerified": true
}
```

### POST /foods (Create custom food)
```json
// Request
{
  "name": "Homemade Granola",
  "servingSize": 50,
  "servingUnit": "g",
  "nutrients": {
    "calories": 240,
    "protein": 6,
    "total_fat": 10,
    "carbohydrates": 32
  }
}

// Response 201
{
  "id": "uuid",
  "name": "Homemade Granola",
  ...
}
```

## Meal Entry Endpoints

### POST /meals/entries
```json
// Request
{
  "entryDate": "2024-01-15",
  "mealType": "breakfast",
  "foodId": "uuid",
  "servingAmount": 1.5,
  "servingUnit": "cup",
  "notes": "Added extra berries"
}

// Response 201
{
  "id": "entry_uuid",
  "entryDate": "2024-01-15",
  "mealType": "breakfast",
  "food": {
    "id": "uuid",
    "name": "Oatmeal"
  },
  "servingAmount": 1.5,
  "servingUnit": "cup",
  "calculatedNutrients": {
    "calories": 225,
    "protein": 7.5,
    // ...
  },
  "loggedAt": "2024-01-15T08:30:00Z"
}
```

### GET /meals/entries
```json
// Query Parameters
?date=2024-01-15&mealType=breakfast

// Response 200
{
  "entries": [
    {
      "id": "entry_uuid",
      "mealType": "breakfast",
      "food": { ... },
      "servingAmount": 1.5,
      "calculatedNutrients": { ... }
    }
  ],
  "summary": {
    "totalCalories": 450,
    "totalEntries": 3
  }
}
```

### DELETE /meals/entries/:id
```json
// Response 204
```

## Dashboard Endpoints

### GET /dashboard/daily
```json
// Query Parameters
?date=2024-01-15

// Response 200
{
  "date": "2024-01-15",
  "summary": {
    "totalCalories": 1850,
    "calorieGoal": 2000,
    "caloriePercentage": 92.5
  },
  "macros": {
    "protein": { "consumed": 95, "goal": 80, "percentage": 119 },
    "carbohydrates": { "consumed": 180, "goal": 250, "percentage": 72 },
    "fat": { "consumed": 65, "goal": 65, "percentage": 100 }
  },
  "keyNutrients": [
    {
      "nutrient": "vitamin_c",
      "displayName": "Vitamin C",
      "consumed": 45,
      "target": 90,
      "percentage": 50,
      "status": "low",
      "unit": "mg"
    },
    {
      "nutrient": "iron",
      "displayName": "Iron",
      "consumed": 16,
      "target": 18,
      "percentage": 89,
      "status": "adequate",
      "unit": "mg"
    }
    // ... more nutrients
  ],
  "meals": [
    {
      "type": "breakfast",
      "calories": 450,
      "entryCount": 3
    },
    {
      "type": "lunch",
      "calories": 650,
      "entryCount": 2
    }
  ],
  "alerts": [
    {
      "type": "low_intake",
      "nutrient": "vitamin_c",
      "message": "Your vitamin C is at 50% of target",
      "priority": "medium"
    }
  ]
}
```

### GET /dashboard/nutrients/:nutrientId
```json
// Response 200
{
  "nutrient": "magnesium",
  "displayName": "Magnesium",
  "unit": "mg",
  "today": {
    "consumed": 280,
    "target": 400,
    "percentage": 70,
    "status": "suboptimal"
  },
  "sources": {
    "food": 250,
    "supplement": 30
  },
  "topContributors": [
    { "food": "Almonds", "amount": 80 },
    { "food": "Spinach", "amount": 78 },
    { "food": "Magnesium supplement", "amount": 30 }
  ],
  "sevenDayAverage": 320,
  "trend": "improving",
  "recommendations": [
    { "food": "Pumpkin seeds", "serving": "1/4 cup", "magnesium": 190 },
    { "food": "Black beans", "serving": "1 cup", "magnesium": 120 }
  ]
}
```

## Supplement Endpoints

### GET /supplements
```json
// Response 200
{
  "supplements": [
    {
      "id": "uuid",
      "name": "Vitamin D3 2000 IU",
      "brand": "Nature Made",
      "form": "softgel",
      "nutrients": {
        "vitamin_d": { "amount": 50, "unit": "mcg" }
      },
      "isVerified": true
    }
  ]
}
```

### POST /supplements/entries
```json
// Request
{
  "supplementId": "uuid",
  "entryDate": "2024-01-15",
  "takenAt": "2024-01-15T08:00:00Z",
  "numberOfServings": 1,
  "takenWithFood": true
}

// Response 201
{
  "id": "entry_uuid",
  "supplement": { ... },
  "calculatedNutrients": { ... },
  "warnings": []
}
```

## Trends Endpoints

### GET /trends/nutrients
```json
// Query Parameters
?nutrient=magnesium&days=30

// Response 200
{
  "nutrient": "magnesium",
  "period": { "start": "2023-12-16", "end": "2024-01-15" },
  "target": 400,
  "data": [
    { "date": "2023-12-16", "amount": 320, "percentage": 80 },
    { "date": "2023-12-17", "amount": 380, "percentage": 95 },
    // ... 30 days
  ],
  "statistics": {
    "average": 345,
    "median": 340,
    "min": 280,
    "max": 420,
    "daysAboveTarget": 8,
    "daysBelow50": 3
  },
  "insights": [
    {
      "type": "pattern",
      "message": "Your magnesium is consistently higher on weekends"
    }
  ]
}
```

## User Profile Endpoints

### GET /users/me
```json
// Response 200
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "dateOfBirth": "1990-05-15",
    "sex": "male",
    "heightCm": 175,
    "weightKg": 75,
    "lifeStage": "none",
    "activityLevel": "moderately_active",
    "dietTypes": ["none"],
    "allergies": [],
    "healthPriorities": ["energy", "immunity"],
    "region": "US"
  },
  "preferences": {
    "units": "metric",
    "theme": "system",
    "language": "en"
  },
  "subscription": {
    "tier": "premium",
    "expiresAt": "2024-12-31"
  }
}
```

### PUT /users/me
```json
// Request (partial update)
{
  "firstName": "Johnny",
  "profile": {
    "weightKg": 74
  }
}

// Response 200
{
  "id": "uuid",
  "firstName": "Johnny",
  ...
}
```

### GET /users/me/goals
```json
// Response 200
{
  "goals": [
    {
      "nutrient": "protein",
      "targetAmount": 80,
      "unit": "g",
      "isCustom": false,
      "source": "RDA_male_31-50"
    },
    {
      "nutrient": "vitamin_d",
      "targetAmount": 50,
      "unit": "mcg",
      "isCustom": true,
      "customReason": "Doctor recommendation"
    }
  ]
}
```

### PUT /users/me/goals/:nutrientId
```json
// Request
{
  "targetAmount": 60,
  "isCustom": true,
  "customReason": "Personal preference"
}

// Response 200
{
  "nutrient": "protein",
  "targetAmount": 60,
  "isCustom": true
}
```

## Alerts Endpoints

### GET /alerts
```json
// Query Parameters
?unreadOnly=true&limit=10

// Response 200
{
  "alerts": [
    {
      "id": "alert_uuid",
      "type": "low_intake",
      "priority": "medium",
      "title": "Low Vitamin C",
      "message": "Your vitamin C intake is at 45% of target today",
      "relatedNutrient": "vitamin_c",
      "isRead": false,
      "createdAt": "2024-01-15T18:00:00Z",
      "action": {
        "type": "view_nutrient",
        "payload": { "nutrientId": "vitamin_c" }
      }
    }
  ],
  "unreadCount": 3
}
```

### POST /alerts/:id/dismiss
```json
// Request
{
  "snoozeHours": null // or 4, 24, etc.
}

// Response 200
{
  "id": "alert_uuid",
  "isDismissed": true,
  "dismissedAt": "2024-01-15T19:00:00Z"
}
```

---

# 15. ENGINEERING PLAN

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  iOS App     │  │ Android App  │  │  Web App     │          │
│  │  React Native│  │ React Native │  │  Next.js     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
                    ┌───────▼───────┐
                    │   CDN/Edge    │
                    │  CloudFront   │
                    └───────┬───────┘
                            │
┌───────────────────────────▼────────────────────────────────────┐
│                      API GATEWAY                                 │
│                    AWS API Gateway                               │
│              Rate Limiting, API Keys, WAF                        │
└───────────────────────────┬────────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              ECS Fargate Cluster                        │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐         │   │
│  │  │ API Server │ │ API Server │ │ API Server │         │   │
│  │  │  Node.js   │ │  Node.js   │ │  Node.js   │         │   │
│  │  └────────────┘ └────────────┘ └────────────┘         │   │
│  └────────────────────────────────────────────────────────┘   │
│                          │                                      │
│  ┌───────────────────────▼──────────────────────────────┐   │
│  │              Background Workers                       │   │
│  │  - Daily summary calculation                          │   │
│  │  - Alert generation                                   │   │
│  │  - Data import/processing                             │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────┬────────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │   PostgreSQL     │  │     Redis        │                   │
│  │   RDS Primary    │  │   ElastiCache    │                   │
│  │                  │  │                  │                   │
│  │  - Users         │  │  - Sessions      │                   │
│  │  - Foods         │  │  - Rate limits   │                   │
│  │  - Entries       │  │  - Query cache   │                   │
│  │  - Nutrients     │  │  - Pub/sub       │                   │
│  └──────────────────┘  └──────────────────┘                   │
│  ┌──────────────────┐                                          │
│  │       S3         │                                          │
│  │  - Food images   │                                          │
│  │  - User exports  │                                          │
│  │  - Backups       │                                          │
│  └──────────────────┘                                          │
└────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Mobile (React Native)
```
src/
├── api/                    # API client, interceptors
├── components/
│   ├── common/            # Buttons, inputs, cards
│   ├── nutrients/         # Nutrient rings, progress bars
│   ├── charts/            # Chart wrappers
│   └── forms/             # Form components
├── screens/
│   ├── auth/              # Login, register, onboarding
│   ├── home/              # Home dashboard
│   ├── log/               # Food logging flows
│   ├── nutrients/         # Nutrient detail views
│   ├── trends/            # Charts and analysis
│   └── profile/           # Settings, goals
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
├── utils/                 # Helpers, calculations
├── constants/             # App constants
└── types/                 # TypeScript definitions
```

### State Management
```javascript
// stores/userStore.ts
interface UserStore {
  user: User | null;
  targets: NutrientTargets;
  preferences: UserPreferences;

  setUser: (user: User) => void;
  updateTargets: (targets: Partial<NutrientTargets>) => void;
  logout: () => void;
}

// stores/nutritionStore.ts
interface NutritionStore {
  dailyTotals: DailyTotals | null;
  mealEntries: MealEntry[];
  supplementEntries: SupplementEntry[];

  addMealEntry: (entry: MealEntryInput) => Promise<void>;
  removeMealEntry: (id: string) => Promise<void>;
  refreshDailyTotals: () => Promise<void>;
}
```

## Backend Architecture

### Project Structure
```
src/
├── config/               # Environment config
├── controllers/          # Route handlers
├── middleware/           # Auth, validation, error handling
├── models/               # Database models
├── routes/               # API route definitions
├── services/             # Business logic
│   ├── calculations/     # Nutrient calculations
│   ├── alerts/          # Alert generation
│   ├── insights/        # Insight engine
│   └── sync/            # Offline sync handling
├── utils/                # Helpers
├── jobs/                 # Background jobs
├── types/                # TypeScript definitions
└── tests/                # Test suites
```

### Service Layer Pattern
```typescript
// services/nutritionService.ts
export class NutritionService {
  constructor(
    private foodRepo: FoodRepository,
    private entryRepo: MealEntryRepository,
    private calculator: NutrientCalculator
  ) {}

  async calculateDailyTotals(
    userId: string, 
    date: Date
  ): Promise<DailyTotals> {
    const entries = await this.entryRepo.getByUserAndDate(userId, date);
    const supplements = await this.getSupplementEntries(userId, date);

    return this.calculator.calculateTotals(entries, supplements);
  }

  async addMealEntry(
    userId: string, 
    input: MealEntryInput
  ): Promise<MealEntry> {
    const food = await this.foodRepo.getById(input.foodId);
    const nutrients = this.calculator.calculateForServing(
      food, 
      input.servingAmount
    );

    const entry = await this.entryRepo.create({
      ...input,
      userId,
      calculatedNutrients: nutrients
    });

    // Invalidate cache
    await this.invalidateDailySummary(userId, input.entryDate);

    return entry;
  }
}
```

## Search Strategy

### Food Search Implementation
```sql
-- Full-text search with ranking
SELECT 
  f.id,
  f.name,
  f.brand,
  f.calories,
  ts_rank(f.search_vector, query) as rank
FROM foods f,
  to_tsquery('english', 'chicken & breast') query
WHERE f.search_vector @@ query
ORDER BY 
  ts_rank(f.search_vector, query) DESC,
  f.data_quality_score DESC
LIMIT 20;
```

### Fuzzy Search (for typos)
```sql
-- Using pg_trgm for fuzzy matching
SELECT 
  f.id,
  f.name,
  similarity(f.name, 'chiken') as sim
FROM foods f
WHERE f.name % 'chiken'  -- trigram similarity
ORDER BY similarity(f.name, 'chiken') DESC
LIMIT 10;
```

### Caching Strategy
```javascript
// Cache frequently searched terms
const searchCache = new Map();

async function searchFoods(query, options) {
  const cacheKey = `${query}-${JSON.stringify(options)}`;

  // Check cache
  const cached = await redis.get(`search:${cacheKey}`);
  if (cached) return JSON.parse(cached);

  // Query database
  const results = await db.query(...);

  // Cache for 1 hour
  await redis.setex(`search:${cacheKey}`, 3600, JSON.stringify(results));

  return results;
}
```

## Offline-First Strategy

### Local Database (React Native)
```javascript
// Using WatermelonDB or Realm
const mealEntries = database.collections.get('meal_entries');

// Queue for sync
async function addMealEntryOffline(entry) {
  await database.write(async () => {
    await mealEntries.create(record => {
      record.userId = entry.userId;
      record.foodId = entry.foodId;
      record.servingAmount = entry.servingAmount;
      record.isSynced = false;
      record.syncAttempts = 0;
    });
  });
}

// Background sync
async function syncPendingEntries() {
  const pending = await mealEntries
    .query(Q.where('is_synced', false))
    .fetch();

  for (const entry of pending) {
    try {
      await api.post('/meals/entries', entry.toJSON());
      await entry.update(record => {
        record.isSynced = true;
      });
    } catch (error) {
      await entry.update(record => {
        record.syncAttempts += 1;
      });
    }
  }
}
```

### Conflict Resolution
```javascript
// Last-write-wins with timestamp check
function resolveConflict(localEntry, serverEntry) {
  const localTime = new Date(localEntry.updatedAt).getTime();
  const serverTime = new Date(serverEntry.updatedAt).getTime();

  if (localTime > serverTime) {
    return { winner: 'local', entry: localEntry };
  } else {
    return { winner: 'server', entry: serverEntry };
  }
}
```

## Testing Strategy

### Unit Tests (Jest)
```javascript
// calculations.test.ts
describe('Nutrient Calculations', () => {
  test('calculateDailyTotals aggregates correctly', () => {
    const entries = [
      { foodId: '1', servingAmount: 100, nutrients: { protein: 20 } },
      { foodId: '2', servingAmount: 50, nutrients: { protein: 10 } }
    ];

    const totals = calculateDailyTotals(entries, []);
    expect(totals.protein).toBe(25);
  });

  test('target percentage calculation', () => {
    expect(calculateTargetPercentage(80, 100)).toBe(80);
    expect(calculateTargetPercentage(0, 100)).toBe(0);
    expect(calculateTargetPercentage(150, 100)).toBe(150);
  });
});
```

### Integration Tests
```javascript
// api.test.ts
describe('Meal Entry API', () => {
  test('POST /meals/entries creates entry', async () => {
    const response = await request(app)
      .post('/meals/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        foodId: 'test-food-id',
        servingAmount: 1,
        mealType: 'breakfast'
      });

    expect(response.status).toBe(201);
    expect(response.body.calculatedNutrients).toBeDefined();
  });
});
```

### E2E Tests (Detox)
```javascript
// e2e/logMeal.test.js
describe('Log Meal Flow', () => {
  it('should log a meal', async () => {
    await element(by.id('home-log-breakfast')).tap();
    await element(by.id('search-input')).typeText('oatmeal');
    await element(by.text('Oatmeal, cooked')).tap();
    await element(by.id('serving-amount')).replaceText('1');
    await element(by.id('add-to-meal')).tap();

    await expect(element(by.text('Oatmeal'))).toBeVisible();
  });
});
```

## Security & Privacy

### Data Protection
```javascript
// Encryption at rest
const encryptedFields = {
  email: encrypt(user.email),
  // PII encrypted
};

// Field-level encryption for sensitive data
```

### HIPAA Considerations (if applicable)
- Business Associate Agreements with vendors
- Audit logging for all data access
- Encryption in transit (TLS 1.3)
- Encryption at rest (AES-256)
- Access controls and authentication
- Regular security assessments

### Privacy Features
```javascript
// User data export
app.get('/users/me/export', async (req, res) => {
  const userData = await exportUserData(req.user.id);
  res.json(userData);
});

// Data deletion (GDPR right to be forgotten)
app.delete('/users/me', async (req, res) => {
  await deleteUserData(req.user.id);
  res.status(204).send();
});
```

## Performance Optimization

### Database Optimization
```sql
-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_meal_entries_user_date 
  ON meal_entries(user_id, entry_date);

CREATE INDEX CONCURRENTLY idx_foods_search 
  ON foods USING gin(search_vector);

-- Partition large tables by date
CREATE TABLE meal_entries_2024 PARTITION OF meal_entries
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### API Response Caching
```javascript
// Cache daily summaries
app.get('/dashboard/daily', 
  cacheMiddleware({ ttl: 300 }), // 5 minutes
  async (req, res) => {
    const data = await getDailyDashboard(req.user.id, req.query.date);
    res.json(data);
  }
);
```

### CDN Configuration
- Static assets cached 1 year
- API responses cached based on Cache-Control headers
- Edge locations for global users

---

# 16. MONETIZATION MODEL

## Tier Structure

### Free Tier
**Price**: $0

**Features**:
- Log up to 3 meals/day
- Track 15 core nutrients
- Basic dashboard
- 7-day history
- Manual food entry
- Ad-supported (non-intrusive)

**Limitations**:
- No supplement tracking
- No trends/analytics
- No data export
- Limited food database (USDA only)

### Premium Tier
**Price**: $9.99/month or $59.99/year (40% savings)

**Features**:
- Unlimited meal logging
- 80+ nutrients tracked
- Full dashboard + nutrient detail views
- Unlimited history
- Supplement tracking with safety alerts
- Weekly/monthly trends
- Data export (CSV, PDF)
- Recipe builder
- Custom foods
- Priority support
- No ads

### Pro Tier
**Price**: $19.99/month or $149.99/year

**Features** (everything in Premium plus):
- Blood work integration
- Advanced correlations
- Custom dashboards
- Family profiles (up to 5)
- API access
- Early access to features
- 1-on-1 nutritionist consultation (quarterly)
- White-label reports

## B2B / Clinician Mode

### Healthcare Provider Plan
**Price**: $49/month per provider

**Features**:
- Patient management dashboard
- View patient nutrition data
- Generate clinical reports
- Set patient goals
- Message patients
- HIPAA compliance features
- EHR integration (future)

## Feature Gating Strategy

| Feature | Free | Premium | Pro |
|---------|------|---------|-----|
| Meal logging | 3/day | Unlimited | Unlimited |
| Nutrients tracked | 15 | 80+ | 80+ |
| History | 7 days | Unlimited | Unlimited |
| Supplement tracking | ❌ | ✅ | ✅ |
| Trends | ❌ | Basic | Advanced |
| Export | ❌ | CSV/PDF | API + all formats |
| Recipe builder | ❌ | ✅ | ✅ |
| Custom foods | ❌ | ✅ | ✅ |
| Blood work | ❌ | ❌ | ✅ |
| Family profiles | ❌ | ❌ | 5 profiles |
| Support | Community | Priority | Dedicated |

## Conversion Strategy

### Free → Premium Triggers
1. Hit 3-meal limit → Show upgrade prompt
2. Try to view nutrient detail → "Unlock with Premium"
3. Day 7 of consistent use → Offer trial
4. Export attempt → "Export is a Premium feature"

### Trial Strategy
- 14-day free trial of Premium
- No credit card required
- Full feature access during trial
- Reminder at day 10
- Easy cancellation

## Pricing Psychology
- Annual pricing emphasizes savings ("Save $60")
- Premium positioned as "most popular"
- Pro for "serious optimizers"
- No lifetime plan (recurring revenue)

---

# 17. LAUNCH PLAN

## Roadmap

### v1.0 - MVP (Months 1-4)
**Core Features**:
- User auth & onboarding
- Food search & logging (manual)
- 30 core nutrients tracked
- Basic dashboard
- Supplement logging
- Daily/weekly views

**Milestones**:
- Month 1: Backend API, database
- Month 2: Mobile app (iOS focus)
- Month 3: Android, web dashboard
- Month 4: Beta testing, bug fixes

### v2.0 - Growth (Months 5-8)
**New Features**:
- Recipe builder
- 80+ nutrients
- Trends & charts
- Data export
- Advanced insights
- Hydration tracking

**Milestones**:
- Month 5: Recipe system
- Month 6: Analytics engine
- Month 7: Export & sharing
- Month 8: Performance optimization

### v3.0 - Scale (Months 9-12)
**New Features**:
- Premium tiers
- Family profiles
- Blood work integration
- Clinician mode
- API access
- International expansion

**Milestones**:
- Month 9: Payment system
- Month 10: B2B features
- Month 11: International
- Month 12: Public launch

## Beta Testing Plan

### Phase 1: Internal (Week 1-2)
- Team + friends & family
- 20-50 users
- Daily standups
- Critical bug fixes

### Phase 2: Private Beta (Week 3-6)
- Nutritionist network
- Fitness communities
- 500 users via TestFlight/Play Console
- Weekly surveys
- Feature prioritization

### Phase 3: Public Beta (Week 7-10)
- Waitlist users
- 2,000 users
- A/B testing
- Monetization experiments

## First 1000 Users Strategy

### Channels
1. **Reddit** (r/nutrition, r/fitness, r/vegan)
   - Value-add posts, not spam
   - "I built an app to track micronutrients"
   - AMA sessions

2. **Product Hunt**
   - Polished listing
   - Maker comments
   - Video demo
   - Goal: Top 5 product of day

3. **Nutritionist Partnerships**
   - Free Pro accounts
   - Affiliate program (20% recurring)
   - Co-marketing

4. **Content Marketing**
   - Blog: "The Ultimate Guide to Magnesium"
   - SEO for "micronutrient tracking"
   - YouTube tutorials

5. **Influencer Outreach**
   - Micro-influencers (10K-100K)
   - Biohackers, nutritionists
   - Free product + affiliate

### Target Metrics
- Week 1: 100 users
- Week 4: 500 users
- Week 8: 1,000 users
- Week 12: 5,000 users

## App Store Positioning

### App Store Optimization (ASO)
**Title**: Nutrient - Micronutrient Tracker
**Subtitle**: Track vitamins, minerals & optimize health

**Keywords**: 
- nutrition tracker, vitamin tracker, mineral tracker
- micronutrients, supplement tracker, nutrient analysis
- healthy eating, diet tracking, nutrition app

**Screenshots**:
1. Dashboard with nutrient rings
2. Food logging interface
3. Nutrient detail with trends
4. Weekly insights report
5. Supplement tracking

**Description**:
```
Go beyond calorie counting. Nutrient is the only app that tracks 80+ vitamins, minerals, and micronutrients to help you optimize your health.

FEATURES:
• Track 80+ nutrients from food and supplements
• Personalized targets based on age, sex, and life stage
• Visual dashboards show exactly what you're missing
• Smart recommendations to fill nutrient gaps
• Safety alerts when approaching upper limits
• Weekly trends and insights
• Export data for your healthcare provider

Whether you're vegan, pregnant, an athlete, or just health-conscious, Nutrient gives you the data you need to thrive.

Download free and start optimizing your nutrition today.
```

## Landing Page Messaging

### Hero Section
**Headline**: "Know Exactly What Your Body Needs"
**Subheadline**: "The only nutrition tracker that monitors 80+ vitamins and minerals, not just calories."
**CTA**: "Start Free Trial"

### Key Benefits
1. **Complete Nutrition Picture**: Track vitamins, minerals, electrolytes, omega-3s, and more
2. **Personalized to You**: Targets based on your age, sex, activity level, and life stage
3. **Smart Guidance**: Get food recommendations to fill your nutrient gaps
4. **Safety First**: Alerts when you're approaching upper safe limits

### Social Proof
- "I've tried every nutrition app. Nutrient is the only one that tracks what actually matters." - Sarah, biohacker
- "Finally, an app that helps me ensure my vegan diet is complete." - Priya, software engineer

### Pricing Section
- Free: Get started
- Premium $9.99/mo: Most popular
- Pro $19.99/mo: For power users

---

---

# 18. EXAMPLE SCREENS

## Onboarding Screen 1: Welcome

```
┌─────────────────────────────────────────┐
│                                         │
│              [Logo Icon]                │
│                                         │
│     Discover Your Nutritional           │
│            Profile                      │
│                                         │
│   Track 80+ vitamins, minerals, and     │
│   micronutrients to optimize your       │
│   health.                               │
│                                         │
│   • Personalized daily targets          │
│   • Visual nutrient dashboards          │
│   • Smart gap recommendations           │
│   • Supplement safety alerts            │
│                                         │
│                                         │
│         [   Get Started   ]             │
│              (Primary CTA)              │
│                                         │
│         Already have an account?        │
│              Log In                     │
│                                         │
└─────────────────────────────────────────┘
```

## Onboarding Screen 5: Primary Goal

```
┌─────────────────────────────────────────┐
│  ← Back                      5 of 12 →  │
│                                         │
│     What's your primary goal?           │
│                                         │
│   This helps us prioritize which        │
│   nutrients to highlight for you.       │
│                                         │
│   ○ Maintain current health             │
│                                         │
│   ● Improve energy                      │
│     (We'll prioritize B-vitamins,       │
│      iron, and magnesium)               │
│                                         │
│   ○ Build muscle                        │
│                                         │
│   ○ Lose weight                         │
│                                         │
│   ○ Support athletic performance        │
│                                         │
│   ○ Support pregnancy                   │
│                                         │
│                                         │
│         [     Continue    ]             │
│                                         │
└─────────────────────────────────────────┘
```

## Home Dashboard

```
┌─────────────────────────────────────────┐
│  Nutrient                    [Profile]  │
│                                         │
│  [←]  Monday, Jan 15  [→]               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      [Nutrient Score Ring]      │   │
│  │                                 │   │
│  │           78/100                │   │
│  │        Good Progress            │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  MACROS                    1,850/2,000  │
│  ┌─────────────────────────────────┐   │
│  │ Protein  ████████░░  95/80g ✓   │   │
│  │ Carbs    ██████░░░░  180/250g   │   │
│  │ Fat      ██████████  65/65g ✓   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  KEY NUTRIENTS                          │
│  ┌─────────────────────────────────┐   │
│  │ [Ring] Vitamin C    45%   45/90 │   │
│  │ [Ring] Iron         89%   16/18 │   │
│  │ [Ring] Magnesium    70%  280/400│   │
│  │ [Ring] Calcium      95%  950/100│   │
│  └─────────────────────────────────┘   │
│                                         │
│  TODAY'S MEALS                          │
│  ┌─────────────────────────────────┐   │
│  │ 🌅 Breakfast      450 cal  [+]  │   │
│  │ 🌞 Lunch          650 cal  [+]  │   │
│  │ 🌙 Dinner              -   [+]  │   │
│  │ 🍎 Snack               -   [+]  │   │
│  │ 💊 Supplement    2 logged  [+]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ⚠️ Vitamin C is at 50% of target       │
│     [View recommendations →]            │
│                                         │
└─────────────────────────────────────────┘
```

## Nutrient Deficiency Alert

```
┌─────────────────────────────────────────┐
│              [Alert Modal]              │
│                                         │
│         ⚠️  Low Vitamin C               │
│                                         │
│   Your vitamin C intake today is at     │
│   45mg (50% of your 90mg target).       │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   Why it matters:                       │
│   Vitamin C supports immune function    │
│   and helps your body absorb iron.      │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   Foods that can help:                  │
│                                         │
│   🍊 Orange (1 medium)                  │
│      70mg vitamin C    [Add +]          │
│                                         │
│   🫑 Bell pepper (1 cup)                │
│      120mg vitamin C   [Add +]          │
│                                         │
│   🥝 Kiwi (1 fruit)                     │
│      64mg vitamin C    [Add +]          │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   [  Remind me later  ]  [  Got it  ]   │
│                                         │
└─────────────────────────────────────────┘
```

## Supplement Warning

```
┌─────────────────────────────────────────┐
│              [Warning Banner]           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🚫  CRITICAL                    │   │
│  │                                 │   │
│  │ Vitamin A exceeds safe limit    │   │
│  │                                 │   │
│  │ Current: 4,500 mcg              │   │
│  │ Upper Limit: 3,000 mcg          │   │
│  │ Excess: 1,500 mcg               │   │
│  │                                 │   │
│  │ Sources:                        │   │
│  │ • Multivitamin: 3,000 mcg       │   │
│  │ • Diet: 1,500 mcg               │   │
│  │                                 │   │
│  │ [View Details]  [I've adjusted] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  YOUR SUPPLEMENTS                       │
│  ┌─────────────────────────────────┐   │
│  │ 🟡 Multivitamin    1 dose       │   │
│  │    ⚠️ High in Vitamin A         │   │
│  │                                 │   │
│  │ 🟢 Vitamin D3      1 dose       │   │
│  │                                 │   │
│  │ 🟢 Magnesium       1 dose       │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Weekly Insights Report

```
┌─────────────────────────────────────────┐
│  ← Back                    [Share]      │
│                                         │
│  Your Week in Review                    │
│  Jan 8 - Jan 14, 2024                   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │    [Weekly Score: 82/100]       │   │
│  │         Grade: B+               │   │
│  │                                 │   │
│  │  ↑ 5 points from last week      │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  🌟 HIGHLIGHTS                          │
│  ─────────────────────────────────────  │
│  • You met your protein goal every day  │
│  • Iron improved 23% from last week     │
│  • Added 3 new nutrient-dense foods     │
│                                         │
│  ⚠️ AREAS FOR IMPROVEMENT               │
│  ─────────────────────────────────────  │
│  • Vitamin C was low 5 of 7 days        │
│    [View recommendations]               │
│                                         │
│  • Weekend intake dropped 30%           │
│    [Set weekend reminders]              │
│                                         │
│  📊 NUTRIENT TRENDS                     │
│  ─────────────────────────────────────  │
│                                         │
│  [Line chart: 7-day trend for key       │
│   nutrients with target lines]          │
│                                         │
│  Improving: Iron ↑, Zinc ↑              │
│  Declining: Vitamin C ↓                 │
│  Consistent: Protein →, Calcium →       │
│                                         │
│  🎯 GOALS FOR NEXT WEEK                 │
│  ─────────────────────────────────────  │
│  1. Add a vitamin C source daily        │
│  2. Maintain weekend consistency        │
│  3. Try 2 new magnesium-rich foods      │
│                                         │
│         [   View Full Report   ]        │
│                                         │
└─────────────────────────────────────────┘
```

## Meal Logging Confirmation

```
┌─────────────────────────────────────────┐
│              [Toast Notification]       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ✓  Added to breakfast          │   │
│  │                                 │   │
│  │  Oatmeal, cooked (1 cup)        │   │
│  │  166 calories                   │   │
│  │                                 │   │
│  │  +6% daily iron                 │   │
│  │  +8% daily fiber                │   │
│  │  +4% daily magnesium            │   │
│  │                                 │   │
│  │  [Undo]              [Add More] │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Empty Nutrient Dashboard

```
┌─────────────────────────────────────────┐
│  Nutrients                   [Filter]   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │         [Illustration]          │   │
│  │      Empty plate icon           │   │
│  │                                 │   │
│  │    No nutrients to display      │   │
│  │                                 │   │
│  │  Log your first meal to see     │   │
│  │  your complete nutrient         │   │
│  │  breakdown.                     │   │
│  │                                 │   │
│  │    [   Log Your First Meal   ]  │   │
│  │                                 │   │
│  │  Popular first meals:           │   │
│  │  • Oatmeal with fruit           │   │
│  │  • Scrambled eggs & toast       │   │
│  │  • Greek yogurt parfait         │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

# 19. DEVELOPER OUTPUT

## A. Product Requirements Document (PRD) Summary

### Objective
Build a mobile-first nutrition tracking application focused on micronutrient monitoring with personalized guidance.

### Success Metrics
- User retention: 40% D30
- Engagement: 3+ meals logged per day (active users)
- Conversion: 5% free to paid
- NPS: >50

### Key User Stories

#### US-001: Log a Food
**As a** user, **I want to** search for and log a food item, **so that** I can track my nutrient intake.

**Acceptance Criteria**:
- Search returns results in < 500ms
- Can select serving size
- Nutrients calculate immediately
- Confirmation shows key nutrients added

#### US-002: View Daily Nutrients
**As a** user, **I want to** see my daily nutrient totals, **so that** I know if I'm meeting targets.

**Acceptance Criteria**:
- Dashboard shows top 10 nutrients
- Each nutrient shows % of target
- Color coding indicates status
- Tap to see detail view

#### US-003: Receive Low Nutrient Alert
**As a** user, **I want to** be notified when a nutrient is low, **so that** I can take action.

**Acceptance Criteria**:
- Alert triggers at < 50% of target
- Shows at end of day
- Includes food recommendations
- Can dismiss or snooze

#### US-004: Track Supplements
**As a** user, **I want to** log my supplements, **so that** I can monitor total intake.

**Acceptance Criteria**:
- Can search supplement database
- Can add custom supplement
- Warns if approaching UL
- Shows contribution to daily totals

## B. Component List (Frontend)

### Common Components
| Component | Props | Description |
|-----------|-------|-------------|
| Button | variant, size, disabled, onPress | Primary, secondary, ghost buttons |
| Card | children, elevation, padding | Container with shadow |
| Input | value, onChange, placeholder, error | Text input with validation |
| Select | options, value, onChange | Dropdown selector |
| Modal | visible, onClose, children | Overlay modal |
| Toast | message, type, duration | Temporary notification |

### Nutrition Components
| Component | Props | Description |
|-----------|-------|-------------|
| NutrientRing | nutrient, current, target, size | Circular progress indicator |
| NutrientBar | nutrient, current, target, showLabel | Horizontal progress bar |
| NutrientGrid | nutrients, columns | Grid of nutrient rings |
| MacroSummary | protein, carbs, fat, calories | Macro breakdown card |
| FoodListItem | food, serving, onPress | Food entry in list |
| MealSection | type, entries, onAdd | Collapsible meal section |

### Chart Components
| Component | Props | Description |
|-----------|-------|-------------|
| TrendChart | data, target, timeRange | Line chart with target line |
| BarChart | data, labels | Comparison bar chart |
| DonutChart | segments, centerLabel | Macro distribution |
| Sparkline | data, color | Mini trend line |

## C. Acceptance Criteria

### Feature: Food Logging
**AC-001**: User can search foods by name
- Given user is on log screen
- When they type in search box
- Then matching foods appear within 500ms

**AC-002**: User can select serving size
- Given user selected a food
- When they tap serving size
- Then they can choose from common measures or enter custom

**AC-003**: Nutrients calculate correctly
- Given user enters 1.5 servings
- When they add to meal
- Then nutrients are 1.5x base values

### Feature: Nutrient Dashboard
**AC-004**: Dashboard shows accurate totals
- Given user has logged meals
- When they view dashboard
- Then totals match sum of all entries

**AC-005**: Color coding is accurate
- Given nutrient is at 45% of target
- When displayed
- Then it shows orange color

**AC-006**: Tapping nutrient shows detail
- Given user taps a nutrient
- Then detail view opens with trends and sources

## D. Edge Cases

### Data Edge Cases
1. **Zero values**: Display "--" instead of "0" for missing data
2. **Very large numbers**: Format with K/M suffix (e.g., 1.2K mg)
3. **Negative values**: Should never occur; validate inputs
4. **Null/undefined**: Treat as 0 in calculations, show "--" in UI

### User Edge Cases
1. **No internet**: Queue actions, show offline indicator
2. **Very old data**: Show "data may be outdated" warning
3. **Rapid logging**: Debounce to prevent duplicate entries
4. **Timezone changes**: Handle gracefully, use UTC internally

### Calculation Edge Cases
1. **Division by zero**: Return 0% if target is 0
2. **Overflow**: Cap percentages at 999%
3. **Floating point**: Round to 2 decimal places for display
4. **UL = 0**: Some nutrients have no UL; don't show UL warning

## E. QA Test Checklist

### Onboarding
- [ ] All 12 steps can be completed
- [ ] Back button works correctly
- [ ] Progress indicator accurate
- [ ] Profile created with correct targets

### Food Logging
- [ ] Search returns relevant results
- [ ] Recent foods appear first
- [ ] Favorites can be saved
- [ ] Custom foods can be created
- [ ] Serving sizes calculate correctly
- [ ] Entries can be edited
- [ ] Entries can be deleted
- [ ] Offline entries sync when online

### Dashboard
- [ ] Totals update immediately after logging
- [ ] All nutrients display correctly
- [ ] Color coding accurate
- [ ] Pull to refresh works
- [ ] Date navigation works

### Supplements
- [ ] Can search supplement database
- [ ] Can create custom supplement
- [ ] UL warnings appear when appropriate
- [ ] Interactions are detected
- [ ] Daily totals include supplements

### Alerts
- [ ] Low nutrient alerts trigger correctly
- [ ] UL warnings appear immediately
- [ ] Alerts can be dismissed
- [ ] Alerts can be snoozed
- [ ] Weekly insights generate correctly

### Performance
- [ ] App launches in < 3 seconds
- [ ] Search returns in < 500ms
- [ ] Dashboard loads in < 1 second
- [ ] No crashes in 30-minute session

---

# 20. FINAL BUILD RECOMMENDATION

## The Best Version to Build First

### MVP Scope (v1.0)
Build a **focused, excellent** core experience:

**In Scope**:
- User onboarding with personalization
- Food search and logging (manual only)
- 30 core nutrients (vitamins + key minerals)
- Basic dashboard with nutrient rings
- Supplement logging
- Daily/7-day views
- Simple gap recommendations
- UL warnings

**Out of Scope for MVP**:
- Recipe builder (use saved meals instead)
- Advanced trends/charts
- Data export
- Social features
- Blood work integration
- Family profiles

## What to Cut (Avoid Overbuilding)

### Cut for MVP
1. **AI/ML features**: Rule-based is sufficient initially
2. **Recipe builder**: Too complex, use meal templates
3. **Advanced analytics**: Basic trends only
4. **Social/sharing**: Focus on individual use first
5. **Barcode scanning**: Manual entry only per requirements
6. **Photo logging**: Not needed for MVP
7. **Wearable integration**: Nice-to-have, not essential
8. **Multiple region databases**: Start with USDA only

### Why These Cuts
- Faster time to market (3-4 months vs 6-8)
- Lower complexity = fewer bugs
- Core value proposition intact
- Can add later based on user feedback

## What Will Make the App Exceptional

### The "It Factor" Features
1. **Instant nutrient visibility**: See 30+ nutrients populate in real-time
2. **Beautiful data visualization**: Nutrient rings that are genuinely useful
3. **Smart but simple guidance**: "Add an orange" not "Consume 70mg ascorbic acid"
4. **Safety-first approach**: UL warnings show we care about health
5. **Zero friction logging**: 3 taps to log common foods

### Polish Points
- Micro-interactions on every action
- Smooth chart animations
- Thoughtful empty states
- Helpful error messages
- Consistent design language

## Biggest Risks

### Risk 1: Data Quality
**Problem**: USDA data has gaps, user-submitted foods may be inaccurate
**Mitigation**: 
- Quality scoring system
- Flag uncertain data
- Start with verified sources only

### Risk 2: User Retention
**Problem**: Logging food is tedious, users drop off
**Mitigation**:
- Excellent search (fuzzy, recent, favorites)
- Quick-add for common foods
- Copy previous meals
- Gamification (streaks, scores)

### Risk 3: Calculation Accuracy
**Problem**: Wrong nutrient calculations destroy trust
**Mitigation**:
- Extensive unit testing
- Cross-reference with known values
- Beta testing with nutritionists

### Risk 4: Market Differentiation
**Problem**: Cronometer already exists
**Mitigation**:
- Superior UX (mobile-first, beautiful)
- Better guidance (not just tracking)
- Focus on safety (UL warnings)

## Highest ROI Features

### Immediate ROI (Build First)
1. **Fast food search**: Reduces friction, increases engagement
2. **Visual nutrient dashboard**: "Aha" moment for users
3. **Smart recommendations**: Provides value beyond tracking
4. **Supplement safety**: Differentiator, builds trust

### Medium-term ROI (Build Next)
1. **Recipe builder**: Increases engagement, sharing
2. **Trends/charts**: Retention through insights
3. **Data export**: Professional use case
4. **Meal planning**: Premium feature opportunity

### Long-term ROI (Build Later)
1. **Blood work integration**: Pro tier justification
2. **Clinician mode**: B2B revenue
3. **AI insights**: After rule-based is proven
4. **Community**: Network effects

---

# APPENDIX: QUICK REFERENCE

## One-Paragraph App Pitch

> Nutrient is a precision nutrition platform that tracks 80+ vitamins, minerals, and micronutrients—going far beyond calorie counting. It provides personalized daily targets based on your age, sex, and life stage; visualizes your intake with beautiful nutrient rings; and offers smart, rule-based guidance to fill gaps while warning you about unsafe excesses. Whether you're optimizing health, managing a special diet, or working with a healthcare provider, Nutrient transforms complex nutritional science into actionable daily habits.

## 10-Feature MVP Shortlist

1. **Personalized Onboarding**: 12-question setup for customized targets
2. **Food Search & Logging**: 300K+ foods, manual entry, serving sizes
3. **30 Core Nutrients**: Vitamins A-K, key minerals, macros
4. **Nutrient Dashboard**: Visual rings, color-coded status, daily totals
5. **Supplement Tracking**: Dose logging with UL safety warnings
6. **Gap Recommendations**: Rule-based food suggestions for low nutrients
7. **7-Day Trends**: Basic historical view
8. **Quick Add**: Recent foods, favorites, copy meals
9. **Daily Alerts**: Low nutrient and UL warnings
10. **Offline Logging**: Queue for sync when back online

## Recommended Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native + TypeScript |
| Web | Next.js + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL + Redis |
| Hosting | AWS (ECS, RDS, S3) |
| Auth | JWT + bcrypt |
| Charts | Victory Native / Recharts |
| State | Zustand + React Query |

## Sample Home Screen Layout

```
┌─────────────────────────────────────────┐
│  Nutrient                    [Profile]  │
│                                         │
│  [←]  Monday, Jan 15  [→]               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      [Nutrient Score: 78]       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  MACROS                    1,850/2,000  │
│  Protein  ████████░░  95/80g            │
│  Carbs    ██████░░░░  180/250g          │
│  Fat      ██████████  65/65g            │
│                                         │
│  KEY NUTRIENTS                          │
│  [C] 45%  [Fe] 89%  [Mg] 70%  [Ca] 95%  │
│                                         │
│  TODAY'S MEALS                          │
│  🌅 Breakfast    450 cal  [+]           │
│  🌞 Lunch        650 cal  [+]           │
│  🌙 Dinner           -    [+]           │
│  💊 Supplement   2 doses  [+]           │
│                                         │
│  ⚠️ Vitamin C is low - View foods →     │
│                                         │
└─────────────────────────────────────────┘
```

## Phased Roadmap Summary

| Phase | Timeline | Focus | Key Deliverables |
|-------|----------|-------|------------------|
| v1.0 MVP | Months 1-4 | Core tracking | Food logging, 30 nutrients, dashboard |
| v1.5 Beta | Month 5 | Refinement | Bug fixes, performance, onboarding |
| v2.0 Growth | Months 6-8 | Depth | 80 nutrients, trends, recipes |
| v2.5 Polish | Month 9 | UX | Design refinement, animations |
| v3.0 Scale | Months 10-12 | Monetization | Premium tiers, B2B, international |

---

*End of Blueprint*
