import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';

export async function makePremiumInvoicePdf({ order }: { order: any }) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4 size
  
  // Font setup
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  
  // Color scheme
  const primary = rgb(0.11, 0.53, 0.81);
  const secondary = rgb(0.95, 0.96, 0.98);
  const accent = rgb(0.92, 0.26, 0.21);
  const success = rgb(0.18, 0.63, 0.35);
  const darkText = rgb(0.2, 0.2, 0.2);
  const mediumText = rgb(0.45, 0.45, 0.45);
  const lightBorder = rgb(0.9, 0.9, 0.9);
  const white = rgb(1, 1, 1);

  // Layout constants - SIMPLE AND CLEAR
  const margin = 50;
  const contentWidth = 495; // 595 - 2*50
  let yPosition = 780; // Start from top

  // SIMPLE HELPER FUNCTIONS
  const drawText = (text: string, x: number, y: number, size: number = 11, useBold: boolean = false, color = darkText, maxWidth?: number) => {
    page.drawText(String(text), {
      x,
      y,
      size,
      font: useBold ? bold : font,
      color,
      maxWidth
    });
  };

  const moveDown = (lines: number = 1) => {
    yPosition -= (lines * 16); // Standard line height
  };

  const drawLine = (thickness: number = 1, color = lightBorder) => {
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: margin + contentWidth, y: yPosition },
      thickness,
      color,
    });
    moveDown(1);
  };

  // === HEADER SECTION ===
  // Header background
  page.drawRectangle({
    x: 0,
    y: 750,
    width: 595,
    height: 92,
    color: primary,
  });

  // Company info
  drawText('HAJZEN STORE', margin, 810, 24, true, white);
  drawText('Premium E-Commerce Solutions', margin, 785, 10, false, white);

  // Invoice badge
  page.drawRectangle({
    x: 400,
    y: 785,
    width: 145,
    height: 40,
    color: white,
  });

  drawText('INVOICE', 425, 805, 16, true, primary);
  drawText(`#${order.id.slice(0, 8).toUpperCase()}`, 425, 785, 12, true, darkText);

  // Start main content
  yPosition = 700;

  // === ORDER DETAILS SECTION ===
  drawText('Order Details', margin, yPosition, 14, true, primary);
  moveDown(1.5);

  // Order details in two columns
  const leftCol = margin;
  const rightCol = margin + 250;

  // Left column - Order info
  drawText(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, leftCol, yPosition, 11, false, darkText);
  drawText(`Status: ${order.status.toUpperCase()}`, leftCol, yPosition - 16, 11, false, 
    order.status === 'paid' || order.status === 'delivered' ? success : accent);
  
  if (order.paymentMethod) {
    drawText(`Payment: ${order.paymentMethod}`, leftCol, yPosition - 32, 11, false, darkText);
  }

  // Right column - Customer info
  if (order.address) {
    drawText(order.address.fullName, rightCol, yPosition, 11, true, darkText);
    drawText(order.address.fullAddress, rightCol, yPosition - 16, 11, false, darkText);
    drawText(`${order.address.city}, ${order.address.country || 'Morocco'}`, rightCol, yPosition - 32, 11, false, darkText);
    drawText(order.address.phone, rightCol, yPosition - 48, 11, false, darkText);
  }

  moveDown(4); // Move down past both columns

  // Divider
  drawLine(0.5);
  moveDown(1);

  // === ORDER ITEMS TABLE ===
  drawText('Order Items', margin, yPosition, 14, true, primary);
  moveDown(1.5);

  // Table header
  const tableTop = yPosition;
  const col = {
    item: margin,
    qty: 350,
    price: 420,
    total: 500
  };

  // Header background
  page.drawRectangle({
    x: margin,
    y: tableTop - 20,
    width: contentWidth,
    height: 25,
    color: secondary,
  });

  // Header text
  drawText('Item Description', col.item, tableTop - 5, 11, true, primary);
  drawText('Qty', col.qty, tableTop - 5, 11, true, primary);
  drawText('Price', col.price, tableTop - 5, 11, true, primary);
  drawText('Total', col.total, tableTop - 5, 11, true, primary);

  yPosition = tableTop - 40;

  // Table rows
  for (const item of order.items) {
    const itemText = `${item.productBrand} - ${item.title}${item.size ? ` [${item.size}]` : ''}`;
    
    // Draw item row
    drawText(itemText, col.item, yPosition, 10, false, darkText, 250);
    drawText(String(item.quantity), col.qty, yPosition, 10, false, darkText);
    drawText(`${item.unitPrice?.toFixed(2) || '0.00'} MAD`, col.price, yPosition, 10, false, darkText);
    drawText(`${item.totalPrice?.toFixed(2) || '0.00'} MAD`, col.total, yPosition, 10, false, darkText);
    
    // Row divider
    drawLine(0.3);
  }

  moveDown(1);

  // === TOTALS SECTION ===
  const totalsLeft = 350;
  
  // Totals background
  page.drawRectangle({
    x: totalsLeft - 10,
    y: yPosition - 120,
    width: 200,
    height: 120,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: lightBorder,
    borderWidth: 1,
  });

  // Reset Y for totals
  const totalsStartY = yPosition - 20;
  let totalsY = totalsStartY;

  // Subtotal
  drawText('Subtotal:', totalsLeft, totalsY, 11, false, darkText);
  drawText(`${order.subtotalMAD?.toFixed(2) || '0.00'} MAD`, totalsLeft + 80, totalsY, 11, false, darkText);
  totalsY -= 20;

  // Discount
  if (order.discountMAD && order.discountMAD > 0) {
    drawText('Discount:', totalsLeft, totalsY, 11, false, accent);
    drawText(`-${order.discountMAD.toFixed(2)} MAD`, totalsLeft + 80, totalsY, 11, false, accent);
    totalsY -= 20;
  }

  // Shipping
  if (order.shippingFeeMAD) {
    drawText('Shipping:', totalsLeft, totalsY, 11, false, darkText);
    drawText(`${order.shippingFeeMAD.toFixed(2)} MAD`, totalsLeft + 80, totalsY, 11, false, darkText);
    totalsY -= 20;
  }

  // Tax
  if (order.taxMAD && order.taxMAD > 0) {
    drawText('Tax:', totalsLeft, totalsY, 11, false, darkText);
    drawText(`${order.taxMAD.toFixed(2)} MAD`, totalsLeft + 80, totalsY, 11, false, darkText);
    totalsY -= 20;
  }

  // Total line
  drawLine(1, primary);
  totalsY -= 10;

  // Grand Total
  drawText('TOTAL:', totalsLeft, totalsY, 14, true, primary);
  drawText(`${order.totalMAD?.toFixed(2) || '0.00'} MAD`, totalsLeft + 80, totalsY, 14, true, primary);

  yPosition = totalsY - 40;

  // === ADDITIONAL INFORMATION ===
  if (order.notes || order.estimatedDelivery) {
    drawText('Additional Information', margin, yPosition, 12, true, primary);
    moveDown(1);

    if (order.estimatedDelivery) {
      drawText(`Estimated Delivery: ${order.estimatedDelivery}`, margin, yPosition, 10, false, darkText);
      moveDown(1);
    }

    if (order.notes) {
      drawText(`Notes: ${order.notes}`, margin, yPosition, 10, false, darkText, 400);
      moveDown(2);
    }

    moveDown(1);
  }

  // === FOOTER ===
  const footerY = 50;

  // Footer background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 595,
    height: footerY + 20,
    color: secondary,
  });

  // Footer content
  drawText('Thank you for your business!', margin, footerY + 15, 12, true, primary);
  drawText('We appreciate your trust in HAJZEN STORE', margin, footerY, 10, false, mediumText);
  drawText('Contact: support@hajzen.com | www.hajzen.com', margin, footerY - 15, 9, false, mediumText);
  drawText('All amounts are in Moroccan Dirham (MAD)', margin, footerY - 30, 8, false, mediumText);

  // Watermark for paid orders
  if (order.status === 'paid' || order.status === 'delivered') {
    page.drawText('PAID', {
      x: 200,
      y: 400,
      size: 120,
      font: bold,
      color: rgb(0.95, 0.95, 0.95),
      opacity: 0.2,
      //rotate: degreesToRadians(45),
    });
  }

  const pdfBytes = await pdf.save();
  return new Uint8Array(pdfBytes);
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}