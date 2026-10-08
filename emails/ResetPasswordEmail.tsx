import { EmailButton, EmailShell, emailStyles } from "@/emails/EmailShell";
import { Text } from "@react-email/components";

export default function ResetPasswordEmail({ resetUrl, logoUrl }: { resetUrl: string; logoUrl: string }) {
  return <EmailShell preview="Reset your HAMZA password" logoUrl={logoUrl}>
    <Text style={emailStyles.heading}>Reset your password</Text>
    <Text style={emailStyles.text}>Use this secure link to choose a new password for your HAMZA account.</Text>
    <EmailButton href={resetUrl}>Reset password</EmailButton>
    <Text style={emailStyles.muted}>If you did not request this, ignore this email. Your password stays unchanged.</Text>
  </EmailShell>;
}
