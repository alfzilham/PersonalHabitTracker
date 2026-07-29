/* ==========================================================================
   analytics.js — All analytics charts (Courses, Study, To-do, Finance)
   Depends on: dashboard-core.js, Chart.js
   ========================================================================== */


/* ==========================================================================
    1. COURSES ANALYTICS — Stat cards, pie, bar
   ========================================================================== */

function renderAnalytics() {
    var courses = getAnalyticsCourses();
    refreshCompletionUI();
    renderCharts(courses);
}

function renderCharts(courses) {
    renderPieChart(courses);
    renderBarChart(courses);
}

function renderPieChart(courses) {
    var canvas = document.getElementById('chart-pie');
    if (!canvas) return;
    if (pieChart) { pieChart.destroy(); pieChart = null; }
    var done = courses.filter(function (c) { return c.completed; }).length;
    var left = courses.filter(function (c) { return !c.completed; }).length;
    pieChart = new Chart(canvas, {
        type: 'doughnut', data: { labels: ['Completed', 'Remaining'], datasets: [{ data: [done, left], backgroundColor: ['#6B7F5E', '#EDE8DC'], borderColor: '#F5F0E8', borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600, easing: 'easeOutQuart' }, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { font: { family: "'Anthropic Sans', sans-serif", size: 12 }, color: '#4A4740', padding: 12, boxWidth: 12, boxHeight: 12 } }, tooltip: { callbacks: { label: function (ctx) { return ' ' + ctx.label + ': ' + ctx.parsed; } } } } },
    });
}

function renderBarChart(courses) {
    var canvas = document.getElementById('chart-bar');
    if (!canvas) return;
    if (barChart) { barChart.destroy(); barChart = null; }
    var companies = getUniqueValues('company');
    var doneCounts = companies.map(function (co) { return courses.filter(function (c) { return c.company === co && c.completed; }).length; });
    var totalCounts = companies.map(function (co) { return COURSES.filter(function (c) { return c.company === co; }).length; });
    barChart = new Chart(canvas, {
        type: 'bar', data: { labels: companies, datasets: [{ label: 'Completed', data: doneCounts, backgroundColor: '#6B7F5E', borderRadius: 4, borderSkipped: false }, { label: 'Remaining', data: totalCounts.map(function (t, i) { return t - doneCounts[i]; }), backgroundColor: '#DCE8D4', borderRadius: 4, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600, easing: 'easeOutQuart' }, indexAxis: 'y', scales: { x: { stacked: true, grid: { display: false }, ticks: { font: { family: "'Anthropic Sans', sans-serif", size: 11 }, color: '#8A8478' }, border: { color: '#D4CBBB' } }, y: { stacked: true, beginAtZero: true, ticks: { font: { family: "'Anthropic Sans', sans-serif", size: 11 }, color: '#4A4740' }, grid: { display: false }, border: { color: '#D4CBBB' } } }, plugins: { legend: { position: 'bottom', labels: { font: { family: "'Anthropic Sans', sans-serif", size: 12 }, color: '#4A4740', padding: 12, boxWidth: 12, boxHeight: 12 } }, tooltip: { callbacks: { label: function (ctx) { return ' ' + ctx.dataset.label + ': ' + ctx.parsed.x; } } } } },
    });
}


/* ==========================================================================
    2. STUDY ANALYTICS — Progress bar, pie, line
   ========================================================================== */

var chartStudyPie = null;
var chartStudyLine = null;

function renderStudyAnalytics() {
    var completion = loadStudyCompletion();
    var total = getAllStudyCourses().length;
    var done = 0;
    var jurusanMk = getAllStudyCourses().filter(function (m) { return m.paket === 'Jurusan'; });
    var mkuMk = getAllStudyCourses().filter(function (m) { return m.paket === 'MKU'; });
    var jurusanDone = 0, mkuDone = 0;
    getAllStudyCourses().forEach(function (mk) {
        var key = 'mk_' + mk.kode;
        if (completion[key]) { done++; if (mk.paket === 'Jurusan') jurusanDone++; else mkuDone++; }
    });
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    var fill = document.getElementById('analytics-study-fill');
    var label = document.getElementById('analytics-study-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = done + ' / ' + total;
    renderStudyPieChart(jurusanDone, mkuDone, jurusanMk.length, mkuMk.length);
    renderStudyLineChart();
}

function renderStudyPieChart(jurusanDone, mkuDone, jurusanTotal, mkuTotal) {
    var canvas = document.getElementById('chart-study-pie');
    if (!canvas) return;
    if (chartStudyPie) { chartStudyPie.destroy(); chartStudyPie = null; }
    var jurusanLeft = jurusanTotal - jurusanDone;
    var mkuLeft = mkuTotal - mkuDone;
    chartStudyPie = new Chart(canvas, {
        type: 'doughnut', data: { labels: ['Jurusan Done', 'Jurusan Left', 'MKU Done', 'MKU Left'], datasets: [{ data: [jurusanDone, jurusanLeft, mkuDone, mkuLeft], backgroundColor: ['#6B7F5E', '#DCE8D4', '#5B7A9E', '#D4E0EC'], borderColor: '#F5F0E8', borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600, easing: 'easeOutQuart' }, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { font: { family: "'Anthropic Sans', sans-serif", size: 12 }, color: '#4A4740', padding: 12, boxWidth: 12, boxHeight: 12 } } } },
    });
}

function renderStudyLineChart() {
    var canvas = document.getElementById('chart-study-line');
    if (!canvas) return;
    if (chartStudyLine) { chartStudyLine.destroy(); chartStudyLine = null; }
    var log = loadStudyLog();
    var weekCounts = {};
    log.forEach(function (entry) { var w = entry.week || '0'; if (!weekCounts[w]) weekCounts[w] = 0; weekCounts[w]++; });
    var weeks = Object.keys(weekCounts).sort(function (a, b) { return parseInt(a) - parseInt(b); });
    var counts = weeks.map(function (w) { return weekCounts[w]; });
    if (!weeks.length) { weeks = ['Minggu ' + getWeekNumber(new Date())]; counts = [0]; }
    else { weeks = weeks.map(function (w) { return 'Minggu ' + w; }); }
    chartStudyLine = new Chart(canvas, {
        type: 'bar', data: { labels: weeks, datasets: [{ label: 'Entries', data: counts, backgroundColor: '#6B7F5E', borderRadius: 4, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600, easing: 'easeOutQuart' }, scales: { x: { grid: { display: false }, ticks: { font: { family: "'Anthropic Sans', sans-serif", size: 11 }, color: '#8A8478' }, border: { color: '#D4CBBB' } }, y: { beginAtZero: true, ticks: { font: { family: "'Anthropic Sans', sans-serif", size: 11 }, color: '#8A8478', stepSize: 1 }, grid: { color: '#EDE8DC' }, border: { color: '#D4CBBB' } } }, plugins: { legend: { display: false } } },
    });
}


/* ==========================================================================
    3. TODO ANALYTICS
   ========================================================================== */

var chartAnalyticsTodoPrio = null;
var chartAnalyticsTodoCat = null;

function renderTodoAnalytics() {
    var list = loadTodos();
    var total = list.length;
    var done = list.filter(function (t) { return t.completed; }).length;
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    var fill = document.getElementById('analytics-todo-fill');
    var label = document.getElementById('analytics-todo-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = done + ' / ' + total;
    renderAnalyticsTodoCharts(list);
}

function renderAnalyticsTodoCharts(list) {
    var canvasPrio = document.getElementById('chart-analytics-todo-priority');
    if (canvasPrio) {
        if (chartAnalyticsTodoPrio) { chartAnalyticsTodoPrio.destroy(); chartAnalyticsTodoPrio = null; }
        var high = list.filter(function (t) { return t.priority === 'high' && !t.completed; }).length;
        var med = list.filter(function (t) { return t.priority === 'medium' && !t.completed; }).length;
        var low = list.filter(function (t) { return t.priority === 'low' && !t.completed; }).length;
        var done = list.filter(function (t) { return t.completed; }).length;
        chartAnalyticsTodoPrio = new Chart(canvasPrio, {
            type: 'doughnut', data: { labels: ['High', 'Medium', 'Low', 'Done'], datasets: [{ data: [high, med, low, done], backgroundColor: ['#C85050', '#D4A85A', '#8A8478', '#6B7F5E'], borderColor: '#F5F0E8', borderWidth: 2 }] },
            options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600, easing: 'easeOutQuart' }, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { font: { family: "'Anthropic Sans', sans-serif", size: 12 }, color: '#4A4740', padding: 12, boxWidth: 12, boxHeight: 12 } } } },
        });
    }
    var canvasCat = document.getElementById('chart-analytics-todo-category');
    if (canvasCat) {
        if (chartAnalyticsTodoCat) { chartAnalyticsTodoCat.destroy(); chartAnalyticsTodoCat = null; }
        var cats = {};
        list.forEach(function (t) { var c = t.category || 'Uncategorized'; if (!cats[c]) cats[c] = { total: 0, done: 0 }; cats[c].total++; if (t.completed) cats[c].done++; });
        var labels = Object.keys(cats);
        chartAnalyticsTodoCat = new Chart(canvasCat, {
            type: 'bar', data: { labels: labels, datasets: [{ label: 'Done', data: labels.map(function (l) { return cats[l].done; }), backgroundColor: '#6B7F5E', borderRadius: 4, borderSkipped: false }, { label: 'Left', data: labels.map(function (l) { return cats[l].total - cats[l].done; }), backgroundColor: '#DCE8D4', borderRadius: 4, borderSkipped: false }] },
            options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600, easing: 'easeOutQuart' }, indexAxis: 'y', scales: { x: { stacked: true, grid: { display: false }, ticks: { font: { family: "'Anthropic Sans', sans-serif", size: 11 }, color: '#8A8478' }, border: { color: '#D4CBBB' } }, y: { stacked: true, beginAtZero: true, ticks: { font: { family: "'Anthropic Sans', sans-serif", size: 11 }, color: '#4A4740' }, grid: { display: false }, border: { color: '#D4CBBB' } } }, plugins: { legend: { position: 'bottom', labels: { font: { family: "'Anthropic Sans', sans-serif", size: 12 }, color: '#4A4740', padding: 12, boxWidth: 12, boxHeight: 12 } } } },
        });
    }
}


/* ==========================================================================
    4. FINANCE ANALYTICS
   ========================================================================== */

var chartAnalyticsFinanceLine = null;
var chartAnalyticsFinanceCat = null;

function renderFinanceAnalytics() {
    var records = loadFinanceRecords();
    var now = new Date();
    var monthStr = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2);
    var monthRecords = records.filter(function (r) { return r.date && r.date.indexOf(monthStr) === 0; });
    var monthTotal = monthRecords.reduce(function (s, r) { return s + (r.amount || 0); }, 0);
    document.getElementById('analytics-finance-monthly').textContent = 'Rp ' + formatRupiah(monthTotal);
    renderAnalyticsFinanceLineChart(records);
    renderAnalyticsFinanceCatChart(records);
}

function renderAnalyticsFinanceLineChart(records) {
    var canvas = document.getElementById('chart-analytics-finance-line');
    if (!canvas) return;
    if (chartAnalyticsFinanceLine) { chartAnalyticsFinanceLine.destroy(); chartAnalyticsFinanceLine = null; }
    var daily = {};
    records.forEach(function (r) { if (!daily[r.date]) daily[r.date] = 0; daily[r.date] += r.amount || 0; });
    var labels = [], data = [];
    for (var i = 29; i >= 0; i--) {
        var d = new Date(); d.setDate(d.getDate() - i);
        var y = d.getFullYear(), m = ('0' + (d.getMonth() + 1)).slice(-2), dd = ('0' + d.getDate()).slice(-2);
        var ds = y + '-' + m + '-' + dd;
        labels.push(dd + '/' + m); data.push(daily[ds] || 0);
    }
    chartAnalyticsFinanceLine = new Chart(canvas, {
        type: 'line', data: { labels: labels, datasets: [{ label: 'Spending', data: data, borderColor: '#6B7F5E', backgroundColor: 'rgba(107,127,94,0.1)', fill: true, tension: 0.3, pointRadius: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600 }, scales: { x: { grid: { display: false }, ticks: { font: { family: "'Anthropic Sans', sans-serif", size: 10 }, color: '#8A8478', maxTicksLimit: 10 }, border: { color: '#D4CBBB' } }, y: { beginAtZero: true, ticks: { font: { family: "'Anthropic Sans', sans-serif", size: 10 }, color: '#8A8478', callback: function (val) { return 'Rp ' + formatRupiah(val); } }, grid: { color: '#EDE8DC' }, border: { color: '#D4CBBB' } } }, plugins: { legend: { display: false } } },
    });
}

function renderAnalyticsFinanceCatChart(records) {
    var canvas = document.getElementById('chart-analytics-finance-cat');
    if (!canvas) return;
    if (chartAnalyticsFinanceCat) { chartAnalyticsFinanceCat.destroy(); chartAnalyticsFinanceCat = null; }
    var cats = {};
    records.forEach(function (r) { var c = r.category || 'Uncategorized'; if (!cats[c]) cats[c] = 0; cats[c] += r.amount || 0; });
    var labels = Object.keys(cats);
    var colors = ['#6B7F5E', '#5B7A9E', '#C87A5E', '#D4A85A', '#8FA882', '#7A9ABE', '#B88A30', '#8A8478', '#C85050'];
    chartAnalyticsFinanceCat = new Chart(canvas, {
        type: 'doughnut', data: { labels: labels, datasets: [{ data: labels.map(function (l) { return cats[l]; }), backgroundColor: colors.slice(0, labels.length), borderColor: '#F5F0E8', borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600, easing: 'easeOutQuart' }, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { font: { family: "'Anthropic Sans', sans-serif", size: 12 }, color: '#4A4740', padding: 12, boxWidth: 12, boxHeight: 12 } } } },
    });
}
