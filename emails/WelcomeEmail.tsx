import { Html } from '@react-email/components';

export default function WelcomeEmail({ name = 'there' }: { name?: string }){
  return (
    <Html>
      <div style={{fontFamily:'Inter,Arial',padding:'24px',background:'#0b0b0d',color:'#fff'}}>
        <h1 style={{margin:'0 0 12px'}}>Welcome, {name} 👋</h1>
        <p style={{opacity:.8}}>Thanks for creating an account at <b>Hajzen Store</b>.</p>
      </div>
    </Html>
  );
}
