// ── Running Work Page — with Pause/Resume + Loading/Trip Counter ──
const RunningPage = {
  _timerInterval: null,
  _work: null,

  render(container, work) {
    if (!work) { App.navigate('home'); return; }
    RunningPage._work = work;

    // Ensure new fields exist (safe for old records without them)
    if (!Array.isArray(work.pauseSegments)) work.pauseSegments = [];
    if (!Array.isArray(work.loading))        work.loading = [];

    RunningPage._buildUI(container);
    RunningPage._startClock();
  },

  // ─────────────────────────────────────────────────────────
  _buildUI(container) {
    const w = RunningPage._work;
    const isPaused = w.status === 'paused';

    container.innerHTML = `
<div class="page">

  <!-- Header -->
  <div class="running-header" id="running-header-bar" style="${isPaused ? 'background:#2d2d2d' : ''}">
    <div style="display:flex;justify-content:center;margin-bottom:16px">
      <div class="running-badge" id="status-badge"
        style="${isPaused ? 'background:#FF9800' : 'background:#4caf50'}">
        <div class="running-dot" style="${isPaused ? 'animation:none;opacity:1' : ''}"></div>
        ${isPaused ? 'PAUSED' : 'RUNNING'}
      </div>
    </div>

    <div class="timer-display ${isPaused ? '' : 'pulse'}" id="timer-display">00:00</div>
    <div style="display:flex;justify-content:center;gap:24px;margin-top:10px">
      <div style="text-align:center">
        <div style="color:rgba(255,255,255,.45);font-size:10px;letter-spacing:.5px">WORKING</div>
        <div style="color:var(--primary);font-size:13px;font-weight:700" id="work-time-display">00:00</div>
      </div>
      <div style="text-align:center">
        <div style="color:rgba(255,255,255,.45);font-size:10px;letter-spacing:.5px">BREAK</div>
        <div style="color:#ff9800;font-size:13px;font-weight:700" id="break-time-display">00:00</div>
      </div>
    </div>
  </div>

  <div class="p-20">

    <!-- Work Info Card -->
    <div class="card mb-16">
      <div class="detail-row">
        <span class="detail-label"><span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:var(--primary)">person</span> Customer</span>
        <span class="detail-value">${w.customerName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label"><span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:#2196f3">location_on</span> Village</span>
        <span class="detail-value">${w.village}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label"><span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:#4caf50">play_circle</span> Start Time</span>
        <span class="detail-value">${fmtTime(w.startTime)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label"><span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:#ff9800">currency_rupee</span> Rate</span>
        <span class="detail-value">₹${w.hourlyRate}/hr</span>
      </div>
      ${w.notes ? `<div class="detail-row"><span class="detail-label">Notes</span><span class="detail-value">${w.notes}</span></div>` : ''}
    </div>

    <!-- JCB Work Controls -->
    <div class="section-hdr"><span class="material-icons-round" style="font-size:14px">construction</span>JCB WORK</div>
    <div style="display:flex;gap:10px;margin-bottom:16px">
      <button class="btn" id="pause-resume-btn"
        style="height:58px;font-size:16px;font-weight:700;border-radius:16px;flex:1;${isPaused ? 'background:#4caf50;color:#fff' : 'background:#FF9800;color:#fff'}">
        <span class="material-icons-round" style="font-size:22px" id="pause-resume-icon">${isPaused ? 'play_arrow' : 'pause'}</span>
        <span id="pause-resume-label">${isPaused ? 'RESUME WORK' : 'PAUSE WORK'}</span>
      </button>
      <button class="btn btn-red" id="end-btn"
        style="height:58px;font-size:16px;font-weight:700;border-radius:16px;flex:1;">
        <span class="material-icons-round" style="font-size:22px">stop_circle</span> END WORK
      </button>
    </div>

    <!-- Loading / Trip Counter -->
    <div class="section-hdr" style="margin-top:4px">
      <span class="material-icons-round" style="font-size:14px">local_shipping</span>LOADING / TRIPS
    </div>

    <div id="loading-list" class="mb-12"></div>

    <button class="btn" id="add-vehicle-btn"
      style="background:rgba(249,196,0,.12);border:1.5px dashed rgba(249,196,0,.6);color:var(--text);height:50px;border-radius:14px;font-size:14px;font-weight:600;">
      <span class="material-icons-round" style="color:var(--primary)">add</span> ADD VEHICLE
    </button>

    <!-- Add Vehicle Modal -->
    <div id="vehicle-modal" class="overlay hidden">
      <div class="dialog" style="max-width:340px">
        <h3 style="margin-bottom:16px">Add Vehicle</h3>
        <div class="form-group">
          <label>Vehicle Type</label>
          <div class="vehicle-type-chips" id="vtype-chips" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px">
            <button class="vtype-chip active" data-type="Tractor" style="padding:8px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1.5px solid #F9C400;background:#F9C400;color:#1A1A1A;cursor:pointer;font-family:Roboto,sans-serif">🚜 Tractor</button>
            <button class="vtype-chip" data-type="Lorry"   style="padding:8px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1.5px solid var(--border);background:none;color:var(--text);cursor:pointer;font-family:Roboto,sans-serif">🚛 Lorry</button>
            <button class="vtype-chip" data-type="Truck"   style="padding:8px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1.5px solid var(--border);background:none;color:var(--text);cursor:pointer;font-family:Roboto,sans-serif">🚚 Truck</button>
            <button class="vtype-chip" data-type="Other"   style="padding:8px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1.5px solid var(--border);background:none;color:var(--text);cursor:pointer;font-family:Roboto,sans-serif">🚐 Other</button>
          </div>
        </div>
        <div class="form-group">
          <label>Vehicle Number</label>
          <div class="input-icon">
            <span class="material-icons-round">pin</span>
            <input id="vnumber-input" class="form-control" type="text" placeholder="e.g. TN 65 AB 1234" style="text-transform:uppercase"/>
          </div>
          <div class="form-error" id="err-vnumber">Vehicle number is required</div>
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn btn-outline" id="vm-cancel" style="flex:1">Cancel</button>
          <button class="btn btn-primary" id="vm-add" style="flex:1">Add Vehicle</button>
        </div>
      </div>
    </div>

    <button class="btn" id="home-btn"
      style="margin-top:12px;background:none;color:var(--text2);font-size:13px;height:40px;">
      <span class="material-icons-round" style="font-size:16px">home</span> Go to Home (work still running)
    </button>

    <div style="height:24px"></div>
  </div>
</div>`;

    RunningPage._renderLoadingList();
    RunningPage._wireEvents();
  },

  // ─────────────────────────────────────────────────────────
  _renderLoadingList() {
    const list = document.getElementById('loading-list');
    if (!list) return;
    const vehicles = RunningPage._work.loading || [];

    if (!vehicles.length) {
      list.innerHTML = `<div style="text-align:center;padding:12px;font-size:13px;color:var(--text2)">No vehicles added yet</div>`;
      return;
    }

    const totalTrips = vehicles.reduce((s, v) => s + v.trips, 0);

    list.innerHTML = vehicles.map((v, idx) => {
      const icon = RunningPage._vehicleIcon(v.vehicleType);
      return `
<div class="loading-vehicle-card" data-idx="${idx}">
  <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
    <div style="font-size:22px">${icon}</div>
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v.vehicleType} — ${v.vehicleNumber}</div>
      <div style="font-size:12px;color:var(--text2)">Trips: <strong style="color:var(--text);font-size:14px">${v.trips}</strong></div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:6px">
    <button class="trip-btn trip-minus" data-idx="${idx}"
      style="width:44px;height:44px;border-radius:12px;border:1.5px solid var(--border);background:var(--surface2);color:var(--text);font-size:22px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">−</button>
    <button class="trip-btn trip-plus" data-idx="${idx}"
      style="width:64px;height:44px;border-radius:12px;background:var(--primary);border:none;color:var(--secondary);font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:2px">
      <span style="font-size:16px;font-weight:900">+1</span>
    </button>
    <button class="trip-btn trip-del" data-idx="${idx}"
      style="width:40px;height:44px;border-radius:12px;border:none;background:rgba(244,67,54,.1);color:#f44336;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">
      <span class="material-icons-round" style="font-size:18px">delete</span>
    </button>
  </div>
</div>`;
    }).join('') + `
<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 4px 4px">
  <span style="font-size:13px;color:var(--text2)">Total Trips</span>
  <span style="font-size:16px;font-weight:900;color:var(--primary)">${totalTrips}</span>
</div>`;
  },

  // ─────────────────────────────────────────────────────────
  _wireEvents() {
    // Pause / Resume
    const pauseBtn = document.getElementById('pause-resume-btn');
    if (pauseBtn) {
      pauseBtn._lastClick = 0;
      pauseBtn.addEventListener('click', async () => {
        const now = Date.now();
        if (now - pauseBtn._lastClick < 1000) return; // debounce
        pauseBtn._lastClick = now;
        await RunningPage._togglePause();
      });
    }

    // End Work
    document.getElementById('end-btn').addEventListener('click', async () => {
      const confirmed = await App.confirm('End Work?', 'This will stop the timer and save the work record.', 'End Work', true);
      if (!confirmed) return;
      RunningPage._stopClock();

      const w        = RunningPage._work;
      const endTime  = new Date();
      const actualMinutes = calcActualWorkingMinutes({ ...w, endTime: endTime.toISOString() });
      const amount   = calcAmount(actualMinutes, w.hourlyRate);

      const completed = {
        ...w,
        status:          'completed',
        endTime:         endTime.toISOString(),
        workingMinutes:  actualMinutes,
        breakMinutes:    calcBreakMinutes(w),
        amount,
        profit: amount,
      };
      await updateWork(completed);
      App.navigate('end-work', { work: completed });
    });

    // Home
    document.getElementById('home-btn').addEventListener('click', () => App.navigate('home'));

    // Add Vehicle button
    document.getElementById('add-vehicle-btn').addEventListener('click', () => {
      document.getElementById('vehicle-modal').classList.remove('hidden');
      document.getElementById('vnumber-input').value = '';
      document.getElementById('err-vnumber').style.display = 'none';
      // Reset type chip selection
      document.querySelectorAll('.vtype-chip').forEach((c, i) => {
        c.style.background    = i === 0 ? '#F9C400' : 'none';
        c.style.borderColor   = i === 0 ? '#F9C400' : 'var(--border)';
        c.style.color         = i === 0 ? '#1A1A1A' : 'var(--text)';
        c.classList.toggle('active', i === 0);
      });
    });

    // Vehicle type chips
    document.getElementById('vtype-chips').addEventListener('click', e => {
      const chip = e.target.closest('.vtype-chip');
      if (!chip) return;
      document.querySelectorAll('.vtype-chip').forEach(c => {
        const sel = c === chip;
        c.style.background  = sel ? '#F9C400' : 'none';
        c.style.borderColor = sel ? '#F9C400' : 'var(--border)';
        c.style.color       = sel ? '#1A1A1A' : 'var(--text)';
        c.classList.toggle('active', sel);
      });
    });

    // Modal cancel
    document.getElementById('vm-cancel').addEventListener('click', () => {
      document.getElementById('vehicle-modal').classList.add('hidden');
    });

    // Modal add
    document.getElementById('vm-add').addEventListener('click', async () => {
      const numInput = document.getElementById('vnumber-input');
      const number   = numInput.value.trim().toUpperCase();
      if (!number) {
        document.getElementById('err-vnumber').style.display = 'block';
        return;
      }
      document.getElementById('err-vnumber').style.display = 'none';
      const typeChip = document.querySelector('.vtype-chip.active');
      const vtype    = typeChip ? typeChip.dataset.type : 'Tractor';

      RunningPage._work.loading.push({ vehicleType: vtype, vehicleNumber: number, trips: 0 });
      await updateWork(RunningPage._work);
      document.getElementById('vehicle-modal').classList.add('hidden');
      RunningPage._renderLoadingList();
      RunningPage._wireTripButtons();
    });

    // Auto-uppercase vehicle number
    document.getElementById('vnumber-input').addEventListener('input', e => {
      const pos = e.target.selectionStart;
      e.target.value = e.target.value.toUpperCase();
      e.target.setSelectionRange(pos, pos);
    });

    RunningPage._wireTripButtons();
  },

  _wireTripButtons() {
    // Trip + / −
    document.querySelectorAll('.trip-btn').forEach(btn => {
      btn._lastClick = btn._lastClick || 0;
      btn.addEventListener('click', async e => {
        const now = Date.now();
        if (now - btn._lastClick < 400) return; // debounce double-tap
        btn._lastClick = now;

        const idx = parseInt(btn.dataset.idx);
        const v   = RunningPage._work.loading[idx];
        if (!v) return;

        if (btn.classList.contains('trip-plus')) {
          v.trips += 1;
        } else if (btn.classList.contains('trip-minus')) {
          v.trips = Math.max(0, v.trips - 1);
        } else if (btn.classList.contains('trip-del')) {
          const ok = await App.confirm('Remove Vehicle?', `Remove ${v.vehicleType} — ${v.vehicleNumber}?`, 'Remove', true);
          if (!ok) return;
          RunningPage._work.loading.splice(idx, 1);
        }

        await updateWork(RunningPage._work);
        RunningPage._renderLoadingList();
        RunningPage._wireTripButtons();
      });
    });
  },

  // ─────────────────────────────────────────────────────────
  async _togglePause() {
    const w = RunningPage._work;

    if (w.status === 'running') {
      // → PAUSE
      w.status = 'paused';
      if (!Array.isArray(w.pauseSegments)) w.pauseSegments = [];
      w.pauseSegments.push({ pausedAt: new Date().toISOString(), resumedAt: null });
      await updateWork(w);
      RunningPage._stopClock();
      RunningPage._updatePauseUI(true);

    } else if (w.status === 'paused') {
      // → RESUME
      const openSeg = w.pauseSegments.find(s => !s.resumedAt);
      if (openSeg) openSeg.resumedAt = new Date().toISOString();
      w.status = 'running';
      await updateWork(w);
      RunningPage._startClock();
      RunningPage._updatePauseUI(false);
    }
  },

  _updatePauseUI(isPaused) {
    const header = document.getElementById('running-header-bar');
    const badge  = document.getElementById('status-badge');
    const icon   = document.getElementById('pause-resume-icon');
    const label  = document.getElementById('pause-resume-label');
    const btn    = document.getElementById('pause-resume-btn');
    const timer  = document.getElementById('timer-display');

    if (isPaused) {
      if (header) header.style.background = '#2d2d2d';
      if (badge)  { badge.style.background = '#FF9800'; badge.innerHTML = '<div class="running-dot" style="animation:none;opacity:1"></div>PAUSED'; }
      if (icon)   icon.textContent = 'play_arrow';
      if (label)  label.textContent = 'RESUME WORK';
      if (btn)    { btn.style.background = '#4caf50'; btn.style.color = '#fff'; }
      if (timer)  timer.classList.remove('pulse');
    } else {
      if (header) header.style.background = '';
      if (badge)  { badge.style.background = '#4caf50'; badge.innerHTML = '<div class="running-dot"></div>RUNNING'; }
      if (icon)   icon.textContent = 'pause';
      if (label)  label.textContent = 'PAUSE WORK';
      if (btn)    { btn.style.background = '#FF9800'; btn.style.color = '#fff'; }
      if (timer)  timer.classList.add('pulse');
    }
  },

  // ─────────────────────────────────────────────────────────
  _startClock() {
    RunningPage._stopClock();
    RunningPage._tick();
    RunningPage._timerInterval = setInterval(RunningPage._tick, 1000);
  },

  _stopClock() {
    clearInterval(RunningPage._timerInterval);
    RunningPage._timerInterval = null;
  },

  _tick() {
    const w = RunningPage._work;
    if (!w) return;

    // Elapsed since start
    const startMs   = new Date(w.startTime).getTime();
    const now       = Date.now();
    const elapsedMs = now - startMs;

    // Paused duration
    const pausedMs  = calcTotalPausedMs(w.pauseSegments || []);
    const workMs    = Math.max(0, elapsedMs - pausedMs);
    const breakMs   = pausedMs;

    const fmtMs = ms => {
      const s = Math.floor(ms / 1000);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      const pad = n => String(n).padStart(2, '0');
      return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
    };

    // Main timer shows total WORKING time (not break, not total elapsed)
    const timerEl = document.getElementById('timer-display');
    if (timerEl) timerEl.textContent = fmtMs(workMs);

    const workEl  = document.getElementById('work-time-display');
    if (workEl)  workEl.textContent  = fmtMs(workMs);

    const breakEl = document.getElementById('break-time-display');
    if (breakEl) breakEl.textContent = fmtMs(breakMs);

    // Stop ticking if no longer on running page
    if (!timerEl) RunningPage._stopClock();
  },

  // ─────────────────────────────────────────────────────────
  _vehicleIcon(type) {
    const map = { Tractor: '🚜', Lorry: '🚛', Truck: '🚚', Other: '🚐' };
    return map[type] || '🚗';
  },
};
