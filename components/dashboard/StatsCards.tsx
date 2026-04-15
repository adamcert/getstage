"use client";

import { Ticket, Send, UserCheck, AlertTriangle, Euro, Users } from "lucide-react";

export interface StatsData {
  issued: number;
  sent: number;
  checkedIn: number;
  invalidAttempts: number;
  revenueCents: number;
  capacity: number;
}

interface CardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}

function KpiCard({ label, value, sub, icon, color }: CardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl shrink-0 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function StatsCards({ data }: { data: StatsData }) {
  const fillRate =
    data.capacity > 0
      ? `${Math.round((data.checkedIn / data.capacity) * 100)} % rempli`
      : undefined;

  const revenue = (data.revenueCents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <KpiCard
        label="Billets émis"
        value={data.issued}
        sub={data.capacity > 0 ? `/ ${data.capacity} capacité` : undefined}
        icon={<Ticket className="w-5 h-5 text-violet-600" />}
        color="bg-violet-50"
      />
      <KpiCard
        label="Envoyés"
        value={data.sent}
        sub={data.issued > 0 ? `${Math.round((data.sent / data.issued) * 100)} %` : undefined}
        icon={<Send className="w-5 h-5 text-blue-600" />}
        color="bg-blue-50"
      />
      <KpiCard
        label="Entrées validées"
        value={data.checkedIn}
        sub={fillRate}
        icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
        color="bg-emerald-50"
      />
      <KpiCard
        label="Scans invalides"
        value={data.invalidAttempts}
        icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
        color="bg-amber-50"
      />
      <KpiCard
        label="Revenus"
        value={revenue}
        icon={<Euro className="w-5 h-5 text-green-600" />}
        color="bg-green-50"
      />
      <KpiCard
        label="Capacité totale"
        value={data.capacity}
        icon={<Users className="w-5 h-5 text-gray-600" />}
        color="bg-gray-50"
      />
    </div>
  );
}
