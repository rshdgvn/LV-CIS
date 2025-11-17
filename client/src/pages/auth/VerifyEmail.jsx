import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_URL } from "@/lib/config";
import Loader from "@/components/app/Loader";
import { useToast } from "@/providers/ToastProvider";
import { FRONTEND_URL } from "@/lib/config";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const executedRef = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const verifyEmail = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const id = params.get("id");
        const hash = params.get("hash");

        const res = await fetch(`${APP_URL}/email/verify/${id}/${hash}`);
        const data = await res.json();

        if (data.success) {
          addToast("Email verified successfully!", "success");

          navigate("/login?verified=1")
        } else {
          navigate("/login?verified=0", { replace: true });
        }
      } catch (error) {
        navigate("/login?verified=0", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [location.search, navigate, addToast]);

  if (loading) return <Loader />;

  return null;
}
