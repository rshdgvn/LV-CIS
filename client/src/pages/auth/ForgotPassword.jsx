import { useState } from "react";
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

export function ForgotPassword({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${APP_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "Something went wrong");
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center px-4",
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
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              {message && (
                <p
                  className={`text-sm text-center mt-2 ${
                    message.toLowerCase().includes("success")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {message}
                </p>
              )}

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
