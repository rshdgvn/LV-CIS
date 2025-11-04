"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ClubCard from "@/components/ClubCard";
import { APP_URL } from "@/lib/config";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_KEYS = [
  { key: "academics", label: "Academics" },
  { key: "culture_and_performing_arts", label: "Culture and Performing Arts" },
  { key: "socio_politics", label: "Socio-Politics" },
];

export default function AllClubsPage() {
  const [categories, setCategories] = useState({
    academics: [],
    culture_and_performing_arts: [],
    socio_politics: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${APP_URL}/clubs/by-category`);
        if (!res.ok) throw new Error("Failed to fetch clubs");
        const data = await res.json();

        setCategories({
          academics: data.academics ?? [],
          culture_and_performing_arts: data.culture_and_performing_arts ?? [],
          socio_politics: data.socio_politics ?? [],
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white relative pb-20">
      {/* Fixed Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 bg-slate-900/70 hover:bg-slate-800 transition-colors border border-slate-700 rounded-full px-4 py-2"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="max-w-7xl mx-auto px-6 pt-24">
        <motion.h1
          className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          All Clubs
        </motion.h1>

        {CATEGORY_KEYS.map(({ key, label }, index) => {
          const clubs = categories[key] ?? [];

          if (clubs.length === 0) return null;

          return (
            <motion.div
              key={key}
              className="mb-20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.1 * index, duration: 0.7 }}
            >
              <h2 className="text-3xl font-semibold mb-10 text-center">
                {label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {clubs.map((club) => (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="flex justify-center"
                  >
                    <ClubCard
                      name={club.name}
                      description={club.description}
                      logo={club.logo}
                      background="/Lv-Background.jpg"
                      status={club.status}
                      showButton={false}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* 
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-8 right-8"
      >
        <Button
          variant="outline"
          className="border-blue-700 text-white hover:bg-blue-800"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑ Top
        </Button>
      </motion.div> */}
    </section>
  );
}
