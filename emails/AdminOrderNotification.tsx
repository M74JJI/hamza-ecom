import { EmailButton, EmailShell, emailStyles } from "@/emails/EmailShell";
import type { OrderEmailData } from "@/emails/order-types";
import { Hr, Section, Text } from "@react-email/components";

export default function AdminOrderNotification({ order, logoUrl, dashboardUrl }: { order: OrderEmailData; logoUrl: string; dashboardUrl: string }) {
  return <EmailShell preview={`New order ${shortOrderId(order.id)} · ${money(order.totalMAD)}`} logoUrl={logoUrl}>
    <Text style={emailStyles.heading}>New order received</Text>
    <Text style={emailStyles.text}>Order <strong>#{shortOrderId(order.id)}</strong> needs review.</Text>
    <Section style={emailStyles.panel}>
      <Text style={emailStyles.label}>Customer</Text>
      <Text style={emailStyles.value}>{order.customerName} · {order.customerEmail} · {order.phone}</Text>
      <Hr style={line} />
      <Text style={emailStyles.label}>Delivery</Text>
      <Text style={emailStyles.value}>{order.address}, {order.city} · {order.shippingCompany}</Text>
      <Hr style={line} />
      <Text style={emailStyles.label}>Total</Text>
      <Text style={total}>{money(order.totalMAD)}</Text>
    </Section>
    {order.items.map((item, index) => <OrderLine key={`${item.title}-${index}`} item={item} />)}
    <EmailButton href={dashboardUrl}>Open order dashboard</EmailButton>
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

const money = (value: number) => `${value.toFixed(2)} MAD`;
const shortOrderId = (id: string) => id.slice(0, 8).toUpperCase();
const line = { borderColor: "#dedede", margin: "14px 0" };
const total = { ...emailStyles.value, fontSize: "22px", fontWeight: "700" };
const itemRow = { borderBottom: "1px solid #e5e5e5", marginBottom: "14px", paddingBottom: "14px" };
const itemName = { color: "#171717", fontSize: "14px", fontWeight: "700", margin: "0 0 4px" };
const itemMeta = { color: "#737373", fontSize: "12px", margin: "0 0 4px" };
const itemPrice = { color: "#171717", fontSize: "13px", margin: "0" };
