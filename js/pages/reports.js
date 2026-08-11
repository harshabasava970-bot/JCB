// ── Reports Page — Work Report + Loading Report ───────────
const ReportsPage = {
  activeModule: 'work',   // 'work' | 'loading'
  activeTab:    'daily',  // 'daily' | 'monthly' | 'yearly'
  chart:        null,
  chart2:       null,

  async render(container) {
    container.innerHTML = `
<div class="page">
  <div class="appbar">
    <button class="appbar-back" onclick="App.navigate('home')">
      <span class="material-icons-round">arrow_back_ios_new</span>
    </button>
    <h1>Reports</h1>
  </div>
  <div class="p-20">
    <!-- Module toggle -->
    <div style="display:flex;gap:10px;margin-bottom:16px">
      <button id="mod-work" class="module-toggle-btn active"
        style="flex:1;height:46px;border-radius:12px;font-size:14px;font-weight:700;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--secondary);color:var(--primary)">
        <span class="material-icons-round" style="font-size:18px">construction</span> WORK
      </button>
      <button id="mod-loading" class="module-toggle-btn"
        style="flex:1;height:46px;border-radius:12px;font-size:14px;font-weight:700;border:1.5px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;background:none;color:var(--text2)">
        <span style="font-size:16px">📦</span> LOADING
      </button>
    </div>
    <!-- Period tabs -->
    <div class="tabs">
      <button class="tab-btn active" data-tab="daily">Daily</button>
      <button class="tab-btn" data-tab="monthly">Monthly</button>
      <button class="tab-btn" data-tab="yearly">Yearly</button>
    </div>
    <div id="report-content"><div class="spinner"></div></div>
  </div>
</div>`;

    // Module toggle
    document.getElementById('mod-work').addEventListener('click', () => {
      ReportsPage.activeModule = 'work';
      document.getElementById('mod-work').style.cssText    = 'flex:1;height:46px;border-radius:12px;font-size:14px;font-weight:700;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--secondary);color:var(--primary)';
      document.getElementById('mod-loading').style.cssText = 'flex:1;height:46px;border-radius:12px;font-size:14px;font-weight:700;border:1.5px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;background:none;color:var(--text2)';
      ReportsPage._renderTab();
    });
    document.getElementById('mod-loading').addEventListener('click', () => {
      ReportsPage.activeModule = 'loading';
      document.getElementById('mod-loading').style.cssText = 'flex:1;height:46px;border-radius:12px;font-size:14px;font-weight:700;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;background:#2196f3;color:#fff';
      document.getElementById('mod-work').style.cssText    = 'flex:1;height:46px;border-radius:12px;font-size:14px;font-weight:700;border:1.5px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;background:none;color:var(--text2)';
      ReportsPage._renderTab();
    });

    // Period tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        ReportsPage.activeTab = btn.dataset.tab;
        ReportsPage._renderTab();
      });
    });

    await ReportsPage._renderTab();
  },

  async _renderTab() {
    const content = document.getElementById('report-content');
    if (!content) return;
    content.innerHTML = '<div class="spinner"></div>';
    if (ReportsPage.chart)  { ReportsPage.chart.destroy();  ReportsPage.chart  = null; }
    if (ReportsPage.chart2) { ReportsPage.chart2.destroy(); ReportsPage.chart2 = null; }

    if (ReportsPage.activeModule === 'work') {
      if (ReportsPage.activeTab === 'daily')   await ReportsPage._workDaily(content);
      if (ReportsPage.activeTab === 'monthly') await ReportsPage._workMonthly(content);
      if (ReportsPage.activeTab === 'yearly')  await ReportsPage._workYearly(content);
    } else {
      if (ReportsPage.activeTab === 'daily')   await ReportsPage._loadingDaily(content);
      if (ReportsPage.activeTab === 'monthly') await ReportsPage._loadingMonthly(content);
      if (ReportsPage.activeTab === 'yearly')  await ReportsPage._loadingYearly(content);
    }
  },

  // ── WORK REPORTS ─────────────────────────────────────────
  async _workDaily(content) {
    let sel = todayStr();
    const build = async () => {
      const stats = await getReportStats(sel, sel);
      content.innerHTML = ReportsPage._datePicker(sel, 'rpt-date') + ReportsPage._workStatsGrid(stats, fmtDate(sel));
      document.getElementById('rpt-date').addEventListener('change', async e => { sel = e.target.value; await build(); });
    };
    await build();
  },

  async _workMonthly(content) {
    const now = new Date();
    let year = now.getFullYear(), month = now.getMonth() + 1;
    const mn  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const build = async () => {
      const from = `${year}-${String(month).padStart(2,'0')}-01`;
      const to   = `${year}-${String(month).padStart(2,'0')}-${new Date(year, month, 0).getDate()}`;
      const stats = await getReportStats(from, to);
      content.innerHTML = ReportsPage._monthNav(mn[month-1], year, 'wm') + ReportsPage._workStatsGrid(stats, `${mn[month-1]} ${year}`);
      document.getElementById('wm-prev').onclick = async () => { month--; if (month < 1) { month = 12; year--; } await build(); };
      document.getElementById('wm-next').onclick = async () => {
        const n = new Date(); if (year === n.getFullYear() && month === n.getMonth()+1) return;
        month++; if (month > 12) { month = 1; year++; } await build();
      };
    };
    await build();
  },

  async _workYearly(content) {
    let year = new Date().getFullYear();
    const build = async () => {
      const stats     = await getReportStats(`${year}-01-01`, `${year}-12-31`);
      const chartData = await getMonthlyChartData(year);
      content.innerHTML = ReportsPage._yearNav(year, 'wy') + ReportsPage._workStatsGrid(stats, String(year)) +
        (stats.totalJobs > 0 ? `<div class="card mt-16"><div style="font-size:14px;font-weight:700;margin-bottom:12px">Monthly Work Earnings — ${year}</div><canvas id="work-chart" height="200"></canvas></div>` : '');
      document.getElementById('wy-prev').onclick = async () => { year--; await build(); };
      document.getElementById('wy-next').onclick = async () => { if (year >= new Date().getFullYear()) return; year++; await build(); };
      if (stats.totalJobs > 0) {
        const ctx = document.getElementById('work-chart');
        if (ctx) {
          if (ReportsPage.chart) ReportsPage.chart.destroy();
          ReportsPage.chart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['J','F','M','A','M','J','J','A','S','O','N','D'],
              datasets: [{ label:'Earnings', data: chartData.map(d => d.earnings), backgroundColor:'rgba(249,196,0,.85)', borderRadius:6 }]
            },
            options: { responsive:true, plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>fmtCurrency(c.parsed.y)}} }, scales:{y:{ticks:{callback:v=>v>=1000?(v/1000).toFixed(0)+'k':v,font:{size:10}}},x:{grid:{display:false}}} }
          });
        }
      }
    };
    await build();
  },

  _workStatsGrid(stats, label) {
    if (stats.totalJobs === 0) return `<div class="empty-state"><span class="material-icons-round">construction</span>No work data for ${label}</div>`;
    const hrs  = Math.floor(stats.totalMinutes / 60);
    const mins = stats.totalMinutes % 60;
    const bh   = Math.floor(stats.totalBreakMins / 60);
    const bm   = stats.totalBreakMins % 60;
    return `
<div style="background:linear-gradient(135deg,var(--secondary),#2d2d2d);border-radius:18px;padding:20px;margin-bottom:16px">
  <div style="color:rgba(255,255,255,.55);font-size:12px;margin-bottom:4px">🔧 Work Earnings</div>
  <div style="font-size:34px;font-weight:900;color:var(--primary)">${fmtCurrency(stats.totalEarnings)}</div>
  <div style="color:rgba(255,255,255,.4);font-size:12px;margin-top:4px">${label}</div>
</div>
<div class="card-grid mb-12">
  <div class="stat-card"><div class="stat-icon" style="background:rgba(33,150,243,.12)"><span class="material-icons-round" style="color:#2196f3">work</span></div><div class="stat-value">${stats.totalJobs}</div><div class="stat-label">Total Jobs</div></div>
  <div class="stat-card"><div class="stat-icon" style="background:rgba(156,39,176,.12)"><span class="material-icons-round" style="color:#9c27b0">timer</span></div><div class="stat-value">${hrs}h ${mins}m</div><div class="stat-label">Working Hours</div></div>
</div>
<div class="card-grid mb-12">
  <div class="stat-card"><div class="stat-icon" style="background:rgba(255,152,0,.12)"><span class="material-icons-round" style="color:#ff9800">local_gas_station</span></div><div class="stat-value" style="font-size:15px">${fmtCurrency(stats.totalDiesel)}</div><div class="stat-label">Total Diesel</div></div>
  <div class="stat-card"><div class="stat-icon" style="background:rgba(76,175,80,.12)"><span class="material-icons-round" style="color:#4caf50">trending_up</span></div><div class="stat-value" style="font-size:15px">${fmtCurrency(stats.totalProfit)}</div><div class="stat-label">Net Profit</div></div>
</div>
${stats.totalBreakMins > 0 ? `<div class="stat-card mb-12" style="display:flex;align-items:center;gap:14px;padding:14px"><div class="stat-icon" style="background:rgba(255,152,0,.12);margin-bottom:0;flex-shrink:0"><span class="material-icons-round" style="color:#ff9800">pause_circle</span></div><div><div class="stat-value" style="font-size:18px">${bh}h ${bm}m</div><div class="stat-label">Total Break Time</div></div></div>` : ''}`;
  },

  // ── LOADING REPORTS ───────────────────────────────────────
  async _loadingDaily(content) {
    let sel = todayStr();
    const build = async () => {
      const stats = await getLoadingReportStats(sel, sel);
      content.innerHTML = ReportsPage._datePicker(sel, 'rpt-date2') + ReportsPage._loadingStatsGrid(stats, fmtDate(sel));
      document.getElementById('rpt-date2').addEventListener('change', async e => { sel = e.target.value; await build(); });
    };
    await build();
  },

  async _loadingMonthly(content) {
    const now = new Date();
    let year = now.getFullYear(), month = now.getMonth() + 1;
    const mn  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const build = async () => {
      const from  = `${year}-${String(month).padStart(2,'0')}-01`;
      const to    = `${year}-${String(month).padStart(2,'0')}-${new Date(year, month, 0).getDate()}`;
      const stats = await getLoadingReportStats(from, to);
      content.innerHTML = ReportsPage._monthNav(mn[month-1], year, 'lm') + ReportsPage._loadingStatsGrid(stats, `${mn[month-1]} ${year}`);
      document.getElementById('lm-prev').onclick = async () => { month--; if (month < 1) { month = 12; year--; } await build(); };
      document.getElementById('lm-next').onclick = async () => {
        const n = new Date(); if (year === n.getFullYear() && month === n.getMonth()+1) return;
        month++; if (month > 12) { month = 1; year++; } await build();
      };
    };
    await build();
  },

  async _loadingYearly(content) {
    let year = new Date().getFullYear();
    const build = async () => {
      const stats     = await getLoadingReportStats(`${year}-01-01`, `${year}-12-31`);
      const chartData = await getLoadingMonthlyChartData(year);
      content.innerHTML = ReportsPage._yearNav(year, 'ly') + ReportsPage._loadingStatsGrid(stats, String(year)) +
        (stats.totalRecords > 0 ? `<div class="card mt-16"><div style="font-size:14px;font-weight:700;margin-bottom:12px">Monthly Loading Trips — ${year}</div><canvas id="loading-chart" height="200"></canvas></div>` : '');
      document.getElementById('ly-prev').onclick = async () => { year--; await build(); };
      document.getElementById('ly-next').onclick = async () => { if (year >= new Date().getFullYear()) return; year++; await build(); };
      if (stats.totalRecords > 0) {
        const ctx = document.getElementById('loading-chart');
        if (ctx) {
          if (ReportsPage.chart2) ReportsPage.chart2.destroy();
          ReportsPage.chart2 = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['J','F','M','A','M','J','J','A','S','O','N','D'],
              datasets: [{ label:'Trips', data: chartData.map(d => d.trips), backgroundColor:'rgba(33,150,243,.75)', borderRadius:6 }]
            },
            options: { responsive:true, plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>`${c.parsed.y} trips`}} }, scales:{y:{ticks:{font:{size:10}}},x:{grid:{display:false}}} }
          });
        }
      }
    };
    await build();
  },

  _loadingStatsGrid(stats, label) {
    if (stats.totalRecords === 0) return `<div class="empty-state"><span style="font-size:64px;opacity:.3;display:block;margin-bottom:12px">📦</span>No loading data for ${label}</div>`;
    const typeRows = Object.entries(stats.byType).map(([type, d]) =>
      `<div class="detail-row"><span class="detail-label">${vIcon(type)} ${type}</span><span class="detail-value">${d.trips} trips — ${fmtCurrency(d.amount)}</span></div>`
    ).join('');
    return `
<div style="background:linear-gradient(135deg,#1565c0,#1976d2);border-radius:18px;padding:20px;margin-bottom:16px">
  <div style="color:rgba(255,255,255,.65);font-size:12px;margin-bottom:4px">📦 Loading Revenue</div>
  <div style="font-size:34px;font-weight:900;color:#fff">${fmtCurrency(stats.totalAmount)}</div>
  <div style="color:rgba(255,255,255,.5);font-size:12px;margin-top:4px">${label}</div>
</div>
<div class="card-grid mb-12">
  <div class="stat-card"><div class="stat-icon" style="background:rgba(33,150,243,.12)"><span class="material-icons-round" style="color:#2196f3">receipt_long</span></div><div class="stat-value">${stats.totalRecords}</div><div class="stat-label">Total Records</div></div>
  <div class="stat-card"><div class="stat-icon" style="background:rgba(156,39,176,.12)"><span class="material-icons-round" style="color:#9c27b0">local_shipping</span></div><div class="stat-value">${stats.totalTrips}</div><div class="stat-label">Total Trips</div></div>
</div>
<div class="card-grid mb-12">
  <div class="stat-card"><div class="stat-icon" style="background:rgba(76,175,80,.12)"><span class="material-icons-round" style="color:#4caf50">payments</span></div><div class="stat-value" style="font-size:15px">${fmtCurrency(stats.totalPaid)}</div><div class="stat-label">Total Paid</div></div>
  <div class="stat-card"><div class="stat-icon" style="background:rgba(244,67,54,.12)"><span class="material-icons-round" style="color:#f44336">pending</span></div><div class="stat-value" style="font-size:15px">${fmtCurrency(stats.totalBalance)}</div><div class="stat-label">Pending</div></div>
</div>
${typeRows ? `<div class="card mb-12"><div style="font-size:13px;font-weight:700;margin-bottom:10px;color:var(--text2);letter-spacing:.5px">VEHICLE-WISE</div>${typeRows}</div>` : ''}`;
  },

  // ── Shared helpers ────────────────────────────────────────
  _datePicker(value, id) {
    return `
<div style="display:flex;align-items:center;gap:10px;background:var(--surface);border:1.5px solid rgba(249,196,0,.4);border-radius:var(--radius);padding:12px 16px;margin-bottom:16px;cursor:pointer;position:relative" onclick="document.getElementById('${id}').showPicker&&document.getElementById('${id}').showPicker()">
  <span class="material-icons-round" style="color:var(--primary)">calendar_today</span>
  <span style="font-size:15px;font-weight:600;flex:1">${fmtDate(value)}</span>
  <input type="date" id="${id}" value="${value}" max="${new Date().toISOString().slice(0,10)}" style="position:absolute;opacity:0;pointer-events:none"/>
  <span class="material-icons-round" style="color:var(--primary)">keyboard_arrow_down</span>
</div>`;
  },

  _monthNav(label, year, pfx) {
    return `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface);border:1.5px solid rgba(249,196,0,.4);border-radius:var(--radius);padding:12px 16px;margin-bottom:16px">
      <button id="${pfx}-prev" style="background:none;border:none;cursor:pointer;color:var(--primary);display:flex;align-items:center"><span class="material-icons-round">chevron_left</span></button>
      <span style="font-size:16px;font-weight:700">${label} ${year}</span>
      <button id="${pfx}-next" style="background:none;border:none;cursor:pointer;color:var(--primary);display:flex;align-items:center"><span class="material-icons-round">chevron_right</span></button>
    </div>`;
  },

  _yearNav(year, pfx) {
    return `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface);border:1.5px solid rgba(249,196,0,.4);border-radius:var(--radius);padding:12px 16px;margin-bottom:16px">
      <button id="${pfx}-prev" style="background:none;border:none;cursor:pointer;color:var(--primary);display:flex;align-items:center"><span class="material-icons-round">chevron_left</span></button>
      <span style="font-size:20px;font-weight:700">${year}</span>
      <button id="${pfx}-next" style="background:none;border:none;cursor:pointer;color:var(--primary);display:flex;align-items:center"><span class="material-icons-round">chevron_right</span></button>
    </div>`;
  },
};
