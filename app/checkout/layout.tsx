import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiement",
  description: "Finalisez votre commande en toute sécurité. Paiement sécurisé par Stripe avec protection des données.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Paiement | GetStage",
    description: "Finalisez votre commande en toute sécurité.",
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
