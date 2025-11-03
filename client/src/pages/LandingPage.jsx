import { Button } from "@/components/ui/button";
import { isLoggedIn } from "@/lib/auth";
import { useNavigate } from "react-router";
import logo from "../assets/lvcc-logo.png";
import LVCIS from "../assets/LVCIS.png";
import { useAuth } from "@/contexts/AuthContext";
import FeaturesSection from "@/components/FeaturesSection";
import ClubsSection from "@/components/ClubsSection";
import { motion } from "framer-motion";

function LandingPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const admin = user?.role === "admin";

  return (
    <div className="w-full bg-slate-950 text-white overflow-x-hidden">
      {/* HERO SECTION */}
      <section
        id="home"
        className="relative flex flex-col h-screen md:px-6
             bg-[radial-gradient(ellipse_at_top,theme(colors.slate.800)_5%,theme(colors.slate.900)_20%,theme(colors.slate-950)_70%)] bg-[length:100%_30%] bg-no-repeat"
      >
        {/* NAVBAR */}
        <div className="flex flex-row items-center justify-between px-20 py-5">
          <motion.a
            href="/dashboard"
            className="flex items-center font-medium gap-3"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <img src={logo} alt="La Verdad Club" className="h-13 w-12" />
            <img src={LVCIS} alt="LVCIS Logo" className="h-5 w-auto" />
          </motion.a>

          <motion.nav
            className="hidden md:flex gap-8 text-gray-300"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Manage Clubs Digitally
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

      {/* FEATURES */}
      <FeaturesSection />

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
          What are we About?
        </motion.h2>

        <motion.p
          className="mt-5 max-w-7xl text-gray-400 md:text-xl text-lg leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          La Verdad Club Integrated System (LVCIS) — an all-in-one digital
          platform designed for La Verdad Christian College students and
          organizations. LVCIS streamlines the way clubs operate by making it
          simple to manage memberships, record attendance, organize events, and
          share updates — all within a single, user-friendly system. Empowering
          collaboration, transparency, and engagement, LVCIS helps every student
          and club leader stay connected and focused on what matters most —
          building a vibrant and active campus community.
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
            className="absolute w-20 h-20 object-contain rounded-lg shadow-md hover:scale-105 transition-transform opacity-15"
          />
        </motion.div>
      </section>

      {/* CLUBS SECTION */}
      {/* <section
        id="clubs"
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white"
      >
        <motion.h2
          className="text-5xl font-bold mb-4 bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          Explore Our Clubs
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-30 mt-5 max-w-7xl">
          {[
            {
              title: "Association of ICT Majors",
              description: "This is sample text for the description",
              category: "Academics",
            },
            {
              title: "La Verdad Dance Troupe",
              description: "This is sample text for the description",
              category: "Culture and Performing Arts",
            },
            {
              title: "Disaster Response and Rescue Team",
              description: "This is sample text for the description",
              category: "Socio-politics",
            },
          ].map((club, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              className="bg-blue-950/60 rounded-2xl overflow-hidden shadow-lg text-left"
            >
              <img
                src="/Lv-Background.jpg"
                alt={club.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2">{club.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{club.description}</p>
                <span className="block font-bold text-sm">{club.category}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Button
            variant="outline"
            className="mt-10 border-blue-700 text-white hover:bg-blue-800"
            onClick={() => nav("/clubs")}
          >
            View All Clubs
          </Button>
        </motion.div>
      </section> */}
      <ClubsSection />
    </div>
  );
}

export default LandingPage;
