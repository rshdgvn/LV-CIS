"use client";

import React from "react";
import { Phone, MapPin, Facebook, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-center md:justify-start items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                <a
                  href="tel:+63082150975"
                  className="hover:text-white transition-colors"
                >
                  +63 908 215 0975
                </a>
              </li>
              <li className="flex justify-center md:justify-start items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <span className="text-sm leading-snug">
                  Mac Arthur Highway, Sampaloc, <br /> Apalit, Pampanga
                </span>
              </li>
            </ul>
          </div>

          {/* About Us - Centered */}
          <div className="flex flex-col items-center md:items-center text-center">
            <h3 className="text-lg font-semibold text-white mb-3">About Us</h3>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Developed by BS Information System 3B students to promote
              innovation and teamwork through technology.
            </p>
          </div>

          {/* Socials */}
          <div className="md:text-right text-center">
            <h3 className="text-lg font-semibold text-white mb-3">Socials</h3>
            <div className="flex justify-center md:justify-end items-center gap-5">
              <a
                href="https://www.facebook.com/lvcc.apalit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform text-blue-500"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="mailto:rasheedgavinesponga@student.laverdad.edu.ph"
                className="hover:scale-110 transition-transform text-rose-400"
              >
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mt-10 pt-6">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} BS Information System - 3B. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
