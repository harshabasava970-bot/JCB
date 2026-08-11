// ── Loading Module — Separate from Work ──────────────────
const LoadingPage = {
  _mode: 'list',   // 'list' | 'new' | 'detail' | 'edit'
  _record: null,
  _filter: 'All',
  _search: '',

  render(container, params = {}) {
    if (params.mode === 'detail' && params.record) {
      LoadingPage._renderDetail(container, params.record);
    } else if (params.mode === 'new') {
      LoadingPage._renderForm(container, null);
    } else if (params.mode === 'edit' && params.record) {
      LoadingPage._renderForm(container, params.record);
    } else {
      LoadingPage._renderList(container);
    }
  },

  // ══════════════════════════════════════════════════════
  // LIST VIEW
  // ══════════════════════════════════════════════════════
  async _renderList(container) {
    container.innerHTML = `
<div class="page">
  <div class="appbar" style="background:#2196f3">
    <button class="appbar-back" onclick="App.navigate('home')" style="color:#fff">
      <span class="material-icons-round">arrow_back_ios_new</span>
    </button>
    <h1 style="color:#fff">📦 Loading</h1>
    <span id="load-count" style="font-size:12px;font-weight:600;background:rgba(255,255,255,.2);padding:3px 10px;border-radius:10px;color:#fff"></span>
  </div>

  <div style="background:var(--surface);padding:12px 16px 8px;border-bottom:1px solid var(--border)">
    <div class="search-bar mb-8">
      <span class="material-icons-round">search</span>
      <input id="load-search" class="form-control" type="text" placeholder="Search customer, vehicle, mobile..." style="height:44px"/>
      <button class="search-clear hidden" id="load-clear"><span class="material-icons-round">close</span></button>
    </div>
    <div class="chips">
      <button class="chip chip-all active"     data-filter="All">All</button>
      <button class="chip chip-paid"            data-filter="Paid">Paid</button>
      <button class="chip chip-pending"         data-filter="Pending">Pending</button>
      <button class="chip chip-partial"         data-filter="Partially Paid">Part Paid</button>
    </div>
  </div>

  <div class="p-16" id="load-list"><div class="spinner"></div></div>
</div>

<button id="load-fab"
  style="position:fixed;bottom:80px;right:20px;width:58px;height:58px;border-radius:50%;background:#2196f3;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(33,150,243,.5);z-index:90">
  <span class="material-icons-round" style="color:#fff;font-size:28px">add</span>
</button>`;

    LoadingPage._filter = 'All';
    LoadingPage._search = '';
    await LoadingPage._loadList();

    document.getElementById('load-fab').addEventListener('click', () => {
      App.navigate('loading', { mode: 'new' });
    });

    document.getElementById('load-search').addEventListener('input', async e => {
      LoadingPage._search = e.target.value;
      document.getElementById('load-clear').classList.toggle('hidden', !e.target.value);
      await LoadingPage._loadList();
    });
    document.getElementById('load-clear').addEventListener('click', async () => {
      document.getElementById('load-search').value = '';
      LoadingPage._search = '';
      document.getElementById('load-clear').classList.add('hidden');
      await LoadingPage._loadList();
    });
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', async () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        LoadingPage._filter = chip.dataset.filter;
        await LoadingPage._loadList();
      });
    });
  },

  async _loadList() {
    const records = await getFilteredLoadingRecords({
      search:  LoadingPage._search,
      payment: LoadingPage._filter,
    });
    const list    = document.getElementById('load-list');
    const countEl = document.getElementById('load-count');
    if (countEl) countEl.textContent = `${records.length} records`;
    if (!list) return;

    if (!records.length) {
      list.innerHTML = `<div class="empty-state"><span style="font-size:72px;opacity:.3;display:block;margin-bottom:12px">📦</span>No loading records<br><small>Tap + to add a new loading record</small></div>`;
      return;
    }

    list.innerHTML = records.map(r => {
      const vCount     = (r.vehicles || []).length;
      const totalTrips = r.totalTrips  || 0;
      const amount     = r.totalAmount || 0;
      return `
<div class="work-card" data-id="${r.id}" style="border-left:3px solid #2196f3">
  <div class="work-card-top">
    <div class="wc-avatar" style="background:rgba(33,150,243,.2);color:#1565c0">${r.customerName[0].toUpperCase()}</div>
    <div class="wc-info">
      <div class="wc-name">${r.customerName}</div>
      <div class="wc-village"><span class="material-icons-round" style="font-size:12px">location_on</span>${r.village}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:2px">
        ${vCount} vehicle${vCount !== 1 ? 's' : ''} &nbsp;·&nbsp; ${totalTrips} trips
      </div>
    </div>
    <div style="text-align:right">
      <div class="wc-amount" style="color:#1565c0">${fmtCurrency(amount)}</div>
      <div class="pay-badge ${payBadgeClass(r.paymentStatus)}">${r.paymentStatus}</div>
    </div>
  </div>
  <div class="work-card-bottom">
    <div class="wc-meta"><span class="material-icons-round">calendar_today</span>${fmtDate(r.date)}</div>
    <div class="wc-meta"><span class="material-icons-round">local_shipping</span>${totalTrips} trips</div>
    <div class="wc-meta"><span class="material-icons-round">phone</span>${r.customerMobile || 'N/A'}</div>
  </div>
</div>`;
    }).join('');

    list.querySelectorAll('.work-card').forEach(card => {
      card.addEventListener('click', async () => {
        const record = await getLoadingRecordById(parseInt(card.dataset.id));
        if (record) App.navigate('loading', { mode: 'detail', record });
      });
    });
  },

  // ══════════════════════════════════════════════════════
  // DETAIL VIEW
  // ══════════════════════════════════════════════════════
  _renderDetail(container, record) {
    const vehicles   = record.vehicles || [];
    const totalTrips = record.totalTrips  || 0;
    const totalAmt   = record.totalAmount || 0;

    const vehicleRows = vehicles.map(v => {
      const vTotal = (v.trips || 0) * (v.amountPerTrip || 0);
      return `
<div style="background:var(--surface2);border-radius:12px;padding:12px;margin-bottom:10px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
    <span style="font-size:22px">${vIcon(v.vehicleType)}</span>
    <div>
      <div style="font-size:14px;font-weight:700">${v.vehicleType} — ${v.vehicleNumber}</div>
    </div>
  </div>
  <div class="detail-row"><span class="detail-label">Trips</span><span class="detail-value">${v.trips}</span></div>
  <div class="detail-row"><span class="detail-label">Amount / Trip</span><span class="detail-value">${fmtCurrency(v.amountPerTrip)}</span></div>
  <div class="detail-row"><span class="detail-label" style="font-weight:700">Vehicle Total</span><span class="detail-value" style="color:#2196f3;font-weight:700">${fmtCurrency(vTotal)}</span></div>
</div>`;
    }).join('');

    container.innerHTML = `
<div class="page">
  <div class="appbar" style="background:#2196f3">
    <button class="appbar-back" onclick="App.navigate('loading')" style="color:#fff">
      <span class="material-icons-round">arrow_back_ios_new</span>
    </button>
    <h1 style="color:#fff">Loading Details</h1>
    <button class="appbar-action" id="ld-edit" style="color:#fff"><span class="material-icons-round">edit</span></button>
    <button class="appbar-action" id="ld-del"  style="color:#ffcdd2"><span class="material-icons-round">delete_outline</span></button>
  </div>
  <div class="p-20">
    <div style="background:linear-gradient(135deg,#1565c0,#1976d2);border-radius:18px;padding:20px;text-align:center;margin-bottom:16px">
      <div style="color:rgba(255,255,255,.7);font-size:13px">Total Loading Amount</div>
      <div style="font-size:36px;font-weight:900;color:#fff;margin:4px 0">${fmtCurrency(totalAmt)}</div>
      <div style="color:rgba(255,255,255,.6);font-size:12px">${totalTrips} trips</div>
      <div style="margin-top:10px">
        <span style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:700;color:${payColor(record.paymentStatus)};background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.4)">${record.paymentStatus}</span>
      </div>
    </div>

    <div class="card mb-12">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="width:30px;height:30px;border-radius:8px;background:rgba(33,150,243,.15);display:flex;align-items:center;justify-content:center">
          <span class="material-icons-round" style="font-size:16px;color:#2196f3">person</span>
        </div>
        <span style="font-size:14px;font-weight:700">Customer</span>
      </div>
      <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${record.customerName}</span></div>
      <div class="detail-row"><span class="detail-label">Village</span><span class="detail-value">${record.village}</span></div>
      ${record.customerMobile ? `<div class="detail-row"><span class="detail-label">Mobile</span><span class="detail-value">${record.customerMobile}</span></div>` : ''}
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${fmtDate(record.date)}</span></div>
    </div>

    <div class="section-hdr"><span style="font-size:14px">📦</span>VEHICLES & TRIPS</div>
    ${vehicleRows}

    <div class="card mb-16">
      <div class="detail-row"><span class="detail-label" style="font-weight:700">Total Trips</span><span class="detail-value" style="font-size:16px;font-weight:900;color:#2196f3">${totalTrips}</span></div>
      <div class="detail-row"><span class="detail-label" style="font-weight:700">Total Amount</span><span class="detail-value" style="font-size:16px;font-weight:900;color:#2196f3">${fmtCurrency(totalAmt)}</span></div>
      <div class="detail-row"><span class="detail-label">Amount Paid</span><span class="detail-value" style="color:#4caf50">${fmtCurrency(record.paidAmount || 0)}</span></div>
      <div class="detail-row"><span class="detail-label">Balance Due</span><span class="detail-value" style="color:#f44336">${fmtCurrency(record.balanceDue || 0)}</span></div>
    </div>

    <div class="row mb-16">
      <button class="btn" id="ld-pdf" style="background:none;border:1.5px solid #f44336;color:#f44336;flex:1">
        <span class="material-icons-round" style="font-size:18px">picture_as_pdf</span> PDF
      </button>
      <button class="btn btn-whatsapp" id="ld-wa" style="flex:1">
        <span class="material-icons-round" style="font-size:18px">share</span> WhatsApp
      </button>
    </div>
    <div style="height:20px"></div>
  </div>
</div>`;

    document.getElementById('ld-edit').onclick = () => App.navigate('loading', { mode: 'edit', record });
    document.getElementById('ld-del').onclick  = async () => {
      const ok = await App.confirm('Delete?', 'This loading record will be permanently deleted.', 'Delete', true);
      if (!ok) return;
      await deleteLoadingRecord(record.id);
      App.showToast('Loading record deleted', 'success');
      App.navigate('loading');
    };
    document.getElementById('ld-pdf').onclick = () => PdfService.generateLoading(record);
    document.getElementById('ld-wa').onclick  = () => ShareService.whatsappLoading(record);
  },

  // ══════════════════════════════════════════════════════
  // NEW / EDIT FORM
  // ══════════════════════════════════════════════════════
  _renderForm(container, existing) {
    const isEdit  = !!existing;
    const today   = todayStr();
    // clone vehicles for editing
    let vehicles  = isEdit && existing.vehicles
      ? JSON.parse(JSON.stringify(existing.vehicles))
      : [{ vehicleType: 'Tractor', vehicleNumber: '', trips: 0, amountPerTrip: 0 }];
    let payStatus = isEdit ? existing.paymentStatus : 'Pending';

    const renderVehicles = () => {
      const el = document.getElementById('vehicle-entries');
      if (!el) return;
      el.innerHTML = vehicles.map((v, idx) => `
<div class="loading-vehicle-card" style="flex-direction:column;align-items:stretch;gap:10px;margin-bottom:12px" data-idx="${idx}">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <span style="font-size:13px;font-weight:700;color:var(--text2)">VEHICLE ${idx+1}</span>
    ${vehicles.length > 1 ? `<button class="rem-vehicle" data-idx="${idx}" style="background:none;border:none;color:#f44336;cursor:pointer;font-size:12px;font-weight:600">✕ Remove</button>` : ''}
  </div>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    ${['Tractor','Lorry','Truck','Other'].map(t => `
    <button class="vt-chip" data-idx="${idx}" data-type="${t}"
      style="padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;font-family:Roboto,sans-serif;
             ${v.vehicleType===t ? 'background:#2196f3;color:#fff;border:1.5px solid #2196f3' : 'background:none;color:var(--text);border:1.5px solid var(--border)'}">
      ${vIcon(t)} ${t}
    </button>`).join('')}
  </div>
  <div class="form-group" style="margin-bottom:8px">
    <label style="font-size:12px">Vehicle Number</label>
    <input class="form-control vn-input" data-idx="${idx}" type="text" placeholder="e.g. TN 65 AB 1234" value="${escHtml(v.vehicleNumber)}" style="text-transform:uppercase;height:44px"/>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
    <div class="form-group" style="margin-bottom:0">
      <label style="font-size:12px">No. of Trips</label>
      <input class="form-control trips-input" data-idx="${idx}" type="number" min="0" inputmode="numeric" value="${v.trips}" style="height:44px"/>
    </div>
    <div class="form-group" style="margin-bottom:0">
      <label style="font-size:12px">Amount / Trip (₹)</label>
      <input class="form-control apt-input" data-idx="${idx}" type="number" min="0" inputmode="decimal" value="${v.amountPerTrip || ''}" placeholder="0" style="height:44px"/>
    </div>
  </div>
  <div style="text-align:right;font-size:13px;font-weight:700;color:#2196f3">
    Vehicle Total: ${fmtCurrency((v.trips||0)*(v.amountPerTrip||0))}
  </div>
</div>`).join('');

      // totals
      const totalTrips  = vehicles.reduce((s, v) => s + (v.trips || 0), 0);
      const totalAmount = vehicles.reduce((s, v) => s + (v.trips||0)*(v.amountPerTrip||0), 0);
      const totEl = document.getElementById('loading-totals');
      if (totEl) totEl.innerHTML = `
<div class="detail-row"><span class="detail-label">Total Trips</span><span class="detail-value" style="color:#2196f3;font-weight:700;font-size:16px">${totalTrips}</span></div>
<div class="detail-row"><span class="detail-label" style="font-weight:700">Total Loading Amount</span><span class="detail-value" style="color:#2196f3;font-weight:700;font-size:18px">${fmtCurrency(totalAmount)}</span></div>`;

      // balance
      LoadingPage._recalcBalance();

      // wire vehicle inputs
      el.querySelectorAll('.vt-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const i = parseInt(chip.dataset.idx);
          vehicles[i].vehicleType = chip.dataset.type;
          renderVehicles();
        });
      });
      el.querySelectorAll('.vn-input').forEach(inp => {
        inp.addEventListener('input', e => {
          const i = parseInt(inp.dataset.idx);
          vehicles[i].vehicleNumber = e.target.value.toUpperCase();
          e.target.value = e.target.value.toUpperCase();
        });
      });
      el.querySelectorAll('.trips-input').forEach(inp => {
        inp.addEventListener('input', e => {
          const i = parseInt(inp.dataset.idx);
          vehicles[i].trips = parseInt(e.target.value) || 0;
          renderVehicles();
        });
      });
      el.querySelectorAll('.apt-input').forEach(inp => {
        inp.addEventListener('input', e => {
          const i = parseInt(inp.dataset.idx);
          vehicles[i].amountPerTrip = parseFloat(e.target.value) || 0;
          renderVehicles();
        });
      });
      el.querySelectorAll('.rem-vehicle').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.dataset.idx);
          vehicles.splice(i, 1);
          renderVehicles();
        });
      });
    };

    container.innerHTML = `
<div class="page">
  <div class="appbar" style="background:#2196f3">
    <button class="appbar-back" id="lf-back" style="color:#fff"><span class="material-icons-round">arrow_back_ios_new</span></button>
    <h1 style="color:#fff">${isEdit ? 'Edit Loading' : '+ New Loading'}</h1>
  </div>
  <div class="p-20">

    <div class="section-hdr">CUSTOMER DETAILS</div>
    <div class="form-group" style="position:relative">
      <label>Customer Name *</label>
      <div class="input-icon"><span class="material-icons-round">person</span>
        <input id="lf-name" class="form-control" type="text" placeholder="Enter customer name" value="${escHtml(isEdit ? existing.customerName : '')}" autocomplete="off"/>
      </div>
      <div class="form-error" id="err-lf-name">Customer name is required</div>
      <div class="suggestions hidden" id="lf-suggestions"></div>
    </div>
    <div class="form-group">
      <label>Mobile Number</label>
      <div class="input-icon"><span class="material-icons-round">phone</span>
        <input id="lf-mobile" class="form-control" type="tel" maxlength="10" inputmode="numeric" placeholder="10-digit (optional)" value="${isEdit ? (existing.customerMobile||'') : ''}"/>
      </div>
    </div>
    <div class="form-group">
      <label>Village / Site *</label>
      <div class="input-icon"><span class="material-icons-round">location_on</span>
        <input id="lf-village" class="form-control" type="text" placeholder="Enter village" value="${escHtml(isEdit ? existing.village : '')}"/>
      </div>
      <div class="form-error" id="err-lf-village">Village is required</div>
    </div>
    <div class="form-group">
      <label>Date</label>
      <input id="lf-date" class="form-control" type="date" value="${isEdit ? existing.date : today}" max="${today}"/>
    </div>

    <div class="section-hdr" style="margin-top:4px">VEHICLES & TRIPS</div>
    <div id="vehicle-entries"></div>

    <button id="add-vehicle-btn"
      style="width:100%;height:46px;border-radius:12px;background:rgba(33,150,243,.1);border:1.5px dashed rgba(33,150,243,.5);color:var(--text);font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:16px">
      <span class="material-icons-round" style="color:#2196f3">add</span> ADD VEHICLE
    </button>

    <div class="section-hdr">TOTALS</div>
    <div class="card mb-16" id="loading-totals"></div>

    <div class="section-hdr">PAYMENT</div>
    <div class="pay-chips mb-12" id="lf-pay-chips">
      <button class="pay-chip pending ${(!isEdit||payStatus==='Pending')?'active':''}" data-status="Pending">Pending</button>
      <button class="pay-chip paid ${(isEdit&&payStatus==='Paid')?'active':''}" data-status="Paid">Paid</button>
      <button class="pay-chip partial ${(isEdit&&payStatus==='Partially Paid')?'active':''}" data-status="Partially Paid">Partially Paid</button>
    </div>
    <div class="form-group">
      <label>Amount Paid (₹)</label>
      <div class="input-icon"><span class="material-icons-round">payments</span>
        <input id="lf-paid" class="form-control" type="number" min="0" inputmode="decimal" placeholder="0" value="${isEdit ? (existing.paidAmount||0) : ''}"/>
      </div>
    </div>
    <div class="card mb-16" id="lf-balance-card">
      <div class="detail-row">
        <span class="detail-label" style="font-weight:600">Balance Due</span>
        <span class="detail-value text-error" id="lf-balance-val">-</span>
      </div>
    </div>

    <button class="btn" id="lf-save"
      style="height:60px;font-size:18px;border-radius:16px;background:#2196f3;color:#fff">
      <span class="material-icons-round">check_circle</span> ${isEdit ? 'SAVE CHANGES' : 'SAVE LOADING'}
    </button>
    <div style="height:20px"></div>
  </div>
</div>`;

    renderVehicles();

    // back
    document.getElementById('lf-back').onclick = () =>
      isEdit ? App.navigate('loading', { mode: 'detail', record: existing }) : App.navigate('loading');

    // add vehicle
    document.getElementById('add-vehicle-btn').addEventListener('click', () => {
      vehicles.push({ vehicleType: 'Tractor', vehicleNumber: '', trips: 0, amountPerTrip: 0 });
      renderVehicles();
    });

    // payment chips
    document.getElementById('lf-pay-chips').addEventListener('click', e => {
      const chip = e.target.closest('.pay-chip');
      if (!chip) return;
      payStatus = chip.dataset.status;
      document.querySelectorAll('.pay-chip').forEach(c => c.classList.toggle('active', c.dataset.status === payStatus));
      if (payStatus === 'Paid') {
        const total = vehicles.reduce((s, v) => s + (v.trips||0)*(v.amountPerTrip||0), 0);
        document.getElementById('lf-paid').value = total;
        LoadingPage._recalcBalance();
      }
    });
    document.getElementById('lf-paid').addEventListener('input', () => LoadingPage._recalcBalance());

    // name suggestions
    document.getElementById('lf-name').addEventListener('input', async e => {
      const q   = e.target.value.trim();
      const sug = document.getElementById('lf-suggestions');
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
          document.getElementById('lf-name').value    = el.dataset.name;
          document.getElementById('lf-village').value = el.dataset.village;
          document.getElementById('lf-mobile').value  = el.dataset.mobile;
          sug.classList.add('hidden');
        });
      });
    });

    // mobile autofill
    document.getElementById('lf-mobile').addEventListener('input', async e => {
      e.target.value = e.target.value.replace(/\D/g,'').slice(0,10);
      if (e.target.value.length === 10) {
        const c = await getCustomerByMobile(e.target.value);
        if (c) {
          document.getElementById('lf-name').value    = c.name;
          document.getElementById('lf-village').value = c.village;
        }
      }
    });

    // save
    document.getElementById('lf-save').addEventListener('click', async () => {
      const name    = document.getElementById('lf-name').value.trim();
      const village = document.getElementById('lf-village').value.trim();
      let valid = true;
      if (!name)    { document.getElementById('err-lf-name').style.display    = 'block'; valid = false; } else document.getElementById('err-lf-name').style.display    = 'none';
      if (!village) { document.getElementById('err-lf-village').style.display = 'block'; valid = false; } else document.getElementById('err-lf-village').style.display = 'none';
      if (!valid) return;

      const totalTrips  = vehicles.reduce((s, v) => s + (v.trips || 0), 0);
      const totalAmount = vehicles.reduce((s, v) => s + (v.trips||0)*(v.amountPerTrip||0), 0);
      const paidAmt     = parseFloat(document.getElementById('lf-paid').value) || 0;
      const balanceDue  = Math.max(0, totalAmount - paidAmt);

      const btn = document.getElementById('lf-save');
      btn.disabled = true;

      const record = {
        ...(isEdit ? existing : {}),
        customerName:   name,
        customerMobile: document.getElementById('lf-mobile').value.trim(),
        village,
        date:           document.getElementById('lf-date').value || todayStr(),
        vehicles:       JSON.parse(JSON.stringify(vehicles)),
        totalTrips,
        totalAmount,
        paymentStatus:  payStatus,
        paidAmount:     paidAmt,
        balanceDue,
        updatedAt:      new Date().toISOString(),
        ...(isEdit ? {} : { createdAt: new Date().toISOString() }),
      };

      if (isEdit) {
        await updateLoadingRecord(record);
        App.showToast('Loading record updated!', 'success');
        App.navigate('loading', { mode: 'detail', record });
      } else {
        const id = await addLoadingRecord(record);
        record.id = id;
        App.showToast('Loading record saved!', 'success');
        App.navigate('loading');
      }
    });
  },

  _recalcBalance() {
    const vehicles = [];
    document.querySelectorAll('.trips-input').forEach((inp, i) => {
      const apt = document.querySelectorAll('.apt-input')[i];
      vehicles.push({ trips: parseInt(inp.value)||0, amountPerTrip: parseFloat(apt?.value)||0 });
    });
    const total   = vehicles.reduce((s, v) => s + v.trips * v.amountPerTrip, 0);
    const paid    = parseFloat(document.getElementById('lf-paid')?.value) || 0;
    const balance = Math.max(0, total - paid);
    const el = document.getElementById('lf-balance-val');
    if (el) el.textContent = fmtCurrency(balance);
  },
};
