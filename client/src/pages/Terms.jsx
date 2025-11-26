"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, ChevronLeft, Users, FileText, Lock } from "lucide-react";
import Footer from "@/components/FooterSection";

const TermsOfService = () => {
  return (
    <div className="w-full min-h-screen bg-slate-950 text-gray-300 font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden relative">
      {/* Background Decor (grid + glow) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f1724_1px,transparent_1px),linear-gradient(to_bottom,#0f1724_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-15"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/8 blur-[100px] rounded-full mix-blend-screen animate-fade-in" />
      </div>

      {/* Hero */}
      <header className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <a
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-all group bg-blue-500/5 px-4 py-1.5 rounded-full border border-blue-500/10 hover:border-blue-500/30"
          >
            <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Return to Home
            </span>
          </a>

          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            Terms of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Service
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            By using the La Verdad College Information System (LVCIS), you agree
            to comply with these Terms of Service. Please read carefully to
            understand your rights and responsibilities.
          </motion.p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 pb-28 relative z-10">
        <div className="space-y-8">
          {/* Section 1: Acceptance */}
          <motion.section
            className="group bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-10 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="p-3 bg-blue-500/8 rounded-2xl h-fit w-fit border border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <Users className="h-7 w-7 text-blue-400" />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3 flex items-center">
                  1. Acceptance of Terms
                  <div className="h-px bg-gray-800 flex-1 ml-5" />
                </h2>

                <p className="text-lvcis-muted mb-4 leading-relaxed text-gray-300">
                  By accessing or using the Service, you agree to be bound by
                  these Terms of Service. If you do not agree, you must stop
                  using the Service immediately.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Section 2: User Accounts */}
          <motion.section
            className="group bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-10 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="p-3 bg-purple-500/8 rounded-2xl h-fit w-fit border border-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                <FileText className="h-7 w-7 text-purple-400" />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3 flex items-center">
                  2. User Accounts
                  <div className="h-px bg-gray-800 flex-1 ml-5" />
                </h2>

                <p className="text-lvcis-muted mb-6 leading-relaxed text-gray-300">
                  When creating an account, you must provide accurate
                  information, keep your credentials confidential, and be
                  responsible for all actions taken under your account.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Section 3 & 4: Security & Sharing */}
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <section className="group bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
              <div className="mb-4 p-3 bg-emerald-500/10 rounded-xl w-fit border border-emerald-500/20">
                <Lock className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                3. Data Security
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We implement industry-standard encryption and access controls.
                Only authorized personnel can access sensitive information.
              </p>
            </section>

            <section className="group bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
              <div className="mb-4 p-3 bg-orange-500/10 rounded-xl w-fit border border-orange-500/20">
                <Shield className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                4. Information Sharing
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your information is never sold. Sharing occurs strictly
                internally for academic and administrative purposes.
              </p>
            </section>
          </motion.div>

          {/* Section 5: Governing Law */}
          <motion.section
            className="mt-10 bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 transition-all"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold text-white mb-3">
              5. Governing Law & Contact
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-3">
              These Terms are governed by the laws of the Philippines. Any
              disputes will fall under Philippine jurisdiction.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              For questions or concerns, contact us at{" "}
              <a
                href="mailto:lvcis.app@gmail.com"
                className="text-blue-400 hover:underline"
              >
                lvcis.app@gmail.com
              </a>
              .
            </p>
          </motion.section>
        </div>

        <div className="mt-20">
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
