const HistoryPage = {
  currentFilter: 'All',
  searchQuery: '',

  async render(container) {
    container.innerHTML = `
<div class="page">
  <div class="appbar">
    <button class="appbar-back" onclick="App.navigate('home')"><span class="material-icons-round">arrow_back_ios_new</span></button>
    <h1>Work History</h1>
    <span id="hist-count" style="font-size:12px;font-weight:600;background:rgba(0,0,0,.15);padding:3px 10px;border-radius:10px;color:var(--secondary)"></span>
  </div>

  <div style="background:var(--surface);padding:12px 16px 8px;border-bottom:1px solid var(--border)">
    <div class="search-bar mb-8">
      <span class="material-icons-round">search</span>
      <input id="hist-search" class="form-control" type="text" placeholder="Search by name, village, mobile..." style="height:44px"/>
      <button class="search-clear hidden" id="hist-clear"><span class="material-icons-round">close</span></button>
    </div>
    <div class="chips">
      <button class="chip chip-all active" data-filter="All">All</button>
      <button class="chip chip-paid" data-filter="Paid">Paid</button>
      <button class="chip chip-pending" data-filter="Pending">Pending</button>
      <button class="chip chip-partial" data-filter="Partially Paid">Partially Paid</button>
    </div>
  </div>

  <div class="p-16" id="hist-list"><div class="spinner"></div></div>
</div>`;

    HistoryPage.currentFilter = 'All';
    HistoryPage.searchQuery = '';
    await HistoryPage.loadList();

    document.getElementById('hist-search').addEventListener('input', async e => {
      HistoryPage.searchQuery = e.target.value;
      document.getElementById('hist-clear').classList.toggle('hidden', !e.target.value);
      await HistoryPage.loadList();
    });

    document.getElementById('hist-clear').addEventListener('click', async () => {
      document.getElementById('hist-search').value = '';
      HistoryPage.searchQuery = '';
      document.getElementById('hist-clear').classList.add('hidden');
      await HistoryPage.loadList();
    });

    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', async () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        HistoryPage.currentFilter = chip.dataset.filter;
        await HistoryPage.loadList();
      });
    });
  },

  async loadList() {
    const works = await getCompletedWorks({
      search: HistoryPage.searchQuery,
      payment: HistoryPage.currentFilter,
    });
    const list = document.getElementById('hist-list');
    const countEl = document.getElementById('hist-count');
    if (countEl) countEl.textContent = `${works.length} records`;

    if (!works.length) {
      list.innerHTML = `<div class="empty-state"><span class="material-icons-round">work_off</span>No records found<br><small>Start a new work to see records here</small></div>`;
      return;
    }
    list.innerHTML = works.map(w => `
<div class="work-card" data-id="${w.id}">
  <div class="work-card-top">
    <div class="wc-avatar">${w.customerName[0].toUpperCase()}</div>
    <div class="wc-info">
      <div class="wc-name">${w.customerName}</div>
      <div class="wc-village"><span class="material-icons-round" style="font-size:12px">location_on</span>${w.village}</div>
    </div>
    <div>
      <div class="wc-amount">${fmtCurrency(w.amount)}</div>
      <div class="pay-badge ${payBadgeClass(w.paymentStatus)}">${w.paymentStatus}</div>
    </div>
  </div>
  <div class="work-card-bottom">
    <div class="wc-meta"><span class="material-icons-round">calendar_today</span>${fmtDate(w.date)}</div>
    <div class="wc-meta"><span class="material-icons-round">timer</span>${fmtDuration(w.workingMinutes)}</div>
    <div class="wc-meta"><span class="material-icons-round">phone</span>${w.mobileNumber || 'N/A'}</div>
  </div>
</div>`).join('');

    list.querySelectorAll('.work-card').forEach(card => {
      card.addEventListener('click', async () => {
        const work = await getWorkById(parseInt(card.dataset.id));
        if (work) App.navigate('detail', { work });
      });
    });
  }
};
