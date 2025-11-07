"use client";

import { Button } from "@/components/ui/button";
import { isLoggedIn } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/lvcc-logo.png";
import LVCIS from "../assets/LVCIS.png";
import { useAuth } from "@/contexts/AuthContext";
import FeaturesSection from "@/components/FeaturesSection";
import ClubsSection from "@/components/ClubsSection";
import Footer from "@/components/FooterSection";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Menu } from "lucide-react";

function LandingPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const admin = user?.role === "admin";

  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const sectionsRef = useRef({});

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const ids = ["home", "features", "about", "clubs"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionsRef.current[id] = el;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: "-40% 0px -40% 0px", threshold: 0.01 }
    );

    Object.values(sectionsRef.current).forEach((el) => observer.observe(el));

    return () => {
      Object.values(sectionsRef.current).forEach((el) =>
        observer.unobserve(el)
      );
    };
  }, []);

  const scrollToSection = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full bg-slate-950 text-white overflow-x-hidden scroll-smooth">
      {/* NAVBAR */}
      <motion.header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] md:w-[85%] transition-all duration-300 rounded-2xl border ${
          scrolled
            ? "shadow-md backdrop-blur-lg py-3"
            : "border-transparent py-4"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between px-6 md:px-10">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <img src={logo} alt="La Verdad Club" className="h-10 w-10" />
            <img src={LVCIS} alt="LVCIS Logo" className="h-5 w-auto" />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex gap-8 text-gray-600 items-center text-sm font-medium">
            <button
              onClick={() => scrollToSection("home")}
              className={`transition-colors ${
                active === "home"
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className={`transition-colors ${
                active === "features"
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600"
              }`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className={`transition-colors ${
                active === "about"
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600"
              }`}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("clubs")}
              className={`transition-colors ${
                active === "clubs"
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600"
              }`}
            >
              Clubs
            </button>
          </nav>

          {/* Auth Button + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              {isLoggedIn() ? (
                <Button
                  variant="outline"
                  onClick={() => nav(admin ? "/admin/dashboard" : "/dashboard")}
                  className="text-white transition"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="text-white transition"
                  onClick={() => nav("/login")}
                >
                  Login
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen((s) => !s)}
              className="md:hidden p-2 rounded-lg"
              aria-label="Toggle menu"
            >
              <Menu className="w-7 h-7 text-blue-600 hover:text-blue-400 transition" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div className="md:hidden mt-3 px-6 pb-4">
            <div className="flex flex-col gap-3 text-gray-700">
              {["home", "features", "about", "clubs"].map((id) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`text-left py-2 px-2 rounded-md ${
                    active === id
                      ? "text-blue-600 font-semibold"
                      : "hover:text-blue-600"
                  }`}
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}

              <div className="pt-3">
                {isLoggedIn() ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      nav(admin ? "/admin/dashboard" : "/dashboard")
                    }
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-blue-900 text-white hover:bg-blue-950"
                    onClick={() => nav("/login")}
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.header>

      {/* HERO SECTION */}
      <section
        id="home"
        className="relative flex flex-col h-screen px-10 md:px-6 pt-28
          bg-[radial-gradient(ellipse_at_top,theme(colors.slate.800)_5%,theme(colors.slate.900)_20%,theme(colors.slate-950)_70%)] bg-[length:100%_30%] bg-no-repeat"
      >
        <div className="flex flex-col items-center justify-center mb-20 text-center flex-1">
          <motion.span
            className="block bg-blue-900 text-white px-3 py-1 rounded-xl text-xs md:text-sm font-medium mb-5 opacity-90"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Manage Clubs Digitally.
          </motion.span>

          <motion.h1
            className="md:text-7xl text-5xl font-bold py-5 px-3 rounded-3xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
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
            className="mt-6 max-w-4xl text-gray-400 md:text-xl text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Discover a smarter way to manage student organizations — from
            keeping track of members and attendance to organizing events and
            generating reports, all through one easy-to-use system.
          </motion.p>

          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
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
                onClick={() => scrollToSection("about")}
              >
                Learn more →
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES (wrapped in section with id for nav) */}
      <section id="features" className="w-full">
        <FeaturesSection />
      </section>

      {/* ABOUT SECTION */}
      <section
        id="about"
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 text-white"
      >
        <motion.h2
          className="text-5xl font-bold mb-4 bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          About LVCIS
        </motion.h2>

        <motion.p
          className="mt-5 max-w-6xl text-gray-400 md:text-xl text-lg leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          La Verdad Club Integrated System (LVCIS) — an all-in-one digital
          platform designed for La Verdad Christian College students and
          organizations. LVCIS streamlines the way clubs operate by making it
          simple to manage memberships, record attendance, organize events, and
          share updates — all within a single, user-friendly system.
        </motion.p>

        <motion.div
          className="mt-7 flex flex-wrap justify-center gap-15"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <img
            src={logo}
            alt="LVCC Logo"
            className="absolute w-20 h-20 object-contain rounded-lg shadow-md hover:scale-105 transition-transform opacity-30"
          />
        </motion.div>
      </section>

      {/* CLUBS */}
      <section id="clubs">
        <ClubsSection />
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default LandingPage;
