import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogOut, User, Settings, Moon, Globe, Save } from 'lucide-react'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const utils = trpc.useUtils()
  const userId = user?.id ?? 1

  const [editing, setEditing] = useState(false)
  const [height, setHeight] = useState(user?.heightCm ? String(user.heightCm) : '')
  const [weight, setWeight] = useState(user?.weightKg ? String(user.weightKg) : '')
  const [sex, setSex] = useState(user?.sex ?? '')
  const [activity, setActivity] = useState(user?.activityLevel ?? 'moderately_active')

  const updateProfile = trpc.onboarding.updateProfile.useMutation({
    onSuccess: () => {
      utils.onboarding.getProfile.invalidate()
      setEditing(false)
    },
  })

  const handleSave = () => {
    updateProfile.mutate({
      userId,
      heightCm: height ? parseFloat(height) : undefined,
      weightKg: weight ? parseFloat(weight) : undefined,
      sex: sex as 'male' | 'female' | undefined,
      activityLevel: activity as any,
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-4xl font-black tracking-tight">Profile</h1>
        <p className="text-base text-muted-foreground mt-1.5">Manage your account and nutrition settings</p>
      </div>

      {/* User Card */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {user?.name?.[0] ?? 'U'}
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.name ?? 'User'}</p>
              <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Profile */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <User size={16} />
            Nutrition Profile
          </h2>
          {!editing && (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit</Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {editing ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Height (cm)</label>
                  <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Weight (kg)</label>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Sex</label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Activity Level</label>
                <Select value={activity} onValueChange={(v: string) => setActivity(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active</SelectItem>
                    <SelectItem value="very_active">Very Active</SelectItem>
                    <SelectItem value="extremely_active">Extremely Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
                <Button className="flex-1 gap-1" onClick={handleSave} disabled={updateProfile.isPending}>
                  <Save size={14} /> Save
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2.5">
              <ProfileRow label="Height" value={user?.heightCm ? `${user.heightCm} cm` : 'Not set'} />
              <ProfileRow label="Weight" value={user?.weightKg ? `${user.weightKg} kg` : 'Not set'} />
              <ProfileRow label="Sex" value={user?.sex ? (user.sex.charAt(0).toUpperCase() + user.sex.slice(1)) : 'Not set'} />
              <ProfileRow label="Activity" value={user?.activityLevel ? user.activityLevel.replace('_', ' ') : 'Moderately active'} />
              <ProfileRow label="Life Stage" value={user?.lifeStage && user.lifeStage !== 'none' ? user.lifeStage : 'Not set'} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Settings size={16} />
            Settings
          </h2>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          <button className="w-full flex items-center justify-between py-3 px-2 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-muted-foreground" />
              <span className="text-sm">Region</span>
            </div>
            <span className="text-xs text-muted-foreground">US (DRI)</span>
          </button>
          <Separator />
          <button className="w-full flex items-center justify-between py-3 px-2 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <Moon size={16} className="text-muted-foreground" />
              <span className="text-sm">Theme</span>
            </div>
            <span className="text-xs text-muted-foreground">System</span>
          </button>
        </CardContent>
      </Card>

      {/* About */}
      <div className="text-center space-y-1 pt-2">
        <p className="text-xs text-muted-foreground">Nutrient Tracker v1.0</p>
        <p className="text-[10px] text-muted-foreground">Data sources: USDA FoodData Central · DRI Reference Values</p>
        <p className="text-[10px] text-muted-foreground mt-2 max-w-xs mx-auto">
          Disclaimer: This app is for informational purposes only and does not constitute medical advice.
        </p>
      </div>

      {/* Logout */}
      <Button variant="outline" className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
        <LogOut size={16} /> Log Out
      </Button>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
