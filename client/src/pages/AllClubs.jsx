import React from "react";
import { useNavigate } from "react-router";
import logo from "../assets/lvcc-logo.png";
import LVCIS from "../assets/LVCIS.png";
import aim from "../assets/aim.png";
import lvdt from "../assets/lvdt.png";
import lvprod from "../assets/lvprod.png";
import lvdrrt from "../assets/lvdrrt.png";
import jpia from "../assets/jpia.png";
import swsap from "../assets/swsap.png";
import broadsoc from "../assets/broadsoc.png";
import dashboard from "../assets/Dashboard.png";
import { LogOut } from "lucide-react";

function AllClubs() {
  const nav = useNavigate();

  return (
    <div className="w-full bg-[#0f172a] text-white min-h-screen relative">
      {/* Back Button */}
      <button
        onClick={() => nav("/")}
        className="absolute top-6 left-6 bg-transparent hover:scale-110 transition-transform"
      >
        <LogOut size={32} strokeWidth={2.5} color="white" />
      </button>
        <section         
        id="clubs"
        className="h-screen flex flex-col items-center justify-center text-center px-6"
        >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Academics</h2>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {/* Card */}
            <div className="flex flex-col items-center">
            <div className="relative rounded-2xl p-[10px] bg-gradient-to-br from-blue-600 to-purple-800 shadow-lg hover:scale-105 transition-transform">
                <div className="rounded-xl overflow-hidden bg-[#0f172a]">
                <img
                    src={aim}
                    alt="Association of ICT Majors"
                    className="w-72 h-44 object-cover"
                />
                </div>
            </div>
            </div>
            <div className="flex flex-col items-center">
            <div className="relative rounded-2xl p-[10px] bg-gradient-to-br from-blue-600 to-purple-800 shadow-lg hover:scale-105 transition-transform">
                <div className="rounded-xl overflow-hidden bg-[#0f172a]">
                <img
                    src={jpia}
                    alt="Junior Philippine Institute of Accountants"
                    className="w-72 h-44 object-cover"
                />
                </div>
            </div>
            </div>
            <div className="flex flex-col items-center">
            <div className="relative rounded-2xl p-[10px] bg-gradient-to-br from-blue-600 to-purple-800 shadow-lg hover:scale-105 transition-transform">
                <div className="rounded-xl overflow-hidden bg-[#0f172a]">
                <img
                    src={swsap}
                    alt="Social Work Student Association of the Philippines"
                    className="w-72 h-44 object-cover"
                />
                </div>
            </div>
            </div>
            <div className="flex flex-col items-center">
            <div className="relative rounded-2xl p-[10px] bg-gradient-to-br from-blue-600 to-purple-800 shadow-lg hover:scale-105 transition-transform">
                <div className="rounded-xl overflow-hidden bg-[#0f172a]">
                <img
                    src={broadsoc}
                    alt="Broadcasting Society"
                    className="w-72 h-44 object-cover"
                />
                </div>
            </div>
            </div>
        </div>
        </section>
    </div>
  );
}

export default AllClubs;
