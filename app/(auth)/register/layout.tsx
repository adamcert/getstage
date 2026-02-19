import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte Events gratuitement et découvrez les meilleurs événements près de chez vous.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Inscription | Events",
    description: "Créez votre compte Events gratuitement et découvrez les meilleurs événements.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
