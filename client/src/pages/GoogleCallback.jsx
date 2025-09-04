import { useEffect } from "react";
import { useNavigate } from "react-router";

function GoogleCallback() {
  const nav = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log(token);
    if (token) {
      localStorage.setItem("token", token);
      nav("/dashboard");
    } else {
      nav("/login");
    }
  }, [nav]);

  return <p>Signing you in with Google...</p>;
}

export default GoogleCallback;
