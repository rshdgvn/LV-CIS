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

export function SignupForm({
  className,
  formData,
  handleChange,
  submitSignup,
  handleGoogleSignup,
  errors = {},
}) {
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

              <div className="text-muted-foreground text-center text-xs">
                Only La Verdad work accounts are accepted. For help, contact IT
                support.
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
