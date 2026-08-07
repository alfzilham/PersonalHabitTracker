/* ==========================================================================
   todo.js — To-do CRUD, render, filter, due-date reminders, charts
   Depends on: dashboard-core.js
   ========================================================================== */


/* ==========================================================================
    1. RENDER — Todos with day-grouping
   ========================================================================== */

function formatDayGroupLabel(isoStr) {
    var date = new Date(isoStr);
    var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var today = new Date();
    var t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var diffDays = Math.round((t - d) / 86400000);
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function dayGroupKey(isoStr) {
    var date = new Date(isoStr);
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

function renderTodoDayGroups(items, dateField) {
    var groups = {};
    var order = [];
    items.forEach(function (t) {
        var dateVal = t[dateField] || t.createdAt;
        var key = dayGroupKey(dateVal);
        if (!groups[key]) { groups[key] = { label: formatDayGroupLabel(dateVal), items: [], sortVal: new Date(dateVal).getTime() }; order.push(key); }
        groups[key].items.push(t);
    });
    order.sort(function (a, b) { return groups[b].sortVal - groups[a].sortVal; });
    return order.map(function (key) {
        var g = groups[key];
        return '<div class="todo-day-separator"><span>' + g.label + '</span></div>' + g.items.map(function (t) { return buildTodoItem(t); }).join('');
    }).join('');
}

function buildTodoItem(t) {
    var checked = t.completed ? 'checked' : '';
    var dueStatus = getTodoDueStatus(t);
    var cls = t.completed ? 'todo-item todo-item--done' : 'todo-item';
    if (dueStatus === 'overdue') cls += ' todo-item--overdue';
    else if (dueStatus === 'due-today') cls += ' todo-item--due-today';
    var prioLabel = { high: 'High', medium: 'Med', low: 'Low' }[t.priority] || '';
    var prioClass = 'todo-prio todo-prio--' + (t.priority || 'medium');
    var dueHtml = '';
    if (t.dueDate) {
        var dueCls = 'todo-due' + (dueStatus === 'overdue' ? ' todo-due--overdue' : dueStatus === 'due-today' ? ' todo-due--today' : '');
        dueHtml = '<span class="' + dueCls + '">' + t.dueDate + '</span>';
    }
    var catHtml = t.category ? '<span class="todo-cat">' + escapeHtml(t.category) + '</span>' : '';
    var dailyHtml = t.isDaily ? '<span class="todo-daily-badge"><i data-lucide="refresh-cw" style="width:11px;height:11px;"></i> ' + (__('todo-daily-badge') || 'Daily') + '</span>' : '';
    return '<div class="' + cls + '" data-todo-id="' + t.id + '">' +
        '<label class="checkbox-wrapper" style="margin:0;"><input type="checkbox" data-todo-id="' + t.id + '" ' + checked + '><span class="checkbox-custom"><i data-lucide="check"></i></span></label>' +
        '<div class="todo-item__body">' +
        '<div class="todo-item__title">' + escapeHtml(t.title) + '</div>' +
        (t.description ? '<div class="todo-item__desc">' + escapeHtml(t.description) + '</div>' : '') +
        '<div class="todo-item__meta">' + dailyHtml + ' ' + catHtml + ' <span class="' + prioClass + '">' + prioLabel + '</span> ' + dueHtml + '</div>' +
        '</div>' +
        '<button class="btn btn-ghost btn-sm todo-del" data-todo-id="' + t.id + '" title="Delete" style="flex-shrink:0;"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-text-muted);"></i></button></div>';
}

function renderTodos() {
    ensureDailyTasksForToday();
    purgeOldCompletedTodos();
    var list = loadTodos();
    var container = document.getElementById('todo-list');
    if (!container) return;
    var filtered = list.filter(function (t) {
        if (todoFilterCategory && t.category !== todoFilterCategory) return false;
        if (todoFilterPriority && t.priority !== todoFilterPriority) return false;
        return true;
    });
    var pending = filtered.filter(function (t) { return !t.completed; });
    var completed = filtered.filter(function (t) { return t.completed; });
    var html = '';
    if (pending.length) {
        html += '<div class="mb-4"><span class="text-sm font-bold text-primary">Pending (' + pending.length + ')</span></div>';
        html += renderTodoDayGroups(pending, 'createdAt');
    }
    if (completed.length) {
        var expandedCls = todoCompletedExpanded ? ' todo-accordion--open' : '';
        html += '<div class="todo-accordion' + expandedCls + '" id="todo-completed-accordion">' +
            '<button class="todo-accordion__toggle" id="todo-completed-toggle"><i data-lucide="chevron-right" class="todo-accordion__chevron"></i><span class="text-sm font-bold text-primary">Completed (' + completed.length + ')</span></button>' +
            '<div class="todo-accordion__body">' + renderTodoDayGroups(completed, 'completedAt') + '</div></div>';
    }
    if (!pending.length && !completed.length) html = '<div class="study-empty"><i data-lucide="list-checks"></i><p>' + __('todo-empty') + '</p></div>';
    container.innerHTML = html;
    reinitLucide();
    attachTodoListeners(container);
    var completedToggle = document.getElementById('todo-completed-toggle');
    if (completedToggle) completedToggle.addEventListener('click', function () {
        todoCompletedExpanded = !todoCompletedExpanded;
        document.getElementById('todo-completed-accordion').classList.toggle('todo-accordion--open', todoCompletedExpanded);
    });
    var total = list.length;
    var done = list.filter(function (t) { return t.completed; }).length;
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    var fill = document.getElementById('todo-progress-fill');
    var label = document.getElementById('todo-progress-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = done + ' / ' + total;
    renderTodoCharts(list);
    refreshTodoDueReminders();
}


/* ==========================================================================
    1b. DAILY TASKS — auto re-spawn recurring todos each day
   ========================================================================== */

function purgeOldCompletedTodos() {
    var list = loadTodos();
    var cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000; /* 2 minggu */
    var kept = list.filter(function (t) {
        if (t.completed && t.completedAt && new Date(t.completedAt).getTime() < cutoff) return false;
        return true;
    });
    if (kept.length !== list.length) {
        saveTodos(kept);
        scheduleTodoSync();
        return true;
    }
    return false;
}

function ensureDailyTasksForToday() {
    var today = getTodayDateStr();
    var templates = loadDailyTasks();
    if (!templates.length) return;
    var list = loadTodos();
    var changed = false;
    templates.forEach(function (tmpl) {
        var instances = list.filter(function (t) {
            return t.isDaily && t.dailyTemplateId === tmpl.id;
        });
        instances.sort(function (a, b) {
            return String(a.dayKey || '').localeCompare(String(b.dayKey || ''));
        });
        var cur = instances.length ? instances[instances.length - 1] : null;
        if (cur && cur.dayKey === today) return;
        if (cur && !cur.completed) {
            cur.dayKey = today;
            cur.createdAt = new Date().toISOString();
            changed = true;
        } else {
            list.push({
                id: 'todo_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                title: tmpl.title,
                description: tmpl.description || '',
                category: tmpl.category || '',
                priority: tmpl.priority || 'medium',
                dueDate: '',
                completed: false,
                createdAt: new Date().toISOString(),
                isDaily: true,
                dailyTemplateId: tmpl.id,
                dayKey: today,
            });
            changed = true;
        }
    });
    if (changed) saveTodos(list);
    if (changed) scheduleTodoSync();
}


/* ==========================================================================
    1c. SYNC — Debounced push of todo/daily changes to server
   ========================================================================== */

var todoSyncTimer = null;

function scheduleTodoSync() {
    if (typeof syncToServer !== 'function') return;
    clearTimeout(todoSyncTimer);
    todoSyncTimer = setTimeout(function () { syncToServer(); }, 600);
}


/* ==========================================================================
    2. EVENT LISTENERS — Checkbox, delete, edit
   ========================================================================== */

function attachTodoListeners(container) {
    container.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
        input.addEventListener('change', function () {
            var id = input.dataset.todoId;
            var list = loadTodos();
            for (var i = 0; i < list.length; i++) {
                if (list[i].id === id) { list[i].completed = !list[i].completed; list[i].completedAt = list[i].completed ? new Date().toISOString() : null; break; }
            }
            saveTodos(list);
            renderTodos();
            scheduleTodoSync();
        });
    });
    container.querySelectorAll('.todo-del').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var id = btn.dataset.todoId;
            var list = loadTodos();
            var todo = list.find(function (t) { return t.id === id; });
            if (todo) {
                document.getElementById('todo-delete-body').innerHTML = 'Delete <strong>' + escapeHtml(todo.title) + '</strong>?';
                document.getElementById('todo-delete-modal').classList.add('is-open');
                document.getElementById('todo-delete-confirm').dataset.targetId = id;
            }
        });
    });
    container.querySelectorAll('.todo-item__body').forEach(function (body) {
        body.addEventListener('click', function () {
            var item = body.closest('.todo-item');
            var id = item ? item.dataset.todoId : null;
            if (!id) return;
            var list = loadTodos();
            var todo = list.find(function (t) { return t.id === id; });
            if (todo) openTodoModal('edit', todo);
        });
    });
}


/* ==========================================================================
    3. MODAL — Add/Edit
   ========================================================================== */

var todoModalMode = 'add';

function openTodoModal(mode, todo) {
    todoEditId = (mode === 'edit' && todo) ? todo.id : null;
    todoModalMode = mode;
    var isDaily = mode === 'daily' || (todo && todo.isDaily);
    var title = 'Add Task';
    if (todoEditId) title = 'Edit Task';
    else if (isDaily) title = __('todo-daily-add') || 'Add Daily Task';
    document.getElementById('todo-modal-title').textContent = title;
    var hint = document.getElementById('todo-modal-daily-hint');
    if (hint) {
        hint.textContent = __('todo-daily-hint') || 'This daily task will automatically reappear every day.';
        hint.classList.toggle('hidden', !isDaily);
    }
    document.getElementById('todo-input-title').value = todo ? todo.title : '';
    document.getElementById('todo-input-desc').value = todo ? (todo.description || '') : '';
    document.getElementById('todo-input-category').value = todo ? (todo.category || '') : '';
    document.getElementById('todo-input-due').value = todo ? (todo.dueDate || '') : '';
    var prio = todo ? (todo.priority || 'medium') : 'medium';
    document.getElementById('todo-input-priority').value = prio;
    document.querySelectorAll('#todo-priority-group .btn-group__item').forEach(function (btn) {
        btn.classList.toggle('btn-group__item--active', btn.dataset.value === prio);
    });
    document.getElementById('todo-modal').classList.add('is-open');
}

function closeTodoModal() {
    document.getElementById('todo-modal').classList.remove('is-open');
}

function saveTodoFromModal() {
    var title = document.getElementById('todo-input-title').value.trim();
    var desc = document.getElementById('todo-input-desc').value.trim();
    var category = document.getElementById('todo-input-category').value.trim();
    var priority = document.getElementById('todo-input-priority').value;
    var dueDate = document.getElementById('todo-input-due').value;
    if (!title) { alert('Task title is required.'); return; }
    var list = loadTodos();
    if (todoEditId) {
        var edited = null;
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === todoEditId) {
                list[i].title = title; list[i].description = desc; list[i].category = category; list[i].priority = priority; list[i].dueDate = dueDate;
                edited = list[i];
                break;
            }
        }
        if (edited && edited.isDaily) {
            var templates = loadDailyTasks();
            templates.forEach(function (tmpl) {
                if (tmpl.id === edited.dailyTemplateId) {
                    tmpl.title = title; tmpl.description = desc; tmpl.category = category; tmpl.priority = priority;
                }
            });
            saveDailyTasks(templates);
        }
    } else if (todoModalMode === 'daily') {
        var dailyId = 'daily_' + Date.now();
        var templates = loadDailyTasks();
        templates.push({ id: dailyId, title: title, description: desc, category: category, priority: priority, createdAt: new Date().toISOString() });
        saveDailyTasks(templates);
        list.push({ id: 'todo_' + Date.now(), title: title, description: desc, category: category, priority: priority, dueDate: dueDate, completed: false, createdAt: new Date().toISOString(), isDaily: true, dailyTemplateId: dailyId, dayKey: getTodayDateStr() });
    } else {
        list.push({ id: 'todo_' + Date.now(), title: title, description: desc, category: category, priority: priority, dueDate: dueDate, completed: false, createdAt: new Date().toISOString() });
    }
    saveTodos(list);
    closeTodoModal();
    renderTodos();
    scheduleTodoSync();
}


/* ==========================================================================
    4. CHARTS — Priority and Category
   ========================================================================== */

var chartTodoPrio = null;
var chartTodoCat = null;

function renderTodoCharts(list) {
    renderTodoPriorityChart(list);
    renderTodoCategoryChart(list);
}

function renderTodoPriorityChart(list) {
    var canvas = document.getElementById('chart-todo-priority');
    if (!canvas) return;
    if (chartTodoPrio) { chartTodoPrio.destroy(); chartTodoPrio = null; }
    var high = list.filter(function (t) { return t.priority === 'high' && !t.completed; }).length;
    var med = list.filter(function (t) { return t.priority === 'medium' && !t.completed; }).length;
    var low = list.filter(function (t) { return t.priority === 'low' && !t.completed; }).length;
    var done = list.filter(function (t) { return t.completed; }).length;
    var tc = themeColors();
    chartTodoPrio = new Chart(canvas, {
        type: 'doughnut', data: { labels: ['High', 'Medium', 'Low', 'Done'], datasets: [{ data: [high, med, low, done], backgroundColor: ['#C85050', '#D4A85A', tc.textMuted, tc.sage], borderColor: tc.bg, borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600, easing: 'easeOutQuart' }, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { font: { family: "'Anthropic Sans', sans-serif", size: 12 }, color: tc.textSecondary, padding: 12, boxWidth: 12, boxHeight: 12 } } } },
    });
}

function renderTodoCategoryChart(list) {
    var canvas = document.getElementById('chart-todo-category');
    if (!canvas) return;
    if (chartTodoCat) { chartTodoCat.destroy(); chartTodoCat = null; }
    var cats = {};
    list.forEach(function (t) {
        var c = t.category || 'Uncategorized';
        if (!cats[c]) cats[c] = { total: 0, done: 0 };
        cats[c].total++;
        if (t.completed) cats[c].done++;
    });
    var labels = Object.keys(cats);
    var tc = themeColors();
    chartTodoCat = new Chart(canvas, {
        type: 'bar', data: { labels: labels, datasets: [{ label: 'Done', data: labels.map(function (l) { return cats[l].done; }), backgroundColor: tc.sage, borderRadius: 4, borderSkipped: false }, { label: 'Left', data: labels.map(function (l) { return cats[l].total - cats[l].done; }), backgroundColor: tc.sageBg, borderRadius: 4, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 600, easing: 'easeOutQuart' }, indexAxis: 'y', scales: { x: { stacked: true, grid: { display: false }, ticks: { font: { family: "'Anthropic Sans', sans-serif", size: 11 }, color: tc.textMuted }, border: { color: tc.border } }, y: { stacked: true, beginAtZero: true, ticks: { font: { family: "'Anthropic Sans', sans-serif", size: 11 }, color: tc.textSecondary }, grid: { display: false }, border: { color: tc.border } } }, plugins: { legend: { position: 'bottom', labels: { font: { family: "'Anthropic Sans', sans-serif", size: 12 }, color: tc.textSecondary, padding: 12, boxWidth: 12, boxHeight: 12 } } } },
    });
}
