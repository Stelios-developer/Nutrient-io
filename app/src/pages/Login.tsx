import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { ArrowRight, User } from "lucide-react";

const FEATURES = [
  { icon: '📊', text: 'Track 30+ nutrients across every meal' },
  { icon: '💊', text: 'Monitor supplements & avoid overdoses' },
  { icon: '📈', text: '7-day trends and personalised food tips' },
  { icon: '⚠️',  text: 'Safety alerts before exceeding upper limits' },
]

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      navigate("/", { replace: true });
      window.location.reload();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    loginMutation.mutate({ name: name.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">

      {/* ── Left panel — brand & features ── */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 px-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-md space-y-10">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <span className="text-3xl">🥗</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Nutrient</h1>
              <p className="text-emerald-100 text-sm">Your personal nutrition tracker</p>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <p className="text-4xl font-black text-white leading-tight">
              Know exactly<br />what you're eating.
            </p>
            <p className="text-emerald-100 mt-3 text-base leading-relaxed">
              Log meals, track nutrients, and get personalised recommendations — all in one place.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <span className="text-xl">{f.icon}</span>
                <p className="text-white text-sm font-medium">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — name entry ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile logo */}
          <div className="lg:hidden text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
              <span className="text-3xl">🥗</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Nutrient</h1>
          </div>

          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            {/* Coloured top stripe */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            <CardContent className="px-8 py-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Welcome! 👋</h2>
                <p className="text-muted-foreground mt-1">
                  Enter your first name to get started. We'll use it to personalise your experience.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User size={14} /> Your first name
                  </label>
                  <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Stelios"
                    className="h-12 text-base px-4 rounded-xl border-2 focus:border-emerald-500 transition-colors"
                    maxLength={80}
                    disabled={loginMutation.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 gap-2 shadow-md shadow-emerald-200 transition-all"
                  disabled={!name.trim() || loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Getting ready...
                    </span>
                  ) : (
                    <>
                      Let's go <ArrowRight size={18} />
                    </>
                  )}
                </Button>

                {loginMutation.isError && (
                  <p className="text-sm text-destructive text-center">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            For informational purposes only · Not medical advice<br />
            No account required — your data stays on this device.
          </p>
        </div>
      </div>
    </div>
  );
}
