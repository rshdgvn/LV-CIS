import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_URL } from "@/lib/config";
import Loader from "@/components/app/Loader";
export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const hash = params.get("hash");

    fetch(`${APP_URL}/email/verify/${id}/${hash}`)
      .then(async (res) => {
        const data = await res.json();
        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        } else {
          window.location.href = "/login?verified=0";
        }
      })
      .catch(() => {
        window.location.href = "/login?verified=0";
      });
  }, []);

  return <Loader />;
}
