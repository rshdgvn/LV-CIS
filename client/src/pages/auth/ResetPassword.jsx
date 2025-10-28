import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_URL } from "@/lib/config";

export function ResetPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

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
    setLoading(false);
    setMessage(data.message || "Something went wrong");
  };

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center">Reset Password</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <div>
          <Label htmlFor="token">Reset Token</Label>
          <Input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            placeholder="Enter your reset token"
          />
        </div>

        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        <Button
          disabled={loading}
          type="submit"
          className="bg-blue-700 text-white"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      {message && (
        <p className="text-sm text-center text-muted-foreground mt-2">
          {message}
        </p>
      )}
    </div>
  );
}
