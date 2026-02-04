import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    template: "%s | Events",
    default: "Events - Decouvrez les meilleurs evenements",
  },
  description: "Billetterie en ligne pour concerts, clubs, theatre, expositions et plus encore. Reservez vos places en toute securite.",
  keywords: [
    "billetterie",
    "evenements",
    "concerts",
    "theatre",
    "expositions",
    "spectacles",
    "reservation",
    "billets",
    "sorties",
    "culture",
  ],
  authors: [{ name: "Events" }],
  creator: "Events",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Events",
    title: "Events - Decouvrez les meilleurs evenements",
    description: "Billetterie en ligne pour concerts, clubs, theatre, expositions et plus encore. Reservez vos places en toute securite.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Events - Plateforme de billetterie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events - Decouvrez les meilleurs evenements",
    description: "Billetterie en ligne pour concerts, clubs, theatre, expositions et plus encore.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
