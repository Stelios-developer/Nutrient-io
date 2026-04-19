import { Routes, Route } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/AppLayout'
import { OnboardingPage } from '@/pages/Onboarding'
import { HomePage } from '@/pages/Home'
import { LogFoodPage } from '@/pages/LogFood'
import { NutrientsPage } from '@/pages/Nutrients'
import { SupplementsPage } from '@/pages/Supplements'
import { TrendsPage } from '@/pages/Trends'
import { ProfilePage } from '@/pages/Profile'
import { FoodDetailPage } from '@/pages/FoodDetail'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not logged in — only allow login and public routes
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // If user has no name yet, send them to login to enter it
  if (!user.name) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Check if user needs onboarding
  const needsOnboarding = !user.onboarded;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {needsOnboarding ? (
        <Route path="*" element={<OnboardingPage />} />
      ) : (
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/log" element={<LogFoodPage />} />
          <Route path="/nutrients" element={<NutrientsPage />} />
          <Route path="/supplements" element={<SupplementsPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/food/:id" element={<FoodDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      )}
    </Routes>
  )
}
