import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { SkeletonSidebar } from "./components/skeletons/SkeletonSidebar";
import { SidebarProvider } from "./components/ui/sidebar";

function GoogleCallback() {
  const navigate = useNavigate();
  const { setToken, getUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (!token) return;

      setToken(token);
      localStorage.setItem("token", token);

      // Wait for user data
      const userData = await getUser(token);

      // Navigate after user is ready
      if (userData?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

      setLoading(false);
    };

    handleGoogleCallback();
  }, [setToken, getUser, navigate]);

  if (loading) {
    return (
      <SidebarProvider>
        <SkeletonSidebar />
      </SidebarProvider>
    );
  }

  return null;
}

export default GoogleCallback;
