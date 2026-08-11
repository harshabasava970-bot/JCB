const HomePage = {
  async render(container) {
    container.innerHTML = `<div class="page"><div class="spinner"></div></div>`;
    const user  = Auth.getUser() || {};
    const stats = await getDashboardStats();

    container.innerHTML = `
<div class="page">
  <div class="home-header">
    <div class="home-header-row">
      <div>
        <div class="home-greeting">${greeting()},</div>
        <div class="home-name">${user.name || 'Owner'}</div>
        <div class="home-date">${fmtDate(todayStr())}</div>
      </div>
      <button class="appbar-action" onclick="App.navigate('settings')">
        <span class="material-icons-round">settings</span>
      </button>
    </div>
  </div>

  <div class="p-20">

    <!-- Work Today -->
    <div class="section-hdr">
      <span class="material-icons-round" style="font-size:14px;color:var(--primary)">construction</span>
      JCB WORK — TODAY
    </div>
    <div class="card-grid mb-16">
      <div class="stat-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="stat-icon" style="background:rgba(249,196,0,.15)">
            <span class="material-icons-round" style="color:var(--primary)">currency_rupee</span>
          </div>
          <span class="stat-badge" style="background:rgba(249,196,0,.15);color:#9a7a00">${stats.todayJobs} jobs</span>
        </div>
        <div class="stat-value">${fmtCurrency(stats.todayEarnings)}</div>
        <div class="stat-label">Work Earnings</div>
      </div>
      <div class="stat-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="stat-icon" style="background:rgba(76,175,80,.15)">
            <span class="material-icons-round" style="color:#4caf50">calendar_month</span>
          </div>
          <span class="stat-badge" style="background:rgba(76,175,80,.15);color:#2e7d32">${stats.monthlyJobs} jobs</span>
        </div>
        <div class="stat-value">${fmtCurrency(stats.monthlyEarnings)}</div>
        <div class="stat-label">Monthly Work</div>
      </div>
    </div>

    <!-- Loading Today -->
    <div class="section-hdr">
      <span style="font-size:14px">📦</span>
      LOADING — TODAY
    </div>
    <div class="card-grid mb-16">
      <div class="stat-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="stat-icon" style="background:rgba(33,150,243,.15)">
            <span class="material-icons-round" style="color:#2196f3">local_shipping</span>
          </div>
          <span class="stat-badge" style="background:rgba(33,150,243,.15);color:#1565c0">${stats.todayLoadingCount} records</span>
        </div>
        <div class="stat-value" style="font-size:20px">${stats.todayLoadingTrips}</div>
        <div class="stat-label">Total Trips</div>
      </div>
      <div class="stat-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="stat-icon" style="background:rgba(156,39,176,.15)">
            <span class="material-icons-round" style="color:#9c27b0">currency_rupee</span>
          </div>
          <span class="stat-badge" style="background:rgba(156,39,176,.15);color:#6a1b9a">${stats.monthLoadingTrips} trips</span>
        </div>
        <div class="stat-value">${fmtCurrency(stats.todayLoadingAmount)}</div>
        <div class="stat-label">Loading Earnings</div>
      </div>
    </div>

    <!-- Quick Start Buttons -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
      <button class="btn btn-dark" onclick="App.navigate('start-work')"
        style="height:64px;border-radius:16px;font-size:15px;letter-spacing:1px;">
        <div style="width:34px;height:34px;background:var(--primary);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span class="material-icons-round" style="color:var(--secondary);font-size:22px">construction</span>
        </div>
        START WORK
      </button>
      <button class="btn" onclick="App.navigate('loading')"
        style="height:64px;border-radius:16px;font-size:15px;letter-spacing:1px;background:rgba(33,150,243,.12);border:1.5px solid rgba(33,150,243,.3);color:var(--text);">
        <div style="width:34px;height:34px;background:#2196f3;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="font-size:20px">📦</span>
        </div>
        LOADING
      </button>
    </div>

    <!-- Quick Access -->
    <div class="section-hdr">
      <span class="material-icons-round" style="font-size:14px">apps</span>Quick Access
    </div>
    <div class="menu-grid">
      <div class="menu-card" onclick="App.navigate('history')">
        <div class="menu-icon" style="background:rgba(33,150,243,.12)"><span class="material-icons-round" style="color:#2196f3">history</span></div>
        <div class="menu-label">Work History</div>
      </div>
      <div class="menu-card" onclick="App.navigate('loading')">
        <div class="menu-icon" style="background:rgba(249,196,0,.12)"><span style="font-size:20px">📦</span></div>
        <div class="menu-label">Loading</div>
      </div>
      <div class="menu-card" onclick="App.navigate('reports')">
        <div class="menu-icon" style="background:rgba(76,175,80,.12)"><span class="material-icons-round" style="color:#4caf50">bar_chart</span></div>
        <div class="menu-label">Reports</div>
      </div>
      <div class="menu-card" onclick="App.navigate('settings')">
        <div class="menu-icon" style="background:rgba(255,152,0,.12)"><span class="material-icons-round" style="color:#ff9800">settings</span></div>
        <div class="menu-label">Settings</div>
      </div>
    </div>
  </div>
</div>`;
  }
};
