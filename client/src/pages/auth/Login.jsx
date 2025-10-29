import { useState, useEffect } from "react";
import { LoginForm } from "@/components/login-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "../../assets/lvcc-logo.png";
import { APP_URL } from "@/lib/config";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

function Login() {
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [errors, setErrors] = useState({});
  const { setToken, getUser, user } = useAuth();
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

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
        setErrors(data.errors || { general: data.message });
        return;
      }

      await setToken(data.token);
      localStorage.setItem("token", data.token);

      const userData = await getUser(data.token);
      console.log("user", userData);

      if (userData?.role === "admin") {
        nav("/admin/dashboard");
      } else {
        nav("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${APP_URL}/auth/google`;
  };

  return (
    <div className="bg-neutral-900 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 bg-s">
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
        />
      </div>
    </div>
  );
}

export default Login;
