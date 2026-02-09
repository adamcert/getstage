import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { EventSection } from "@/components/home/event-section";
import {
  getTonightEvents,
  getFeaturedEvents,
  getNewEvents,
} from "@/lib/data/mock-events";

export const metadata: Metadata = {
  title: "Accueil - Decouvrez les meilleurs evenements",
  description: "Explorez les meilleurs evenements pres de chez vous : concerts, theatre, expositions, soirees et plus encore. Reservez vos billets en ligne en toute securite.",
  openGraph: {
    title: "Accueil - Decouvrez les meilleurs evenements | GetStage",
    description: "Explorez les meilleurs evenements pres de chez vous : concerts, theatre, expositions, soirees et plus encore.",
  },
};

export default function Home() {
  // Get events for each section
  const tonightEvents = getTonightEvents();
  const featuredEvents = getFeaturedEvents();
  const newEvents = getNewEvents();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <Hero />

      {/* Ce soir - Tonight's Events */}
      {tonightEvents.length > 0 && (
        <EventSection
          title="Ce soir"
          subtitle="Les evenements qui ont lieu aujourd'hui"
          events={tonightEvents}
          viewAllLink="/events?filter=tonight"
          className="bg-white"
        />
      )}

      {/* Coups de coeur - Featured Events */}
      <EventSection
        title="Coups de coeur"
        subtitle="Notre selection des meilleurs evenements"
        events={featuredEvents.slice(0, 6)}
        variant="featured"
        viewAllLink="/events?filter=featured"
        className="bg-gray-50"
      />

      {/* Nouveautes - New Events */}
      <EventSection
        title="Nouveautes"
        subtitle="Les derniers evenements ajoutes"
        events={newEvents.slice(0, 8)}
        viewAllLink="/events?filter=new"
        className="bg-white"
      />
    </main>
  );
}
