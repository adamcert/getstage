import { Body, Container, Head, Html, Img, Preview, Section, Text, Button, Hr } from "@react-email/components";
import * as React from "react";

interface Props {
  firstName: string;
  eventName: string;
  eventDate: string;           // formatted "Samedi 22 Avril 2026 · 23:00"
  venueName: string;
  venueAddress: string;
  tierName: string;
  shortCode: string;
  ticketUrl: string;
  qrCid: string;               // "qr@getstage" — matches attachment cid
  organizerName?: string;
}

export function TicketEmail({
  firstName, eventName, eventDate, venueName, venueAddress,
  tierName, shortCode, ticketUrl, qrCid, organizerName,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Ton billet pour {eventName}</Preview>
      <Body style={{ background: "#0B0B0F", color: "#fff", fontFamily: "Inter, sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 700, background: "linear-gradient(90deg,#EF4444,#8B5CF6)", WebkitBackgroundClip: "text", color: "transparent" }}>
            GetStage
          </Text>
          <Text style={{ fontSize: 18, marginTop: 24 }}>Bonjour {firstName},</Text>
          <Text>Ton billet pour <strong>{eventName}</strong> est confirmé.</Text>

          <Section style={{ background: "#17171D", borderRadius: 12, padding: 20, marginTop: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{eventName}</Text>
            <Text style={{ color: "#9CA3AF", margin: "4px 0" }}>{eventDate}</Text>
            <Text style={{ color: "#9CA3AF", margin: "4px 0" }}>{venueName} — {venueAddress}</Text>
            <Hr style={{ borderColor: "#27272F", margin: "16px 0" }} />
            <Text style={{ margin: "4px 0" }}><strong>Catégorie :</strong> {tierName}</Text>
            <Text style={{ margin: "4px 0", fontFamily: "monospace", fontSize: 12, color: "#9CA3AF" }}>{shortCode}</Text>
          </Section>

          <Section style={{ textAlign: "center", marginTop: 24 }}>
            <Img src={`cid:${qrCid}`} width="220" height="220" alt="QR" style={{ borderRadius: 12 }} />
          </Section>

          <Section style={{ textAlign: "center", marginTop: 16 }}>
            <Button href={ticketUrl} style={{ background: "linear-gradient(90deg,#EF4444,#8B5CF6)", color: "#fff", padding: "12px 24px", borderRadius: 999, textDecoration: "none", fontWeight: 600 }}>
              Ouvrir mon billet
            </Button>
          </Section>

          <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 32, textAlign: "center" }}>
            Billet nominatif — pièce d&apos;identité demandée à l&apos;entrée.<br />
            {organizerName ? `Vendu par GetStage pour ${organizerName}.` : "Vendu par GetStage."}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
