"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Calendar, Ticket, ArrowLeft, Music, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-xl w-full text-center">
        {/* Animated Illustration */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
          className="mb-10 relative"
        >
          {/* Main Ticket Icon */}
          <div className="relative inline-block">
            <motion.div
              animate={{
                y: [-5, 5, -5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-32 h-32 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/30"
            >
              <Ticket className="w-16 h-16 text-white" />
            </motion.div>

            {/* Question Mark */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 200,
              }}
              className="absolute -top-3 -right-3 w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            >
              ?
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                x: [0, 5, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-8 top-4"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Music className="w-5 h-5 text-primary-500" />
              </div>
            </motion.div>

            <motion.div
              animate={{
                y: [0, 10, 0],
                x: [0, -5, 0],
                rotate: [0, -10, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute -right-8 bottom-4"
            >
              <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-secondary-500" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Événement introuvable
          </h1>
          <p className="text-gray-500 mb-8 text-lg leading-relaxed">
            Cet événement n'existe pas ou a été supprimé.
            <br />
            Il a peut-être eu lieu ou été annulé.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Link href="/search">
            <Button
              variant="primary"
              leftIcon={<Search className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Rechercher un événement
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              leftIcon={<Calendar className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Voir tous les événements
            </Button>
          </Link>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-gray-400 hover:text-gray-600"
          >
            Retour
          </Button>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100"
        >
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-4">
            Explorez par catégorie
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Concerts", href: "/search?category=concert" },
              { label: "DJ / Club", href: "/search?category=dj" },
              { label: "Théâtre", href: "/search?category=theatre" },
              { label: "Festivals", href: "/search?category=festival" },
            ].map((cat) => (
              <Link key={cat.label} href={cat.href}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-600 hover:text-primary-500 hover:shadow-md transition-all border border-gray-100"
                >
                  {cat.label}
                </motion.span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
