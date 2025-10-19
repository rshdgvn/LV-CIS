import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

function GoogleCallback() {
  const navigate = useNavigate();
  const { setToken, user } = useAuth(); 

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("Received token:", token);

    if (token) {
      setToken(token); 
      localStorage.setItem("token", token); 
      navigate('/dashboard');
    }
  }, [navigate, setToken]);

  useEffect(() => {
    if(user.role == 'admin'){
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard')
    }
  },[user])
  return;
}

export default GoogleCallback;
