import { Html } from '@react-email/components';

export default function VerifyEmail({ verifyUrl }: { verifyUrl: string }){
  return (
    <Html>
      <div style={{fontFamily:'Inter,Arial',padding:'24px',background:'#0b0b0d',color:'#fff'}}>
        <h1>Verify your email</h1>
        <p>Click the link below to verify your email address.</p>
        <p><a style={{color:'#9ae6b4'}} href={verifyUrl}>{verifyUrl}</a></p>
      </div>
    </Html>
  );
}
