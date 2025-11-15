import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/providers/ToastProvider";

export default function GoogleSignupSuccess() {
  const nav = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    addToast("Signup successful! Please check your email to verify your account.", "success");

    nav("/login");
  }, []);

  return null;
}
