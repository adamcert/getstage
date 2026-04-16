import { Body, Container, Head, Html, Preview, Section, Text, Button, Hr, Row, Column } from "@react-email/components";
import * as React from "react";

interface Props {
  firstName: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  tierName: string;
  shortCode: string;
  mapsUrl: string;
}

export function TicketEmail({
  firstName, eventName, eventDate, venueName, venueAddress, venueCity,
  tierName, shortCode, mapsUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Ton billet pour {eventName} est en pièce jointe</Preview>
      <Body style={{ background: "#09090B", color: "#fff", fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px" }}>

          {/* GetStage Logo Header */}
          <Section>
            <Row>
              <Column style={{ width: 40 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, #EF4444, #8B5CF6)",
                  display: "inline-block", textAlign: "center", lineHeight: "36px",
                }}>
                  <span style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>G</span>
                </div>
              </Column>
              <Column>
                <Text style={{ fontSize: 20, fontWeight: 700, color: "#FAFAFA", margin: 0, lineHeight: "22px" }}>
                  GetStage
                </Text>
                <Text style={{ fontSize: 9, color: "#71717A", margin: 0, letterSpacing: "2px", textTransform: "uppercase" }}>
                  by SNAPSS
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Greeting */}
          <Text style={{ fontSize: 16, color: "#A1A1AA", marginTop: 28, marginBottom: 4 }}>
            Bonjour {firstName},
          </Text>
          <Text style={{ fontSize: 16, color: "#D4D4D8", margin: "0 0 8px 0" }}>
            Ton billet pour <strong style={{ color: "#FAFAFA" }}>{eventName}</strong> est confirmé.
          </Text>

          {/* PDF callout */}
          <Section style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(139,92,246,0.08))",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 24,
            border: "1px solid rgba(139,92,246,0.2)",
          }}>
            <Text style={{ fontSize: 14, color: "#C4B5FD", fontWeight: 600, margin: 0 }}>
              📎 Ton billet est en pièce jointe de cet email
            </Text>
            <Text style={{ fontSize: 12, color: "#8B8A9A", margin: "4px 0 0 0" }}>
              Sauvegarde le PDF sur ton téléphone pour le jour J
            </Text>
          </Section>

          {/* Event Card */}
          <Section style={{
            background: "#18181B",
            borderRadius: 16,
            border: "1px solid #27272A",
            overflow: "hidden",
          }}>
            {/* Red-violet accent bar */}
            <Section style={{
              height: 4,
              background: "linear-gradient(90deg, #EF4444, #8B5CF6)",
            }} />

            <Section style={{ padding: "20px 24px 16px 24px" }}>
              <Text style={{ fontSize: 20, fontWeight: 700, color: "#FAFAFA", margin: 0, lineHeight: "26px" }}>
                {eventName}
              </Text>
              <Text style={{ fontSize: 14, color: "#A1A1AA", margin: "10px 0 0 0" }}>
                📅 {eventDate}
              </Text>
              <Text style={{ fontSize: 14, color: "#A1A1AA", margin: "4px 0 0 0" }}>
                📍 {venueName}{venueAddress ? ` — ${venueAddress}` : ""}{venueCity ? `, ${venueCity}` : ""}
              </Text>
            </Section>

            <Hr style={{ border: "none", borderTop: "1px solid #27272A", margin: 0 }} />

            <Section style={{ padding: "14px 24px" }}>
              <Row>
                <Column>
                  <Text style={{ fontSize: 11, color: "#71717A", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                    Catégorie
                  </Text>
                  <Text style={{ fontSize: 14, color: "#D4D4D8", fontWeight: 600, margin: "2px 0 0 0" }}>
                    {tierName}
                  </Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={{ fontSize: 11, color: "#71717A", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                    Réf.
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: "monospace", color: "#52525B", margin: "2px 0 0 0" }}>
                    {shortCode}
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Map Link */}
          {mapsUrl && (
            <Section style={{ textAlign: "center", marginTop: 20 }}>
              <Button href={mapsUrl} style={{
                background: "#18181B",
                color: "#D4D4D8",
                padding: "12px 24px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 500,
                fontSize: 14,
                border: "1px solid #27272A",
              }}>
                📍 Voir le lieu sur la carte
              </Button>
            </Section>
          )}

          {/* Instructions */}
          <Section style={{
            background: "#18181B",
            borderRadius: 12,
            padding: "16px 20px",
            marginTop: 20,
            border: "1px solid #27272A",
          }}>
            <Text style={{ fontSize: 13, color: "#D4D4D8", margin: 0, lineHeight: "22px" }}>
              <strong style={{ color: "#FAFAFA" }}>Le jour J :</strong><br />
              1. Ouvre le PDF en pièce jointe sur ton téléphone<br />
              2. Présente le QR code à l&#39;entrée<br />
              3. Chaque billet ne peut être scanné qu&#39;une seule fois
            </Text>
          </Section>

          {/* Separator */}
          <Hr style={{ border: "none", borderTop: "1px solid #27272A", margin: "28px 0" }} />

          {/* Footer */}
          <Text style={{ fontSize: 11, color: "#52525B", textAlign: "center", lineHeight: "18px", margin: 0 }}>
            Billet nominatif — pièce d&#39;identité demandée à l&#39;entrée.<br />
            Ne transfère pas cet email. Chaque billet est unique et personnel.
          </Text>

          <Section style={{ textAlign: "center", marginTop: 16 }}>
            <Row>
              <Column style={{ textAlign: "center" }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: "linear-gradient(135deg, #EF4444, #8B5CF6)",
                  display: "inline-block", textAlign: "center", lineHeight: "24px",
                  marginBottom: 4,
                }}>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>G</span>
                </div>
                <Text style={{ fontSize: 10, color: "#3F3F46", margin: "4px 0 0 0" }}>
                  powered by GetStage
                </Text>
              </Column>
            </Row>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
