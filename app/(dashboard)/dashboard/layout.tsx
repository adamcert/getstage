import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your events, track your sales and view your statistics from your organizer dashboard.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Dashboard | Events",
    description: "Manage your events and track your sales from your dashboard.",
  },
};

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
