import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order securely. Secure payment by Stripe with data protection.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Checkout | GetStage",
    description: "Complete your order securely.",
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
