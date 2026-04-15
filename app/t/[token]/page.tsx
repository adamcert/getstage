import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateQrDataUrl } from "@/lib/qr";
import { TicketCard } from "@/components/ticket/TicketCard";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

interface PageProps {
  params: { token: string };
}

export default async function TicketPage({ params }: PageProps) {
  const { token } = params;

  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc("get_ticket_by_token", {
    p_token: token,
  });

  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    notFound();
  }

  // RPC returns an array (TABLE return type)
  const ticket = Array.isArray(data) ? data[0] : data;

  if (!ticket) {
    notFound();
  }

  // Generate QR data URL from the short_code
  const qrDataUrl = await generateQrDataUrl(ticket.short_code, 200);

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <TicketCard
        ticketId={ticket.ticket_id}
        shortCode={ticket.short_code}
        buyerFirstName={ticket.buyer_first_name}
        buyerLastName={ticket.buyer_last_name}
        tierName={ticket.tier_name}
        eventName={ticket.event_name}
        eventStartsAt={ticket.event_starts_at}
        venueName={ticket.venue_name}
        venueAddress={ticket.venue_address}
        venueCity={ticket.venue_city}
        coverImageUrl={ticket.cover_image_url}
        status={ticket.status}
        qrDataUrl={qrDataUrl}
      />
    </main>
  );
}
