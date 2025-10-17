import { Html } from '@react-email/components';

export default function OrderConfirmation({ orderId }: { orderId: string }){
  return (
    <Html>
      <div style={{fontFamily:'Inter,Arial',padding:'24px',background:'#0b0b0d',color:'#fff'}}>
        <h1>Order Confirmed</h1>
        <p>Order <b>#{orderId}</b> has been placed successfully. We will contact you soon.</p>
      </div>
    </Html>
  );
}
