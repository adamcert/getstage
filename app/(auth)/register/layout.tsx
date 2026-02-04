import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Creez votre compte Events gratuitement et decouvrez les meilleurs evenements pres de chez vous.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Inscription | Events",
    description: "Creez votre compte Events gratuitement et decouvrez les meilleurs evenements.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
