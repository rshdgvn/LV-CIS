import { Button } from "@/components/ui/button";
import { isLoggedIn } from "@/lib/auth";
import { useNavigate } from "react-router";
import logo from "../assets/lvcc-logo.png";
import LVCIS from "../assets/LVCIS.png";
import { useAuth } from "@/contexts/AuthContext";
import dashboard from "../assets/Dashboard.png";

function LandingPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const admin = user.role == "admin";

  return (
    <div className="w-full bg-black text-white">
      <section
        id="home" 
        className="relative flex flex-col h-screen md:px-6
             bg-[radial-gradient(ellipse_at_top,theme(colors.blue.800)_0%,theme(colors.blue.900)_0%,theme(colors.black)_100%)] bg-[length:100%_30%] bg-no-repeat"
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
          </div>
        </div>

        {/* HERO */}
        <div className="flex flex-col items-center justify-center mb-20 text-center flex-1">
          <span className="block bg-blue-700 text-white px-3 py-1 rounded-xl text-xs md:text-sm font-medium mb-5 opacity-90">
            Manage Clubs Digitally
          </span>
          <h1 className="md:text-6xl text-4xl font-bold py-5 px-3 rounded-3xl">
            <span className="block text-gray-300">Level Up Your Club</span>
            <span className="text-gray-300">Experience With </span>
            <span className="bg-gradient-to-r from-blue-400 via-blue-600 to-blue-500 bg-clip-text text-transparent py-2">
              LVCIS
            </span>
          </h1>

          <p className="mt-6 max-w-3xl text-gray-400 md:text-lg text-sm">
            Discover a smarter way to manage student organizations — from
            keeping track of members and attendance to organizing events and
            generating reports, all through one easy-to-use system.
          </p>

          <div className="flex gap-3">
            <Button
              className="mt-6 bg-blue-700 text-white hover:bg-blue-600"
              onClick={() => nav("/login")}
            >
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
      </section>
    </div>
  );
}

export default LandingPage;
