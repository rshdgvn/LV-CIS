import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_URL } from "@/lib/config";
import { useNavigate } from "react-router-dom";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setToken("");

    const res = await fetch(`${APP_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);
    setMessage(data.message || "Something went wrong");

    if (data.token) {
      setToken(data.token);
    }
  };

  const nav = useNavigate();

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    alert("Token copied to clipboard!");
  };

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center">Forgot Password</h2>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <Button
          disabled={loading}
          type="submit"
          className="bg-blue-700 text-white"
        >
          {loading ? "Generating..." : "Generate Reset Token"}
        </Button>
      </form>

      {message && (
        <p className="text-sm text-center text-muted-foreground mt-2">
          {message}
        </p>
      )}

      {token && (
        <div className="bg-muted p-3 rounded-md mt-3">
          <p className="text-xs text-muted-foreground text-center break-all">
            <strong>Reset Token:</strong> {token}
          </p>
          <Button
            onClick={() => navigator.clipboard.writeText(token)}
            className="w-full mt-2 bg-blue-700 text-white"
          >
            Copy Token
          </Button>
          <Button
            onClick={() =>
              nav(
                `/reset-password?email=${encodeURIComponent(
                  email
                )}&token=${token}`
              )
            }
            className="w-full mt-2 bg-green-700 text-white"
          >
            Go to Reset Password
          </Button>
        </div>
      )}
    </div>
  );
}
