import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

function GoogleCallback() {
  const navigate = useNavigate();
  const { setToken } = useAuth(); 

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("Received token:", token);

    if (token) {
      setToken(token); 
      localStorage.setItem("token", token); 
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate, setToken]);

  return <p>Signing you in with Google...</p>;
}

export default GoogleCallback;
