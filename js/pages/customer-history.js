// ── Customer History Page ─────────────────────────────────
const CustomerHistoryPage = {
  async render(container, params) {
    const name    = params.name    || '';
    const village = params.village || '';
    container.innerHTML = `<div class="page"><div class="appbar">
      <button class="appbar-back" onclick="history.go(-1)||App.navigate('history')">
        <span class="material-icons-round">arrow_back_ios_new</span>
      </button>
      <h1>${name}</h1>
    </div><div class="spinner"></div></div>`;

    const works = await getWorksByCustomer(name, village);
    const totalAmount = works.reduce((s, w) => s + w.amount, 0);
    const lastDate = works.length ? fmtDate(works[0].date) : '-';

    container.innerHTML = `
<div class="page">
  <div class="appbar">
    <button class="appbar-back" onclick="App.navigate('history')">
      <span class="material-icons-round">arrow_back_ios_new</span>
    </button>
    <h1>${name}</h1>
  </div>

  <!-- Customer Summary Header -->
  <div style="background:var(--secondary);padding:20px;border-radius:0 0 24px 24px">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <div style="width:56px;height:56px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:var(--secondary)">
        ${name[0] ? name[0].toUpperCase() : 'C'}
      </div>
      <div>
        <div style="font-size:20px;font-weight:700;color:#fff">${name}</div>
        <div style="font-size:13px;color:rgba(255,255,255,.6)">${village}</div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-around;border-top:1px solid rgba(255,255,255,.15);padding-top:14px">
      <div style="text-align:center">
        <div style="font-size:18px;font-weight:700;color:var(--primary)">${works.length}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px">Total Jobs</div>
      </div>
      <div style="width:1px;background:rgba(255,255,255,.15)"></div>
      <div style="text-align:center">
        <div style="font-size:18px;font-weight:700;color:var(--primary)">${fmtCurrency(totalAmount)}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px">Total Earned</div>
      </div>
      <div style="width:1px;background:rgba(255,255,255,.15)"></div>
      <div style="text-align:center">
        <div style="font-size:14px;font-weight:700;color:var(--primary)">${lastDate}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px">Last Work</div>
      </div>
    </div>
  </div>

  <!-- Work List -->
  <div class="p-16">
    ${works.length === 0
      ? `<div class="empty-state"><span class="material-icons-round">work_off</span>No work records found</div>`
      : works.map(w => `
      <div class="work-card" data-id="${w.id}">
        <div class="work-card-top">
          <div class="wc-avatar">${w.customerName[0].toUpperCase()}</div>
          <div class="wc-info">
            <div class="wc-name">${w.customerName}</div>
            <div class="wc-village"><span class="material-icons-round" style="font-size:12px">location_on</span>${w.village}</div>
          </div>
          <div>
            <div class="wc-amount">${fmtCurrency(w.amount)}</div>
            <div class="pay-badge ${payBadgeClass(w.paymentStatus)}">${w.paymentStatus}</div>
          </div>
        </div>
        <div class="work-card-bottom">
          <div class="wc-meta"><span class="material-icons-round">calendar_today</span>${fmtDate(w.date)}</div>
          <div class="wc-meta"><span class="material-icons-round">timer</span>${fmtDuration(w.workingMinutes)}</div>
          <div class="wc-meta"><span class="material-icons-round">currency_rupee</span>₹${w.hourlyRate}/hr</div>
        </div>
      </div>`).join('')
    }
    <div style="height:20px"></div>
  </div>
</div>`;

    container.querySelectorAll('.work-card').forEach(card => {
      card.addEventListener('click', async () => {
        const work = await getWorkById(parseInt(card.dataset.id));
        if (work) App.navigate('detail', { work });
      });
    });
  }
};
