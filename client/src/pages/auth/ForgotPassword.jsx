import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_URL } from "@/lib/config";
import { useToast } from "@/providers/ToastProvider";

export function ForgotPassword({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { addToast } = useToast();
  const intervalRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("resetCooldown");
    if (stored) {
      const remaining = Math.floor((Number(stored) - Date.now()) / 1000);
      if (remaining > 0) setCooldown(remaining);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            localStorage.removeItem("resetCooldown");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setLoading(true);

    try {
      const res = await fetch(`${APP_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.status === 200) {
        addToast(data.message, "success");
        if (data.cooldown) {
          setCooldown(data.cooldown);
          const cooldownEnd = Date.now() + data.cooldown * 1000;
          localStorage.setItem("resetCooldown", cooldownEnd.toString());
        }
      } else if (res.status === 429) {
        addToast(data.message, "error");
        if (data.cooldown) {
          setCooldown(data.cooldown);
          const cooldownEnd = Date.now() + data.cooldown * 1000;
          localStorage.setItem("resetCooldown", cooldownEnd.toString());
        }
      } else {
        addToast("Something went wrong!", "error");
      }
    } catch (err) {
      console.log(err);
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center px-4 bg-slate-950",
        className
      )}
      {...props}
    >
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">
              Forgot Your Password?
            </CardTitle>
            <CardDescription>
              Enter your email below and we’ll send you a password reset link.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || cooldown > 0}
                className="w-full bg-blue-900 text-white"
              >
                {loading
                  ? "Sending..."
                  : cooldown > 0
                  ? `Wait ${cooldown}s`
                  : "Send Reset Link"}
              </Button>

              <div className="text-sm text-muted-foreground mt-4">
                <a
                  href="/login"
                  className="text-white hover:underline underline-offset-4"
                >
                  Back to Login
                </a>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-muted-foreground text-center text-xs mt-4 text-balance">
          If you don’t receive an email, please check your spam folder or
          contact IT support.
        </div>
      </div>
    </div>
  );
}
