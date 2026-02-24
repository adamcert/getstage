"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Home, Settings, Bug, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const { t: tde } = useTranslation("dashboardError");
  const { t: td } = useTranslation("dashboard");
  const { t: tc } = useTranslation("common");

  useEffect(() => {
    // Log error to monitoring service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Error Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
              }}
              className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <AlertCircle className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
            <h1 className="text-xl font-bold text-white text-center mt-4">
              {tde("title")}
            </h1>
          </div>

          {/* Content */}
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-600 text-center mb-6">
                {tde("desc")}
                {" "}{tde("pleaseRetry")}
              </p>

              {/* Error Details (Development) */}
              {process.env.NODE_ENV === "development" && error.message && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-2">
                    <Bug className="w-4 h-4" />
                    <span>{tde("technicalDetails")}</span>
                  </div>
                  <p className="text-sm text-red-600 font-mono break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-400 mt-2">
                      ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={reset}
                  variant="primary"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  className="w-full"
                >
                  {tc("tryAgain")}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/dashboard" className="block">
                    <Button
                      variant="outline"
                      leftIcon={<Home className="w-4 h-4" />}
                      className="w-full"
                    >
                      {td("dashboard")}
                    </Button>
                  </Link>
                  <Link href="/dashboard/settings" className="block">
                    <Button
                      variant="outline"
                      leftIcon={<Settings className="w-4 h-4" />}
                      className="w-full"
                    >
                      {td("settings")}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="px-6 py-4 bg-gray-50 border-t border-gray-100"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{tde("needHelp")}</span>
              <a
                href="mailto:support@events.com"
                className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                <LifeBuoy className="w-4 h-4" />
                {tde("contactSupport")}
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-400 mb-3">{tde("quickActions")}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/dashboard/events/new">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 hover:text-primary-500 border border-gray-200 hover:border-primary-200 transition-colors"
              >
                {td("createEvent")}
              </motion.span>
            </Link>
            <Link href="/dashboard/analytics">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 hover:text-primary-500 border border-gray-200 hover:border-primary-200 transition-colors"
              >
                {tde("viewAnalytics")}
              </motion.span>
            </Link>
            <Link href="/">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 hover:text-primary-500 border border-gray-200 hover:border-primary-200 transition-colors"
              >
                {td("backToSite")}
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
