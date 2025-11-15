import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { APP_URL } from "@/lib/config";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/ToastProvider"; // import toast
import { Eye, EyeOff } from "lucide-react"; // icons

export function ResetPassword({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // for validation/error messages
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast(); // toast hook

  useEffect(() => {
    const urlToken = searchParams.get("token");
    const urlEmail = searchParams.get("email");
    if (urlToken) setToken(urlToken);
    if (urlEmail) setEmail(urlEmail);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${APP_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: confirm,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast("Password reset successfully!", "success"); // only success
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again.");
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
              Reset Password
            </CardTitle>
            <CardDescription>
              Enter your new password below to reset your account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              <input type="hidden" value={email} readOnly />
              <input type="hidden" value={token} readOnly />

              {/* New Password */}
              <div className="grid gap-3 relative">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="grid gap-3 relative">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-9 text-muted-foreground"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-900 text-white"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>

              {/* Error / Validation Message */}
              {message && (
                <p className="text-sm text-center mt-2 text-red-500">
                  {message}
                </p>
              )}

              <div className="text-center text-sm text-muted-foreground mt-4">
                <a
                  href="/login"
                  className="text-blue-700 hover:underline underline-offset-4"
                >
                  Back to Login
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
