import { EmailButton, EmailShell, emailStyles } from "@/emails/EmailShell";
import { Text } from "@react-email/components";

export default function WelcomeEmail({ name = "there", logoUrl, shopUrl }: { name?: string; logoUrl: string; shopUrl: string }) {
  return <EmailShell preview="Welcome to HAMZA" logoUrl={logoUrl}>
    <Text style={emailStyles.heading}>Welcome, {name}</Text>
    <Text style={emailStyles.text}>Your HAMZA account is ready. Browse products, save favorites, and track orders in one place.</Text>
    <EmailButton href={shopUrl}>Visit HAMZA</EmailButton>
  </EmailShell>;
}
