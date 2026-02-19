"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-accent-200 to-accent-300 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.8,
          }}
          className="mb-8"
        >
          <div className="relative inline-block">
            {/* Main 404 Text */}
            <motion.h1
              className="text-[150px] sm:text-[200px] font-black leading-none"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              404
            </motion.h1>

            {/* Floating Elements */}
            <motion.div
              animate={{
                y: [-10, 10, -10],
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-4 -right-4 sm:-right-8"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent-400 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </motion.div>

            <motion.div
              animate={{
                y: [10, -10, 10],
                rotate: [5, -5, 5],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-2 -left-4 sm:-left-8"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Search className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Page non trouvée
          </h2>
          <p className="text-gray-500 mb-8 text-lg leading-relaxed max-w-md mx-auto">
            Désolée, la page que vous recherchez semble avoir disparu ou n'existe plus.
          </p>
        </motion.div>

        {/* Suggested Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-4">
            Suggestions
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              >
                <Home className="w-5 h-5 text-primary-500" />
                <span className="font-medium text-gray-700">Accueil</span>
              </motion.div>
            </Link>
            <Link href="/search">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              >
                <Search className="w-5 h-5 text-secondary-500" />
                <span className="font-medium text-gray-700">Rechercher</span>
              </motion.div>
            </Link>
            <Link href="/search?category=concert">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              >
                <Calendar className="w-5 h-5 text-accent-500" />
                <span className="font-medium text-gray-700">Événements</span>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-gray-500 hover:text-gray-700"
          >
            Retour à la page précédente
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
