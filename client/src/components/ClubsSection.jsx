"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClubCard from "@/components/ClubCard";
import { APP_URL } from "@/lib/config";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const CATEGORY_KEYS = [
  { key: "academics", label: "Academics" },
  { key: "culture_and_performing_arts", label: "Culture & Performing Arts" },
  { key: "socio_politics", label: "Socio-Politics" },
];

export default function ClubsThreeColumnRotator({ intervalMs = 5000 }) {
  const [categories, setCategories] = useState({
    academics: [],
    culture_and_performing_arts: [],
    socio_politics: [],
  });
  const [loading, setLoading] = useState(true);
  const [indexes, setIndexes] = useState({
    academics: 0,
    culture_and_performing_arts: 0,
    socio_politics: 0,
  });
  const timersRef = useRef({});
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchByCategory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${APP_URL}/clubs/by-category`);
        if (!res.ok) throw new Error("Failed to fetch clubs");
        const data = await res.json();

        const normalized = {
          academics: data.academics ?? [],
          culture_and_performing_arts: data.culture_and_performing_arts ?? [],
          socio_politics: data.socio_politics ?? [],
        };

        if (!mounted) return;
        setCategories(normalized);
        setIndexes({
          academics: 0,
          culture_and_performing_arts: 0,
          socio_politics: 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchByCategory();

    return () => {
      mounted = false;
      Object.values(timersRef.current).forEach((t) => clearInterval(t));
    };
  }, []);

  useEffect(() => {
    Object.values(timersRef.current).forEach((t) => clearInterval(t));
    timersRef.current = {};

    CATEGORY_KEYS.forEach(({ key }) => {
      if (categories[key] && categories[key].length > 1) {
        timersRef.current[key] = setInterval(() => {
          setIndexes((prev) => {
            const len = categories[key].length || 1;
            return {
              ...prev,
              [key]: (prev[key] + 1) % len,
            };
          });
        }, intervalMs);
      }
    });

    return () => {
      Object.values(timersRef.current).forEach((t) => clearInterval(t));
      timersRef.current = {};
    };
  }, [categories, intervalMs]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Animate section title on scroll */}
        <motion.h2
          className="text-5xl font-bold mb-20 text-center bg-linear-to-r from-neutral-100 via-neutral-300 to-neutral-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Meet Our Clubs
        </motion.h2>

        {/* Animate grid of clubs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {CATEGORY_KEYS.map(({ key, label }, index) => {
            const list = categories[key] || [];
            const idx = indexes[key] ?? 0;
            const activeClub = list.length > 0 ? list[idx] : null;

            return (
              <motion.div
                key={key}
                className="flex flex-col items-stretch"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  delay: 0.2 * index,
                  duration: 0.7,
                  ease: "easeOut",
                }}
              >
                <div className="flex-1 flex items-stretch justify-center">
                  <AnimatePresence mode="wait">
                    {activeClub ? (
                      <motion.div
                        key={activeClub.id}
                        initial={{ opacity: 0, y: 8, scale: 0.995 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.995 }}
                        transition={{ duration: 0.45 }}
                        className="w-full flex justify-center"
                      >
                        <ClubCard
                          name={activeClub.name}
                          description={activeClub.description}
                          logo={activeClub.logo}
                          background="/Lv-Background.jpg"
                          status={activeClub.status}
                          showButton={false}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`${key}-empty`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full flex justify-center"
                      >
                        <div className="w-80 rounded-xl p-8 bg-neutral-900/60 text-gray-400 text-center">
                          No clubs available.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-10 text-center">
                  <p className="text-lg font-semibold text-white uppercase tracking-wider">
                    {label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Button animation */}
        <div className="flex justify-center w-full">
          <motion.div
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Button
              variant="outline"
              className="mt-14 border-blue-700 text-white hover:bg-blue-800"
              onClick={() => nav("/all-clubs")}
            >
              View All Clubs
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
