// ── PDF Invoice Generator ─────────────────────────────────
const PdfService = {
  generate(work) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const W = 210, margin = 20, cw = W - margin * 2;

      // ── Header Yellow Bar ────────────────────────────────
      doc.setFillColor(249, 196, 0);
      doc.roundedRect(margin, 15, cw, 30, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(26, 26, 26);
      doc.text('JCB WORKING', margin + 8, 27);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Work Invoice', margin + 8, 35);

      // ── Invoice Number & Date ────────────────────────────
      const invoiceNo = `#${String(work.id || 1).padStart(4, '0')}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text(`Invoice ${invoiceNo}`, margin, 55);
      doc.setFont('helvetica', 'normal');
      doc.text(fmtDate(work.date), W - margin, 55, { align: 'right' });

      // ── Divider ──────────────────────────────────────────
      doc.setDrawColor(224, 224, 224);
      doc.setLineWidth(0.4);
      doc.line(margin, 60, W - margin, 60);

      // ── Bill To ──────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text('BILL TO', margin, 70);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(26, 26, 26);
      doc.text(work.customerName, margin, 78);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(work.village, margin, 85);
      if (work.mobileNumber) doc.text(`Mobile: ${work.mobileNumber}`, margin, 91);

      // ── Work Details Section ─────────────────────────────
      let y = 105;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text('WORK DETAILS', margin, y);
      y += 6;
      doc.setDrawColor(224, 224, 224);
      doc.line(margin, y, W - margin, y);
      y += 8;

      const addRow = (label, value, bold = false) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(label, margin, y);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setTextColor(26, 26, 26);
        doc.text(String(value), W - margin, y, { align: 'right' });
        y += 8;
      };

      addRow('Date', fmtDate(work.date));
      addRow('Start Time', fmtTime(work.startTime));
      addRow('End Time', fmtTime(work.endTime));
      addRow('Duration', fmtDuration(work.workingMinutes));
      addRow('Hourly Rate', `Rs.${work.hourlyRate}/hr`);
      y += 4;

      // ── Charges Section ──────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text('CHARGES', margin, y);
      y += 6;
      doc.setDrawColor(224, 224, 224);
      doc.line(margin, y, W - margin, y);
      y += 8;

      addRow('Work Amount', fmtCurrency(work.amount));
      if (work.dieselExpense > 0) {
        addRow('Diesel Expense', `-${fmtCurrency(work.dieselExpense)}`);
        addRow('Net Profit', fmtCurrency(work.profit || 0));
      }
      y += 2;
      addRow('Advance Received', fmtCurrency(work.advanceAmount || 0));
      addRow('Balance Due', fmtCurrency(work.balanceAmount || 0), true);
      y += 4;

      // ── Payment Status Badge ─────────────────────────────
      const pColor = work.paymentStatus === 'Paid' ? [46,125,50] : work.paymentStatus === 'Pending' ? [198,40,40] : [230,81,0];
      doc.setFillColor(...pColor);
      doc.roundedRect(margin, y, 50, 9, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`Payment: ${work.paymentStatus}`, margin + 4, y + 6);
      y += 18;

      // ── Total Amount Big Box ─────────────────────────────
      doc.setFillColor(26, 26, 26);
      doc.roundedRect(margin, y, cw, 18, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('TOTAL AMOUNT', margin + 6, y + 11);
      doc.setFontSize(15);
      doc.setTextColor(249, 196, 0);
      doc.text(fmtCurrency(work.amount), W - margin - 6, y + 11, { align: 'right' });
      y += 26;

      // ── Notes ────────────────────────────────────────────
      if (work.notes) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Notes: ${work.notes}`, margin, y);
        y += 10;
      }

      // ── Footer ───────────────────────────────────────────
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(170, 170, 170);
      doc.text('Generated by JCB Working App', W / 2, 285, { align: 'center' });

      // ── Save / Open PDF ──────────────────────────────────
      doc.save(`JCB_Invoice_${work.customerName.replace(/\s+/g,'_')}_${work.id || 'draft'}.pdf`);
      App.showToast('PDF downloaded!', 'success');
    } catch (err) {
      console.error('PDF error:', err);
      App.showToast('Could not generate PDF', 'error');
    }
  }
};
