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
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginForm({
  className,
  formData,
  handleChange,
  submitLogin,
  handleGoogleLogin,
  loading,
  showResend,
  handleResendVerification,
  errors = {},
  ...props
}) {
  const [resendDisabled, setResendDisabled] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const nav = useNavigate();

  const handleResendClick = async () => {
    if (resendDisabled) return;

    setResendDisabled(true);
    setCooldown(30); // 30s cooldown
    await handleResendVerification();

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome Back</CardTitle>
          <CardDescription>Login with your La Verdad account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submitLogin}>
            <div className="grid gap-6">
              {/* Google Login */}
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={handleGoogleLogin}
              >
                <svg
                  className="h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Log in with Google
              </Button>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              {/* Email */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email address</Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                />
                {(errors.email || errors.general) && (
                  <p className="text-destructive text-xs">
                    {errors.email || errors.general}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    onClick={() => (window.location.href = "/forgot-password")}
                    className="ml-auto cursor-pointer text-sm underline-offset-4 text-blue-400 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-destructive text-xs">{errors.password}</p>
                )}
              </div>

              {showResend && (
                <div className="flex mt-1 justify-between">
                  <p className="text-sm text-gray-200">
                    Didn't receive an Email?
                  </p>
                  <button
                    onClick={handleResendClick}
                    disabled={resendDisabled}
                    className={`text-sm hover:underline self-start ${
                      resendDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-400 cursor-pointer"
                    }`}
                  >
                    {resendDisabled
                      ? `Resend email in ${cooldown}s`
                      : "Resend verification email"}
                  </button>
                </div>  
              )}

              <Button
                type="submit"
                className="w-full bg-blue-900 text-white"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Don't have an account?
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full bg-blue-900 text-white"
                onClick={() => nav("/signup")}
              >
                Create an account →
              </Button>

              <div className="text-muted-foreground text-center text-xs">
                Only La Verdad work accounts are accepted. For help, contact IT
                support.
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs *:[a]:underline *:[a]:underline-offset-4">
        By clicking Login, you agree to our{" "}
        <a target="blank" href="https://policies.google.com/terms?hl=en-US">
          Terms of Service
        </a>{" "}
        and{" "}
        <a target="blank" href="https://policies.google.com/privacy?hl=en-US">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
