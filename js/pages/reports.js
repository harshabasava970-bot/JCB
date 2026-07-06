// ── Reports Page ─────────────────────────────────────────
const ReportsPage = {
  activeTab: 'daily',
  chart: null,

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
    <div class="tabs">
      <button class="tab-btn active" data-tab="daily">Daily</button>
      <button class="tab-btn" data-tab="monthly">Monthly</button>
      <button class="tab-btn" data-tab="yearly">Yearly</button>
    </div>
    <div id="report-content"><div class="spinner"></div></div>
  </div>
</div>`;

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
    if (ReportsPage.chart) { ReportsPage.chart.destroy(); ReportsPage.chart = null; }

    if (ReportsPage.activeTab === 'daily')   await ReportsPage._renderDaily(content);
    if (ReportsPage.activeTab === 'monthly') await ReportsPage._renderMonthly(content);
    if (ReportsPage.activeTab === 'yearly')  await ReportsPage._renderYearly(content);
  },

  async _renderDaily(content) {
    const today = new Date();
    let selectedDate = today.toISOString().slice(0, 10);

    const build = async () => {
      const stats = await getReportStats(selectedDate, selectedDate);
      content.innerHTML = `
        ${ReportsPage._datePicker(selectedDate, 'rpt-date')}
        ${ReportsPage._statsGrid(stats, fmtDate(selectedDate))}`;
      document.getElementById('rpt-date').addEventListener('change', async e => {
        selectedDate = e.target.value;
        await build();
      });
    };
    await build();
  },

  async _renderMonthly(content) {
    const now = new Date();
    let year = now.getFullYear(), month = now.getMonth() + 1;

    const build = async () => {
      const from = `${year}-${String(month).padStart(2,'0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const to = `${year}-${String(month).padStart(2,'0')}-${lastDay}`;
      const stats = await getReportStats(from, to);
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      content.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface);border:1.5px solid rgba(249,196,0,.4);border-radius:var(--radius);padding:12px 16px;margin-bottom:16px">
          <button id="prev-m" style="background:none;border:none;cursor:pointer;color:var(--primary);display:flex;align-items:center">
            <span class="material-icons-round">chevron_left</span>
          </button>
          <span style="font-size:16px;font-weight:700">${monthNames[month-1]} ${year}</span>
          <button id="next-m" style="background:none;border:none;cursor:pointer;color:var(--primary);display:flex;align-items:center">
            <span class="material-icons-round">chevron_right</span>
          </button>
        </div>
        ${ReportsPage._statsGrid(stats, `${monthNames[month-1]} ${year}`)}`;
      document.getElementById('prev-m').onclick = async () => {
        month--; if (month < 1) { month = 12; year--; } await build();
      };
      document.getElementById('next-m').onclick = async () => {
        const n = new Date(); if (year === n.getFullYear() && month === n.getMonth()+1) return;
        month++; if (month > 12) { month = 1; year++; } await build();
      };
    };
    await build();
  },

  async _renderYearly(content) {
    let year = new Date().getFullYear();

    const build = async () => {
      const stats = await getReportStats(`${year}-01-01`, `${year}-12-31`);
      const chartData = await getMonthlyChartData(year);
      content.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface);border:1.5px solid rgba(249,196,0,.4);border-radius:var(--radius);padding:12px 16px;margin-bottom:16px">
          <button id="prev-y" style="background:none;border:none;cursor:pointer;color:var(--primary);display:flex;align-items:center">
            <span class="material-icons-round">chevron_left</span>
          </button>
          <span style="font-size:20px;font-weight:700">${year}</span>
          <button id="next-y" style="background:none;border:none;cursor:pointer;color:var(--primary);display:flex;align-items:center">
            <span class="material-icons-round">chevron_right</span>
          </button>
        </div>
        ${ReportsPage._statsGrid(stats, String(year))}
        ${stats.totalJobs > 0 ? `
        <div class="card mt-16">
          <div style="font-size:14px;font-weight:700;margin-bottom:12px">Monthly Earnings — ${year}</div>
          <canvas id="earnings-chart" height="200"></canvas>
        </div>` : ''}`;

      document.getElementById('prev-y').onclick = async () => { year--; await build(); };
      document.getElementById('next-y').onclick = async () => {
        if (year >= new Date().getFullYear()) return; year++; await build();
      };

      if (stats.totalJobs > 0) {
        const ctx = document.getElementById('earnings-chart');
        if (ctx) {
          if (ReportsPage.chart) ReportsPage.chart.destroy();
          ReportsPage.chart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['J','F','M','A','M','J','J','A','S','O','N','D'],
              datasets: [{
                label: 'Earnings (₹)',
                data: chartData.map(d => d.earnings),
                backgroundColor: 'rgba(249,196,0,0.85)',
                borderRadius: 6,
                borderSkipped: false,
              }]
            },
            options: {
              responsive: true,
              plugins: { legend: { display: false },
                tooltip: { callbacks: { label: ctx => fmtCurrency(ctx.parsed.y) } }
              },
              scales: {
                y: { ticks: { callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v, font:{size:10} }, grid:{color:'rgba(0,0,0,.06)'} },
                x: { grid: { display: false } }
              }
            }
          });
        }
      }
    };
    await build();
  },

  _datePicker(value, id) {
    return `
<div style="display:flex;align-items:center;gap:10px;background:var(--surface);border:1.5px solid rgba(249,196,0,.4);border-radius:var(--radius);padding:12px 16px;margin-bottom:16px;cursor:pointer" onclick="document.getElementById('${id}').showPicker&&document.getElementById('${id}').showPicker()">
  <span class="material-icons-round" style="color:var(--primary)">calendar_today</span>
  <span style="font-size:15px;font-weight:600;flex:1">${fmtDate(value)}</span>
  <input type="date" id="${id}" value="${value}" max="${new Date().toISOString().slice(0,10)}" style="position:absolute;opacity:0;pointer-events:none"/>
  <span class="material-icons-round" style="color:var(--primary)">keyboard_arrow_down</span>
</div>`;
  },

  _statsGrid(stats, label) {
    if (stats.totalJobs === 0) {
      return `<div class="empty-state"><span class="material-icons-round">bar_chart</span>No data for ${label}</div>`;
    }
    const hrs = Math.floor(stats.totalMinutes / 60), mins = stats.totalMinutes % 60;
    return `
<div style="background:linear-gradient(135deg,var(--secondary),#2d2d2d);border-radius:18px;padding:20px;margin-bottom:16px">
  <div style="color:rgba(255,255,255,.55);font-size:12px;margin-bottom:4px">Total Earnings</div>
  <div style="font-size:34px;font-weight:900;color:var(--primary)">${fmtCurrency(stats.totalEarnings)}</div>
  <div style="color:rgba(255,255,255,.4);font-size:12px;margin-top:4px">${label}</div>
</div>
<div class="card-grid mb-12">
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(33,150,243,.12)">
      <span class="material-icons-round" style="color:#2196f3">work</span>
    </div>
    <div class="stat-value">${stats.totalJobs}</div>
    <div class="stat-label">Total Jobs</div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(156,39,176,.12)">
      <span class="material-icons-round" style="color:#9c27b0">timer</span>
    </div>
    <div class="stat-value">${hrs}h ${mins}m</div>
    <div class="stat-label">Total Hours</div>
  </div>
</div>
<div class="card-grid">
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(255,152,0,.12)">
      <span class="material-icons-round" style="color:#ff9800">local_gas_station</span>
    </div>
    <div class="stat-value" style="font-size:15px">${fmtCurrency(stats.totalDiesel)}</div>
    <div class="stat-label">Total Diesel</div>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:rgba(76,175,80,.12)">
      <span class="material-icons-round" style="color:#4caf50">trending_up</span>
    </div>
    <div class="stat-value" style="font-size:15px">${fmtCurrency(stats.totalProfit)}</div>
    <div class="stat-label">Total Profit</div>
  </div>
</div>`;
  }
};
