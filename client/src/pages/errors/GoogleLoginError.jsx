import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import logo from "../../assets/lvcc-logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function GoogleLoginError() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msg = params.get("message");
    setMessage(msg || "An unknown error occurred.");
  }, [location.search]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-col items-center gap-2">
          <img
            src={logo}
            alt="La Verdad Club"
            className="h-16 w-16 object-contain"
          />
          <CardTitle className="text-xl text-center">
            Google Login Error
          </CardTitle>
          <CardDescription className="text-center">
            There was a problem logging in with Google
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 items-center">
          <p className="text-center text-red-400">{message}</p>

          <Button
            className="w-full bg-blue-900 hover:bg-blue-950 text-white mt-2"
            onClick={() => navigate("/login")}
          >
            Go Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
