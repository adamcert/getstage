import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous a votre compte Events pour acceder a vos billets et gerer vos reservations.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Connexion | Events",
    description: "Connectez-vous a votre compte Events pour acceder a vos billets.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
