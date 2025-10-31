import { Button } from "@/components/ui/button";
import { isLoggedIn } from "@/lib/auth";
import { useNavigate } from "react-router";
import logo from "../assets/lvcc-logo.png";
import LVCIS from "../assets/LVCIS.png";
import { useAuth } from "@/contexts/AuthContext";
import FeaturesSection from "@/components/FeaturesSection";
import { motion } from "framer-motion";

function LandingPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const admin = user.role == "admin";

  return (
    <div className="w-full bg-neutral-900 text-white overflow-x-hidden">
      {/* HERO SECTION */}
      <section
        id="home"
        className="relative flex flex-col h-screen md:px-6
             bg-[radial-gradient(ellipse_at_top,theme(colors.blue.800)_0%,theme(colors.blue.900)_0%,theme(colors.neutral.900)_70%)] bg-[length:100%_30%] bg-no-repeat"
      >
        {/* NAVBAR */}
        <div className="flex flex-row items-center justify-between px-20 py-5">
          <motion.a
            href="/dashboard"
            className="flex items-center font-medium gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img src={logo} alt="La Verdad Club" className="h-13 w-12" />
            <img src={LVCIS} alt="LVCIS Logo" className="h-5 w-auto" />
          </motion.a>

          <motion.nav
            className="hidden md:flex gap-8 text-gray-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#clubs" className="hover:text-white transition-colors">
              Clubs
            </a>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {isLoggedIn() ? (
              <Button
                variant="outline"
                onClick={() => nav(admin ? "/admin/dashboard" : "/dashboard")}
              >
                Dashboard
              </Button>
            ) : (
              <Button variant="outline" onClick={() => nav("/login")}>
                Login
              </Button>
            )}
          </motion.div>
        </div>

        {/* HERO TEXT */}
        <div className="flex flex-col items-center justify-center mb-20 text-center flex-1">
          <motion.span
            className="block bg-blue-900 text-white px-3 py-1 rounded-xl text-xs md:text-sm font-medium mb-5 opacity-90"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Manage Clubs Digitally
          </motion.span>

          <motion.h1
            className="md:text-6xl text-4xl font-bold py-5 px-3 rounded-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="block bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-400 bg-clip-text text-transparent py-2">
              Level Up Your Club
            </span>
            <span className="bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-400 bg-clip-text text-transparent">
              Experience With{" "}
            </span>
            <span className="bg-gradient-to-r from-blue-400 via-blue-600 to-blue-500 bg-clip-text text-transparent py-2">
              LVCIS
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-3xl text-gray-400 md:text-lg text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Discover a smarter way to manage student organizations — from
            keeping track of members and attendance to organizing events and
            generating reports, all through one easy-to-use system.
          </motion.p>

          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                className="mt-6 bg-blue-900 text-white hover:bg-blue-950"
                onClick={() => nav("/login")}
              >
                Get Started
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() =>
                  document
                    .getElementById("about")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                Learn more →
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <FeaturesSection />
      
      <section
        id="about"
        className="min-h-screen flex flex-col items-center justify-center text-center px-6text-white"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">About Us</h2>
        <p className="mt-5 max-w-4xl text-gray-400 text-lg leading-relaxed">
          Welcome to the La Verdad Club Integrated System — a digital platform
          for LVCC students and organizations. LVCIS makes it easy to manage
          clubs and memberships, track attendance, schedule events, and stay
          updated all in one place.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-15">
          <img
            src={logo}
            alt="LVCC Logo"
            className="w-20 h-20 object-contain rounded-lg shadow-md hover:scale-105 transition-transform opacity-15"
          />
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
