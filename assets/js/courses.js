/* ==========================================================================
   courses.js — Course table render, filter, search, archive, edit/delete
   Depends on: dashboard-core.js (loadCompletion, getCourseKey, etc.)
   ========================================================================== */


/* ==========================================================================
    1. TABLE RENDER
   ========================================================================== */

function buildCheckbox(key, checked) {
    return '<label class="checkbox-wrapper" title="Mark as completed">' +
        '<input type="checkbox" data-course-key="' + key + '" ' + (checked ? 'checked' : '') + '>' +
        '<span class="checkbox-custom"><i data-lucide="check"></i></span></label>';
}

function buildTableRow(course, index) {
    var key = getCourseKey(course);
    var completedClass = course.completed ? 'is-completed' : '';
    var roleLabel = course.role || '<span class="text-muted">\u2014</span>';
    var companyHtml = course.url
        ? '<a class="text-sm text-muted" href="' + course.url + '" target="_blank" rel="noopener" style="text-decoration:underline;text-underline-offset:2px;">' + course.company + '</a>'
        : '<span class="text-sm text-muted">' + (course.company || '\u2014') + '</span>';
    return '<tr class="' + completedClass + '" data-course-key="' + key + '" data-slug="' + (course.slug || '') + '" role="row" tabindex="0">' +
        '<td class="col-num">' + index + '</td>' +
        '<td class="col-name">' + course.title + '</td>' +
        '<td class="col-desc">' + (course.description || '') + '</td>' +
        '<td><span class="text-sm text-muted">' + (course.subCategory || '\u2014') + '</span></td>' +
        '<td><span class="text-sm text-muted">' + roleLabel + '</span></td>' +
        '<td>' + companyHtml + '</td>' +
        '<td style="width:32px;"><div class="course-dot-wrap">' +
        '<button class="course-dot-btn" data-course-key="' + key + '" aria-label="Actions"><i data-lucide="settings"></i></button>' +
        '<div class="course-dropdown" data-dropdown-for="' + key + '">' +
        '<button class="course-dropdown__item" data-action="edit" data-key="' + key + '"><i data-lucide="pencil"></i> Edit</button>' +
        '<button class="course-dropdown__item" data-action="archive" data-key="' + key + '"><i data-lucide="archive"></i> Archive</button>' +
        '<button class="course-dropdown__item course-dropdown__item--danger" data-action="delete" data-key="' + key + '"><i data-lucide="trash-2"></i> Delete</button>' +
        '</div></div></td>' +
        '<td class="col-check">' + buildCheckbox(key, course.completed) + '</td></tr>';
}

function buildSkeletonRow(index) {
    return '<tr class="skeleton-row">' +
        '<td class="col-num"><span class="skeleton skeleton--xs"></span></td>' +
        '<td class="col-name"><span class="skeleton skeleton--xl"></span></td>' +
        '<td class="col-desc"><span class="skeleton skeleton--full"></span></td>' +
        '<td><span class="skeleton skeleton--md"></span></td>' +
        '<td><span class="skeleton skeleton--md"></span></td>' +
        '<td><span class="skeleton skeleton--sm"></span></td>' +
        '<td><span class="skeleton skeleton--xs"></span></td>' +
        '<td class="col-check"><span class="skeleton skeleton--checkbox"></span></td></tr>';
}

function showSkeletonRows(count) {
    count = count || 20;
    var tbody = document.getElementById('courses-table-body');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < count; i++) html += buildSkeletonRow(i);
    tbody.innerHTML = html;
}

function renderTable() {
    var tbody = document.getElementById('courses-table-body');
    var completedCount = document.getElementById('courses-completed-count');
    var totalCount = document.getElementById('courses-total-count');
    var allCourses = getCoursesWithCompletion();
    var filtered = getFilteredCourses();
    var totalCompleted = allCourses.filter(function (c) { return c.completed; }).length;
    if (completedCount) completedCount.textContent = totalCompleted;
    if (totalCount) totalCount.textContent = allCourses.length;
    var html = '';
    var displayIndex = 1;
    filtered.forEach(function (course) { html += buildTableRow(course, displayIndex); displayIndex++; });
    if (!html) {
        var hasActiveFilter = !!(searchQuery || filterRole || filterCategory || filterCompany || filterDone);
        html = '<tr><td colspan="8" class="text-center text-muted" style="padding:var(--space-8);">' +
            (hasActiveFilter ? 'No courses match your current filters. Try selecting <strong>All</strong> on one of the filters above to widen your search.' : 'No courses match your search.') +
            '</td></tr>';
    }
    tbody.innerHTML = html;
    attachRowClickListeners();
    attachCourseDropdownListeners();
    attachCheckboxListeners();
    reinitLucide();
}


/* ==========================================================================
    2. EVENT LISTENERS — Rows, checkboxes
   ========================================================================== */

function attachRowClickListeners() {
    document.querySelectorAll('#courses-table-body tr[data-course-key]').forEach(function (row) {
        var key = row.dataset.courseKey;
        var slug = row.dataset.slug;
        if (!key) return;
        row.addEventListener('click', function (e) {
            if (e.target.closest('.checkbox-wrapper')) return;
            if (e.target.closest('a')) return;
            navigateToCourse(key, slug);
        });
        row.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target.closest('.checkbox-wrapper')) return;
                if (e.target.closest('a')) return;
                e.preventDefault();
                navigateToCourse(key, slug);
            }
        });
    });
}

function attachCheckboxListeners() {
    document.querySelectorAll('#courses-table-body input[type="checkbox"]').forEach(function (input) {
        input.addEventListener('change', function (e) {
            e.stopPropagation();
            toggleCompletion(input.dataset.courseKey);
        });
    });
}

function attachFilterListeners() {
    var searchInput = document.getElementById('filter-search');
    if (searchInput) searchInput.addEventListener('input', function (e) { searchQuery = e.target.value.trim(); renderTable(); });
}


/* ==========================================================================
    3. COURSE DROPDOWN — Three-dot actions (edit, archive, delete)
   ========================================================================== */

function attachCourseDropdownListeners() {
    document.querySelectorAll('.course-dot-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var key = btn.dataset.courseKey;
            var dd = document.querySelector('.course-dropdown[data-dropdown-for="' + key + '"]');
            if (!dd) return;
            var isOpen = dd.classList.contains('is-open');
            closeAllCourseDropdowns();
            if (!isOpen) dd.classList.add('is-open');
        });
    });
    document.querySelectorAll('.course-dropdown__item[data-action="archive"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) { e.stopPropagation(); toggleArchive(btn.dataset.key); closeAllCourseDropdowns(); });
    });
    document.querySelectorAll('.course-dropdown__item[data-action="edit"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) { e.stopPropagation(); closeAllCourseDropdowns(); openEditCourse(btn.dataset.key); });
    });
    document.querySelectorAll('.course-dropdown__item[data-action="delete"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            pendingDeleteKey = btn.dataset.key;
            var allCourses = getCoursesWithCompletion();
            var course = allCourses.find(function (c) { return getCourseKey(c) === pendingDeleteKey; });
            var name = course ? course.title : pendingDeleteKey;
            document.getElementById('course-delete-body').innerHTML = 'Are you sure you want to delete <strong>' + escapeHtml(name) + '</strong>? This cannot be undone.';
            document.getElementById('course-delete-modal').classList.add('is-open');
            closeAllCourseDropdowns();
        });
    });
}

function closeAllCourseDropdowns() {
    document.querySelectorAll('.course-dropdown.is-open').forEach(function (d) { d.classList.remove('is-open'); });
}

document.addEventListener('click', closeAllCourseDropdowns);


/* ==========================================================================
    4. ARCHIVE & DELETE OPERATIONS
   ========================================================================== */

function toggleArchive(key) {
    var archived = loadArchived();
    var idx = archived.indexOf(key);
    if (idx === -1) archived.push(key);
    else archived.splice(idx, 1);
    saveArchived(archived);
    renderTable();
    refreshCompletionUI();
    renderArchivedTable();
}

function deleteCourseByKey(key) {
    if (key.indexOf('custom_') === 0) {
        var custom = loadCustomCourses();
        custom = custom.filter(function (c) { return c.id !== key; });
        saveCustomCourses(custom);
    }
    var archived = loadArchived();
    archived = archived.filter(function (k) { return k !== key; });
    saveArchived(archived);
    renderTable();
    refreshCompletionUI();
    renderArchivedTable();
}

function openEditCourse(key) {
    var allCourses = getCoursesWithCompletion();
    var course = allCourses.find(function (c) { return getCourseKey(c) === key; });
    if (!course) return;
    courseEditKey = key;
    document.getElementById('add-course-title').value = course.title || '';
    document.getElementById('add-course-desc').value = course.description || '';
    document.getElementById('add-course-category').value = course.subCategory || '';
    document.getElementById('add-course-company').value = course.company || '';
    document.getElementById('add-course-url').value = course.url || '';
    createViewDropdown('add-course-role-container', ['FullStack Developer', 'Software Engineer', 'AI Engineer', 'Others'], course.role || 'Others');
    createViewDropdown('add-course-phase-container', ['1', '2', '3'], '' + (course.phase || 1));
    document.getElementById('add-course-modal').classList.add('is-open');
}


/* ==========================================================================
    5. ARCHIVED TABLE
   ========================================================================== */

function renderArchivedTable() {
    var tbody = document.getElementById('archived-table-body');
    if (!tbody) return;
    var allCourses = getCoursesWithCompletion();
    var archivedKeys = loadArchived();
    var archivedCourses = allCourses.filter(function (c) { return archivedKeys.indexOf(getCourseKey(c)) !== -1; });
    if (!archivedCourses.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="padding:var(--space-16);text-align:center;"><div class="archived-empty"><i data-lucide="archive"></i><p>No archived courses.</p></div></td></tr>';
        reinitLucide(); return;
    }
    tbody.innerHTML = archivedCourses.map(function (course, i) {
        var key = getCourseKey(course);
        return '<tr data-course-key="' + key + '">' +
            '<td class="col-num">' + (i + 1) + '</td>' +
            '<td class="col-name" style="text-decoration:line-through;color:var(--color-text-muted);">' + course.title + '</td>' +
            '<td class="col-desc">' + (course.description || '') + '</td>' +
            '<td><span class="text-sm text-muted">' + (course.subCategory || '\u2014') + '</span></td>' +
            '<td><span class="text-sm text-muted">' + (course.role || '\u2014') + '</span></td>' +
            '<td><span class="text-sm text-muted">' + (course.company || '\u2014') + '</span></td>' +
            '<td><button class="btn btn-ghost btn-sm archived-restore" data-key="' + key + '" title="Restore"><i data-lucide="rotate-ccw"></i></button>' +
            '<button class="btn btn-ghost btn-sm archived-delete" data-key="' + key + '" title="Delete"><i data-lucide="trash-2" style="color:#C85050;"></i></button></td></tr>';
    }).join('');
    reinitLucide();
    tbody.querySelectorAll('.archived-restore').forEach(function (btn) { btn.addEventListener('click', function () { toggleArchive(btn.dataset.key); }); });
    tbody.querySelectorAll('.archived-delete').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var key = btn.dataset.key;
            var course = allCourses.find(function (c) { return getCourseKey(c) === key; });
            pendingDeleteKey = key;
            document.getElementById('course-delete-body').innerHTML = 'Are you sure you want to permanently delete <strong>' + (course ? course.title : key) + '</strong>? This cannot be undone.';
            document.getElementById('course-delete-modal').classList.add('is-open');
        });
    });
}


/* ==========================================================================
    6. FILTER DROPDOWNS — Role, Category, Company
   ========================================================================== */

function buildFilterDropdowns() {
    var roles = getUniqueValues('role').filter(Boolean);
    var cats = getUniqueValues('subCategory').filter(Boolean);
    var companies = getUniqueValues('company').filter(Boolean);
    buildSingleFilter('filter-role-container', 'Role', roles, function (val) { filterRole = val; renderTable(); }, filterRole, true);
    buildSingleFilter('filter-category-container', 'Category', cats, function (val) { filterCategory = val; renderTable(); }, filterCategory, true);
    buildSingleFilter('filter-company-container', 'Company', companies, function (val) { filterCompany = val; renderTable(); }, filterCompany, true);
    buildSingleFilter('filter-done-container', 'Status', ['Done', 'Pending'], function (val) { filterDone = val; renderTable(); }, filterDone, true);
}

function buildSingleFilter(containerId, label, options, onChange, defaultValue, showAll) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var id = 'dropdown-' + containerId;
    var selectedValue = defaultValue || '';
    var html = '<div class="view-dropdown" id="' + id + '">' +
        '<button class="view-dropdown__trigger" type="button"><span class="view-dropdown__label">' + (selectedValue || label) + '</span><i data-lucide="chevron-down"></i></button>' +
        '<div class="view-dropdown__panel view-dropdown__panel--filter"><div class="view-dropdown__heading">' + label + '</div>';
    if (showAll) html += '<button class="view-dropdown__item' + (selectedValue === '' ? ' is-selected' : '') + '" data-value="">All</button>';
    options.forEach(function (opt) { html += '<button class="view-dropdown__item' + (opt === selectedValue ? ' is-selected' : '') + '" data-value="' + opt.replace(/"/g, '&quot;') + '">' + opt + '</button>'; });
    html += '</div></div>';
    container.innerHTML = html;
    reinitLucide();
    var dd = document.getElementById(id);
    var trigger = dd.querySelector('.view-dropdown__trigger');
    var items = dd.querySelectorAll('.view-dropdown__item');
    var labelEl = trigger.querySelector('.view-dropdown__label');
    trigger.addEventListener('click', function (e) { e.stopPropagation(); dd.classList.toggle('is-open'); });
    items.forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            items.forEach(function (i) { i.classList.remove('is-selected'); });
            item.classList.add('is-selected');
            labelEl.textContent = item.textContent.trim();
            dd.classList.remove('is-open');
            onChange(item.dataset.value);
        });
    });
    document.addEventListener('click', function () { dd.classList.remove('is-open'); });
}
