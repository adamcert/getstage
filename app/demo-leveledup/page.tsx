import type { Metadata } from "next";
import { DemoHome } from "./demo-home";
import {
  getTonightEvents,
  getFeaturedEvents,
  getNewEvents,
  mockEvents,
} from "@/lib/data/mock-events";

export const metadata: Metadata = {
  title: "LEVELED UP - La Scène Autrement",
  description:
    "Vivez la scène comme jamais. Concerts, clubs, culture et plus encore.",
};

export default function DemoPage() {
  const tonightEvents = getTonightEvents();
  const featuredEvents = getFeaturedEvents();
  const newEvents = getNewEvents();

  return (
    <DemoHome
      tonightEvents={tonightEvents}
      featuredEvents={featuredEvents}
      newEvents={newEvents}
      allEvents={mockEvents}
    />
  );
}
