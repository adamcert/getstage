import type { Metadata } from "next";
import { DemoHome } from "@/components/home/demo-home";
import {
  getTonightEvents,
  getFeaturedEvents,
  getNewEvents,
  mockEvents,
} from "@/lib/data/mock-events";

export const metadata: Metadata = {
  title: "Home - Experience the stage like never before",
  description:
    "Experience the stage like never before. Concerts, clubs, culture and more. Book your tickets online securely.",
  openGraph: {
    title: "GetStage - Experience the stage like never before",
    description:
      "Concerts, clubs, culture and more. Book your tickets online securely.",
  },
};

export default function Home() {
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
