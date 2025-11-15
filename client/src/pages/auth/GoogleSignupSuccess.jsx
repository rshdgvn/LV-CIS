import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/providers/ToastProvider";

export default function GoogleSignupSuccess() {
  const nav = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    addToast("Signup successful! You can now log in.", "success");

    nav("/login");
  }, []);

  return null;
}
