const StartWorkPage = {
  render(container) {
    container.innerHTML = `
<div class="page">
  <div class="appbar">
    <button class="appbar-back" onclick="App.navigate('home')"><span class="material-icons-round">arrow_back_ios_new</span></button>
    <h1>Start New Work</h1>
  </div>
  <div class="p-20">
    <div class="info-banner mb-16">
      <span class="material-icons-round">info</span>
      <span>Timer starts automatically when you press START</span>
    </div>

    <div class="form-group">
      <label>Customer Mobile (for auto-fill)</label>
      <div class="input-icon">
        <span class="material-icons-round">phone</span>
        <input id="sw-mobile" class="form-control" type="tel" placeholder="Enter mobile (optional)" maxlength="10" inputmode="numeric"/>
      </div>
    </div>

    <div class="form-group" style="position:relative">
      <label>Customer Name *</label>
      <div class="input-icon">
        <span class="material-icons-round">person</span>
        <input id="sw-name" class="form-control" type="text" placeholder="Enter customer name" autocomplete="off"/>
      </div>
      <div class="form-error" id="err-sw-name">Customer name is required</div>
      <div class="suggestions hidden" id="sw-suggestions"></div>
    </div>

    <div class="form-group">
      <label>Village / Location *</label>
      <div class="input-icon">
        <span class="material-icons-round">location_on</span>
        <input id="sw-village" class="form-control" type="text" placeholder="Enter village name"/>
      </div>
      <div class="form-error" id="err-sw-village">Village is required</div>
    </div>

    <div class="form-group">
      <label>Notes (Optional)</label>
      <textarea id="sw-notes" class="form-control" placeholder="Add any notes..."></textarea>
    </div>

    <button class="btn btn-primary mt-8" id="sw-start-btn" style="height:60px;font-size:20px;letter-spacing:2px;border-radius:16px;">
      <span class="material-icons-round" style="font-size:28px">play_arrow</span> START
    </button>
  </div>
</div>`;

    // Mobile autofill
    document.getElementById('sw-mobile').addEventListener('input', async e => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      if (e.target.value.length === 10) {
        const c = await getCustomerByMobile(e.target.value);
        if (c) {
          document.getElementById('sw-name').value = c.name;
          document.getElementById('sw-village').value = c.village;
        }
      }
    });

    // Name suggestions
    document.getElementById('sw-name').addEventListener('input', async e => {
      const q = e.target.value.trim();
      const sug = document.getElementById('sw-suggestions');
      if (q.length < 2) { sug.classList.add('hidden'); return; }
      const customers = await searchCustomers(q);
      if (!customers.length) { sug.classList.add('hidden'); return; }
      sug.innerHTML = customers.map(c => `
        <div class="suggestion-item" data-name="${c.name}" data-village="${c.village}" data-mobile="${c.mobileNumber}">
          <div class="sug-avatar">${c.name[0].toUpperCase()}</div>
          <div><div style="font-weight:600;font-size:14px">${c.name}</div><div style="font-size:12px;color:var(--text2)">${c.village}</div></div>
        </div>`).join('');
      sug.classList.remove('hidden');
      sug.querySelectorAll('.suggestion-item').forEach(el => {
        el.addEventListener('click', () => {
          document.getElementById('sw-name').value = el.dataset.name;
          document.getElementById('sw-village').value = el.dataset.village;
          document.getElementById('sw-mobile').value = el.dataset.mobile;
          sug.classList.add('hidden');
        });
      });
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('#sw-name') && !e.target.closest('#sw-suggestions')) {
        document.getElementById('sw-suggestions').classList.add('hidden');
      }
    }, { once: false });

    document.getElementById('sw-start-btn').addEventListener('click', async () => {
      const name   = document.getElementById('sw-name').value.trim();
      const village = document.getElementById('sw-village').value.trim();
      let ok = true;
      if (!name)    { document.getElementById('err-sw-name').style.display='block'; ok=false; }
      else document.getElementById('err-sw-name').style.display='none';
      if (!village) { document.getElementById('err-sw-village').style.display='block'; ok=false; }
      else document.getElementById('err-sw-village').style.display='none';
      if (!ok) return;

      const btn = document.getElementById('sw-start-btn');
      btn.disabled = true; btn.innerHTML = '<div class="spinner" style="margin:0;width:24px;height:24px;border-width:2px"></div>';

      const now = new Date();
      const work = {
        customerName: name,
        village,
        mobileNumber: document.getElementById('sw-mobile').value.trim(),
        date: now.toISOString().slice(0, 10),
        startTime: now.toISOString(),
        endTime: null,
        workingMinutes: 0,
        hourlyRate: Settings.get('hourlyRate'),
        amount: 0, dieselExpense: 0, profit: 0,
        paymentStatus: 'Pending',
        advanceAmount: 0, balanceAmount: 0,
        status: 'running',
        notes: document.getElementById('sw-notes').value.trim() || null,
        createdAt: now.toISOString(),
      };
      const id = await addWork(work);
      work.id = id;
      App.navigate('running', { work });
    });
  }
};
