import { useState, useEffect, useRef } from "react";
import { LoginForm } from "@/components/login-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/providers/ToastProvider";
import { APP_URL } from "@/lib/config";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Loader from "@/components/app/Loader";
import logo from "../../assets/lvcc-logo.png";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const intervalRef = useRef(null);

  const { setToken, getUser } = useAuth();
  const nav = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("resendCooldown");
    if (stored) {
      const remaining = Math.floor((Number(stored) - Date.now()) / 1000);
      if (remaining > 0) setResendCooldown(remaining);
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      localStorage.removeItem("resendCooldown");
      return;
    }

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            localStorage.removeItem("resendCooldown");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setShowResend(false);
    NProgress.start();

    try {
      const res = await fetch(`${APP_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message === "Please verify your email before logging in.") {
          setShowResend(true);
        }
        setErrors(data.errors || { general: data.message || "Login failed" });
        return;
      }

      setLoading(true);
      await setToken(data.token);
      const userData = await getUser(data.token);

      addToast("Login successful!", "success");

      if (userData?.role === "admin") nav("/admin/dashboard");
      else nav("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "Something went wrong. Try again." });
      addToast("Something went wrong. Try again.", "error");
    } finally {
      NProgress.done();
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;

    try {
      const res = await fetch(`${APP_URL}/email/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast(data.message, "success");
        if (data.cooldown) {
          setResendCooldown(data.cooldown);
          localStorage.setItem(
            "resendCooldown",
            (Date.now() + data.cooldown * 1000).toString()
          );
        }
      } else if (res.status === 429) {
        addToast(data.message, "error");
        if (data.cooldown) {
          setResendCooldown(data.cooldown);
          localStorage.setItem(
            "resendCooldown",
            (Date.now() + data.cooldown * 1000).toString()
          );
        }
      } else {
        addToast(data.message || "Failed to resend email.", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Failed to resend email.", "error");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${APP_URL}/auth/google?state=login`;
  };

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-[radial-gradient(circle_at_center,var(--color-slate-800)_5%,var(--color-slate-900)_40%,var(--color-slate-950)_80%)]">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <img
            src={logo}
            alt="La Verdad Club"
            className="h-16 w-16 object-contain"
          />
        </a>
        <LoginForm
          formData={formData}
          handleChange={handleChange}
          submitLogin={handleLogin}
          errors={errors}
          handleGoogleLogin={handleGoogleLogin}
          showResend={showResend}
          handleResendVerification={handleResendVerification}
          resendCooldown={resendCooldown}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default Login;
