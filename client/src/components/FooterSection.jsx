import React from "react";
import { Phone, MapPin, Facebook, Mail, Shield } from "lucide-react";
import logo from "../assets/lvcc-logo.png";
import LVCIS from "../assets/LVCIS.png";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-900/50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src={logo} alt="La Verdad Club" className="h-8 w-8" />
              <img src={LVCIS} alt="LVCIS Logo" className="h-5 w-auto" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              Empowering student organizations with efficient, secure, and
              modern management tools. Join the digital transformation of campus
              life today.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 bg-white/5 rounded-lg hover:bg-blue-900 transition-colors text-gray-400 hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/5 rounded-lg hover:bg-blue-900 transition-colors text-gray-400 hover:text-white"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-500" />
                +63 908 215 0975
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-blue-500 mt-1" />
                <span>
                  Mac Arthur Highway, Sampaloc,
                  <br />
                  Apalit, Pampanga
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Developers</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Created by BS Information System 3B students. Dedicated to
              innovation and excellence.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
