// Generate a downloadable PDF invoice / receipt for a transaction
import jsPDF from 'jspdf';
import { Transaction } from './pricingStore';

export interface InvoiceParty {
  name: string;
  email: string;
  studentId: string;
  phone?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const BRAND = {
  name: 'Typing Master by Vinkal Prajapati',
  tagline: 'Free Online Typing Master Tool',
  website: 'https://vinkaltyping.lovable.app',
  email: 'support@vinkaltyping.com',
  address: 'India',
  gstin: 'N/A',
};

export const invoiceNumber = (t: Transaction) =>
  `INV-${new Date(t.createdAt).getFullYear()}-${t.id.slice(-8).toUpperCase()}`;

export const generateInvoicePDF = (t: Transaction, party: InvoiceParty): jsPDF => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  let y = 50;

  // Header band
  doc.setFillColor(139, 92, 246);
  doc.rect(0, 0, W, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(BRAND.name, M, 38);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(BRAND.tagline, M, 56);
  doc.text(BRAND.website, M, 70);

  // Invoice title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(t.status === 'success' ? 'TAX INVOICE' : 'RECEIPT', W - M, 42, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`# ${invoiceNumber(t)}`, W - M, 58, { align: 'right' });
  doc.text(new Date(t.createdAt).toLocaleString('en-IN'), W - M, 70, { align: 'right' });

  y = 110;
  doc.setTextColor(20, 20, 20);

  // Status badge
  const statusColor: [number, number, number] =
    t.status === 'success' ? [34, 197, 94] :
    t.status === 'pending' ? [234, 179, 8] :
    t.status === 'refunded' ? [99, 102, 241] : [239, 68, 68];
  doc.setFillColor(...statusColor);
  doc.roundedRect(M, y, 90, 22, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(t.status.toUpperCase(), M + 45, y + 15, { align: 'center' });

  y += 50;

  // Bill To & From
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(9);
  doc.text('BILLED TO', M, y);
  doc.text('FROM', W / 2 + 10, y);
  y += 14;

  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(party.name, M, y);
  doc.text(BRAND.name, W / 2 + 10, y);

  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(party.email, M, y);
  doc.text(BRAND.email, W / 2 + 10, y);
  y += 12;
  doc.text(`Student ID: ${party.studentId}`, M, y);
  doc.text(`Website: ${BRAND.website}`, W / 2 + 10, y);
  if (party.phone) { y += 12; doc.text(`Phone: ${party.phone}`, M, y); }
  if (party.city)  {
    const addr = [party.city, party.state, party.pincode].filter(Boolean).join(', ');
    if (addr) { y += 12; doc.text(addr, M, y); }
  }

  y += 30;

  // Items table header
  doc.setFillColor(245, 245, 250);
  doc.rect(M, y, W - 2 * M, 26, 'F');
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DESCRIPTION', M + 10, y + 17);
  doc.text('DURATION', W - 220, y + 17);
  doc.text('AMOUNT', W - M - 10, y + 17, { align: 'right' });
  y += 40;

  // Row
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  doc.text(`${t.planName} Plan Subscription`, M + 10, y);
  doc.text(`${t.durationMonths} month${t.durationMonths > 1 ? 's' : ''}`, W - 220, y);
  doc.text(`Rs. ${t.originalAmount}`, W - M - 10, y, { align: 'right' });

  if (t.couponCode) {
    y += 14;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Coupon applied: ${t.couponCode}`, M + 10, y);
  }

  y += 30;
  doc.setDrawColor(230, 230, 230);
  doc.line(M, y, W - M, y);
  y += 20;

  // Totals
  const lineRight = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 12 : 10);
    doc.setTextColor(bold ? 20 : 90, bold ? 20 : 90, bold ? 20 : 90);
    doc.text(label, W - 200, y);
    doc.text(value, W - M - 10, y, { align: 'right' });
    y += bold ? 22 : 16;
  };

  lineRight('Subtotal', `Rs. ${t.originalAmount}`);
  if (t.discount > 0) lineRight('Discount', `- Rs. ${t.discount}`);
  // Reverse-calc GST from total: total = subtotal*1.18 => gst = total - subtotal
  const taxable = Math.round(t.amount / 1.18);
  const gst = t.amount - taxable;
  lineRight('Taxable Value', `Rs. ${taxable}`);
  lineRight('GST (18%)', `Rs. ${gst}`);
  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(W - 220, y - 10, W - M, y - 10);
  lineRight('TOTAL PAID', `Rs. ${t.amount}`, true);

  // Payment details box
  y += 16;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M, y, W - 2 * M, 60, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('PAYMENT DETAILS', M + 12, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Method: ${t.mode === 'razorpay' ? 'Razorpay (UPI / Card / Netbanking)' : 'Manual'}`, M + 12, y + 34);
  if (t.paymentId) doc.text(`Payment ID: ${t.paymentId}`, M + 12, y + 48);
  if (t.orderId) doc.text(`Order ID: ${t.orderId}`, W / 2, y + 48);

  // Footer
  const footY = doc.internal.pageSize.getHeight() - 60;
  doc.setDrawColor(230, 230, 230);
  doc.line(M, footY, W - M, footY);
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text('Thank you for choosing Typing Master. This is a system-generated invoice.', W / 2, footY + 16, { align: 'center' });
  doc.text(`${BRAND.name} • ${BRAND.email} • ${BRAND.website}`, W / 2, footY + 30, { align: 'center' });

  return doc;
};

export const downloadInvoice = (t: Transaction, party: InvoiceParty) => {
  const doc = generateInvoicePDF(t, party);
  doc.save(`${invoiceNumber(t)}.pdf`);
};
