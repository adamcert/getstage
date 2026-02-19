import type { Metadata } from "next";
import { getEventBySlug } from "@/lib/data/mock-events";

interface EventLayoutProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return {
      title: "Événement introuvable",
      description: "Cet événement n'existe pas ou a été supprimé.",
    };
  }

  // Truncate description to ~155 characters for SEO
  const description = event.short_description || event.description || "";
  const truncatedDescription =
    description.length > 155
      ? description.substring(0, 152) + "..."
      : description || `Découvrez ${event.title} sur Events. Réservez vos billets en ligne.`;

  return {
    title: event.title,
    description: truncatedDescription,
    openGraph: {
      title: `${event.title} | Events`,
      description: truncatedDescription,
      type: "website",
      locale: "fr_FR",
      images: event.cover_image
        ? [
            {
              url: event.cover_image,
              width: 1200,
              height: 630,
              alt: event.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: truncatedDescription,
      images: event.cover_image ? [event.cover_image] : undefined,
    },
  };
}

export default function EventLayout({ children }: EventLayoutProps) {
  return children;
}
