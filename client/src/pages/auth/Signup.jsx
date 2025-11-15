"use client";
import { useState } from "react";
import { SignupForm } from "@/components/signup-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "../../assets/lvcc-logo.png";
import { APP_URL } from "@/lib/config";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Loader from "@/components/app/Loader";
import { useToast } from "@/providers/ToastProvider";

function Signup() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    course: "",
    year_level: "",
  });

  const { addToast } = useToast();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { setToken, getUser } = useAuth();
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});
    NProgress.start();
    try {
      const res = await fetch(`${APP_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || { general: data.message || "Signup failed" });
        setLoading(false);
        return;
      }

      addToast(
        "Account created! Please check your email to verify your account.",
        "success"
      );

      nav("/login");
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ general: "Something went wrong. Try again." });
      addToast("Something went wrong. Try again.", "error");
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };
  const handleGoogleSignup = () => {
    window.location.href = `${APP_URL}/auth/google`;
  };

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10 bg-slate-950">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignupForm
          formData={formData}
          handleChange={handleChange}
          submitSignup={handleSignup}
          errors={errors}
          handleGoogleSignup={handleGoogleSignup}
        />
      </div>
    </div>
  );
}

export default Signup;
