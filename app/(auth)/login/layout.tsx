import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Events account to access your tickets and manage your bookings.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Sign In | Events",
    description: "Sign in to your Events account to access your tickets.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
