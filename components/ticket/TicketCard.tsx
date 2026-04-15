import Image from "next/image";

export interface TicketCardProps {
  ticketId: string;
  shortCode: string;
  buyerFirstName: string;
  buyerLastName: string;
  tierName: string;
  eventName: string;
  eventStartsAt: string;
  venueName: string;
  venueAddress: string | null;
  venueCity: string | null;
  coverImageUrl: string | null;
  status: "valid" | "checked_in" | "cancelled" | string;
  qrDataUrl: string;
}

export function TicketCard({
  shortCode,
  buyerFirstName,
  buyerLastName,
  tierName,
  eventName,
  eventStartsAt,
  venueName,
  venueAddress,
  venueCity,
  coverImageUrl,
  status,
  qrDataUrl,
}: TicketCardProps) {
  const dateStr = new Date(eventStartsAt).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = new Date(eventStartsAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isCheckedIn = status === "checked_in";

  return (
    <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-red-600 via-violet-700 to-violet-900 text-white">
      {/* Cover image */}
      {coverImageUrl && (
        <div className="relative w-full h-40">
          <Image
            src={coverImageUrl}
            alt={eventName}
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
        </div>
      )}

      {/* Event info */}
      <div className="px-6 pt-4 pb-3">
        <h1 className="text-xl font-bold leading-tight">{eventName}</h1>
        <p className="text-sm text-white/80 mt-1">
          {dateStr} · {timeStr}
        </p>
        <p className="text-sm text-white/70 mt-0.5">
          {venueName}
          {venueCity ? `, ${venueCity}` : ""}
        </p>
      </div>

      {/* Dotted separator */}
      <div className="flex items-center px-4 my-2">
        <div className="flex-1 border-t-2 border-dashed border-white/30" />
        <div className="mx-2 w-4 h-4 rounded-full bg-white/20" />
        <div className="flex-1 border-t-2 border-dashed border-white/30" />
      </div>

      {/* QR Code */}
      <div className="flex justify-center px-6 py-4 relative">
        <div className="rounded-xl overflow-hidden bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR Code"
            width={200}
            height={200}
            className="block"
          />
        </div>

        {/* UTILISÉ overlay */}
        {isCheckedIn && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/70 rounded-xl px-6 py-3 rotate-[-15deg] border-4 border-red-500">
              <span className="text-red-400 text-3xl font-black tracking-widest uppercase">
                Utilisé
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dotted separator */}
      <div className="flex items-center px-4 my-2">
        <div className="flex-1 border-t-2 border-dashed border-white/30" />
        <div className="mx-2 w-4 h-4 rounded-full bg-white/20" />
        <div className="flex-1 border-t-2 border-dashed border-white/30" />
      </div>

      {/* Ticket holder info */}
      <div className="px-6 pt-3 pb-6 space-y-1">
        <p className="text-xs text-white/60 uppercase tracking-wider">Titulaire</p>
        <p className="font-semibold text-lg">
          {buyerFirstName} {buyerLastName}
        </p>
        <p className="text-sm text-white/80">{tierName}</p>
        <p className="text-xs text-white/50 mt-2 font-mono tracking-widest">
          #{shortCode}
        </p>
      </div>
    </div>
  );
}
