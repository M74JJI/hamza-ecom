import { Html } from '@react-email/components';

export default function ResetPasswordEmail({ resetUrl }: { resetUrl: string }){
  return (
    <Html>
      <div style={{fontFamily:'Inter,Arial',padding:'24px',background:'#0b0b0d',color:'#fff'}}>
        <h1>Reset your password</h1>
        <p>Click the link below to reset your password.</p>
        <p><a style={{color:'#9ae6b4'}} href={resetUrl}>{resetUrl}</a></p>
      </div>
    </Html>
  );
}
