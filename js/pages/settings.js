// ── Settings Page ─────────────────────────────────────────
const SettingsPage = {
  render(container) {
    const s = Settings.get();
    const user = Auth.getUser() || {};

    container.innerHTML = `
<div class="page">
  <div class="appbar">
    <button class="appbar-back" onclick="App.navigate('home')">
      <span class="material-icons-round">arrow_back_ios_new</span>
    </button>
    <h1>Settings</h1>
  </div>
  <div class="p-20">

    <!-- Profile -->
    <div style="font-size:11px;font-weight:700;color:var(--text2);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px">
      <span class="material-icons-round" style="font-size:14px">person</span>Profile
    </div>
    <div class="card mb-20">
      <div class="form-group" style="margin-bottom:12px">
        <label>Owner Name</label>
        <div class="input-icon">
          <span class="material-icons-round">person</span>
          <input id="sett-name" class="form-control" type="text" value="${escHtml(s.ownerName || user.name || '')}" placeholder="Enter your name"/>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:12px">
        <label>Mobile Number</label>
        <div class="input-icon">
          <span class="material-icons-round">phone</span>
          <input id="sett-mobile" class="form-control" type="tel" maxlength="10" value="${s.ownerMobile || user.mobile || ''}" placeholder="10-digit number"/>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" id="sett-save-profile" style="height:44px;font-size:14px">
        <span class="material-icons-round" style="font-size:16px">save</span> Save Profile
      </button>
    </div>

    <!-- Work Settings -->
    <div style="font-size:11px;font-weight:700;color:var(--text2);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px">
      <span class="material-icons-round" style="font-size:14px">build</span>Work Settings
    </div>
    <div class="card mb-20">
      <div style="font-size:13px;font-weight:600;color:var(--text2);margin-bottom:8px">Hourly Rate (₹/hr)</div>
      <div style="display:flex;gap:10px;align-items:center">
        <div class="input-icon" style="flex:1">
          <span class="material-icons-round">currency_rupee</span>
          <input id="sett-rate" class="form-control" type="number" value="${s.hourlyRate || 1300}" min="1" inputmode="numeric"/>
        </div>
        <button class="btn btn-primary btn-sm" id="sett-save-rate" style="height:52px;width:auto;padding:0 20px">Save</button>
      </div>
      <div style="font-size:12px;color:var(--text2);margin-top:8px">
        Current: ₹${s.hourlyRate || 1300}/hr &nbsp;|&nbsp; Default: ₹1300/hr
      </div>
    </div>

    <!-- Appearance -->
    <div style="font-size:11px;font-weight:700;color:var(--text2);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px">
      <span class="material-icons-round" style="font-size:14px">palette</span>Appearance
    </div>
    <div class="card mb-20">
      <div class="setting-item">
        <div class="setting-icon" style="background:rgba(249,196,0,.15)">
          <span class="material-icons-round" style="color:var(--primary)">dark_mode</span>
        </div>
        <div class="setting-info">
          <div class="setting-title">Dark Mode</div>
          <div class="setting-sub">Switch to dark theme</div>
        </div>
        <button class="toggle ${s.darkMode ? 'on' : ''}" id="dark-toggle"></button>
      </div>
    </div>

    <!-- App Info -->
    <div style="font-size:11px;font-weight:700;color:var(--text2);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px">
      <span class="material-icons-round" style="font-size:14px">info</span>About
    </div>
    <div class="card mb-20">
      <div class="setting-item">
        <div class="setting-icon" style="background:rgba(249,196,0,.15)">
          <span class="material-icons-round" style="color:var(--primary)">construction</span>
        </div>
        <div class="setting-info"><div class="setting-title">App Name</div></div>
        <span style="font-size:13px;font-weight:600">JCB Working</span>
      </div>
      <div class="setting-item">
        <div class="setting-icon" style="background:rgba(33,150,243,.12)">
          <span class="material-icons-round" style="color:#2196f3">tag</span>
        </div>
        <div class="setting-info"><div class="setting-title">Version</div></div>
        <span style="font-size:13px;font-weight:600">1.0.0</span>
      </div>
      <div class="setting-item">
        <div class="setting-icon" style="background:rgba(76,175,80,.12)">
          <span class="material-icons-round" style="color:#4caf50">cloud_off</span>
        </div>
        <div class="setting-info">
          <div class="setting-title">Offline First</div>
          <div class="setting-sub">All data saved in your browser</div>
        </div>
      </div>
    </div>

    <!-- Logout -->
    <button class="btn" id="sett-logout" style="background:none;border:1.5px solid #f44336;color:#f44336;height:50px;border-radius:12px">
      <span class="material-icons-round">logout</span> Logout
    </button>
    <div style="height:20px"></div>
  </div>
</div>`;

    // Save profile
    document.getElementById('sett-save-profile').onclick = () => {
      const name   = document.getElementById('sett-name').value.trim();
      const mobile = document.getElementById('sett-mobile').value.trim();
      if (!name) { App.showToast('Name is required', 'error'); return; }
      Settings.setAll({ ownerName: name, ownerMobile: mobile });
      const user = Auth.getUser();
      if (user) { user.name = name; user.mobile = mobile; Auth.login(user.name, user.mobile); }
      App.showToast('Profile saved!', 'success');
    };

    // Save rate
    document.getElementById('sett-save-rate').onclick = () => {
      const rate = parseFloat(document.getElementById('sett-rate').value);
      if (!rate || rate <= 0) { App.showToast('Enter valid rate', 'error'); return; }
      Settings.set('hourlyRate', rate);
      App.showToast('Rate saved!', 'success');
      // Re-render to update display
      SettingsPage.render(container);
    };

    // Dark mode toggle
    document.getElementById('dark-toggle').onclick = function () {
      const isDark = !this.classList.contains('on');
      this.classList.toggle('on', isDark);
      Settings.set('darkMode', isDark);
      document.body.classList.toggle('dark', isDark);
    };

    // Logout
    document.getElementById('sett-logout').onclick = async () => {
      const ok = await App.confirm('Logout?', 'You will need to login again.', 'Logout', true);
      if (!ok) return;
      Auth.logout();
      App.navigate('login');
    };
  }
};
