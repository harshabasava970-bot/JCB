// ── JCB Working - Main App Controller ────────────────────
const App = {
  currentPage: null,

  async init() {
    if (Settings.get('darkMode')) document.body.classList.add('dark');

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        if (page) App.navigate(page);
      });
    });

    document.getElementById('confirm-cancel').addEventListener('click', () => {
      document.getElementById('confirm-overlay').classList.add('hidden');
      if (App._confirmReject) App._confirmReject(false);
    });
    document.getElementById('confirm-ok').addEventListener('click', () => {
      document.getElementById('confirm-overlay').classList.add('hidden');
      if (App._confirmResolve) App._confirmResolve(true);
    });

    if (!Auth.isLoggedIn()) {
      App.navigate('login');
      return;
    }

    const active = await getActiveWork();
    if (active) {
      App.navigate('running', { work: active });
    } else {
      App.navigate('home');
    }
  },

  navigate(page, params = {}) {
    if (App.currentPage === 'running' && page !== 'running') {
      if (RunningPage && RunningPage._stopClock) RunningPage._stopClock();
    }

    App.currentPage = page;
    const container = document.getElementById('page-container');
    const nav       = document.getElementById('bottom-nav');

    const noNavPages = ['login', 'running'];
    if (noNavPages.includes(page)) {
      nav.classList.add('hidden');
    } else {
      if (Auth.isLoggedIn()) nav.classList.remove('hidden');
    }

    document.querySelectorAll('.nav-btn').forEach(b => {
      const active = b.dataset.page === page ||
        (b.dataset.page === 'loading' && page === 'loading') ||
        (b.dataset.page === 'history' && page === 'detail') ||
        (b.dataset.page === 'history' && page === 'customer-history');
      b.classList.toggle('active', active);
    });

    const pages = {
      login:              () => LoginPage.render(container),
      home:               () => HomePage.render(container),
      'start-work':       () => StartWorkPage.render(container),
      running:            () => RunningPage.render(container, params.work),
      'end-work':         () => EndWorkPage.render(container, params.work),
      history:            () => HistoryPage.render(container),
      detail:             () => DetailPage.render(container, params.work),
      loading:            () => LoadingPage.render(container, params),
      reports:            () => ReportsPage.render(container),
      settings:           () => SettingsPage.render(container),
      'customer-history': () => CustomerHistoryPage.render(container, params),
    };

    if (pages[page]) {
      container.innerHTML = '';
      pages[page]();
    }
  },

  showToast(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className   = 'toast' + (type ? ' ' + type : '');
    t.classList.remove('hidden');
    clearTimeout(App._toastTimer);
    App._toastTimer = setTimeout(() => t.classList.add('hidden'), 3000);
  },

  confirm(title, msg, confirmText = 'Confirm', danger = true) {
    return new Promise((resolve, reject) => {
      App._confirmResolve = resolve;
      App._confirmReject  = reject;
      document.getElementById('confirm-title').textContent = title;
      document.getElementById('confirm-msg').textContent   = msg;
      const okBtn = document.getElementById('confirm-ok');
      okBtn.textContent = confirmText;
      okBtn.className   = danger ? 'btn-danger' : 'btn-green';
      document.getElementById('confirm-overlay').classList.remove('hidden');
    });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
