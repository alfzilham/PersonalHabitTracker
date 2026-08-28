/* ==========================================================================
   finance.js — Finance CRUD, render, week navigation, export CSV/PDF, charts
   Depends on: dashboard-core.js
   ========================================================================== */

/* Mode aktif: 'expense' (Pengeluaran) atau 'income' (Pemasukan).
   Kedua tab TIDAK saling sinkron — setiap mode hanya membaca record dengan
   type-nya sendiri. */
var financeMode = 'expense';

function filterFinanceRecords(records, mode) {
    var m = mode || financeMode;
    return records.filter(function (r) { return (r.type || 'expense') === m; });
}

function isIncomeMode() { return financeMode === 'income'; }

function switchFinanceMode(mode) {
    financeMode = mode === 'income' ? 'income' : 'expense';
    document.querySelectorAll('#finance-mode-tabs .btn-group__item').forEach(function (b) {
        b.classList.toggle('btn-group__item--active', b.dataset.financeMode === financeMode);
    });
    var addLabel = document.getElementById('finance-add-label');
    if (addLabel) addLabel.textContent = isIncomeMode() ? 'Add Income' : 'Add Expense';
    renderFinance();
}


/* ==========================================================================
    1. RENDER — Finance view by week
   ========================================================================== */

function renderFinance() {
    var records = loadFinanceRecords();
    var currentWeek = '' + getWeekNumber(new Date());
    updateFinanceWeekLabel(currentWeek);
    renderFinanceWeek(currentWeek);
}

function updateFinanceWeekLabel(weekNum) {
    var label = document.getElementById('finance-week-label');
    if (!label) return;
    var current = getWeekNumber(new Date());
    label.textContent = weekNum == current ? 'Minggu ini' : 'Minggu ' + weekNum;
}

function getFinanceWeek(records, weekNum) {
    var grouped = {};
    records.forEach(function (r) {
        var w = getWeekNumber(new Date(r.date));
        if (!grouped[w]) grouped[w] = [];
        grouped[w].push(r);
    });
    return grouped[weekNum] || [];
}

function renderFinanceWeek(weekNum) {
    var all = loadFinanceRecords();
    var modeRecords = filterFinanceRecords(all, financeMode);
    var weekRecords = getFinanceWeek(modeRecords, weekNum);
    var content = document.getElementById('finance-week-content');
    var emptyState = document.getElementById('finance-empty-state');
    var emptyText = document.getElementById('finance-empty-text');
    if (!weekRecords.length) {
        if (content) content.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        if (emptyText) emptyText.textContent = __('no-data');
        document.getElementById('finance-week-total').textContent = 'Rp 0';
        document.getElementById('finance-top3').innerHTML = '';
        reinitLucide(); return;
    }
    if (content) content.style.display = '';
    if (emptyState) emptyState.style.display = 'none';
    var total = weekRecords.reduce(function (sum, r) { return sum + (r.amount || 0); }, 0);
    document.getElementById('finance-week-total').textContent = 'Rp ' + formatRupiah(total);
    var dailyTotals = {};
    weekRecords.forEach(function (r) { var d = r.date; if (!dailyTotals[d]) dailyTotals[d] = 0; dailyTotals[d] += r.amount || 0; });
    var sortedDays = Object.keys(dailyTotals).sort(function (a, b) { return dailyTotals[b] - dailyTotals[a]; });
    var top3 = document.getElementById('finance-top3');
    var medals = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];
    var dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    top3.innerHTML = sortedDays.slice(0, 3).map(function (d, i) {
        var day = new Date(d); var name = dayNames[day.getDay()];
        return '<span class="finance-top finance-top--' + (i + 1) + '">' + medals[i] + ' ' + name + ' Rp ' + formatRupiah(dailyTotals[d]) + '</span>';
    }).join('');
    var tbody = document.getElementById('finance-table-body');
    if (tbody) {
        var sortedRecords = weekRecords.slice().sort(function (a, b) { return b.date.localeCompare(a.date) || b.id.localeCompare(a.id); });
        tbody.innerHTML = sortedRecords.map(function (r) {
            return '<tr data-finance-id="' + escapeHtml(r.id) + '"><td><span class="text-sm text-muted">' + escapeHtml(r.date) + '</span></td><td><span class="text-sm font-medium text-primary">' + escapeHtml(formatCurrency(r.amount, r.currency || 'IDR')) + '</span></td><td><span class="text-sm text-muted">' + escapeHtml(r.category || '\u2014') + '</span></td><td><span class="text-sm text-muted">' + escapeHtml(r.description || '') + '</span></td><td><button class="btn btn-ghost btn-sm finance-del" data-finance-id="' + escapeHtml(r.id) + '" title="Delete"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-text-muted);"></i></button></td></tr>';
        }).join('');
        reinitLucide();
        tbody.querySelectorAll('.finance-del').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = btn.dataset.financeId;
                var rec = modeRecords.find(function (r) { return r.id === id; });
                if (rec) {
                    var kind = isIncomeMode() ? 'income' : 'expense';
                    document.getElementById('finance-delete-body').textContent = 'Delete ' + kind + ' ' + formatCurrency(rec.amount, rec.currency || 'IDR') + '?';
                    document.getElementById('finance-delete-modal').classList.add('is-open');
                    document.getElementById('finance-delete-confirm').dataset.targetId = id;
                }
            });
        });
    }
    renderFinanceCharts(weekRecords);
}


/* ==========================================================================
    2. WEEK DAYS HELPER
   ========================================================================== */

function getWeekDays(weekNum) {
    var year = new Date().getFullYear();
    var firstJan = new Date(year, 0, 1);
    var days = Math.floor((weekNum - 1) * 7 - firstJan.getDay() + 1);
    var monday = new Date(year, 0, days + 1);
    if (weekNum === 1) monday.setDate(1);
    var result = [];
    var dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    for (var i = 0; i < 7; i++) {
        var d = new Date(monday);
        d.setDate(monday.getDate() + i);
        var y = d.getFullYear(), m = ('0' + (d.getMonth() + 1)).slice(-2), dd = ('0' + d.getDate()).slice(-2);
        result.push({ name: dayNames[i], dateStr: y + '-' + m + '-' + dd });
    }
    return result;
}


/* ==========================================================================
    3. MODAL — Add expense
   ========================================================================== */

function openFinanceModal() {
    var mt = document.getElementById('finance-modal-title');
    if (mt) mt.textContent = isIncomeMode() ? 'Add Income' : 'Add Expense';
    document.getElementById('finance-input-amount').value = '';
    document.getElementById('finance-input-currency').value = 'IDR';
    var label = document.getElementById('finance-currency-label');
    if (label) label.textContent = 'IDR (Rp)';
    var dd = document.getElementById('finance-currency-dropdown');
    if (dd) dd.querySelectorAll('.view-dropdown__item').forEach(function (item) { item.classList.toggle('is-selected', item.dataset.value === 'IDR'); });
    document.getElementById('finance-input-category').value = '';
    document.getElementById('finance-input-desc').value = '';
    document.getElementById('finance-input-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('finance-modal').classList.add('is-open');
}

function closeFinanceModal() {
    document.getElementById('finance-modal').classList.remove('is-open');
}

function saveFinanceFromModal() {
    var amount = parseInt(document.getElementById('finance-input-amount').value);
    var category = document.getElementById('finance-input-category').value.trim();
    var description = document.getElementById('finance-input-desc').value.trim();
    var date = document.getElementById('finance-input-date').value;
    if (!amount || amount <= 0) { alert('Amount must be greater than 0.'); return; }
    if (!date) { alert('Date is required.'); return; }
    var records = loadFinanceRecords();
    records.push({ id: 'Finance_' + Date.now(), type: financeMode, amount: amount, currency: document.getElementById('finance-input-currency').value, category: category, description: description, date: date, createdAt: new Date().toISOString() });
    saveFinanceRecords(records);
    closeFinanceModal();
    renderFinance();
}


/* ==========================================================================
    4. CHARTS — Finance tab bar and pie
   ========================================================================== */

var chartFinanceBar = null;
var chartFinancePie = null;

function renderFinanceCharts(weekRecords) {
    renderFinanceBarChart(weekRecords);
    renderFinancePieChart(weekRecords);
}

function renderFinanceBarChart(weekRecords) {
    var canvas = document.getElementById('chart-finance-bar');
    if (!canvas) return;
    if (chartFinanceBar) { chartFinanceBar.destroy(); chartFinanceBar = null; }
    var weekNum = parseInt(document.getElementById('finance-week-label').textContent.replace('Minggu ', '')) || getWeekNumber(new Date());
    var days = getWeekDays(weekNum);
    var dailyTotals = {};
    weekRecords.forEach(function (r) { if (!dailyTotals[r.date]) dailyTotals[r.date] = 0; dailyTotals[r.date] += r.amount || 0; });
    var tc = themeColors();
    var barLabel = isIncomeMode() ? 'Income' : 'Spending';
    chartFinanceBar = new Chart(canvas, {
        type: 'bar', data: { labels: days.map(function (d) { return d.name; }), datasets: [{ label: barLabel, data: days.map(function (d) { return dailyTotals[d.dateStr] || 0; }), backgroundColor: tc.sage, borderRadius: 4, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600 }, scales: { x: { grid: { display: false }, ticks: { font: { family: "'Anthropic Sans', sans-serif", size: 11 }, color: tc.textMuted }, border: { color: tc.border } }, y: { beginAtZero: true, ticks: { font: { family: "'Anthropic Sans', sans-serif", size: 11 }, color: tc.textMuted }, grid: { color: tc.bgCard }, border: { color: tc.border } } }, plugins: { legend: { display: false } } },
    });
}

function renderFinancePieChart(weekRecords) {
    var canvas = document.getElementById('chart-finance-pie');
    if (!canvas) return;
    if (chartFinancePie) { chartFinancePie.destroy(); chartFinancePie = null; }
    var cats = {};
    weekRecords.forEach(function (r) { var c = r.category || 'Uncategorized'; if (!cats[c]) cats[c] = 0; cats[c] += r.amount || 0; });
    var labels = Object.keys(cats);
    var tc = themeColors();
    var colors = [tc.sage, tc.blue, '#C87A5E', '#D4A85A', tc.sageLight, tc.blueLight, '#B88A30', tc.textMuted];
    chartFinancePie = new Chart(canvas, {
        type: 'doughnut', data: { labels: labels, datasets: [{ data: labels.map(function (l) { return cats[l]; }), backgroundColor: colors.slice(0, labels.length), borderColor: tc.bg, borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600, easing: 'easeOutQuart' }, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { font: { family: "'Anthropic Sans', sans-serif", size: 12 }, color: tc.textSecondary, padding: 12, boxWidth: 12, boxHeight: 12 } } } },
    });
}


/* ==========================================================================
    5. EXPORT — CSV and PDF
   ========================================================================== */

function exportFinanceCSV(weekNum) {
    var all = loadFinanceRecords();
    var weekRecords = getFinanceWeek(filterFinanceRecords(all, financeMode), weekNum);
    if (!weekRecords.length) { alert('No data for this week.'); return; }
    var csv = 'Tanggal,Jumlah,Kategori,Catatan\n';
    weekRecords.sort(function (a, b) { return a.date.localeCompare(b.date); }).forEach(function (r) { csv += r.date + ',Rp ' + formatRupiah(r.amount) + ',"' + (r.category || '') + '","' + (r.description || '') + '"\n'; });
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'finance-week-' + weekNum + '.csv';
    link.click();
}

function exportFinancePDF(weekNum) {
    if (typeof window.jspdf === 'undefined' && typeof jspdf === 'undefined') { alert('jsPDF not loaded. Please refresh and try again.'); return; }
    var all = loadFinanceRecords();
    var weekRecords = getFinanceWeek(filterFinanceRecords(all, financeMode), weekNum);
    if (!weekRecords.length) { alert('No data for this week.'); return; }
    var { jsPDF } = window.jspdf;
    var doc = new jsPDF();
    var total = weekRecords.reduce(function (s, r) { return s + (r.amount || 0); }, 0);
    doc.setFontSize(16);
    doc.text('finance Report \u2014 Minggu ' + weekNum, 14, 20);
    doc.setFontSize(11);
    doc.text('Total: Rp ' + formatRupiah(total), 14, 30);
    var rows = weekRecords.sort(function (a, b) { return a.date.localeCompare(b.date); }).map(function (r) { return [r.date, 'Rp ' + formatRupiah(r.amount), r.category || '\u2014', r.description || '']; });
    doc.autoTable({ startY: 38, head: [['Date', 'Amount', 'Category', 'Description']], body: rows, theme: 'striped', styles: { fontSize: 9 } });
    doc.save('finance-week-' + weekNum + '.pdf');
}
