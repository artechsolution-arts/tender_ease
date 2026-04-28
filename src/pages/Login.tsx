import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth-store";

export default function Login() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Login — AP e-Procurement";
  }, []);

  if (currentUser) {
    return <Navigate to={currentUser.role === "vendor" ? "/vendor-dashboard" : "/"} replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = login(email, password);
    if (!user) {
      setError("Invalid credentials. Please try again.");
      return;
    }
    navigate(user.role === "vendor" ? "/vendor-dashboard" : "/", { replace: true });
  };

  return (
    <main className="min-h-screen bg-secondary/60">
      <div className="border-b-4 border-accent bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/10 ring-1 ring-primary-foreground/25">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-primary-foreground/75">Government of Andhra Pradesh</p>
              <h1 className="text-base font-bold md:text-xl">AP e-Procurement Portal</h1>
            </div>
          </div>
          <p className="hidden text-xs text-primary-foreground/75 sm:block">Tender Management Login</p>
        </div>
      </div>

      <section className="mx-auto flex min-h-[calc(100vh-76px)] max-w-md flex-col items-center justify-center px-4 py-8 md:px-8">
        <Card className="w-full rounded-sm border-border p-5 shadow-elegant-lg">
          <div className="mb-5 border-b border-border pb-4">
            <h2 className="text-lg font-bold text-primary">User Login</h2>
            <p className="text-xs text-muted-foreground">Sign in to your account.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email ID</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-10" required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="rounded-sm bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full rounded-sm bg-accent text-accent-foreground hover:bg-accent/90">
              Login
            </Button>
            <div className="mt-4 text-center mt-2 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-2">Don't have an account?</p>
              <Button type="button" variant="outline" className="w-full rounded-sm" onClick={() => navigate("/vendor-signup")}>
                Create Account
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </main>
  );
}