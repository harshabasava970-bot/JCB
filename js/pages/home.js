const HomePage = {
  async render(container) {
    container.innerHTML = `<div class="page"><div class="spinner"></div></div>`;
    const user = Auth.getUser() || {};
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
    <div class="section-hdr"><span class="material-icons-round" style="font-size:14px">insights</span>Overview</div>
    <div class="card-grid mb-16">
      <div class="stat-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="stat-icon" style="background:rgba(249,196,0,.15)">
            <span class="material-icons-round" style="color:var(--primary)">currency_rupee</span>
          </div>
          <span class="stat-badge" style="background:rgba(249,196,0,.15);color:#9a7a00">${stats.todayJobs} jobs</span>
        </div>
        <div class="stat-value">${fmtCurrency(stats.todayEarnings)}</div>
        <div class="stat-label">Today's Earnings</div>
      </div>
      <div class="stat-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="stat-icon" style="background:rgba(76,175,80,.15)">
            <span class="material-icons-round" style="color:#4caf50">calendar_month</span>
          </div>
          <span class="stat-badge" style="background:rgba(76,175,80,.15);color:#2e7d32">${stats.monthlyJobs} jobs</span>
        </div>
        <div class="stat-value">${fmtCurrency(stats.monthlyEarnings)}</div>
        <div class="stat-label">Monthly Earnings</div>
      </div>
    </div>

    <div class="start-btn-wrap">
      <button class="btn btn-dark" onclick="App.navigate('start-work')" style="height:70px;border-radius:18px;font-size:20px;letter-spacing:1.5px;">
        <div style="width:42px;height:42px;background:var(--primary);border-radius:12px;display:flex;align-items:center;justify-content:center;">
          <span class="material-icons-round" style="color:var(--secondary);font-size:28px">play_arrow</span>
        </div>
        START WORK
      </button>
    </div>

    <div class="section-hdr"><span class="material-icons-round" style="font-size:14px">apps</span>Quick Access</div>
    <div class="menu-grid">
      <div class="menu-card" onclick="App.navigate('history')">
        <div class="menu-icon" style="background:rgba(33,150,243,.12)"><span class="material-icons-round" style="color:#2196f3">history</span></div>
        <div class="menu-label">Work History</div>
      </div>
      <div class="menu-card" onclick="App.navigate('reports')">
        <div class="menu-icon" style="background:rgba(76,175,80,.12)"><span class="material-icons-round" style="color:#4caf50">bar_chart</span></div>
        <div class="menu-label">Reports</div>
      </div>
      <div class="menu-card" onclick="App.navigate('settings')">
        <div class="menu-icon" style="background:rgba(255,152,0,.12)"><span class="material-icons-round" style="color:#ff9800">settings</span></div>
        <div class="menu-label">Settings</div>
      </div>
      <div class="menu-card" onclick="App.navigate('history')">
        <div class="menu-icon" style="background:rgba(156,39,176,.12)"><span class="material-icons-round" style="color:#9c27b0">people</span></div>
        <div class="menu-label">Customers</div>
      </div>
    </div>
  </div>
</div>`;
  }
};
