import { jsPDF } from "jspdf";

export type ReceiptData = {
  reference: string;
  createdAt: Date;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  frequency: string;
  donationType: string;
  paymentMethod: string;
  anonymous?: boolean;
  dedication?: string;
};

export function generateReceiptPDF(d: ReceiptData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = 595;
  const M = 48;

  // Header band
  doc.setFillColor(14, 116, 172); // brand blue
  doc.rect(0, 0, W, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("THE SAINTS CHILDCARE FOUNDATION", M, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Uganda · Registered Non-Profit", M, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DONATION RECEIPT", W - M, 42, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Ref: ${d.reference}`, W - M, 60, { align: "right" });
  doc.text(d.createdAt.toLocaleString(), W - M, 74, { align: "right" });

  doc.setTextColor(20, 20, 20);
  let y = 140;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Thank you for your generosity.", M, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  const intro = d.anonymous
    ? "Your anonymous gift will directly support the education, healthcare, nutrition and shelter of orphaned and vulnerable children in Uganda."
    : `Dear ${d.donorName || "friend"}, your gift will directly support the education, healthcare, nutrition and shelter of orphaned and vulnerable children in Uganda.`;
  const lines = doc.splitTextToSize(intro, W - M * 2);
  doc.text(lines, M, y);
  y += lines.length * 13 + 18;

  // Amount panel
  doc.setDrawColor(230, 230, 230);
  doc.setFillColor(248, 250, 252);
  doc.rect(M, y, W - M * 2, 90, "FD");
  doc.setTextColor(90, 90, 90);
  doc.setFontSize(9);
  doc.text("AMOUNT DONATED", M + 20, y + 24);
  doc.setTextColor(14, 116, 172);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(`${d.currency} ${d.amount.toLocaleString()}`, M + 20, y + 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`${d.frequency === "one" ? "One-time" : d.frequency} · ${d.donationType}`, M + 20, y + 78);
  y += 110;

  // Details table
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DONATION DETAILS", M, y);
  y += 14;
  doc.setDrawColor(230, 230, 230);
  doc.line(M, y, W - M, y);
  y += 14;
  const rows: Array<[string, string]> = [
    ["Reference", d.reference],
    ["Date", d.createdAt.toLocaleString()],
    ["Donor", d.anonymous ? "Anonymous" : d.donorName || "—"],
    ["Email", d.anonymous ? "—" : d.donorEmail || "—"],
    ["Payment method", d.paymentMethod],
    ["Frequency", d.frequency === "one" ? "One-time" : d.frequency],
    ["Type", d.donationType],
  ];
  if (d.dedication) rows.push(["Dedication", d.dedication]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  rows.forEach(([k, v]) => {
    doc.setTextColor(120, 120, 120);
    doc.text(k, M, y);
    doc.setTextColor(20, 20, 20);
    doc.text(String(v), M + 160, y);
    y += 18;
  });

  y += 20;
  doc.setDrawColor(230, 230, 230);
  doc.line(M, y, W - M, y);
  y += 20;
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(9);
  doc.text("The Saint's Childcare Foundation Uganda is a registered non-profit organization.", M, y);
  y += 12;
  doc.text("This receipt confirms your contribution. Please retain for your records.", M, y);

  // Footer
  doc.setFillColor(14, 116, 172);
  doc.rect(0, 800, W, 42, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("thesaintschildcare@gmail.com  ·  +256 700 339 231  ·  +256 769 027 058", W / 2, 826, { align: "center" });

  doc.save(`Saints-Foundation-Receipt-${d.reference}.pdf`);
}
