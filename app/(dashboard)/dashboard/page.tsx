"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { mockEvents } from "@/lib/data/mock-events";
import type { Event, EventStatus } from "@/types/database";
import {
  CalendarDays,
  Users,
  TrendingUp,
  Ticket,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
} from "lucide-react";

// Stats data
const stats = [
  {
    name: "Total Events",
    value: "12",
    change: "+2 ce mois",
    icon: CalendarDays,
    color: "text-primary-500",
    bgColor: "bg-primary-50",
  },
  {
    name: "Tickets Vendus",
    value: "1,234",
    change: "+15% vs dernier mois",
    icon: Ticket,
    color: "text-secondary-500",
    bgColor: "bg-secondary-50",
  },
  {
    name: "Participants",
    value: "890",
    change: "+8% vs dernier mois",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    name: "Revenus",
    value: "45,670 EUR",
    change: "+23% vs dernier mois",
    icon: TrendingUp,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
];

// Helper to get status badge variant
function getStatusBadge(status: EventStatus) {
  const statusConfig: Record<EventStatus, { label: string; variant: "default" | "new" | "hot" | "tonight" | "soldout" | "featured" }> = {
    draft: { label: "Brouillon", variant: "default" },
    preview: { label: "Apercu", variant: "new" },
    published: { label: "Publie", variant: "hot" },
    cancelled: { label: "Annule", variant: "soldout" },
    past: { label: "Termine", variant: "default" },
  };
  return statusConfig[status] || statusConfig.draft;
}

// Calculate tickets sold for an event
function getTicketsSold(event: Event): { sold: number; total: number } {
  if (!event.ticket_types || event.ticket_types.length === 0) {
    return { sold: 0, total: 0 };
  }
  const sold = event.ticket_types.reduce((acc, t) => acc + t.quantity_sold, 0);
  const total = event.ticket_types.reduce((acc, t) => acc + t.quantity_total, 0);
  return { sold, total };
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Use some mock events as "user events"
const userEvents = mockEvents.slice(0, 6);

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Filter events based on search
  const filteredEvents = userEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasEvents = filteredEvents.length > 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue sur votre Dashboard
          </h1>
          <p className="mt-1 text-gray-500">
            Gerez vos evenements et suivez vos performances.
          </p>
        </div>
        <Link href="/dashboard/events/new">
          <Button leftIcon={<Plus className="w-5 h-5" />}>
            Creer un evenement
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Events section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Mes Evenements
          </h2>
          <div className="w-full sm:w-72">
            <Input
              placeholder="Rechercher un evenement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
        </div>

        {hasEvents ? (
          <Card className="overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                      Evenement
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                      Tickets vendus
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEvents.map((event) => {
                    const tickets = getTicketsSold(event);
                    const statusBadge = getStatusBadge(event.status);
                    const progress = tickets.total > 0 ? (tickets.sold / tickets.total) * 100 : 0;

                    return (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {event.cover_image ? (
                                <Image
                                  src={event.cover_image}
                                  alt={event.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <CalendarDays className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/dashboard/events/${event.id}`}
                                className="font-medium text-gray-900 hover:text-primary-500 truncate block"
                              >
                                {event.title}
                              </Link>
                              <p className="text-sm text-gray-500 truncate">
                                {event.venue?.name || "Lieu non defini"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {formatDate(event.start_date)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {tickets.sold} / {tickets.total}
                              </span>
                              <span className="text-gray-400">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/events/${event.slug}`} target="_blank">
                              <Button variant="ghost" size="sm" className="p-2">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/events/${event.id}`}>
                              <Button variant="ghost" size="sm" className="p-2">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2"
                                onClick={() =>
                                  setActiveMenu(activeMenu === event.id ? null : event.id)
                                }
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                              {activeMenu === event.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setActiveMenu(null)}
                                  />
                                  <div className="absolute right-0 z-50 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1">
                                    <button
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          `${window.location.origin}/events/${event.slug}`
                                        );
                                        setActiveMenu(null);
                                      }}
                                    >
                                      <Copy className="w-4 h-4" />
                                      Copier le lien
                                    </button>
                                    <button
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      onClick={() => setActiveMenu(null)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Supprimer
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredEvents.map((event) => {
                const tickets = getTicketsSold(event);
                const statusBadge = getStatusBadge(event.status);
                const progress = tickets.total > 0 ? (tickets.sold / tickets.total) * 100 : 0;

                return (
                  <div key={event.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {event.cover_image ? (
                          <Image
                            src={event.cover_image}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CalendarDays className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/dashboard/events/${event.id}`}
                              className="font-medium text-gray-900 hover:text-primary-500"
                            >
                              {event.title}
                            </Link>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {formatDate(event.start_date)}
                            </p>
                          </div>
                          <Badge variant={statusBadge.variant} className="flex-shrink-0">
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {tickets.sold} / {tickets.total} tickets
                            </span>
                            <span className="text-gray-400">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Modifier
                            </Button>
                          </Link>
                          <Link href={`/events/${event.slug}`} target="_blank">
                            <Button variant="ghost" size="sm" className="p-2">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="text-center py-12 text-gray-500">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucun evenement</p>
              <p className="text-sm mt-1 mb-6">
                {searchQuery
                  ? "Aucun evenement ne correspond a votre recherche."
                  : "Commencez par creer votre premier evenement."}
              </p>
              {!searchQuery && (
                <Link href="/dashboard/events/new">
                  <Button leftIcon={<Plus className="w-5 h-5" />}>
                    Creer un evenement
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
