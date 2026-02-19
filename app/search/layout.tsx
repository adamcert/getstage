import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rechercher des événements",
  description: "Recherchez et filtrez parmi des centaines d'événements : concerts, spectacles, expositions et soirées. Trouvez l'événement parfait près de chez vous.",
  openGraph: {
    title: "Rechercher des événements | GetStage",
    description: "Recherchez et filtrez parmi des centaines d'événements : concerts, spectacles, expositions et soirées.",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
