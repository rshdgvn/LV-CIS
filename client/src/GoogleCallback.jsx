import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Loader from "./components/app/Loader";
import { useToast } from "./providers/ToastProvider";

function GoogleCallback() {
  const navigate = useNavigate();
  const { setToken, getUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return; 
    executedRef.current = true;

    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (!token) return;

      setToken(token);
      localStorage.setItem("token", token);

      const userData = await getUser(token);

      addToast("Login successful!", "success");

      if (userData?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

      setLoading(false);
    };

    handleGoogleCallback();
  }, [setToken, getUser, navigate, addToast]);

  if (loading) return <Loader />;

  return null;
}

export default GoogleCallback;
