import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Toast({
  type = "success",
  message,
  onClose,
  duration = 3000,
  container,
}) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === "success" ? "bg-green-400/70" : "bg-red-400/70";
  const borderColor =
    type === "success" ? "border-green-900" : "border-red-900";
  const Icon = type === "success" ? CheckCircle : AlertCircle;

  if (!container) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className={`flex items-center justify-between gap-3 ${bgColor} border ${borderColor} text-white p-3 rounded-xl shadow-md mb-4 max-w-md`}
    >
      <div className="flex items-center gap-2">
        <Icon size={20} />
        <span className="break-words">{message}</span>
      </div>
      <button onClick={onClose} className="text-white hover:opacity-75">
        <X size={16} />
      </button>
    </motion.div>,
    container
  );
}
