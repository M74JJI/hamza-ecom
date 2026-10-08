import { EmailButton, EmailShell, emailStyles } from "@/emails/EmailShell";
import { Section, Text } from "@react-email/components";

export default function OrderStatusUpdate({ orderId, status, logoUrl, orderUrl }: { orderId: string; status: string; logoUrl: string; orderUrl: string }) {
  return <EmailShell preview={`Your HAMZA order is ${status.toLowerCase()}`} logoUrl={logoUrl}>
    <Text style={emailStyles.heading}>Order status updated</Text>
    <Text style={emailStyles.text}>Your order has moved to a new stage.</Text>
    <Section style={emailStyles.panel}>
      <Text style={emailStyles.label}>Order</Text>
      <Text style={emailStyles.value}>#{orderId.slice(0, 8).toUpperCase()}</Text>
      <Text style={{ ...emailStyles.label, marginTop: "16px" }}>Status</Text>
      <Text style={{ ...emailStyles.value, fontWeight: "700" }}>{status}</Text>
    </Section>
    <EmailButton href={orderUrl}>View order</EmailButton>
  </EmailShell>;
}
