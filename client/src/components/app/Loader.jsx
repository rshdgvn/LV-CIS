import { motion } from "framer-motion";
import logo from "../../assets/lvcc-logo.png";
import LVCIS from "../../assets/LVCIS.png";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-900">
      <motion.img
        src={logo}
        alt="LVCC Logo"
        className="w-24 h-24 mb-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.8, 1.1, 1, 0.9],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          repeatDelay: 0.5,
          ease: "easeInOut",
        }}
      />

      <motion.img
        src={LVCIS}
        alt="LVCIS Text"
        className="w-40"
        initial={{ opacity: 0, y: 15 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [15, 0, 0, -10],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          repeatDelay: 0.5,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
