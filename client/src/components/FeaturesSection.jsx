import { useState } from "react";
import { BarChart3, Users, GraduationCap, CalendarCheck } from "lucide-react";
import dashboard from "../assets/Dashboard.png"; // ✅ your existing image

const features = [
  {
    icon: <BarChart3 className="w-6 h-6 text-blue-400" />,
    title: "Dashboard and Analytics",
    description: "Your central hub for updates and performance metrics.",
  },
  {
    icon: <Users className="w-6 h-6 text-blue-400" />,
    title: "Attendance Management",
    description: "Track and manage attendance records with ease.",
  },
  {
    icon: <GraduationCap className="w-6 h-6 text-blue-400" />,
    title: "Clubs and Member Management",
    description: "Organize clubs, manage members, and monitor participation.",
  },
  {
    icon: <CalendarCheck className="w-6 h-6 text-blue-400" />,
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
      className="py-24 bg-gradient-to-b from-neutral-900 via-blue-950 to-neutral-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-400 bg-clip-text text-transparent">
            System Features
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            Discover the tools that make LVCIS efficient, intuitive, and
            accessible for every club member and officer.
          </p>
        </div>

        {/* MAIN CONTENT — Features + Image */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* LEFT SIDE — Feature List */}
          <div className="flex flex-col w-full md:w-1/2 space-y-5">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`flex items-start gap-4 p-5 rounded-xl text-left transition-all duration-300 ${
                  activeIndex === index
                    ? "bg-blue-950/40 border border-blue-800 shadow-md"
                    : "hover:bg-blue-950/20 border border-transparent"
                }`}
              >
                <div className="flex-shrink-0 p-2 bg-blue-900/30 rounded-lg">
                  {feature.icon}
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
              </button>
            ))}
          </div>

          {/* RIGHT SIDE — Dashboard Image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <img
              src={dashboard}
              alt="Dashboard Preview"
              className="w-full max-w-md rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
