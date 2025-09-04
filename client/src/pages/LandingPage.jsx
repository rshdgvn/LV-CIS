import { Button } from "@/components/ui/button";
import { isLoggedIn } from "@/lib/auth";
import { useNavigate } from "react-router";

function LandingPage() {
  const nav = useNavigate();

  return isLoggedIn() ? (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button onClick={() => nav("/dashboard")}>Dashboard</Button>
    </div>
  ) : (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button onClick={() => nav("/login")}>Sign in</Button>
    </div>
  );
}

export default LandingPage;
