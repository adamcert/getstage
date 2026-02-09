import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rechercher des evenements",
  description: "Recherchez et filtrez parmi des centaines d'evenements : concerts, spectacles, expositions et soirees. Trouvez l'evenement parfait pres de chez vous.",
  openGraph: {
    title: "Rechercher des evenements | GetStage",
    description: "Recherchez et filtrez parmi des centaines d'evenements : concerts, spectacles, expositions et soirees.",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
