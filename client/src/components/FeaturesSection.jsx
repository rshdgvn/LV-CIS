import { useState } from "react";
import { BarChart3, Users, GraduationCap, CalendarCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  {
    icon: BarChart3,
    title: "Dashboard and Analytics",
    description: "Your central hub for updates and performance metrics.",
    image: "/Dashboard.png", // Looks for public/dashboard.png
  },
  {
    icon: Users,
    title: "Attendance Management",
    description: "Track and manage attendance records with ease.",
    image: "/Attendance.png", // Looks for public/attendance.png
  },
  {
    icon: GraduationCap,
    title: "Clubs and Member Management",
    description: "Organize clubs, manage members, and monitor participation.",
    image: "/Clubs.png", // Looks for public/clubs.png
  },
  {
    icon: CalendarCheck,
    title: "Events and Tasks",
    description:
      "Plan, assign, and track upcoming events and tasks efficiently.",
    image: "/Event.png", // Looks for public/events.png
  },
];

export default function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-y border-slate-800/50 text-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            System{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Discover the tools that make LVCIS efficient, intuitive, and
            accessible for every club member and officer.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* LEFT SIDE — Feature List */}
          <div className="flex flex-col w-full lg:w-1/2 space-y-4">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`group flex items-start gap-5 p-6 rounded-2xl text-left transition-all duration-300 relative overflow-hidden ${
                  activeIndex === index
                    ? "bg-blue-950/30 border border-blue-500/30 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]"
                    : "hover:bg-slate-900/50 border border-transparent hover:border-slate-800"
                }`}
              >
                {/* Active Indicator Bar */}
                {activeIndex === index && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                <div
                  className={`shrink-0 p-3 rounded-xl transition-all duration-300 ${
                    activeIndex === index
                      ? "bg-blue-600 shadow-lg shadow-blue-900/50"
                      : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                  }`}
                >
                  <feature.icon
                    className={`w-6 h-6 ${
                      activeIndex === index ? "text-white" : "currentColor"
                    }`}
                  />
                </div>

                <div>
                  <h3
                    className={`font-bold text-lg mb-2 transition-colors ${
                      activeIndex === index ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT SIDE — Dynamic Image Display */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xl aspect-[16/10] rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl overflow-hidden">
              {/* Decorative Glows */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]" />

              <div className="absolute inset-0 p-2">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeIndex}
                    src={features[activeIndex].image}
                    alt={features[activeIndex].title}
                    className="w-full h-full object-cover rounded-xl shadow-inner bg-slate-950"
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
