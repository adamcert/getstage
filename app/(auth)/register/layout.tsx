import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your free Events account and discover the best events near you.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Sign Up | Events",
    description: "Create your free Events account and discover the best events.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
