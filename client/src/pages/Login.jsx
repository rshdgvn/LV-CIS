import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { useNavigate } from "react-router"; 

function Login() {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [token, setToken] = useState(null);

  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    console.log("working");

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

      localStorage.setItem("token", data.token);
      setToken(data.token);

      nav("/dashboard"); 
    } catch (error) {
      console.error("Login error:", error);
    }
  };

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
        />
      </div>
    </div>
  );
}

export default Login;
