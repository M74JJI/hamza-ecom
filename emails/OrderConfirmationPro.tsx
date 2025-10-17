export default function OrderConfirmationPro({ orderId, items, total }:{ orderId:string; items: { title:string; qty:number; price:number }[]; total:number; }){
  return (
    <div style={{ fontFamily:'Inter,system-ui,Arial', background:'#0b0b0f', padding:24, color:'#f8f8f8' }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth:680, margin:'0 auto', background:'#111', borderRadius:16, border:'1px solid rgba(255,255,255,.12)' }}>
        <tbody>
          <tr><td style={{ padding:24, textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:800 }}>Hajzen Store</div>
            <div style={{ opacity:.7, fontSize:12 }}>Order Confirmation</div>
          </td></tr>
          <tr><td style={{ padding:'0 24px 12px', fontSize:14 }}>Order <span style={{ fontFamily:'monospace' }}>#{orderId}</span></td></tr>
          <tr><td style={{ padding:'0 24px 16px' }}>
            <table width="100%" style={{ borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  <th align="left" style={{ padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.1)', fontSize:12, opacity:.8 }}>Item</th>
                  <th align="center" style={{ padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.1)', fontSize:12, opacity:.8 }}>Qty</th>
                  <th align="right" style={{ padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.1)', fontSize:12, opacity:.8 }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i)=>(
                  <tr key={i}>
                    <td style={{ padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>{it.title}</td>
                    <td align="center" style={{ padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>{it.qty}</td>
                    <td align="right" style={{ padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>{it.price.toFixed(2)} MAD</td>
                  </tr>
                ))}
                <tr>
                  <td></td><td align="right" colSpan={2} style={{ paddingTop:12, fontWeight:700 }}>Total: {total.toFixed(2)} MAD</td>
                </tr>
              </tbody>
            </table>
          </td></tr>
          <tr><td style={{ padding:24, textAlign:'center', opacity:.7, fontSize:12 }}>
            We will contact you soon to confirm delivery.
          </td></tr>
          <tr><td style={{ padding:20, textAlign:'center', fontSize:11, opacity:.5, borderTop:'1px solid rgba(255,255,255,.08)' }}>
            © 2025 Hajzen Store — Built with Next.js
          </td></tr>
        </tbody>
      </table>
    </div>
  )
}
