import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Cards",
  description: "Give unforgettable experiences with our gift cards. Valid for all events on the platform, a perfect gift for any occasion.",
  openGraph: {
    title: "Gift Cards | GetStage",
    description: "Give unforgettable experiences with our gift cards. Valid for all events on the platform.",
  },
};

export default function GiftCardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
