export default function OrderConfirmationEmail({ order }: { order: any }){
  return (
    <div style={{fontFamily:'ui-sans-serif,system-ui', padding:'20px'}}>
      <h1>Thanks for your order!</h1>
      <p>Order ID: <strong>{order.id}</strong></p>
      <p>Total: <strong>{Number(order.totalMAD).toFixed(2)} MAD</strong></p>
      <p>We will contact you to confirm delivery soon.</p>
    </div>
  );
}
