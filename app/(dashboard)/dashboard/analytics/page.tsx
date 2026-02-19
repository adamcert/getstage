"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Users,
  Ticket,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    name: "Vues totales",
    value: "24,567",
    change: "+12.5%",
    trend: "up",
    icon: BarChart3,
  },
  {
    name: "Taux de conversion",
    value: "3.2%",
    change: "+0.4%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    name: "Visiteurs uniques",
    value: "8,234",
    change: "-2.1%",
    trend: "down",
    icon: Users,
  },
  {
    name: "Tickets vendus",
    value: "1,234",
    change: "+18.2%",
    trend: "up",
    icon: Ticket,
  },
];

const recentActivity = [
  { event: "Techno Night w/ Amelie Lens", tickets: 12, revenue: "180 EUR", time: "Il y a 2h" },
  { event: "Phoenix en Concert", tickets: 4, revenue: "180 EUR", time: "Il y a 3h" },
  { event: "House Music Marathon", tickets: 8, revenue: "240 EUR", time: "Il y a 5h" },
  { event: "Stand-Up Comedy Night", tickets: 6, revenue: "108 EUR", time: "Il y a 6h" },
  { event: "Stromae - Multitude Tour", tickets: 15, revenue: "735 EUR", time: "Il y a 8h" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-gray-500">
          Suivez les performances de vos événements en temps réel.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Icon className="w-5 h-5 text-primary-500" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.name}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ventes par jour
          </h3>
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Graphique des ventes</p>
              <p className="text-sm">(Intégration à venir)</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Trafic par source
          </h3>
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p>Graphique du trafic</p>
              <p className="text-sm">(Intégration à venir)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Activité récente
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Ticket className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.event}</p>
                  <p className="text-sm text-gray-500">
                    {activity.tickets} tickets vendus
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{activity.revenue}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
