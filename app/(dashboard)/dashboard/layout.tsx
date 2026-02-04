import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Gerez vos evenements, suivez vos ventes et consultez vos statistiques depuis votre tableau de bord organisateur.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Dashboard | Events",
    description: "Gerez vos evenements et suivez vos ventes depuis votre tableau de bord.",
  },
};

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
