import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_URL } from "@/lib/config";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const email = params.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${APP_URL}/forgot-password/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Password reset successfully! You can now log in.");
      window.location.href = "/login";
    } else {
      alert(data.message || "Failed to reset password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">Set a New Password</h2>
        <p className="text-sm mb-4 text-gray-400">
          For <span className="text-blue-400">{email}</span>
        </p>
        <Input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
        <Button type="submit" className="w-full">
          Update Password
        </Button>
      </form>
    </div>
  );
}

export default ResetPassword;
