import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiement",
  description: "Finalisez votre commande en toute securite. Paiement securise par Stripe avec protection des donnees.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Paiement | Events",
    description: "Finalisez votre commande en toute securite.",
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
