/**
 * Expense & Budget Visualizer
 * app.js — Vanilla JS, no frameworks
 *
 * MVP Features:
 *  - Input form (name, amount, category) with validation
 *  - Transaction list with delete
 *  - Total balance (auto-updated)
 *  - Pie chart via Chart.js (auto-updated)
 *
 * Optional Features (3 chosen):
 *  1. Dark / Light mode toggle
 *  2. Sort transactions (newest, oldest, amount ↓↑, category)
 *  3. Highlight spending over a set limit
 *  + Bonus: Custom categories, Monthly summary view
 */

'use strict';

/* ============================================================
   Constants & State
   ============================================================ */
const STORAGE_KEY_TRANSACTIONS = 'ebv_transactions';
const STORAGE_KEY_THEME         = 'ebv_theme';
const STORAGE_KEY_LIMIT         = 'ebv_limit';
const STORAGE_KEY_CATEGORIES    = 'ebv_categories';

const DEFAULT_CATEGORIES = [
  { value: 'Food',      label: '🍔 Food',      icon: '🍔' },
  { value: 'Transport', label: '🚌 Transport',  icon: '🚌' },
  { value: 'Fun',       label: '🎮 Fun',        icon: '🎮' },
];

// Chart.js colour palette for categories
const CATEGORY_COLORS = {
  Food:      '#f97316',
  Transport: '#3b82f6',
  Fun:       '#a855f7',
};

// Fallback colours for custom categories (cycle through)
const EXTRA_COLORS = [
  '#10b981','#ef4444','#f59e0b','#06b6d4',
  '#e11d48','#8b5cf6','#84cc16','#f43f5e',
];

/** @type {Transaction[]} */
let transactions = [];

/** @type {string[]} custom category names */
let customCategories = [];

/** @type {number|null} spending limit in Rp */
let spendingLimit = null;

/** @type {'light'|'dark'} */
let currentTheme = 'light';

/** currently viewed month offset (0 = current month) */
let monthOffset = 0;

/** Chart.js instance */
let chartInstance = null;

/* ============================================================
   Persistence Layer
   ============================================================ */
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
}

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    transactions = raw ? JSON.parse(raw) : [];
  } catch (e) {
    transactions = [];
  }
}

function saveTheme() {
  localStorage.setItem(STORAGE_KEY_THEME, currentTheme);
}

function loadTheme() {
  currentTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'light';
}

function saveLimit() {
  localStorage.setItem(STORAGE_KEY_LIMIT, spendingLimit !== null ? String(spendingLimit) : '');
}

function loadLimit() {
  const raw = localStorage.getItem(STORAGE_KEY_LIMIT);
  const parsed = parseFloat(raw);
  spendingLimit = !isNaN(parsed) && parsed > 0 ? parsed : null;
}

function saveCategories() {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(customCategories));
}

function loadCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    customCategories = raw ? JSON.parse(raw) : [];
  } catch (e) {
    customCategories = [];
  }
}

/* ============================================================
   Utility Functions
   ============================================================ */

// Format number to Rupiah string: "Rp 25.000"
function formatRp(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// Format ISO date string to "12 Jan 2025"
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Generate unique ID based on timestamp + random
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Return CSS class slug for category
function getCategorySlug(cat) {
  const slugs = { Food: 'food', Transport: 'transport', Fun: 'fun' };
  return slugs[cat] || 'custom';
}

// Return emoji icon for category
function getCategoryIcon(cat) {
  const icons = { Food: '🍔', Transport: '🚌', Fun: '🎮' };
  return icons[cat] || '🏷️';
}

// Return deterministic hex color for category
function getCategoryColor(cat) {
  if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
  // Deterministic hash for custom categories: (hash * 31 + charCode) % EXTRA_COLORS.length
  let hash = 0;
  for (let i = 0; i < cat.length; i++) {
    hash = (hash * 31 + cat.charCodeAt(i)) % EXTRA_COLORS.length;
  }
  return EXTRA_COLORS[Math.abs(hash) % EXTRA_COLORS.length];
}

/** Return all category definitions (defaults + customs) */
function getAllCategories() {
  const customs = customCategories.map(name => ({
    value: name,
    label: '🏷️ ' + name,
    icon: '🏷️',
  }));
  return [...DEFAULT_CATEGORIES, ...customs];
}

/* ============================================================
   DOM References
   ============================================================ */
const dom = {
  // Balance
  totalBalance:      document.getElementById('totalBalance'),
  totalTransactions: document.getElementById('totalTransactions'),
  totalCategories:   document.getElementById('totalCategories'),

  // Form
  form:                document.getElementById('transactionForm'),
  itemName:            document.getElementById('itemName'),
  amount:              document.getElementById('amount'),
  category:            document.getElementById('category'),
  customCategoryGroup: document.getElementById('customCategoryGroup'),
  customCategory:      document.getElementById('customCategory'),
  itemNameError:       document.getElementById('itemNameError'),
  amountError:         document.getElementById('amountError'),
  categoryError:       document.getElementById('categoryError'),
  customCategoryError: document.getElementById('customCategoryError'),

  // Limit
  spendingLimit: document.getElementById('spendingLimit'),
  setLimitBtn:   document.getElementById('setLimitBtn'),
  limitInfo:     document.getElementById('limitInfo'),
  limitBanner:   document.getElementById('limitBanner'),
  limitMessage:  document.getElementById('limitMessage'),
  dismissBanner: document.getElementById('dismissBanner'),

  // Chart
  expenseChart: document.getElementById('expenseChart'),
  chartEmpty:   document.getElementById('chartEmpty'),

  // Monthly summary
  prevMonth:       document.getElementById('prevMonth'),
  nextMonth:       document.getElementById('nextMonth'),
  monthLabel:      document.getElementById('monthLabel'),
  monthlySummary:  document.getElementById('monthlySummary'),

  // List
  transactionList: document.getElementById('transactionList'),
  sortSelect:      document.getElementById('sortSelect'),
  clearAllBtn:     document.getElementById('clearAllBtn'),

  // Theme
  themeToggle: document.getElementById('themeToggle'),
  themeIcon:   document.getElementById('themeIcon'),
};

/* ============================================================
   Theme
   ============================================================ */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  dom.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  // Update Chart.js text colour if chart exists
  if (chartInstance) {
    const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    chartInstance.options.plugins.legend.labels.color = textColor;
    chartInstance.update();
  }
}

dom.themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(currentTheme);
  saveTheme();
});

/* ============================================================
   Category Select (with custom option)
   ============================================================ */
function rebuildCategorySelect() {
  const current = dom.category.value;
  dom.category.innerHTML = '<option value="">-- Select Category --</option>';

  getAllCategories().forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.value;
    opt.textContent = cat.label;
    dom.category.appendChild(opt);
  });

  // Always add "Add custom…" option at the bottom
  const addOpt = document.createElement('option');
  addOpt.value = '__custom__';
  addOpt.textContent = '➕ Add custom category…';
  dom.category.appendChild(addOpt);

  // Restore previous selection if still valid
  if (current && current !== '__custom__') dom.category.value = current;
}

dom.category.addEventListener('change', () => {
  if (dom.category.value === '__custom__') {
    dom.customCategoryGroup.classList.remove('hidden');
    dom.customCategory.focus();
  } else {
    dom.customCategoryGroup.classList.add('hidden');
    dom.customCategoryError.textContent = '';
  }
});

/* ============================================================
   Form Validation
   ============================================================ */
function clearErrors() {
  [dom.itemNameError, dom.amountError, dom.categoryError, dom.customCategoryError].forEach(el => {
    el.textContent = '';
  });
  [dom.itemName, dom.amount, dom.category, dom.customCategory].forEach(el => {
    el.classList.remove('input-error');
  });
}

function validateForm() {
  clearErrors();
  let valid = true;

  const name = dom.itemName.value.trim();
  const amt  = dom.amount.value.trim();
  const cat  = dom.category.value;

  if (!name) {
    dom.itemNameError.textContent = 'Item name is required.';
    dom.itemName.classList.add('input-error');
    valid = false;
  }

  if (!amt || isNaN(Number(amt)) || Number(amt) <= 0) {
    dom.amountError.textContent = 'Enter a valid positive amount.';
    dom.amount.classList.add('input-error');
    valid = false;
  }

  if (!cat) {
    dom.categoryError.textContent = 'Please select a category.';
    dom.category.classList.add('input-error');
    valid = false;
  }

  if (cat === '__custom__') {
    const customName = dom.customCategory.value.trim();
    if (!customName) {
      dom.customCategoryError.textContent = 'Enter your custom category name.';
      dom.customCategory.classList.add('input-error');
      valid = false;
    }
  }

  return valid;
}

/* ============================================================
   Add Transaction
   ============================================================ */
dom.form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  let cat = dom.category.value;

  // Handle custom category
  if (cat === '__custom__') {
    const customName = dom.customCategory.value.trim();
    // Register custom category if not already present
    if (!customCategories.includes(customName)) {
      customCategories.push(customName);
      saveCategories();
      rebuildCategorySelect();
    }
    cat = customName;
  }

  /** @type {Transaction} */
  const tx = {
    id:        generateId(),
    name:      dom.itemName.value.trim(),
    amount:    parseFloat(dom.amount.value),
    category:  cat,
    createdAt: new Date().toISOString(),
  };

  transactions.push(tx);
  saveTransactions();

  // Reset form
  dom.form.reset();
  dom.customCategoryGroup.classList.add('hidden');
  clearErrors();

  renderAll();
});

/* ============================================================
   Delete Transaction
   ============================================================ */
function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveTransactions();
  renderAll();
}

/* ============================================================
   Clear All
   ============================================================ */
dom.clearAllBtn.addEventListener('click', () => {
  if (transactions.length === 0) return;
  if (!confirm('Delete all transactions? This cannot be undone.')) return;
  transactions = [];
  saveTransactions();
  renderAll();
});

/* ============================================================
   Spending Limit
   ============================================================ */
dom.setLimitBtn.addEventListener('click', () => {
  const val = parseFloat(dom.spendingLimit.value);
  if (!dom.spendingLimit.value || isNaN(val) || val <= 0) {
    dom.limitInfo.textContent = '⚠️ Enter a valid positive limit.';
    dom.limitInfo.style.color = 'var(--clr-danger)';
    return;
  }
  spendingLimit = val;
  saveLimit();
  dom.limitInfo.style.color = 'var(--clr-success)';
  dom.limitInfo.textContent = `✔ Limit set to ${formatRp(val)}`;
  renderAll();
});

dom.dismissBanner.addEventListener('click', () => {
  dom.limitBanner.classList.add('hidden');
});

function checkSpendingLimit() {
  if (spendingLimit === null) {
    dom.limitBanner.classList.add('hidden');
    return;
  }
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  if (total > spendingLimit) {
    dom.limitMessage.textContent =
      `⚠️ Total spending ${formatRp(total)} has exceeded your limit of ${formatRp(spendingLimit)}!`;
    dom.limitBanner.classList.remove('hidden');
  } else {
    dom.limitBanner.classList.add('hidden');
  }
}

/* ============================================================
   Sorting
   ============================================================ */
function getSortedTransactions() {
  const sorted = [...transactions];
  const mode   = dom.sortSelect.value;

  switch (mode) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest':
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'amount-desc':
      sorted.sort((a, b) => b.amount - a.amount);
      break;
    case 'amount-asc':
      sorted.sort((a, b) => a.amount - b.amount);
      break;
    case 'category':
      sorted.sort((a, b) => a.category.localeCompare(b.category));
      break;
  }
  return sorted;
}

dom.sortSelect.addEventListener('change', () => renderTransactionList());

/* ============================================================
   Render: Balance
   ============================================================ */
function renderBalance() {
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  dom.totalBalance.textContent = formatRp(total);
  dom.totalTransactions.textContent = transactions.length;

  const cats = new Set(transactions.map(t => t.category));
  dom.totalCategories.textContent = cats.size;
}

/* ============================================================
   Render: Transaction List
   ============================================================ */
function renderTransactionList() {
  const sorted = getSortedTransactions();
  const totalAmt = transactions.reduce((s, t) => s + t.amount, 0);

  if (sorted.length === 0) {
    dom.transactionList.innerHTML = `
      <div class="empty-list">
        <div class="empty-icon">📋</div>
        <p>No transactions yet.</p>
        <p>Add one above to get started!</p>
      </div>`;
    return;
  }

  dom.transactionList.innerHTML = '';
  sorted.forEach(tx => {
    const slug        = getCategorySlug(tx.category);
    const icon        = getCategoryIcon(tx.category);
    const isOverLimit = spendingLimit !== null && totalAmt > spendingLimit;

    const item = document.createElement('div');
    item.className = `transaction-item${isOverLimit ? ' over-limit' : ''}`;
    item.setAttribute('role', 'listitem');
    item.dataset.id = tx.id;

    item.innerHTML = `
      <div class="tx-icon ${slug}" aria-hidden="true">${icon}</div>
      <div class="tx-info">
        <div class="tx-name">${escapeHtml(tx.name)}</div>
        <div class="tx-meta">
          <span class="tx-badge ${slug}">${escapeHtml(tx.category)}</span>
          <span class="tx-date">${formatDate(tx.createdAt)}</span>
          ${isOverLimit ? '<span class="tx-over-badge">Over Limit</span>' : ''}
        </div>
      </div>
      <div class="tx-amount">−${formatRp(tx.amount)}</div>
      <button class="tx-delete" data-id="${tx.id}" aria-label="Delete ${escapeHtml(tx.name)}">🗑️</button>`;

    dom.transactionList.appendChild(item);
  });

  // Event delegation for delete
  dom.transactionList.querySelectorAll('.tx-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteTransaction(btn.dataset.id));
  });
}

/* ============================================================
   Render: Chart
   ============================================================ */
function renderChart() {
  // Aggregate by category
  const totals = {};
  transactions.forEach(tx => {
    totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
  });

  const labels  = Object.keys(totals);
  const data    = Object.values(totals);
  const colors  = labels.map(l => getCategoryColor(l));

  if (labels.length === 0) {
    dom.chartEmpty.style.display = 'block';
    dom.expenseChart.style.display = 'none';
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    return;
  }

  dom.chartEmpty.style.display = 'none';
  dom.expenseChart.style.display = 'block';

  const textColor = currentTheme === 'dark' ? '#94a3b8' : '#64748b';

  if (chartInstance) {
    chartInstance.data.labels  = labels;
    chartInstance.data.datasets[0].data   = data;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(dom.expenseChart, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: 'transparent',
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      cutout: '55%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            padding: 14,
            font: { size: 12, family: "'Segoe UI', system-ui, sans-serif" },
            usePointStyle: true,
            pointStyleWidth: 8,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val   = ctx.parsed;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct   = ((val / total) * 100).toFixed(1);
              return ` ${formatRp(val)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

/* ============================================================
   Render: Monthly Summary
   ============================================================ */
function getViewedMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
}

function renderMonthlySummary() {
  const viewed = getViewedMonth();
  const y = viewed.getFullYear();
  const m = viewed.getMonth();

  dom.monthLabel.textContent = viewed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const monthTx = transactions.filter(tx => {
    const d = new Date(tx.createdAt);
    return d.getFullYear() === y && d.getMonth() === m;
  });

  if (monthTx.length === 0) {
    dom.monthlySummary.innerHTML = '<p class="empty-summary">No transactions this month.</p>';
    return;
  }

  // Group by category
  const grouped = {};
  monthTx.forEach(tx => {
    if (!grouped[tx.category]) grouped[tx.category] = { total: 0, count: 0 };
    grouped[tx.category].total += tx.amount;
    grouped[tx.category].count++;
  });

  const monthTotal = monthTx.reduce((s, t) => s + t.amount, 0);

  let html = '';
  Object.entries(grouped)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([cat, info]) => {
      const slug = getCategorySlug(cat);
      html += `
        <div class="summary-row">
          <div class="summary-row-left">
            <span class="cat-dot ${slug}"></span>
            <span class="summary-cat">${escapeHtml(cat)}</span>
            <span class="summary-count">(${info.count} item${info.count > 1 ? 's' : ''})</span>
          </div>
          <span class="summary-amount">${formatRp(info.total)}</span>
        </div>`;
    });

  html += `
    <div class="summary-total-row">
      <span class="summary-total-label">Total this month</span>
      <span class="summary-total-value">${formatRp(monthTotal)}</span>
    </div>`;

  dom.monthlySummary.innerHTML = html;
}

dom.prevMonth.addEventListener('click', () => { monthOffset--; renderMonthlySummary(); });
dom.nextMonth.addEventListener('click', () => { monthOffset++; renderMonthlySummary(); });

/* ============================================================
   Render: Spending Limit UI
   ============================================================ */
function renderLimitUI() {
  if (spendingLimit !== null) {
    dom.spendingLimit.value = spendingLimit;
    dom.limitInfo.textContent = `Current limit: ${formatRp(spendingLimit)}`;
    dom.limitInfo.style.color = 'var(--text-secondary)';
  }
}

/* ============================================================
   Master Render
   ============================================================ */
function renderAll() {
  renderBalance();
  renderTransactionList();
  renderChart();
  renderMonthlySummary();
  checkSpendingLimit();
}

/* ============================================================
   Security: escape HTML
   ============================================================ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ============================================================
   Init
   ============================================================ */
function init() {
  loadTransactions();
  loadTheme();
  loadLimit();
  loadCategories();

  applyTheme(currentTheme);
  rebuildCategorySelect();
  renderLimitUI();
  renderAll();
}

init();
