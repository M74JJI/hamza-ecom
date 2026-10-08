import { EmailButton, EmailShell, emailStyles } from "@/emails/EmailShell";
import type { OrderEmailData } from "@/emails/order-types";
import { Hr, Section, Text } from "@react-email/components";

export default function OrderConfirmationEmail({ order, logoUrl, orderUrl }: { order: OrderEmailData; logoUrl: string; orderUrl: string }) {
  return <EmailShell preview={`Order ${shortOrderId(order.id)} received`} logoUrl={logoUrl}>
    <Text style={emailStyles.heading}>Thanks for your order, {order.customerName}</Text>
    <Text style={emailStyles.text}>We received your order and will contact you to confirm delivery.</Text>
    <Section style={emailStyles.panel}>
      <Text style={emailStyles.label}>Order</Text>
      <Text style={emailStyles.value}>#{shortOrderId(order.id)}</Text>
      <Hr style={line} />
      <Text style={emailStyles.label}>Delivery</Text>
      <Text style={emailStyles.value}>{order.address}, {order.city}<br />{order.shippingCompany}</Text>
    </Section>
    {order.items.map((item, index) => <OrderLine key={`${item.title}-${index}`} item={item} />)}
    <Section style={summary}>
      <SummaryLine label="Subtotal" value={order.subtotalMAD} />
      {order.discountMAD > 0 && <SummaryLine label="Discount" value={-order.discountMAD} />}
      <SummaryLine label="Delivery" value={order.shippingFeeMAD} />
      <Hr style={line} />
      <Text style={grandTotal}>Total&nbsp;&nbsp;{money(order.totalMAD)}</Text>
    </Section>
    <EmailButton href={orderUrl}>View order</EmailButton>
    <Text style={emailStyles.muted}>Keep this email for your records.</Text>
  </EmailShell>;
}

function OrderLine({ item }: { item: OrderEmailData["items"][number] }) {
  const details = [item.variant, item.size ? `Size ${item.size}` : null].filter(Boolean).join(" · ");
  return <Section style={itemRow}>
    <Text style={itemName}>{item.title} × {item.quantity}</Text>
    {details && <Text style={itemMeta}>{details}</Text>}
    <Text style={itemPrice}>{money(item.unitPriceMAD * item.quantity)}</Text>
  </Section>;
}

function SummaryLine({ label, value }: { label: string; value: number }) {
  return <Text style={summaryLine}>{label}: <strong>{money(value)}</strong></Text>;
}

const money = (value: number) => `${value.toFixed(2)} MAD`;
const shortOrderId = (id: string) => id.slice(0, 8).toUpperCase();
const line = { borderColor: "#dedede", margin: "14px 0" };
const itemRow = { borderBottom: "1px solid #e5e5e5", marginBottom: "14px", paddingBottom: "14px" };
const itemName = { color: "#171717", fontSize: "14px", fontWeight: "700", margin: "0 0 4px" };
const itemMeta = { color: "#737373", fontSize: "12px", margin: "0 0 4px" };
const itemPrice = { color: "#171717", fontSize: "13px", margin: "0" };
const summary = { margin: "24px 0" };
const summaryLine = { color: "#525252", fontSize: "13px", margin: "6px 0", textAlign: "right" as const };
const grandTotal = { color: "#0a0a0a", fontSize: "18px", fontWeight: "700", margin: "0", textAlign: "right" as const };
