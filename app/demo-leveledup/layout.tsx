import { Unbounded } from "next/font/google";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-display-demo",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={unbounded.variable}>{children}</div>;
}
