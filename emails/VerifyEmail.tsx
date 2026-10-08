import { EmailButton, EmailShell, emailStyles } from "@/emails/EmailShell";
import { Text } from "@react-email/components";

export default function VerifyEmail({ verifyUrl, logoUrl }: { verifyUrl: string; logoUrl: string }) {
  return <EmailShell preview="Verify your HAMZA email address" logoUrl={logoUrl}>
    <Text style={emailStyles.heading}>Verify your email</Text>
    <Text style={emailStyles.text}>Confirm this email address to finish creating your HAMZA account.</Text>
    <EmailButton href={verifyUrl}>Verify email address</EmailButton>
    <Text style={emailStyles.muted}>This link expires in 24 hours. If you did not create an account, ignore this email.</Text>
  </EmailShell>;
}
