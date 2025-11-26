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
} from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-lvcis-bg text-gray-300 font-sans selection:bg-blue-500 selection:text-white">

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <a
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </a>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Privacy <span className="text-blue-500">Policy</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            We are committed to protecting the privacy of our students and
            organization members. This policy outlines how LVCIS manages your
            data within the La Verdad Christian College ecosystem.
          </p>
          <div className="mt-8 inline-block px-4 py-1 rounded-full bg-blue-900/30 border border-blue-800/50 text-xs text-blue-200">
            Last Updated: October 2023
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pb-24">
        <div className="space-y-12">
          {/* Section 1 */}
          <section className="bg-lvcis-card border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600/10 rounded-lg shrink-0">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  1. Information We Collect
                </h2>
                <p className="mb-4 text-sm leading-relaxed">
                  To provide the functionality of the Club Integrated System, we
                  collect and process the following information necessary for
                  student organization management:
                </p>
                <ul className="space-y-3">
                  {[
                    "Personal Identification: Name, Student ID number, and Course/Year level.",
                    "Account Credentials: Login details securely stored for system access.",
                    "Club Activities: Membership status, roles (officer/member), and club affiliations.",
                    "Attendance Data: Records of participation in club events, meetings, and activities.",
                    "System Usage Logs: Technical data to ensure system security and stability.",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start text-sm text-gray-400"
                    >
                      <span className="mr-2 text-blue-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-lvcis-card border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600/10 rounded-lg shrink-0">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="mb-4 text-sm leading-relaxed">
                  The data collected via LVCIS is used exclusively for academic
                  and extracurricular management purposes within La Verdad
                  Christian College:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-[#050810] p-4 rounded-lg border border-gray-800">
                    <h3 className="text-white font-semibold text-sm mb-2">
                      Club Management
                    </h3>
                    <p className="text-xs text-gray-500">
                      Organizing member rosters, assigning officer roles, and
                      managing club requirements.
                    </p>
                  </div>
                  <div className="bg-[#050810] p-4 rounded-lg border border-gray-800">
                    <h3 className="text-white font-semibold text-sm mb-2">
                      Attendance Tracking
                    </h3>
                    <p className="text-xs text-gray-500">
                      Digital recording of student presence at mandatory and
                      optional events for grading/clearance.
                    </p>
                  </div>
                  <div className="bg-[#050810] p-4 rounded-lg border border-gray-800">
                    <h3 className="text-white font-semibold text-sm mb-2">
                      Reporting
                    </h3>
                    <p className="text-xs text-gray-500">
                      Generating performance reports and analytics for school
                      administration review.
                    </p>
                  </div>
                  <div className="bg-[#050810] p-4 rounded-lg border border-gray-800">
                    <h3 className="text-white font-semibold text-sm mb-2">
                      Communication
                    </h3>
                    <p className="text-xs text-gray-500">
                      Sending notifications regarding upcoming tasks, events, or
                      announcements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 & 4 Combined */}
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-lvcis-card border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors shadow-xl">
              <div className="mb-4 p-3 bg-blue-600/10 rounded-lg w-fit">
                <Lock className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-lg font-bold text-white mb-3">
                3. Data Security
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                We implement industry-standard security measures to protect your
                personal information. Access to sensitive data is restricted to
                authorized student officers, faculty advisers, and system
                administrators only. We use encryption for sensitive credentials
                and regular backups to prevent data loss.
              </p>
            </section>

            <section className="bg-lvcis-card border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors shadow-xl">
              <div className="mb-4 p-3 bg-blue-600/10 rounded-lg w-fit">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-lg font-bold text-white mb-3">
                4. Data Sharing
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your information is <strong>never sold</strong> to third
                parties. Data is only shared internally within La Verdad
                Christian College departments for academic validation and
                auditing purposes. We do not share student data with external
                marketing agencies.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
