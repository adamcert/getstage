import type { Metadata } from "next";
import { Inter, Space_Grotesk, Unbounded } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "700"],
});
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-display-demo",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    template: "%s | GetStage",
    default: "GetStage - Discover the best events",
  },
  description: "Online ticketing for concerts, clubs, theatre, exhibitions and more. Book your seats safely.",
  keywords: [
    "ticketing",
    "events",
    "concerts",
    "theatre",
    "exhibitions",
    "shows",
    "booking",
    "tickets",
    "outings",
    "culture",
  ],
  authors: [{ name: "GetStage by SNAPSS" }],
  creator: "GetStage by SNAPSS",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "GetStage",
    title: "GetStage - Discover the best events",
    description: "Online ticketing for concerts, clubs, theatre, exhibitions and more. Book your seats safely.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GetStage - Ticketing platform by SNAPSS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetStage - Discover the best events",
    description: "Online ticketing for concerts, clubs, theatre, exhibitions and more.",
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
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${unbounded.variable} font-sans bg-[#09090B] text-zinc-100 noise-overlay`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
