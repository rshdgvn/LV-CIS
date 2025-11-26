import React from "react";
import {
  Shield,
  ChevronLeft,
  Lock,
  Users,
  FileText,
  MapPin,
  Phone,
  Mail,
  Facebook,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-lvcis-bg text-gray-300 font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden relative">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15]"></div>
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen animate-fade-in" />
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-lvcis-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2 rounded-lg shadow-lg shadow-blue-900/20 group-hover:shadow-blue-600/30 transition-all duration-300">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-wider text-white">
                LVCIS
              </span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              {["Home", "Features", "About"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
                </a>
              ))}
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center z-10 relative">
          <a
            href="#"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-all group bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 hover:border-blue-500/40"
          >
            <ChevronLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Return to Home
            </span>
          </a>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight animate-fade-in-up [animation-delay:0ms]">
            Privacy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Policy
            </span>
          </h1>

          <p className="text-lg md:text-xl text-lvcis-muted max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:100ms]">
            Transparency is at the core of LVCIS. We are committed to protecting
            the data of every student and organization member within the La
            Verdad Christian College ecosystem.
          </p>

          <div className="mt-10 animate-fade-in-up [animation-delay:200ms]">
            <span className="inline-flex items-center px-3 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              Effective Date: October 24, 2023
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pb-32 relative z-10">
        <div className="space-y-8">
          {/* Section 1: Collection */}
          <section className="group bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-8 md:p-10 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 animate-fade-in-up [animation-delay:300ms]">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="p-4 bg-blue-500/10 rounded-2xl h-fit w-fit border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  1. Information Collection
                  <div className="h-px bg-gray-800 flex-1 ml-6"></div>
                </h2>
                <p className="text-lvcis-muted mb-6 leading-relaxed">
                  The Club Integrated System collects specific data points
                  essential for seamless organizational management. We limit
                  collection to what is strictly necessary:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Identity",
                      desc: "Name, Student ID, Course & Year",
                    },
                    {
                      title: "Security",
                      desc: "Encrypted credentials & access logs",
                    },
                    {
                      title: "Activity",
                      desc: "Club roles, membership status",
                    },
                    {
                      title: "Attendance",
                      desc: "Event participation records",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start p-3 rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 shrink-0"></div>
                      <div>
                        <strong className="block text-white text-sm mb-0.5">
                          {item.title}
                        </strong>
                        <span className="text-xs text-gray-500">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Usage */}
          <section className="group bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-8 md:p-10 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 animate-fade-in-up [animation-delay:400ms]">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="p-4 bg-purple-500/10 rounded-2xl h-fit w-fit border border-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  2. Data Usage
                  <div className="h-px bg-gray-800 flex-1 ml-6"></div>
                </h2>
                <p className="text-lvcis-muted mb-8 leading-relaxed">
                  Every piece of data serves a functional purpose within the
                  college ecosystem. We do not use your data for ad targeting or
                  commercial profiling.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Management",
                      text: "Roster handling & officer assignments",
                    },
                    {
                      label: "Grading",
                      text: "Clearance validation via attendance",
                    },
                    { label: "Analytics", text: "Club performance reporting" },
                    {
                      label: "Notifications",
                      text: "Event updates & announcements",
                    },
                  ].map((card, idx) => (
                    <div
                      key={idx}
                      className="bg-[#050810]/50 p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all group/card"
                    >
                      <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 group-hover/card:text-blue-300 transition-colors">
                        {card.label}
                      </h3>
                      <p className="text-gray-400 text-sm">{card.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Split Sections */}
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up [animation-delay:500ms]">
            <section className="group bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all">
              <div className="mb-6 p-3 bg-emerald-500/10 rounded-xl w-fit border border-emerald-500/20">
                <Lock className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                3. Data Security
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                We employ industry-standard encryption for data at rest and in
                transit. Access controls are strictly enforced—only authorized
                faculty advisers and system admins can access sensitive student
                records.
              </p>
            </section>

            <section className="group bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all">
              <div className="mb-6 p-3 bg-orange-500/10 rounded-xl w-fit border border-orange-500/20">
                <Shield className="h-6 w-6 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                4. Information Sharing
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your trust is paramount. We{" "}
                <span className="text-white font-semibold">never sell</span>{" "}
                your data. Information is shared strictly internally within La
                Verdad Christian College for academic validation and auditing
                purposes.
              </p>
            </section>
          </div>
        </div>

        {/* Footer Area */}
        <footer className="mt-24 pt-12 border-t border-white/5">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-6 w-6 text-blue-500" />
                <span className="text-lg font-bold text-white">LVCIS</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-6">
                Empowering student organizations with efficient, secure, and
                modern management tools.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 transition-all text-gray-400 hover:text-white border border-white/5 hover:border-blue-500"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 transition-all text-gray-400 hover:text-white border border-white/5 hover:border-blue-500"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6">Contact</h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-3 group">
                  <div className="p-1.5 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <Phone className="h-3 w-3 text-blue-400" />
                  </div>
                  +63 908 215 0975
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1.5 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors mt-0.5">
                    <MapPin className="h-3 w-3 text-blue-400" />
                  </div>
                  <span className="leading-relaxed">
                    Mac Arthur Highway,
                    <br />
                    Sampaloc, Apalit, Pampanga
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6">Legal</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors text-blue-400"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Developer Info
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-600">
              © 2025 BS Information System - 3B. All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/5 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              All Systems Operational
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
