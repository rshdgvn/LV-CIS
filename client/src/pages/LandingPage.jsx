import { Button } from "@/components/ui/button";
import { isLoggedIn } from "@/lib/auth";
import { useNavigate } from "react-router";
import logo from "../assets/lvcc-logo.png";
import LVCIS from "../assets/LVCIS.png";
import academics from "../assets/academics.png";
import culture from "../assets/culture.png";
import performingarts from "../assets/performing-arts.png";
import sociopolitics from "../assets/socio-politics.png";
import dashboard from "../assets/Dashboard.png";

function LandingPage() {
  const nav = useNavigate();

  return (
    <div className="w-full bg-black text-white">
      <section
        id="home"
        className="relative flex flex-col h-screen px-6 
             bg-[radial-gradient(ellipse_at_top,theme(colors.blue.800)_0%,theme(colors.blue.900)_20%,theme(colors.black)_60%)] bg-[length:100%_50%] bg-no-repeat"
      >
        <div className="flex flex-row items-center justify-between px-20 py-5">
          <a href="/dashboard" className="flex items-center font-medium gap-3">
            <img src={logo} alt="La Verdad Club" className="h-13 w-12" />
            <img src={LVCIS} alt="LVCIS Logo" className="h-5 w-auto" />
          </a>

          <nav className="hidden md:flex gap-8 text-gray-300">
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#clubs" className="hover:text-white transition-colors">
              Clubs
            </a>
          </nav>

          <div>
            {isLoggedIn() ? (
              <Button variant="outline" onClick={() => nav("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <Button variant="outline" onClick={() => nav("/login")}>
                Login
              </Button>
            )}
          </div>
        </div>

        {/* HERO */}
        <div className="flex flex-col items-center justify-center mb-20 text-center flex-1">
          <h1 className="text-6xl font-bold py-5 px-3 rounded-3xl">
            La Verdad{" "}
            <span className="block text-5xl bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700 bg-clip-text text-transparent py-2">
              Club Integrated System
            </span>
          </h1>

          <p className="mt-6 max-w-6xl text-gray-400 text-lg">
            Welcome to the La Verdad Club Integrated System. A digital platform
            for LVCC students and organizations. LVCIS makes it easy to manage
            memberships, track attendance, schedule events, and stay updated —
            all in one place.
          </p>

          <div className="flex gap-3">
            <Button className="mt-6 bg-blue-700 text-white" onClick={() => nav("/login")}>
              Get Started
            </Button>
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
          </div>
        </div>
      </section>

      <section
        id="about"
        className="h-screen flex flex-col items-center justify-center text-center px-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">About Us</h2>
        <p className="mt-5 max-w-4xl text-gray-400 text-lg leading-relaxed">
          We are students of the BS in Information Systems 3rd Year from La
          Verdad Christian College dedicated to creating innovative solutions
          that improve school processes. Our project, the Club Integrated System
          (LV–CIS), was developed to help streamline the management of student
          organizations by digitizing attendance, memberships, events, and
          reporting. With this system, we aim to provide a reliable and
          user-friendly platform that promotes efficiency, accountability, and
          active student participation across all clubs and organizations.
        </p>
        
          {/* CLUB CATEGORIES */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {/* Card */}
            <div className="flex flex-col items-center">
              <div className="relative rounded-2xl p-[10px] bg-gradient-to-br from-blue-600 to-purple-800 shadow-lg hover:scale-105 transition-transform">
                <div className="rounded-xl overflow-hidden bg-[#0f172a]">
                  <img
                    src={academics}
                    alt="Academics"
                    className="w-72 h-44 object-cover"
                  />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Academics</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative rounded-2xl p-[10px] bg-gradient-to-br from-blue-600 to-purple-800 shadow-lg hover:scale-105 transition-transform">
                <div className="rounded-xl overflow-hidden bg-[#0f172a]">
                  <img
                    src={culture}
                    alt="Academics"
                    className="w-72 h-44 object-cover"
                  />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Culture</h3>
            </div>
                <div className="flex flex-col items-center">
              <div className="relative rounded-2xl p-[10px] bg-gradient-to-br from-blue-600 to-purple-800 shadow-lg hover:scale-105 transition-transform">
                <div className="rounded-xl overflow-hidden bg-[#0f172a]">
                  <img
                    src={performingarts}
                    alt="Academics"
                    className="w-72 h-44 object-cover"
                  />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Performing Arts</h3>
            </div>
                <div className="flex flex-col items-center">
              <div className="relative rounded-2xl p-[10px] bg-gradient-to-br from-blue-600 to-purple-800 shadow-lg hover:scale-105 transition-transform">
                <div className="rounded-xl overflow-hidden bg-[#0f172a]">
                  <img
                    src={sociopolitics}
                    alt="Academics"
                    className="w-72 h-44 object-cover"
                  />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Socio-Politics</h3>
            </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
