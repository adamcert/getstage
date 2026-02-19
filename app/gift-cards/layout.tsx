import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cartes Cadeaux",
  description: "Offrez des expériences inoubliables avec nos cartes cadeaux. Valables sur tous les événements de la plateforme, un cadeau parfait pour toutes les occasions.",
  openGraph: {
    title: "Cartes Cadeaux | GetStage",
    description: "Offrez des expériences inoubliables avec nos cartes cadeaux. Valables sur tous les événements de la plateforme.",
  },
};

export default function GiftCardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
