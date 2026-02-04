import { Card } from "@/components/ui/card";
import { CalendarDays, Users, TrendingUp, Ticket } from "lucide-react";

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

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenue sur votre Dashboard
        </h1>
        <p className="mt-1 text-gray-500">
          Gerez vos evenements et suivez vos performances.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${stat.bgColor}`}
                >
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

      {/* Recent events section placeholder */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Evenements recents
        </h2>
        <Card className="p-6">
          <div className="text-center py-12 text-gray-500">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Aucun evenement</p>
            <p className="text-sm mt-1">
              Commencez par creer votre premier evenement.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
