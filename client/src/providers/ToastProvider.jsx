import { createContext, useContext, useState, useRef } from "react";
import Toast from "@/components/app/Toast";
import { AnimatePresence } from "framer-motion";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastContainerRef = useRef(null);

  const addToast = (message, type = "success", duration) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container */}
      <div
        ref={toastContainerRef}
        className="fixed top-4 right-4 flex flex-col-reverse items-end z-[100]"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <Toast
              key={t.id}
              type={t.type}
              message={t.message}
              duration={t.duration}
              onClose={() => removeToast(t.id)}
              container={toastContainerRef.current}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
