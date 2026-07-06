// ── Work Detail Page ──────────────────────────────────────
const DetailPage = {
  isEditing: false,

  render(container, work) {
    if (!work) { App.navigate('history'); return; }
    DetailPage.isEditing = false;
    DetailPage._work = work;
    DetailPage._renderView(container, work);
  },

  _renderView(container, work) {
    container.innerHTML = `
<div class="page">
  <div class="appbar">
    <button class="appbar-back" onclick="App.navigate('history')">
      <span class="material-icons-round">arrow_back_ios_new</span>
    </button>
    <h1>Work Details</h1>
    <button class="appbar-action" id="det-edit-btn" title="Edit">
      <span class="material-icons-round">edit</span>
    </button>
    <button class="appbar-action" id="det-del-btn" title="Delete" style="color:#f44336">
      <span class="material-icons-round">delete_outline</span>
    </button>
  </div>

  <div class="p-20">

    <!-- Customer Header -->
    <div style="background:rgba(249,196,0,.1);border:1.5px solid rgba(249,196,0,.3);border-radius:18px;padding:16px;display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <div style="width:56px;height:56px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:var(--secondary);flex-shrink:0">
        ${work.customerName[0].toUpperCase()}
      </div>
      <div style="flex:1">
        <div style="font-size:18px;font-weight:700">${work.customerName}</div>
        <div style="font-size:13px;color:var(--text2);display:flex;align-items:center;gap:3px;margin-top:2px">
          <span class="material-icons-round" style="font-size:14px">location_on</span>${work.village}
        </div>
        ${work.mobileNumber ? `<div style="font-size:13px;color:var(--text2);display:flex;align-items:center;gap:3px;margin-top:2px"><span class="material-icons-round" style="font-size:14px">phone</span>${work.mobileNumber}</div>` : ''}
      </div>
      <button onclick="App.navigate('customer-history',{name:'${escHtml(work.customerName)}',village:'${escHtml(work.village)}'})"
        style="background:none;border:none;cursor:pointer;color:var(--primary);display:flex;flex-direction:column;align-items:center;font-size:10px;font-weight:600;gap:2px">
        <span class="material-icons-round">history</span>History
      </button>
    </div>

    <!-- Amount Card -->
    <div class="amount-card mb-16">
      <div class="amount-label">Total Amount</div>
      <div class="amount-value">${fmtCurrency(work.amount)}</div>
      <div class="amount-sub">${fmtDuration(work.workingMinutes)} × ₹${work.hourlyRate}/hr</div>
      <div style="margin-top:10px">
        <span style="background:${payColor(work.paymentStatus)};opacity:.2;padding:6px 14px;border-radius:20px;font-size:0">&nbsp;</span>
        <span style="position:relative;display:inline-block;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700;color:${payColor(work.paymentStatus)};border:1.5px solid ${payColor(work.paymentStatus)}">
          ${work.paymentStatus}
        </span>
      </div>
    </div>

    <!-- Work Time -->
    <div class="card mb-12">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <div style="width:30px;height:30px;border-radius:8px;background:rgba(33,150,243,.15);display:flex;align-items:center;justify-content:center">
          <span class="material-icons-round" style="font-size:16px;color:#2196f3">timer</span>
        </div>
        <span style="font-size:14px;font-weight:700">Work Time</span>
      </div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${fmtDate(work.date)}</span></div>
      <div class="detail-row"><span class="detail-label">Start Time</span><span class="detail-value">${fmtTime(work.startTime)}</span></div>
      <div class="detail-row"><span class="detail-label">End Time</span><span class="detail-value">${fmtTime(work.endTime)}</span></div>
      <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${fmtDuration(work.workingMinutes)}</span></div>
      <div class="detail-row"><span class="detail-label">Hourly Rate</span><span class="detail-value">₹${work.hourlyRate}/hr</span></div>
    </div>

    <!-- Payment -->
    <div class="card mb-12">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <div style="width:30px;height:30px;border-radius:8px;background:rgba(76,175,80,.15);display:flex;align-items:center;justify-content:center">
          <span class="material-icons-round" style="font-size:16px;color:#4caf50">payments</span>
        </div>
        <span style="font-size:14px;font-weight:700">Payment</span>
      </div>
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">${fmtCurrency(work.amount)}</span></div>
      <div class="detail-row"><span class="detail-label">Diesel Expense</span><span class="detail-value">${fmtCurrency(work.dieselExpense || 0)}</span></div>
      <div class="detail-row"><span class="detail-label">Net Profit</span><span class="detail-value" style="color:#4caf50">${fmtCurrency(work.profit || 0)}</span></div>
      <div class="detail-row"><span class="detail-label">Advance Paid</span><span class="detail-value">${fmtCurrency(work.advanceAmount || 0)}</span></div>
      <div class="detail-row"><span class="detail-label">Balance Due</span><span class="detail-value" style="color:#f44336">${fmtCurrency(work.balanceAmount || 0)}</span></div>
    </div>

    ${work.notes ? `
    <div class="card mb-12">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div style="width:30px;height:30px;border-radius:8px;background:rgba(156,39,176,.15);display:flex;align-items:center;justify-content:center">
          <span class="material-icons-round" style="font-size:16px;color:#9c27b0">note</span>
        </div>
        <span style="font-size:14px;font-weight:700">Notes</span>
      </div>
      <p style="font-size:14px;color:var(--text2)">${work.notes}</p>
    </div>` : ''}

    <!-- Action Buttons -->
    <div class="row mt-16 mb-16">
      <button class="btn btn-outline" id="det-pdf-btn" style="border-color:#f44336;color:#f44336">
        <span class="material-icons-round" style="font-size:18px">picture_as_pdf</span> PDF
      </button>
      <button class="btn btn-whatsapp" id="det-wa-btn">
        <span class="material-icons-round" style="font-size:18px">share</span> WhatsApp
      </button>
    </div>

    <p style="text-align:center;font-size:11px;color:var(--text2)">
      Created: ${fmtDate(work.createdAt)}
    </p>
    <div style="height:20px"></div>
  </div>
</div>`;

    document.getElementById('det-edit-btn').onclick = () => DetailPage._renderEdit(container, work);
    document.getElementById('det-del-btn').onclick = async () => {
      const ok = await App.confirm('Delete Work?', 'This record will be permanently deleted.', 'Delete', true);
      if (!ok) return;
      await deleteWork(work.id);
      App.showToast('Work deleted', 'success');
      App.navigate('history');
    };
    document.getElementById('det-pdf-btn').onclick = () => PdfService.generate(work);
    document.getElementById('det-wa-btn').onclick = () => ShareService.whatsapp(work);
  },

  _renderEdit(container, work) {
    container.innerHTML = `
<div class="page">
  <div class="appbar">
    <button class="appbar-back" id="edit-back">
      <span class="material-icons-round">arrow_back_ios_new</span>
    </button>
    <h1>Edit Work</h1>
    <button class="appbar-action" id="edit-discard" style="font-size:13px;font-weight:600;color:var(--secondary)">Discard</button>
  </div>
  <div class="p-20">
    <div class="form-group">
      <label>Customer Name</label>
      <div class="input-icon"><span class="material-icons-round">person</span>
        <input id="e-name" class="form-control" value="${escHtml(work.customerName)}"/>
      </div>
    </div>
    <div class="form-group">
      <label>Village</label>
      <div class="input-icon"><span class="material-icons-round">location_on</span>
        <input id="e-village" class="form-control" value="${escHtml(work.village)}"/>
      </div>
    </div>
    <div class="form-group">
      <label>Mobile Number</label>
      <div class="input-icon"><span class="material-icons-round">phone</span>
        <input id="e-mobile" class="form-control" type="tel" maxlength="10" value="${work.mobileNumber || ''}"/>
      </div>
    </div>
    <div class="form-group">
      <label>Diesel Expense (₹)</label>
      <div class="input-icon"><span class="material-icons-round">local_gas_station</span>
        <input id="e-diesel" class="form-control" type="number" min="0" value="${work.dieselExpense || 0}"/>
      </div>
    </div>
    <div class="form-group">
      <label>Advance Amount (₹)</label>
      <div class="input-icon"><span class="material-icons-round">payments</span>
        <input id="e-advance" class="form-control" type="number" min="0" value="${work.advanceAmount || 0}"/>
      </div>
    </div>
    <div class="form-group">
      <label>Payment Status</label>
      <div class="pay-chips" id="e-pay-chips">
        <button class="pay-chip paid ${work.paymentStatus==='Paid'?'active':''}" data-status="Paid">Paid</button>
        <button class="pay-chip pending ${work.paymentStatus==='Pending'?'active':''}" data-status="Pending">Pending</button>
        <button class="pay-chip partial ${work.paymentStatus==='Partially Paid'?'active':''}" data-status="Partially Paid">Partially Paid</button>
      </div>
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="e-notes" class="form-control">${work.notes || ''}</textarea>
    </div>
    <button class="btn btn-primary mt-8" id="edit-save" style="height:56px;font-size:17px">
      <span class="material-icons-round">check_circle</span> Save Changes
    </button>
    <div style="height:20px"></div>
  </div>
</div>`;

    let payStatus = work.paymentStatus;
    document.getElementById('e-pay-chips').addEventListener('click', e => {
      const chip = e.target.closest('.pay-chip');
      if (!chip) return;
      payStatus = chip.dataset.status;
      document.querySelectorAll('.pay-chip').forEach(c => c.classList.toggle('active', c.dataset.status === payStatus));
    });
    document.getElementById('edit-back').onclick = () => DetailPage._renderView(container, work);
    document.getElementById('edit-discard').onclick = () => DetailPage._renderView(container, work);
    document.getElementById('edit-save').onclick = async () => {
      const diesel  = parseFloat(document.getElementById('e-diesel').value)  || 0;
      const advance = parseFloat(document.getElementById('e-advance').value) || 0;
      const updated = {
        ...work,
        customerName:  document.getElementById('e-name').value.trim()    || work.customerName,
        village:       document.getElementById('e-village').value.trim() || work.village,
        mobileNumber:  document.getElementById('e-mobile').value.trim(),
        dieselExpense: diesel,
        profit:        Math.max(0, work.amount - diesel),
        advanceAmount: advance,
        balanceAmount: Math.max(0, work.amount - advance),
        paymentStatus: payStatus,
        notes:         document.getElementById('e-notes').value.trim() || null,
      };
      const btn = document.getElementById('edit-save');
      btn.disabled = true;
      await updateWork(updated);
      App.showToast('Work updated!', 'success');
      DetailPage._work = updated;
      DetailPage._renderView(container, updated);
    };
  }
};

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function payColor(status) {
  if (status === 'Paid') return '#4caf50';
  if (status === 'Pending') return '#f44336';
  return '#ff9800';
}
