const RunningPage = {
  render(container, work) {
    if (!work) { App.navigate('home'); return; }
    container.innerHTML = `
<div class="page">
  <div class="running-header">
    <div style="display:flex;justify-content:center;margin-bottom:16px">
      <div class="running-badge"><div class="running-dot"></div>RUNNING</div>
    </div>
    <div class="timer-display pulse" id="timer-display">00:00</div>
    <div style="color:rgba(255,255,255,.5);font-size:13px;margin-top:6px">Work in Progress</div>
  </div>

  <div class="p-20">
    <div class="card mb-16">
      <div class="detail-row">
        <span class="detail-label"><span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:var(--primary)">person</span> Customer</span>
        <span class="detail-value">${work.customerName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label"><span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:#2196f3">location_on</span> Village</span>
        <span class="detail-value">${work.village}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label"><span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:#4caf50">play_circle</span> Start Time</span>
        <span class="detail-value">${fmtTime(work.startTime)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label"><span class="material-icons-round" style="font-size:16px;vertical-align:middle;color:#ff9800">currency_rupee</span> Rate</span>
        <span class="detail-value">₹${work.hourlyRate}/hr</span>
      </div>
      ${work.notes ? `<div class="detail-row"><span class="detail-label">Notes</span><span class="detail-value">${work.notes}</span></div>` : ''}
    </div>

    <button class="btn btn-red mt-8" id="end-btn" style="height:64px;font-size:20px;letter-spacing:1.5px;border-radius:18px;">
      <span class="material-icons-round" style="font-size:28px">stop_circle</span> END WORK
    </button>

    <button class="btn" id="home-btn" style="margin-top:10px;background:none;color:var(--text2);font-size:13px;height:40px;">
      <span class="material-icons-round" style="font-size:16px">home</span> Go to Home (work still running)
    </button>
  </div>
</div>`;

    App.startTimer(work);

    document.getElementById('home-btn').addEventListener('click', () => App.navigate('home'));

    document.getElementById('end-btn').addEventListener('click', async () => {
      const confirmed = await App.confirm('End Work?', 'Are you sure you want to end this work session?', 'End Work', true);
      if (!confirmed) return;

      App.stopTimer();
      const endTime = new Date();
      const startTime = new Date(work.startTime);
      const totalMinutes = Math.floor((endTime - startTime) / 60000);
      const amount = calcAmount(totalMinutes, work.hourlyRate);

      const completed = {
        ...work,
        endTime: endTime.toISOString(),
        workingMinutes: totalMinutes,
        amount,
        profit: amount,
        status: 'completed',
      };
      await updateWork(completed);
      App.navigate('end-work', { work: completed });
    });
  }
};
