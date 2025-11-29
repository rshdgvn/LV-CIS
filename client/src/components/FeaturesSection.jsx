import { useState } from "react";
import { BarChart3, Users, GraduationCap, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";
import dashboard from "../assets/Dashboard.png"; // your existing image

const features = [
  {
    icon: BarChart3,
    title: "Dashboard and Analytics",
    description: "Your central hub for updates and performance metrics.",
  },
  {
    icon: Users,
    title: "Attendance Management",
    description: "Track and manage attendance records with ease.",
  },
  {
    icon: GraduationCap,
    title: "Clubs and Member Management",
    description: "Organize clubs, manage members, and monitor participation.",
  },
  {
    icon: CalendarCheck,
    title: "Events and Tasks",
    description:
      "Plan, assign, and track upcoming events and tasks efficiently.",
  },
];

export default function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="features"
      className="py-24 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 border-y-2 text-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl font-bold mb-4 bg-linear-to-r from-white via-neutral-300 to-white bg-clip-text text-transparent py-2">
            System{" "}
            <span className="bg-linear-to-r from-blue-400 via-blue-600 to-blue-500 bg-clip-text text-transparent py-2">
              Features
            </span>
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            Discover the tools that make LVCIS efficient, intuitive, and
            accessible for every club member and officer.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* LEFT SIDE — Feature List */}
          <div className="flex flex-col w-full md:w-1/2 space-y-5">
            {features.map((feature, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveIndex(index)}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className={`flex items-start gap-4 p-5 rounded-xl text-left transition-all duration-300 cursor-pointer ${
                  activeIndex === index
                    ? "bg-blue-950/40 border border-blue-800 shadow-md"
                    : "hover:bg-blue-950/20 border border-transparent"
                }`}
              >
                <div
                  className={`shrink-0 p-2 rounded-lg transition-all duration-300 ease-in-out
                  ${
                    activeIndex === index
                      ? "bg-blue-900/30 scale-105"
                      : "bg-gray-100/10 scale-100"
                  }
                `}
                >
                  <feature.icon
                    className={`w-6 h-6 transition-all duration-300 ease-in-out
                    ${
                      activeIndex === index
                        ? "text-blue-400 opacity-100"
                        : "text-gray-400 opacity-60"
                    }
                  `}
                  />
                </div>

                <div>
                  <h3
                    className={`font-semibold text-lg mb-1 ${
                      activeIndex === index ? "text-white" : "text-gray-200"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.div
            className="w-full md:w-1/2 flex justify-center md:justify-end"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={dashboard}
              alt="Dashboard Preview"
              className="w-full max-w-md rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
