// ── End Work / Work Summary Page ─────────────────────────
const EndWorkPage = {
  render(container, work) {
    if (!work) { App.navigate('home'); return; }
    let diesel = 0, advance = 0, payStatus = 'Pending';

    const breakMins   = work.breakMinutes || 0;
    const loadingRows = Array.isArray(work.loading) && work.loading.length
      ? work.loading
      : null;
    const totalTrips  = loadingRows
      ? loadingRows.reduce((s, v) => s + (v.trips || 0), 0)
      : 0;

    container.innerHTML = `
<div class="page">
  <div class="appbar">
    <h1>Work Summary</h1>
    <button class="appbar-action" id="ew-cancel" style="color:#f44336;font-size:14px;font-weight:600">Cancel</button>
  </div>
  <div class="p-20">

    <!-- Work Time Summary -->
    <div class="card mb-16">
      <div class="detail-row"><span class="detail-label">Customer</span><span class="detail-value">${work.customerName}</span></div>
      <div class="detail-row"><span class="detail-label">Village</span><span class="detail-value">${work.village}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${fmtDate(work.date)}</span></div>
      <div class="detail-row"><span class="detail-label">Start Time</span><span class="detail-value">${fmtTime(work.startTime)}</span></div>
      <div class="detail-row"><span class="detail-label">End Time</span><span class="detail-value">${fmtTime(work.endTime)}</span></div>
      <div class="detail-row">
        <span class="detail-label">Actual Working Time</span>
        <span class="detail-value" style="color:#4caf50;font-weight:700">${fmtDuration(work.workingMinutes)}</span>
      </div>
      ${breakMins > 0 ? `
      <div class="detail-row">
        <span class="detail-label">Break Time</span>
        <span class="detail-value" style="color:#FF9800">${fmtDuration(breakMins)}</span>
      </div>` : ''}
      <div class="detail-row"><span class="detail-label">Hourly Rate</span><span class="detail-value">₹${work.hourlyRate}/hr</span></div>
    </div>

    <!-- Amount -->
    <div class="amount-card mb-16">
      <div class="amount-label">Total Amount</div>
      <div class="amount-value">${fmtCurrency(work.amount)}</div>
      <div class="amount-sub">${work.workingMinutes}m ÷ 60 × ₹${work.hourlyRate}</div>
    </div>

    ${loadingRows ? `
    <!-- Loading Summary -->
    <div class="card mb-16">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <div style="width:30px;height:30px;border-radius:8px;background:rgba(249,196,0,.15);display:flex;align-items:center;justify-content:center;font-size:16px">📦</div>
        <span style="font-size:14px;font-weight:700">Loading / Trips</span>
      </div>
      ${loadingRows.map(v => `
      <div class="detail-row">
        <span class="detail-label">${RunningPage._vehicleIcon ? RunningPage._vehicleIcon(v.vehicleType) : ''} ${v.vehicleType} — ${v.vehicleNumber}</span>
        <span class="detail-value">${v.trips} trips</span>
      </div>`).join('')}
      <div class="detail-row" style="margin-top:4px">
        <span class="detail-label" style="font-weight:700">Total Trips</span>
        <span class="detail-value" style="font-weight:700;color:var(--primary)">${totalTrips}</span>
      </div>
    </div>` : ''}

    <!-- Diesel -->
    <div class="section-hdr">Diesel Expense (Optional)</div>
    <div class="form-group">
      <div class="input-icon">
        <span class="material-icons-round">local_gas_station</span>
        <input id="ew-diesel" class="form-control" type="number" placeholder="0" min="0" inputmode="decimal"/>
      </div>
    </div>
    <div id="ew-profit-row" class="card mb-16" style="display:none">
      <div class="detail-row">
        <span class="detail-label">Net Profit</span>
        <span class="detail-value text-success" id="ew-profit-val"></span>
      </div>
    </div>

    <!-- Payment -->
    <div class="section-hdr">Payment Status</div>
    <div class="pay-chips mb-16" id="pay-chips">
      <button class="pay-chip pending active" data-status="Pending">Pending</button>
      <button class="pay-chip paid"           data-status="Paid">Paid</button>
      <button class="pay-chip partial"        data-status="Partially Paid">Partially Paid</button>
    </div>

    <div class="form-group">
      <label>Advance Received (₹)</label>
      <div class="input-icon">
        <span class="material-icons-round">payments</span>
        <input id="ew-advance" class="form-control" type="number" placeholder="0" min="0" inputmode="decimal"/>
      </div>
    </div>

    <div class="card mb-16" id="ew-balance-card">
      <div class="detail-row">
        <span class="detail-label" style="font-weight:600">Balance Due</span>
        <span class="detail-value text-error" id="ew-balance-val">${fmtCurrency(work.amount)}</span>
      </div>
    </div>

    <button class="btn btn-primary" id="ew-save" style="height:60px;font-size:18px;border-radius:16px;">
      <span class="material-icons-round">check_circle</span> SAVE RECORD
    </button>
    <div style="height:20px"></div>
  </div>
</div>`;

    // Diesel input
    document.getElementById('ew-diesel').addEventListener('input', e => {
      diesel = parseFloat(e.target.value) || 0;
      const profit = work.amount - diesel;
      const row    = document.getElementById('ew-profit-row');
      if (diesel > 0) {
        row.style.display = 'block';
        document.getElementById('ew-profit-val').textContent = fmtCurrency(Math.max(0, profit));
      } else {
        row.style.display = 'none';
      }
    });

    // Advance input
    document.getElementById('ew-advance').addEventListener('input', e => {
      advance = parseFloat(e.target.value) || 0;
      const balance = Math.max(0, work.amount - advance);
      document.getElementById('ew-balance-val').textContent = fmtCurrency(balance);
      if (advance <= 0)               payStatus = 'Pending';
      else if (advance >= work.amount) payStatus = 'Paid';
      else                             payStatus = 'Partially Paid';
      setPayChip(payStatus);
    });

    // Payment chips
    document.getElementById('pay-chips').addEventListener('click', e => {
      const chip = e.target.closest('.pay-chip');
      if (!chip) return;
      payStatus = chip.dataset.status;
      setPayChip(payStatus);
      if (payStatus === 'Paid') {
        document.getElementById('ew-advance').value = work.amount;
        advance = work.amount;
        document.getElementById('ew-balance-val').textContent = fmtCurrency(0);
      } else if (payStatus === 'Pending') {
        document.getElementById('ew-advance').value = '';
        advance = 0;
        document.getElementById('ew-balance-val').textContent = fmtCurrency(work.amount);
      }
    });

    function setPayChip(status) {
      document.querySelectorAll('.pay-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.status === status);
      });
    }

    // Cancel — deletes the work record
    document.getElementById('ew-cancel').addEventListener('click', async () => {
      const ok = await App.confirm('Cancel Work?', 'This will delete the current work record.', 'Delete', true);
      if (!ok) return;
      await deleteWork(work.id);
      App.navigate('home');
    });

    // Save
    document.getElementById('ew-save').addEventListener('click', async () => {
      const btn     = document.getElementById('ew-save');
      btn.disabled  = true;
      const balance = Math.max(0, work.amount - advance);

      const finalWork = {
        ...work,
        dieselExpense: diesel,
        profit:        Math.max(0, work.amount - diesel),
        paymentStatus: payStatus,
        advanceAmount: advance,
        balanceAmount: balance,
        status:        'completed',
        // loading + pauseSegments already on work object
      };
      await updateWork(finalWork);
      await upsertCustomer(finalWork);
      App.showToast('Work saved successfully!', 'success');
      App.navigate('home');
    });
  },
};
