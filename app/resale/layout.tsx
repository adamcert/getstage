import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Ticket Resale",
  description: "Buy or resell your tickets safely on our official resale platform. Guaranteed transactions and verified tickets.",
  openGraph: {
    title: "Secure Ticket Resale | GetStage",
    description: "Buy or resell your tickets safely on our official resale platform.",
  },
};

export default function ResaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
