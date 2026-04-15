"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BarChart2, Ticket } from "lucide-react";
import { EmailSettingsForm } from "@/components/dashboard/EmailSettingsForm";

export default function EventSettingsPage() {
  const params = useParams();
  const eventId = params.id as string;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/events/${eventId}`}>
          <button className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Paramètres de l'événement</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/events/${eventId}`}>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <BarChart2 className="w-4 h-4" />
              Stats
            </button>
          </Link>
          <Link href={`/dashboard/events/${eventId}/tickets`}>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Ticket className="w-4 h-4" />
              Billets
            </button>
          </Link>
        </div>
      </div>

      {/* Email settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <EmailSettingsForm eventId={eventId} />
      </div>
    </div>
  );
}
