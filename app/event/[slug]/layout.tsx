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
      title: "Event not found",
      description: "This event does not exist or has been deleted.",
    };
  }

  // Truncate description to ~155 characters for SEO
  const description = event.short_description || event.description || "";
  const truncatedDescription =
    description.length > 155
      ? description.substring(0, 152) + "..."
      : description || `Discover ${event.title} on Events. Book your tickets online.`;

  return {
    title: event.title,
    description: truncatedDescription,
    openGraph: {
      title: `${event.title} | Events`,
      description: truncatedDescription,
      type: "website",
      locale: "en_US",
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
