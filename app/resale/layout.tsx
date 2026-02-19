import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revente de billets sécurisée",
  description: "Achetez ou revendez vos billets en toute sécurité sur notre plateforme de revente officielle. Transactions garanties et billets vérifiés.",
  openGraph: {
    title: "Revente de billets sécurisée | GetStage",
    description: "Achetez ou revendez vos billets en toute sécurité sur notre plateforme de revente officielle.",
  },
};

export default function ResaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
