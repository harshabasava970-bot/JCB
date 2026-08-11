// ── Running Work Page — Pause / Resume / End ──────────────
const RunningPage = {
  _timerInterval: null,
  _work: null,

  render(container, work) {
    if (!work) { App.navigate('home'); return; }
    RunningPage._work = work;
    if (!Array.isArray(work.pauseSegments)) work.pauseSegments = [];
    RunningPage._buildUI(container);
    RunningPage._startClock();
  },

  _buildUI(container) {
    const w        = RunningPage._work;
    const isPaused = w.status === 'paused';

    container.innerHTML = `
<div class="page">
  <!-- Header -->
  <div class="running-header" id="running-header-bar"
    style="${isPaused ? 'background:#2d2d2d' : ''}">
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
    <!-- Work Info -->
    <div class="card mb-16">
      <div class="detail-row">
        <span class="detail-label">
          <span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:var(--primary)">person</span> Customer
        </span>
        <span class="detail-value">${w.customerName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">
          <span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:#2196f3">location_on</span> Village
        </span>
        <span class="detail-value">${w.village}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">
          <span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:#4caf50">play_circle</span> Start Time
        </span>
        <span class="detail-value">${fmtTime(w.startTime)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">
          <span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:#ff9800">currency_rupee</span> Rate
        </span>
        <span class="detail-value">₹${w.hourlyRate}/hr</span>
      </div>
      ${w.notes ? `<div class="detail-row"><span class="detail-label">Notes</span><span class="detail-value">${w.notes}</span></div>` : ''}
    </div>

    <!-- Work Controls -->
    <div class="section-hdr">
      <span class="material-icons-round" style="font-size:14px">construction</span>JCB WORK
    </div>
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

    <button class="btn" id="home-btn"
      style="background:none;color:var(--text2);font-size:13px;height:40px;">
      <span class="material-icons-round" style="font-size:16px">home</span>
      Go to Home (work still running)
    </button>
    <div style="height:24px"></div>
  </div>
</div>`;

    RunningPage._wireEvents();
  },

  _wireEvents() {
    // Pause / Resume
    const pauseBtn = document.getElementById('pause-resume-btn');
    if (pauseBtn) {
      pauseBtn._lastClick = 0;
      pauseBtn.addEventListener('click', async () => {
        const now = Date.now();
        if (now - pauseBtn._lastClick < 1000) return;
        pauseBtn._lastClick = now;
        await RunningPage._togglePause();
      });
    }

    // End Work
    document.getElementById('end-btn').addEventListener('click', async () => {
      const confirmed = await App.confirm(
        'End Work?',
        'This will stop the timer and move to the work summary.',
        'End Work', true
      );
      if (!confirmed) return;
      RunningPage._stopClock();

      const w             = RunningPage._work;
      const endTime       = new Date();
      const actualMinutes = calcActualWorkingMinutes({ ...w, endTime: endTime.toISOString() });
      const amount        = calcAmount(actualMinutes, w.hourlyRate);

      const completed = {
        ...w,
        status:         'completed',
        endTime:        endTime.toISOString(),
        workingMinutes: actualMinutes,
        breakMinutes:   calcBreakMinutes(w),
        amount,
        profit: amount,
      };
      await updateWork(completed);
      App.navigate('end-work', { work: completed });
    });

    // Home
    document.getElementById('home-btn').addEventListener('click', () => App.navigate('home'));
  },

  async _togglePause() {
    const w = RunningPage._work;
    if (w.status === 'running') {
      w.status = 'paused';
      if (!Array.isArray(w.pauseSegments)) w.pauseSegments = [];
      w.pauseSegments.push({ pausedAt: new Date().toISOString(), resumedAt: null });
      await updateWork(w);
      RunningPage._stopClock();
      RunningPage._updatePauseUI(true);
    } else if (w.status === 'paused') {
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
      if (icon)   icon.textContent  = 'play_arrow';
      if (label)  label.textContent = 'RESUME WORK';
      if (btn)    { btn.style.background = '#4caf50'; btn.style.color = '#fff'; }
      if (timer)  timer.classList.remove('pulse');
    } else {
      if (header) header.style.background = '';
      if (badge)  { badge.style.background = '#4caf50'; badge.innerHTML = '<div class="running-dot"></div>RUNNING'; }
      if (icon)   icon.textContent  = 'pause';
      if (label)  label.textContent = 'PAUSE WORK';
      if (btn)    { btn.style.background = '#FF9800'; btn.style.color = '#fff'; }
      if (timer)  timer.classList.add('pulse');
    }
  },

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

    const startMs   = new Date(w.startTime).getTime();
    const now       = Date.now();
    const elapsedMs = now - startMs;
    const pausedMs  = calcTotalPausedMs(w.pauseSegments || []);
    const workMs    = Math.max(0, elapsedMs - pausedMs);
    const breakMs   = pausedMs;

    const fmtMs = ms => {
      const s   = Math.floor(ms / 1000);
      const h   = Math.floor(s / 3600);
      const m   = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      const pad = n => String(n).padStart(2, '0');
      return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
    };

    const timerEl = document.getElementById('timer-display');
    if (!timerEl) { RunningPage._stopClock(); return; }
    timerEl.textContent = fmtMs(workMs);

    const workEl  = document.getElementById('work-time-display');
    const breakEl = document.getElementById('break-time-display');
    if (workEl)  workEl.textContent  = fmtMs(workMs);
    if (breakEl) breakEl.textContent = fmtMs(breakMs);
  },
};
