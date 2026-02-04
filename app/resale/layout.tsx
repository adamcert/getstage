import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revente de billets securisee",
  description: "Achetez ou revendez vos billets en toute securite sur notre plateforme de revente officielle. Transactions garanties et billets verifies.",
  openGraph: {
    title: "Revente de billets securisee | Events",
    description: "Achetez ou revendez vos billets en toute securite sur notre plateforme de revente officielle.",
  },
};

export default function ResaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
