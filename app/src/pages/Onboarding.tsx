import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Activity, Heart, Leaf, Sun, Droplets, Zap,
  ChevronRight, ChevronLeft, Scale, Ruler, Calendar
} from 'lucide-react'

const GOALS = [
  { icon: <Heart size={20} />, label: 'General Health', desc: 'Maintain balanced nutrition' },
  { icon: <Zap size={20} />, label: 'Boost Energy', desc: 'Focus on B-vitamins & iron' },
  { icon: <Activity size={20} />, label: 'Athletic Performance', desc: 'Optimize protein & electrolytes' },
  { icon: <Leaf size={20} />, label: 'Weight Management', desc: 'Track macros & fiber' },
  { icon: <Sun size={20} />, label: 'Immune Support', desc: 'Prioritize C, D, zinc & selenium' },
  { icon: <Droplets size={20} />, label: 'Heart Health', desc: 'Focus on omega-3s & potassium' },
]

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', desc: '1-3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active', desc: '3-5 days/week' },
  { value: 'very_active', label: 'Very Active', desc: '6-7 days/week' },
  { value: 'extremely_active', label: 'Extremely Active', desc: 'Physical job + training' },
]

export function OnboardingPage() {
  const { user } = useAuth()
  const userId = user?.id ?? 1
  const [step, setStep] = useState(0)

  const [profile, setProfile] = useState({
    dateOfBirth: '',
    sex: '' as 'male' | 'female' | '',
    heightCm: '',
    weightKg: '',
    activityLevel: 'moderately_active',
    goal: '',
  })

  const updateProfile = trpc.onboarding.updateProfile.useMutation({
    onSuccess: () => {
      if (step < 3) {
        setStep(step + 1)
      } else {
        // Done - refresh page
        window.location.href = '/'
      }
    },
  })

  const handleNext = () => {
    if (step === 3) {
      updateProfile.mutate({
        userId,
        dateOfBirth: profile.dateOfBirth || undefined,
        sex: profile.sex || undefined,
        heightCm: profile.heightCm ? parseFloat(profile.heightCm) : undefined,
        weightKg: profile.weightKg ? parseFloat(profile.weightKg) : undefined,
        activityLevel: profile.activityLevel as any,
        onboarded: true,
      })
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const progress = ((step + 1) / 4) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/40 via-background to-muted/30 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-background rounded-2xl shadow-xl border border-border/40">
      <div className="flex-1 flex flex-col w-full p-8">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {step > 0 && (
            <button onClick={handleBack} className="p-1 rounded-lg hover:bg-accent">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex-1">
            <Progress value={progress} className="h-1.5" />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{step + 1}/4</span>
        </div>

        {/* Step Content */}
        <div className="flex-1 space-y-6">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Welcome to Nutrient</h1>
                <p className="text-muted-foreground">Let's personalize your nutrition targets. This takes just a minute.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Your Goal</h3>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.label}
                      onClick={() => setProfile(prev => ({ ...prev, goal: g.label }))}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                        profile.goal === g.label
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        profile.goal === g.label ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {g.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{g.label}</p>
                        <p className="text-xs text-muted-foreground">{g.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">About You</h1>
                <p className="text-muted-foreground">This helps us calculate your personalized nutrient targets.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar size={14} /> Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sex</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['male', 'female'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setProfile(prev => ({ ...prev, sex: s }))}
                        className={`p-4 rounded-xl border text-sm font-semibold capitalize transition-all ${
                          profile.sex === s
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Ruler size={14} /> Height (cm)
                    </label>
                    <Input
                      type="number"
                      placeholder="175"
                      value={profile.heightCm}
                      onChange={(e) => setProfile(prev => ({ ...prev, heightCm: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Scale size={14} /> Weight (kg)
                    </label>
                    <Input
                      type="number"
                      placeholder="70"
                      value={profile.weightKg}
                      onChange={(e) => setProfile(prev => ({ ...prev, weightKg: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Activity Level</h1>
                <p className="text-muted-foreground">How active are you on a typical week?</p>
              </div>

              <div className="space-y-2">
                {ACTIVITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setProfile(prev => ({ ...prev, activityLevel: level.value }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      profile.activityLevel === level.value
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      profile.activityLevel === level.value ? 'border-primary' : 'border-muted-foreground'
                    }`}>
                      {profile.activityLevel === level.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{level.label}</p>
                      <p className="text-xs text-muted-foreground">{level.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">You're All Set!</h1>
                <p className="text-muted-foreground">Here's a summary of your personalized nutrition profile.</p>
              </div>

              <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                      {user?.name?.[0] ?? 'U'}
                    </div>
                    <div>
                      <p className="font-semibold">{user?.name ?? 'User'}</p>
                      <p className="text-xs text-muted-foreground">{profile.sex} · {profile.heightCm}cm · {profile.weightKg}kg</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between"><span className="text-muted-foreground">Goal:</span> <span className="font-medium">{profile.goal || 'General Health'}</span></p>
                    <p className="flex justify-between"><span className="text-muted-foreground">Activity:</span> <span className="font-medium">{ACTIVITY_LEVELS.find(a => a.value === profile.activityLevel)?.label}</span></p>
                    <p className="flex justify-between"><span className="text-muted-foreground">Standard:</span> <span className="font-medium">US DRI</span></p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium">What you'll track:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" />32+ Nutrients</div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" />Personalized RDA</div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" />UL Safety Alerts</div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" />Gap Analysis</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Next Button */}
        <div className="pt-6">
          <Button
            onClick={handleNext}
            className="w-full h-12 text-base font-semibold"
            disabled={updateProfile.isPending || (step === 0 && !profile.goal) || (step === 1 && (!profile.sex || !profile.dateOfBirth))}
          >
            {step === 3 ? (updateProfile.isPending ? 'Saving...' : 'Get Started') : 'Continue'}
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
      </div>
    </div>
  )
}
