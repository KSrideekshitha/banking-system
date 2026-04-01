// ===== STATE =====
let currentToken = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  if (currentToken && currentUser) {
    checkAndRedirect();
  }
});

// ===== PAGE NAVIGATION =====
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(`page-${page}`);
  if (el) el.classList.add('active');
  clearMessages();
}

function clearMessages() {
  document.querySelectorAll('.message').forEach(m => {
    m.classList.add('hidden');
    m.className = 'message hidden';
    m.textContent = '';
  });
}

function showMessage(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `message ${type}`;
  el.textContent = text;
}

// ===== AUTH =====
async function handleSignup() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  if (!name || !email || !password)
    return showMessage('signup-msg', 'Please fill in all fields.', 'error');

  try {
    const res = await post('/api/auth/signup', { name, email, password });
    if (res.error) return showMessage('signup-msg', res.error, 'error');
    saveSession(res.token, res.user);
    showMessage('signup-msg', 'Account created! Redirecting...', 'success');
    setTimeout(() => checkAndRedirect(), 800);
  } catch {
    showMessage('signup-msg', 'Server error. Please try again.', 'error');
  }
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password)
    return showMessage('login-msg', 'Please enter email and password.', 'error');

  try {
    const res = await post('/api/auth/login', { email, password });
    if (res.error) return showMessage('login-msg', res.error, 'error');
    saveSession(res.token, res.user);
    showMessage('login-msg', 'Login successful! Redirecting...', 'success');
    setTimeout(() => checkAndRedirect(), 700);
  } catch {
    showMessage('login-msg', 'Server error. Please try again.', 'error');
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentToken = null;
  currentUser = null;
  showPage('landing');
}

function saveSession(token, user) {
  currentToken = token;
  currentUser = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

async function checkAndRedirect() {
  try {
    const profile = await get('/api/bank/profile');
    if (profile.error) return handleLogout();
    currentUser = profile;
    localStorage.setItem('user', JSON.stringify(profile));

    if (profile.balance === 0) {
      document.getElementById('deposit-only-name').textContent = profile.name;
      showPage('deposit-only');
    } else {
      loadDashboard(profile);
      showPage('dashboard');
    }
  } catch {
    handleLogout();
  }
}

// ===== DEPOSIT ONLY =====
async function handleDepositOnly() {
  const amount = document.getElementById('deposit-only-amount').value;
  if (!amount || isNaN(amount) || Number(amount) <= 0)
    return showMessage('deposit-only-msg', 'Please enter a valid amount.', 'error');

  try {
    const res = await post('/api/bank/deposit', { amount });
    if (res.error) return showMessage('deposit-only-msg', res.error, 'error');
    showMessage('deposit-only-msg', res.message, 'success');
    currentUser.balance = res.balance;
    localStorage.setItem('user', JSON.stringify(currentUser));
    setTimeout(() => {
      loadDashboard(currentUser);
      showPage('dashboard');
    }, 800);
  } catch {
    showMessage('deposit-only-msg', 'Server error.', 'error');
  }
}

// ===== DASHBOARD =====
function loadDashboard(user) {
  document.getElementById('dash-name').textContent = user.name;
  document.getElementById('dash-balance').textContent = `₹${Number(user.balance).toFixed(2)}`;
  updateBalanceTab(user);
}

function switchTab(tabName, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');
  btn.classList.add('active');
  clearMessages();
  if (tabName === 'history') loadTransactions();
  if (tabName === 'balance') refreshBalance();
}

function updateBalanceDisplay(balance) {
  document.getElementById('dash-balance').textContent = `₹${Number(balance).toFixed(2)}`;
  currentUser.balance = balance;
  localStorage.setItem('user', JSON.stringify(currentUser));
}

async function handleDeposit() {
  const amount = document.getElementById('deposit-amount').value;
  if (!amount || Number(amount) <= 0)
    return showMessage('deposit-msg', 'Enter a valid amount.', 'error');
  try {
    const res = await post('/api/bank/deposit', { amount });
    if (res.error) return showMessage('deposit-msg', res.error, 'error');
    showMessage('deposit-msg', res.message, 'success');
    updateBalanceDisplay(res.balance);
    document.getElementById('deposit-amount').value = '';
  } catch {
    showMessage('deposit-msg', 'Server error.', 'error');
  }
}

async function handleWithdraw() {
  const amount = document.getElementById('withdraw-amount').value;
  if (!amount || Number(amount) <= 0)
    return showMessage('withdraw-msg', 'Enter a valid amount.', 'error');
  try {
    const res = await post('/api/bank/withdraw', { amount });
    if (res.error) return showMessage('withdraw-msg', res.error, 'error');
    showMessage('withdraw-msg', res.message, 'success');
    updateBalanceDisplay(res.balance);
    document.getElementById('withdraw-amount').value = '';
  } catch {
    showMessage('withdraw-msg', 'Server error.', 'error');
  }
}

async function handleTransfer() {
  const email = document.getElementById('transfer-email').value.trim();
  const amount = document.getElementById('transfer-amount').value;
  if (!email || !amount || Number(amount) <= 0)
    return showMessage('transfer-msg', 'Enter recipient email and a valid amount.', 'error');
  try {
    const res = await post('/api/bank/transfer', { amount, recipientEmail: email });
    if (res.error) return showMessage('transfer-msg', res.error, 'error');
    showMessage('transfer-msg', res.message, 'success');
    updateBalanceDisplay(res.balance);
    document.getElementById('transfer-email').value = '';
    document.getElementById('transfer-amount').value = '';
  } catch {
    showMessage('transfer-msg', 'Server error.', 'error');
  }
}

async function refreshBalance() {
  try {
    const profile = await get('/api/bank/profile');
    if (profile.error) return;
    updateBalanceDisplay(profile.balance);
    updateBalanceTab(profile);
  } catch {}
}

function updateBalanceTab(user) {
  document.getElementById('tab-balance-amount').textContent = `₹${Number(user.balance).toFixed(2)}`;
  document.getElementById('tab-balance-name').textContent = user.name;
  document.getElementById('tab-balance-email').textContent = user.email;
  if (user.created_at) {
    const date = new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('tab-balance-since').textContent = `Member since ${date}`;
  }
}

async function loadTransactions() {
  const tbody = document.getElementById('tx-tbody');
  tbody.innerHTML = `<tr><td colspan="6" class="no-data">Loading...</td></tr>`;
  try {
    const txns = await get('/api/bank/transactions');
    if (!txns.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="no-data">No transactions yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = txns.map((tx, i) => {
      const typeMeta = {
        deposit:      { label: '↑ Deposit',      cls: 'deposit',      amtCls: 'green',  sign: '+' },
        withdraw:     { label: '↓ Withdraw',     cls: 'withdraw',     amtCls: 'red',    sign: '-' },
        transfer_in:  { label: '← Transfer In',  cls: 'transfer-in',  amtCls: 'blue',   sign: '+' },
        transfer_out: { label: '→ Transfer Out', cls: 'transfer-out', amtCls: 'orange', sign: '-' },
      };
      const m = typeMeta[tx.type] || { label: tx.type, cls: '', amtCls: '', sign: '' };
      const date = new Date(tx.created_at).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      return `
        <tr>
          <td style="color: var(--text3); font-size:12px">#${txns.length - i}</td>
          <td><span class="tx-badge ${m.cls}">${m.label}</span></td>
          <td><span class="tx-amount ${m.amtCls}">${m.sign}₹${Number(tx.amount).toFixed(2)}</span></td>
          <td style="color: var(--text2); font-size:13px">${tx.description}</td>
          <td style="font-family: 'Syne', sans-serif; font-weight:600">₹${Number(tx.balance_after).toFixed(2)}</td>
          <td style="color: var(--text3); font-size:12px">${date}</td>
        </tr>`;
    }).join('');
  } catch {
    tbody.innerHTML = `<tr><td colspan="6" class="no-data">Failed to load transactions.</td></tr>`;
  }
}

// ===== HTTP HELPERS =====
async function post(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function get(url) {
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${currentToken}` },
  });
  return res.json();
}

// Enter key support
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const active = document.querySelector('.page.active');
  if (!active) return;
  const id = active.id;
  if (id === 'page-login') handleLogin();
  else if (id === 'page-signup') handleSignup();
});
