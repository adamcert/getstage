import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search events",
  description: "Search and filter among hundreds of events: concerts, shows, exhibitions and parties. Find the perfect event near you.",
  openGraph: {
    title: "Search events | GetStage",
    description: "Search and filter among hundreds of events: concerts, shows, exhibitions and parties.",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
