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
        className={`fixed left-1/2 -translate-x-1/2 z-50 w-full transition-all duration-300 border ${
          scrolled
            ? "shadow-md backdrop-blur-xl py-3"
            : "border-transparent py-4"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15]"></div>
          {/* Glow Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen animate-fade-in" />
        </div>

        <div
          className="
            px-6 md:px-10
            flex items-center justify-between   
            md:grid md:grid-cols-3 md:items-center 
          "
        >
          {/* Left: Logo */}
          <a href="/" className="flex items-center gap-3">
            <img src={logo} alt="La Verdad Club" className="h-10 w-10" />
            <img src={LVCIS} alt="LVCIS Logo" className="h-5 w-auto" />
          </a>

          {/* Center: Nav Menu */}
          <nav className="hidden md:flex justify-center gap-8 text-white/50 items-center text-sm font-medium">
            <button
              onClick={() => scrollToSection("home")}
              className={`transition-colors cursor-pointer ${
                active === "home"
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className={`transition-colors cursor-pointer ${
                active === "features"
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600"
              }`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className={`transition-colors cursor-pointer ${
                active === "about"
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600"
              }`}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("clubs")}
              className={`transition-colors cursor-pointer ${
                active === "clubs"
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600"
              }`}
            >
              Clubs
            </button>
          </nav>

          {/* Right: Auth Buttons + Mobile */}
          <div className="flex justify-end items-center gap-3">
            <div className="hidden md:flex gap-3">
              {isLoggedIn() ? (
                <Button
                  variant="outline"
                  onClick={() => nav(admin ? "/admin/dashboard" : "/dashboard")}
                  className="text-white transition cursor-pointer"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="text-white transition cursor-pointer"
                  onClick={() => nav("/login")}
                >
                  Login
                </Button>
              )}
              <Button
                className="bg-blue-900 text-white hover:bg-blue-950 cursor-pointer"
                onClick={() => nav("/signup")}
              >
                Sign up
              </Button>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen((s) => !s)}
              className="md:hidden p-2 rounded-lg"
              aria-label="Toggle menu"
            >
              <Menu className="w-7 h-7 text-white hover:text-blue-400 transition cursor-pointer" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div className="md:hidden mt-3 px-6 pb-4 shadow-md">
            <div className="flex flex-col gap-3 text-gray-700">
              {["home", "features", "about", "clubs"].map((id) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`text-left py-2 px-2 rounded-md cursor-pointer ${
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
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer"
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full bg-blue-900 text-white hover:bg-blue-950 cursor-pointer"
                    onClick={() => nav("/login")}
                  >
                    Login
                  </Button>
                )}
              </div>
              <Button
                className="bg-blue-900 text-white hover:bg-blue-950 cursor-pointer"
                onClick={() => nav("/signup")}
              >
                Sign up
              </Button>
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
            className="mt-8 inline-block px-4 py-1 rounded-full bg-blue-900/30 border border-blue-800/50 text-sm text-blue-200"
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
            <span className="block bg-gradient-to-r from-white via-neutral-300 to-white bg-clip-text text-transparent py-2">
              Level Up Your Club
            </span>
            <span className="bg-gradient-to-r from-white via-neutral-300 to-white bg-clip-text text-transparent">
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
            className="flex gap-5"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                className="mt-6 bg-blue-900 text-white hover:bg-blue-950 p-6 text-md cursor-pointer"
                onClick={() => nav("/signup")}
              >
                Get Started
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="outline"
                className="mt-6  p-6 text-md cursor-pointer"
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
      <section id="about" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-linear-to-br from-white/6 to-transparent border border-white/5 rounded-3xl p-8 md:p-16 relative overflow-hidden">
            {/* Decorative blurs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                About <span className="text-blue-500">LVCIS</span>
              </h2>

              <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-12">
                La Verdad Club Integrated System (LVCIS) is an all-in-one
                digital platform designed specifically for La Verdad Christian
                College. We bridge the gap between students and organizations,
                making it simple to manage memberships, automate attendance, and
                foster a vibrant campus community.
              </p>
            </div>
          </div>
        </div>
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
