"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import {
  CalendarDays,
  BarChart3,
  Users,
  Settings,
  Menu,
  PartyPopper,
  X,
  LogOut,
  ChevronDown,
  Bell,
  Home,
} from "lucide-react";

const navigation = [
  { name: "Events", href: "/dashboard", icon: CalendarDays },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-800">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <PartyPopper className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-zinc-100 tracking-tight">GetStage</span>
                <span className="text-[9px] font-semibold text-zinc-600 tracking-widest uppercase">by SNAPSS</span>
              </div>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-secondary-500/10 text-secondary-400"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      active ? "text-secondary-400" : "text-zinc-600"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Back to site link */}
          <div className="p-4 border-t border-zinc-800">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 transition-all duration-200"
            >
              <Home className="w-5 h-5 text-zinc-600" />
              Retour au site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-800"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page title - hidden on mobile */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-zinc-100">Dashboard</h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                <Bell className="w-5 h-5 text-zinc-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <Avatar size="sm" fallback="U" />
                  <span className="hidden sm:block text-sm font-medium text-zinc-300">
                    Utilisateur
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-zinc-600 transition-transform",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-56 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 py-2">
                      <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="text-sm font-medium text-zinc-100">
                          Utilisateur
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          user@example.com
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 text-zinc-400" />
                          Paramètres
                        </Link>
                      </div>
                      <div className="border-t border-zinc-800 py-1">
                        <button
                          onClick={async () => {
                            setUserMenuOpen(false);
                            await signOut();
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-primary-400 hover:bg-primary-500/10"
                        >
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
