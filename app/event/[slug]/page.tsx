import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import EventDetailClient from "./EventDetailClient";

interface PageProps {
  params: { slug: string };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = params;

  // Short-circuit: if the slug maps to a private event in the DB, return 404.
  // Mock events (which have no DB record) fall through normally.
  const sb = supabaseAdmin();
  const { data: dbEvent } = await sb
    .from("events")
    .select("visibility")
    .eq("slug", slug)
    .maybeSingle();

  if (dbEvent?.visibility === "private") {
    notFound();
  }

  return <EventDetailClient />;
}
