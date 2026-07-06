// ── JCB Working - IndexedDB Database Layer ────────────────
const DB_NAME = 'jcb_working_db';
const DB_VERSION = 1;
let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const d = e.target.result;
      // Works store
      if (!d.objectStoreNames.contains('works')) {
        const ws = d.createObjectStore('works', { keyPath: 'id', autoIncrement: true });
        ws.createIndex('status', 'status');
        ws.createIndex('date', 'date');
        ws.createIndex('customerName', 'customerName');
      }
      // Customers store
      if (!d.objectStoreNames.contains('customers')) {
        const cs = d.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
        cs.createIndex('mobile', 'mobileNumber', { unique: false });
        cs.createIndex('name', 'name');
      }
    };
    req.onsuccess = e => { db = e.target.result; resolve(db); };
    req.onerror = e => reject(e.target.error);
  });
}

// ── Works ────────────────────────────────────────────────
async function addWork(work) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction('works', 'readwrite');
    const req = tx.objectStore('works').add(work);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

async function updateWork(work) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction('works', 'readwrite');
    const req = tx.objectStore('works').put(work);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}

async function deleteWork(id) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction('works', 'readwrite');
    const req = tx.objectStore('works').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}

async function getWorkById(id) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction('works', 'readonly');
    const req = tx.objectStore('works').get(id);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

async function getAllWorks() {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction('works', 'readonly');
    const req = tx.objectStore('works').getAll();
    req.onsuccess = e => resolve(e.target.result.reverse());
    req.onerror = e => reject(e.target.error);
  });
}

async function getActiveWork() {
  const all = await getAllWorks();
  return all.find(w => w.status === 'running') || null;
}

async function getCompletedWorks(filter = {}) {
  let works = await getAllWorks();
  works = works.filter(w => w.status === 'completed');
  if (filter.search) {
    const q = filter.search.toLowerCase();
    works = works.filter(w =>
      w.customerName.toLowerCase().includes(q) ||
      w.village.toLowerCase().includes(q) ||
      (w.mobileNumber || '').includes(q)
    );
  }
  if (filter.payment && filter.payment !== 'All') {
    works = works.filter(w => w.paymentStatus === filter.payment);
  }
  if (filter.fromDate) works = works.filter(w => w.date >= filter.fromDate);
  if (filter.toDate)   works = works.filter(w => w.date <= filter.toDate);
  return works;
}

async function getWorksByCustomer(name, village) {
  const all = await getAllWorks();
  return all.filter(w => w.status === 'completed' && w.customerName === name && w.village === village);
}

async function getDashboardStats() {
  const works = await getAllWorks();
  const completed = works.filter(w => w.status === 'completed');
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + '-01';
  const todayWorks   = completed.filter(w => w.date === today);
  const monthWorks   = completed.filter(w => w.date >= monthStart);
  return {
    todayJobs:      todayWorks.length,
    todayEarnings:  todayWorks.reduce((s, w) => s + w.amount, 0),
    monthlyJobs:    monthWorks.length,
    monthlyEarnings:monthWorks.reduce((s, w) => s + w.amount, 0),
  };
}

async function getReportStats(fromDate, toDate) {
  const works = await getCompletedWorks({ fromDate, toDate });
  return {
    totalJobs:     works.length,
    totalEarnings: works.reduce((s, w) => s + w.amount, 0),
    totalDiesel:   works.reduce((s, w) => s + (w.dieselExpense || 0), 0),
    totalProfit:   works.reduce((s, w) => s + (w.profit || 0), 0),
    totalMinutes:  works.reduce((s, w) => s + (w.workingMinutes || 0), 0),
  };
}

async function getMonthlyChartData(year) {
  const from = `${year}-01-01`, to = `${year}-12-31`;
  const works = await getCompletedWorks({ fromDate: from, toDate: to });
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, earnings: 0, jobs: 0 }));
  works.forEach(w => {
    const m = parseInt(w.date.slice(5, 7)) - 1;
    months[m].earnings += w.amount;
    months[m].jobs += 1;
  });
  return months;
}

// ── Customers ─────────────────────────────────────────────
async function getAllCustomers() {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction('customers', 'readonly');
    const req = tx.objectStore('customers').getAll();
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

async function searchCustomers(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const all = await getAllCustomers();
  return all.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.village.toLowerCase().includes(q) ||
    (c.mobileNumber || '').includes(q)
  ).slice(0, 8);
}

async function getCustomerByMobile(mobile) {
  if (!mobile) return null;
  const all = await getAllCustomers();
  return all.find(c => c.mobileNumber === mobile) || null;
}

async function upsertCustomer(work) {
  if (work.status !== 'completed') return;
  const all = await getAllCustomers();
  let existing = work.mobileNumber
    ? all.find(c => c.mobileNumber === work.mobileNumber)
    : all.find(c => c.name === work.customerName && c.village === work.village);

  const d = await openDB();
  if (!existing) {
    await new Promise((res, rej) => {
      const tx = d.transaction('customers', 'readwrite');
      tx.objectStore('customers').add({
        name: work.customerName, village: work.village,
        mobileNumber: work.mobileNumber || '',
        totalJobs: 1, totalAmount: work.amount,
        lastWorkDate: work.date, createdAt: new Date().toISOString()
      });
      tx.oncomplete = res; tx.onerror = e => rej(e.target.error);
    });
  } else {
    existing.totalJobs = (existing.totalJobs || 0) + 1;
    existing.totalAmount = (existing.totalAmount || 0) + work.amount;
    existing.lastWorkDate = work.date;
    existing.name = work.customerName;
    existing.village = work.village;
    await new Promise((res, rej) => {
      const tx = d.transaction('customers', 'readwrite');
      tx.objectStore('customers').put(existing);
      tx.oncomplete = res; tx.onerror = e => rej(e.target.error);
    });
  }
}

// ── Settings (localStorage) ───────────────────────────────
const Settings = {
  get: key => {
    const s = JSON.parse(localStorage.getItem('jcb_settings') || '{}');
    const defaults = { hourlyRate: 1300, darkMode: false, language: 'English', ownerName: '', ownerMobile: '' };
    return key ? (s[key] !== undefined ? s[key] : defaults[key]) : { ...defaults, ...s };
  },
  set: (key, val) => {
    const s = JSON.parse(localStorage.getItem('jcb_settings') || '{}');
    s[key] = val;
    localStorage.setItem('jcb_settings', JSON.stringify(s));
  },
  setAll: obj => {
    const s = JSON.parse(localStorage.getItem('jcb_settings') || '{}');
    Object.assign(s, obj);
    localStorage.setItem('jcb_settings', JSON.stringify(s));
  }
};

// ── Auth (localStorage) ───────────────────────────────────
const Auth = {
  isLoggedIn: () => !!localStorage.getItem('jcb_user'),
  login: (name, mobile) => localStorage.setItem('jcb_user', JSON.stringify({ name, mobile })),
  getUser: () => JSON.parse(localStorage.getItem('jcb_user') || 'null'),
  logout: () => localStorage.removeItem('jcb_user'),
};

// ── Format Helpers ────────────────────────────────────────
function fmtCurrency(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}
function fmtDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(isoStr) {
  if (!isoStr) return '-';
  return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function fmtDuration(mins) {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function monthStartStr() { return todayStr().slice(0, 7) + '-01'; }
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
}
function payBadgeClass(status) {
  if (status === 'Paid') return 'pay-paid';
  if (status === 'Pending') return 'pay-pending';
  return 'pay-partial';
}
function calcAmount(minutes, rate) { return Math.round((minutes / 60) * rate); }
