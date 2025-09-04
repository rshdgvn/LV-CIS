import { useState, useEffect } from "react";
import { LoginForm } from "@/components/login-form";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

function Login() {
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [errors, setErrors] = useState({});
  const { user, token, setToken } = useAuth(); 
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNavigate = (role) => {

  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        setErrors(data.errors || { general: data.message });
        return;
      }

      setToken(data.token); 
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google";
  };

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        nav("/admin/dashboard");
      } else {
        nav("/dashboard");
      }
    }
  }, [user]);

  if (token) {
    return(
      <div>
        <h1>continue</h1>
      </div>
    )
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          La verdad Club integrated system
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
