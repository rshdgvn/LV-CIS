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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Info } from "lucide-react";

export function SignupForm({
  className,
  formData,
  handleChange,
  submitSignup,
  handleGoogleSignup,
  errors = {},
}) {
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidationErrors, setPasswordValidationErrors] = useState([]);
  const [isTypingPassword, setIsTypingPassword] = useState(false);

  // --- Password Validation Helper ---
  const validatePasswordStrength = (password) => {
    const issues = [];
    if (!password || password.length < 8) issues.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) issues.push("One uppercase letter");
    if (!/[a-z]/.test(password)) issues.push("One lowercase letter");
    if (!/[0-9]/.test(password)) issues.push("One number");
    if (!/[!@#$%^&*]/.test(password))
      issues.push("One special character (!@#$%^&*)");
    return issues;
  };

  // --- Local Submit Handler ---
  const handleLocalSubmit = (e) => {
    e.preventDefault();
    setPasswordValidationErrors([]);

    // Check password strength before sending to backend
    const strengthIssues = validatePasswordStrength(formData.password);

    if (strengthIssues.length > 0) {
      setPasswordValidationErrors(strengthIssues);
      return; // Stop submission
    }

    // Pass to parent handler if valid
    submitSignup(e);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Join La Verdad Club Integrated System
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLocalSubmit}>
            <div className="grid gap-6">
              {/* First + Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label>First name</Label>
                  <Input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First name"
                  />
                  {errors.first_name && (
                    <p className="text-destructive text-xs">
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div className="grid gap-1">
                  <Label>Last name</Label>
                  <Input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last name"
                  />
                  {errors.last_name && (
                    <p className="text-destructive text-xs">
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="grid gap-1">
                <Label>Email address</Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Enter your email"
                />
                {(errors.email || errors.general) && (
                  <p className="text-destructive text-xs">
                    {errors.email || errors.general}
                  </p>
                )}
              </div>

              {/* Password Section */}
              <div className="grid gap-1 relative">
                <div className="flex items-center justify-between">
                  <Label>Password</Label>
                </div>

                <div className="relative">
                  <Input
                    name="password"
                    value={formData.password}
                    onChange={(e) => {
                      handleChange(e);

                      // Show info only when typing
                      setIsTypingPassword(e.target.value.length > 0);

                      // Clear local errors
                      if (passwordValidationErrors.length > 0)
                        setPasswordValidationErrors([]);
                    }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {isTypingPassword && (
                  <div className="flex items-start gap-2 mt-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-[11px] leading-tight">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <span>
                      Password must be at least 8 chars, include uppercase,
                      lowercase, number & symbol.
                    </span>
                  </div>
                )}

                {(errors.password || passwordValidationErrors.length > 0) && (
                  <div className="text-destructive text-xs mt-1 flex flex-col gap-0.5">
                    {errors.password && <p>{errors.password}</p>}
                    {passwordValidationErrors.map((err, i) => (
                      <span key={i}>• {err}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Course + Year Level */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label>Course</Label>
                  <Select
                    value={formData.course}
                    onValueChange={(value) =>
                      handleChange({ target: { name: "course", value } })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Courses</SelectLabel>
                        {["ACT", "BAB", "BSA", "BSAIS", "BSIS", "BSSW"].map(
                          (c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.course && (
                    <p className="text-destructive text-xs">{errors.course}</p>
                  )}
                </div>

                <div className="grid gap-1">
                  <Label>Year Level</Label>
                  <Select
                    value={formData.year_level}
                    onValueChange={(value) =>
                      handleChange({ target: { name: "year_level", value } })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Year</SelectLabel>
                        {[1, 2, 3, 4].map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.year_level && (
                    <p className="text-destructive text-xs">
                      {errors.year_level}
                    </p>
                  )}
                </div>
              </div>

              <Button className="w-full bg-blue-900 text-white" type="submit">
                Create Account
              </Button>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={handleGoogleSignup}
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
                Sign up with Google
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <span
                  className="text-blue-400 cursor-pointer hover:underline"
                  onClick={() => nav("/login")}
                >
                  Login
                </span>
                .
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs *:[a]:underline *:[a]:underline-offset-4">
        By clicking Create Account, you agree to our{" "}
        <span
          className="underline cursor-pointer"
          onClick={() => nav("/terms")}
        >
          Terms of Service
        </span>{" "}
        and{" "}
        <span
          className="underline cursor-pointer"
          onClick={() => nav("/privacy")}
        >
          Privacy Policy
        </span>
        .
      </div>
    </div>
  );
}
