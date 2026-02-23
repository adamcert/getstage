import type { Metadata } from "next";
import { DemoHome } from "./demo-home";
import {
  getTonightEvents,
  getFeaturedEvents,
  getNewEvents,
  mockEvents,
} from "@/lib/data/mock-events";

export const metadata: Metadata = {
  title: "LEVELED UP - The Stage Reimagined",
  description:
    "Experience the stage like never before. Concerts, clubs, culture and more.",
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
