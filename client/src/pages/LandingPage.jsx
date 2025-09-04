import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"

function LandingPage() {
  const nav = useNavigate();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button onClick={() => nav('/login')}>Sign in</Button>
    </div>
  )
}

export default LandingPage