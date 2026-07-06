const LoginPage = {
  render(container) {
    container.innerHTML = `
<div class="page" style="display:flex;flex-direction:column;min-height:100vh;">
  <div class="login-hero">
    <div class="login-logo"><span>JCB</span></div>
    <div class="login-title">JCB Working</div>
    <div class="login-sub">Track. Calculate. Earn.</div>
  </div>
  <div class="login-form-wrap">
    <div class="login-form-title">Welcome Back 👋</div>
    <div class="login-form-sub">Enter your details to continue</div>
    <div class="form-group">
      <label>Your Name</label>
      <div class="input-icon">
        <span class="material-icons-round">person</span>
        <input id="login-name" class="form-control" type="text" placeholder="Enter your name" autocomplete="name"/>
      </div>
      <div class="form-error" id="err-name">Name is required</div>
    </div>
    <div class="form-group">
      <label>Mobile Number</label>
      <div class="input-icon">
        <span class="material-icons-round">phone</span>
        <input id="login-mobile" class="form-control" type="tel" placeholder="10-digit mobile number" maxlength="10" inputmode="numeric"/>
      </div>
      <div class="form-error" id="err-mobile">Enter valid 10-digit number</div>
    </div>
    <button class="btn btn-primary mt-24" id="login-btn" style="height:56px;font-size:17px;">
      <span class="material-icons-round">arrow_forward</span> Continue
    </button>
    <p style="text-align:center;font-size:12px;color:var(--text2);margin-top:20px;">Version 1.0.0 • Offline App</p>
  </div>
</div>`;

    document.getElementById('login-mobile').addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });

    document.getElementById('login-btn').addEventListener('click', () => {
      const name = document.getElementById('login-name').value.trim();
      const mobile = document.getElementById('login-mobile').value.trim();
      let ok = true;
      if (!name) { document.getElementById('err-name').style.display = 'block'; ok = false; }
      else document.getElementById('err-name').style.display = 'none';
      if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) { document.getElementById('err-mobile').style.display = 'block'; ok = false; }
      else document.getElementById('err-mobile').style.display = 'none';
      if (!ok) return;
      Auth.login(name, mobile);
      Settings.setAll({ ownerName: name, ownerMobile: mobile });
      App.navigate('home');
    });
  }
};
