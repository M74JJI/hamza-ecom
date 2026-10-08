import { Body, Button, Container, Head, Hr, Html, Img, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

export function EmailShell({ preview, logoUrl, children }: { preview: string; logoUrl: string; children: ReactNode }) {
  return (
    <Html lang="en"><Head /><Preview>{preview}</Preview><Body style={body}>
      <Container style={container}>
        <Section style={header}>
          <Img src={logoUrl} width="48" height="48" alt="HAMZA" style={logo} />
          <Text style={brand}>HAMZA</Text>
        </Section>
        <Section style={content}>{children}</Section>
        <Hr style={divider} />
        <Text style={footer}>HAMZA · Morocco · Please do not reply to this automated email.</Text>
      </Container>
    </Body></Html>
  );
}

export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return <Button href={href} style={button}>{children}</Button>;
}

export const emailStyles = {
  heading: { color: "#0a0a0a", fontSize: "26px", fontWeight: "700", letterSpacing: "-0.5px", lineHeight: "1.25", margin: "0 0 14px" },
  text: { color: "#525252", fontSize: "15px", lineHeight: "1.65", margin: "0 0 20px" },
  muted: { color: "#737373", fontSize: "13px", lineHeight: "1.55", margin: "20px 0 0" },
  panel: { backgroundColor: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "18px", margin: "22px 0" },
  label: { color: "#737373", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", margin: "0 0 5px", textTransform: "uppercase" as const },
  value: { color: "#171717", fontSize: "15px", lineHeight: "1.5", margin: "0" },
};

const body = { backgroundColor: "#f4f4f4", fontFamily: "Arial, Helvetica, sans-serif", margin: "0", padding: "32px 12px" };
const container = { backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "10px", margin: "0 auto", maxWidth: "600px", overflow: "hidden" };
const header = { borderBottom: "1px solid #e5e5e5", padding: "24px 32px" };
const logo = { display: "inline-block", verticalAlign: "middle" };
const brand = { color: "#0a0a0a", display: "inline-block", fontSize: "18px", fontWeight: "800", letterSpacing: "0.16em", margin: "0 0 0 12px", verticalAlign: "middle" };
const content = { padding: "32px" };
const button = { backgroundColor: "#0a0a0a", borderRadius: "6px", color: "#ffffff", display: "inline-block", fontSize: "14px", fontWeight: "700", padding: "13px 22px", textDecoration: "none" };
const divider = { borderColor: "#e5e5e5", margin: "0" };
const footer = { color: "#8a8a8a", fontSize: "11px", lineHeight: "1.5", margin: "0", padding: "20px 32px 24px", textAlign: "center" as const };
