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

export function SignupForm({
  className,
  formData,
  handleChange,
  submitSignup,
  handleGoogleSignup,
  errors = {},
}) {
  const nav = useNavigate();

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
          <form onSubmit={submitSignup}>
            <div className="grid gap-6">
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

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
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

              {/* Password */}
              <div className="grid gap-1">
                <Label>Password</Label>
                <Input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-destructive text-xs">{errors.password}</p>
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

              {/* Signup Button */}
              <Button className="w-full bg-blue-900 text-white" type="submit">
                Create Account
              </Button>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Already have an account?
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full bg-blue-900 text-white"
                onClick={() => nav("/login")}
              >
                Sign in instead →
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
