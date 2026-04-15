"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface TierStat {
  name: string;
  issued: number;
  checkedIn: number;
  revenueCents: number;
}

const COLORS = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626"];

export function TierDonut({ data }: { data: TierStat[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Répartition par tarif</h3>
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          Aucun billet émis
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: d.name, value: d.issued }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Répartition par tarif</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [v, "billets"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "#6b7280" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
