/* ==========================================================================
   study.js — Study tab + Journal tab render, CRUD, modal, lightbox
   Depends on: dashboard-core.js, study-db.js
   ========================================================================== */


/* ==========================================================================
    1. STUDY TAB — Render dan manage jadwal mingguan
   ========================================================================== */

function renderStudy() {
    checkStudyReset();
    updateStudyMingguInfo();
    renderStudyTable();
}

function updateStudyMingguInfo() {
    var now = new Date();
    var week = getWeekNumber(now);
    var label = document.getElementById('study-minggu-label');
    if (label) label.textContent = getWeekLabel(week) + ' (' + getWeekDateRange() + ')';
}

function renderStudyTable() {
    var tbody = document.getElementById('study-table-body');
    if (!tbody) return;
    var completion = loadStudyCompletion();
    var edits = loadStudyEdits();
    var done = 0;
    tbody.innerHTML = getAllStudyCourses().map(function (mk, i) {
        var key = getStudyKey(mk);
        if (edits[key]) mk = Object.assign({}, mk, edits[key]);
        var checked = !!completion[key];
        if (checked) done++;
        return '<tr data-study-key="' + key + '">' +
            '<td style="width:32px;"><label class="checkbox-wrapper" title="Tandai selesai">' +
            '<input type="checkbox" data-study-key="' + key + '" ' + (checked ? 'checked' : '') + '>' +
            '<span class="checkbox-custom"><i data-lucide="check"></i></span></label></td>' +
            '<td><span class="text-sm text-muted">' + mk.kode + '</span></td>' +
            '<td class="col-name">' + mk.nama + '</td>' +
            '<td class="col-center"><span class="text-sm text-muted">' + mk.hari + '</span></td>' +
            '<td class="col-center"><span class="text-sm text-muted">' + mk.jam + '</span></td>' +
            '<td class="col-center"><span class="text-sm text-muted">' + (mk.kelas || '') + '</span></td>' +
            '<td class="col-center"><span class="text-sm text-muted">' + mk.ruang + '</span></td>' +
            '<td><span class="badge badge--' + (mk.paket === 'MKU' ? 'optional' : 'required') + '" style="font-size:var(--text-xs);">' + mk.paket + '</span></td>' +
            '<td style="width:32px;"><div class="course-dot-wrap">' +
            '<button class="course-dot-btn" data-course-key="' + key + '" aria-label="Actions"><i data-lucide="settings"></i></button>' +
            '<div class="course-dropdown" data-dropdown-for="' + key + '">' +
            '<button class="course-dropdown__item" data-action="edit" data-key="' + key + '"><i data-lucide="pencil"></i> Edit</button>' +
            '<button class="course-dropdown__item course-dropdown__item--danger" data-action="delete" data-key="' + key + '"><i data-lucide="trash-2"></i> Delete</button>' +
            '</div></div></td></tr>';
    }).join('');
    reinitLucide();
    attachStudyDropdownListeners();
    var total = getAllStudyCourses().length;
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    var fill = document.getElementById('study-progress-fill');
    var label = document.getElementById('study-progress-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = done + ' / ' + total;
    tbody.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
        input.addEventListener('change', function (e) {
            e.stopPropagation();
            var key = input.dataset.studyKey;
            var map = loadStudyCompletion();
            map[key] = !map[key];
            saveStudyCompletion(map);
            if (map[key]) openStudyEntryModal(key);
            renderStudyTable();
            updateHeaderCounter(getCurrentActiveTab());
        });
    });
}

/* Study dropdown */
function attachStudyDropdownListeners() {
    document.querySelectorAll('#panel-study .course-dot-btn').forEach(function (btn) {
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
    document.querySelectorAll('#panel-study .course-dropdown__item[data-action="edit"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) { e.stopPropagation(); var key = btn.dataset.key; closeAllCourseDropdowns(); openStudyEditModal(key); });
    });
    document.querySelectorAll('#panel-study .course-dropdown__item[data-action="delete"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var key = btn.dataset.key;
            closeAllCourseDropdowns();
            var mk = getAllStudyCourses().find(function (m) { return getStudyKey(m) === key; });
            var name = mk ? mk.nama : key;
            studyPendingDeleteKey = key;
            document.getElementById('course-delete-body').innerHTML = 'Are you sure you want to delete <strong>' + escapeHtml(name) + '</strong>? This cannot be undone.';
            document.getElementById('course-delete-modal').classList.add('is-open');
        });
    });
}


/* ==========================================================================
    2. JOURNAL TAB — Render masonry log
   ========================================================================== */

function renderStudyLog() {
    var container = document.getElementById('study-log-grid');
    if (!container) return;
    var log = loadStudyLog();
    if (!log.length) {
        container.innerHTML = '<div class="study-empty"><i data-lucide="book-open"></i><p>' + __('study-empty-log') + '</p></div>';
        reinitLucide(); return;
    }
    var currentWeek = '' + getWeekNumber(new Date());
    if (!studyFilteredWeek) studyFilteredWeek = currentWeek;
    filterStudyLogByWeek(studyFilteredWeek);
}

function filterStudyLogByWeek(week) {
    studyFilteredWeek = week;
    renderStudyLogCards(week);
}

function renderStudyLogCards(week) {
    var container = document.getElementById('study-log-grid');
    if (!container) return;
    var log = loadStudyLog();
    var w = week || ('' + getWeekNumber(new Date()));
    var entries = log.filter(function (e) { return e.week === w; });
    if (!entries.length) {
        container.innerHTML = '<div class="study-empty"><i data-lucide="book-open"></i><p>' + __('study-empty-week') + '</p></div>';
        reinitLucide(); return;
    }
    var ordered = entries.slice().reverse();
    container.innerHTML = ordered.map(function (entry) {
        var previewText = stripMarkdown(entry.ringkasan || '');
        return '<div class="study-card" data-entry-id="' + entry.id + '">' +
            (entry.imageKey ? '<div class="study-card__image-wrap" id="study-card-img-' + entry.id + '"></div>' : '') +
            '<div class="study-card__body">' +
            '<div class="study-card__kode">' + entry.kode + '</div>' +
            '<div class="study-card__nama">' + entry.nama + '</div>' +
            '<div class="study-card__divider"></div>' +
            '<div class="study-card__judul">' + escapeHtml(entry.judul) + '</div>' +
            '<div class="study-card__ringkasan">' + escapeHtml(previewText) + '</div>' +
            '<div class="study-card__footer"><span>' + (entry.imageKey ? '<i data-lucide="image"></i>' : '') + '</span><span>' + (entry.hari || '') + '</span></div>' +
            '</div></div>';
    }).join('');
    reinitLucide();
    ordered.forEach(function (entry) {
        if (!entry.imageKey) return;
        var wrap = document.getElementById('study-card-img-' + entry.id);
        if (!wrap) return;
        getImage(entry.imageKey).then(function (blob) {
            if (blob && wrap) { var url = URL.createObjectURL(blob); wrap.innerHTML = '<img src="' + url + '" alt="" loading="lazy">'; }
        }).catch(function () {});
    });
    container.querySelectorAll('.study-card').forEach(function (card) {
        card.addEventListener('click', function () {
            var id = card.dataset.entryId;
            var log = loadStudyLog();
            var entry = log.find(function (e) { return e.id === id; });
            if (entry) openJournalDetailLightbox(entry);
        });
    });
}


/* ==========================================================================
    3. STUDY ENTRY MODAL — Save new Journal entry
   ========================================================================== */

function openStudyEntryModal(key) {
    studyEntryKey = key;
    journalEditingId = '';
    var mk = getAllStudyCourses().find(function (m) { return getStudyKey(m) === key; });
    if (!mk) return;
    document.getElementById('study-entry-title').textContent = 'Catat materi hari ini menjadi sebuah Journal';
    document.getElementById('study-entry-matkul').textContent = mk.kode + ' \u2014 ' + mk.nama;
    document.getElementById('study-entry-judul').value = '';
    document.getElementById('study-entry-ringkasan').value = '';
    document.getElementById('study-image-preview').src = '';
    document.getElementById('study-input-image').value = '';
    document.getElementById('study-drop-zone').classList.remove('has-image');
    document.getElementById('study-entry-modal').querySelector('.modal').classList.remove('modal--edit-mode');
    document.getElementById('study-entry-modal').classList.add('is-open');
    reinitLucide();
}

function closeStudyEntryModal() {
    document.getElementById('study-entry-modal').classList.remove('is-open');
}

function saveStudyEntry() {
    var judul = document.getElementById('study-entry-judul').value.trim();
    var ringkasan = document.getElementById('study-entry-ringkasan').value.trim();
    var preview = document.getElementById('study-image-preview');
    var dropZone = document.getElementById('study-drop-zone');
    if (!judul) { showAlert('Judul materi wajib diisi.'); return; }
    if (!ringkasan) { showAlert('Ringkasan materi wajib diisi.'); return; }
    var mk = getAllStudyCourses().find(function (m) { return getStudyKey(m) === studyEntryKey; });
    if (!mk) return;
    var log = loadStudyLog();
    if (journalEditingId) {
        var idx = log.findIndex(function (e) { return e.id === journalEditingId; });
        if (idx === -1) return;
        var imageKey = log[idx].imageKey || null;
        var hasNewImage = dropZone.classList.contains('has-image') && preview.dataset.blob;
        var imageRemoved = !dropZone.classList.contains('has-image') && log[idx].imageKey;
        if (hasNewImage) {
            imageKey = journalEditingId;
            var binary = atob(preview.dataset.blob.split(',')[1]);
            var array = new Uint8Array(binary.length);
            for (var i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
            var blob = new Blob([array], { type: 'image/webp' });
            saveImage(imageKey, blob);
        } else if (imageRemoved) {
            deleteImage(log[idx].imageKey).catch(function () {});
            imageKey = null;
        }
        log[idx].judul = judul;
        log[idx].ringkasan = ringkasan;
        log[idx].imageKey = imageKey;
        saveStudyLog(log);
        closeStudyEntryModal();
        journalEditingId = '';
        renderStudyLogCards(studyFilteredWeek);
        return;
    }
    var entryId = 'entry_' + Date.now();
    var imageKey = null;
    if (preview.src && dropZone.classList.contains('has-image') && preview.dataset.blob) {
        imageKey = entryId;
        var binary = atob(preview.dataset.blob.split(',')[1]);
        var array = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
        var blob = new Blob([array], { type: 'image/webp' });
        saveImage(imageKey, blob);
    }
    var now = new Date();
    log.push({ id: entryId, kode: mk.kode, nama: mk.nama, judul: judul, ringkasan: ringkasan, imageKey: imageKey, hari: getHariIni(), week: '' + getWeekNumber(now), createdAt: now.toISOString() });
    saveStudyLog(log);
    closeStudyEntryModal();
}

function handleStudyImageUpload(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(function (blob) {
                var br = new FileReader();
                br.onload = function (ev) {
                    var preview = document.getElementById('study-image-preview');
                    preview.src = ev.target.result;
                    preview.dataset.blob = ev.target.result;
                    document.getElementById('study-drop-zone').classList.add('has-image');
                };
                br.readAsDataURL(blob);
            }, 'image/webp', 0.8);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}


/* ==========================================================================
    4. JOURNAL LIGHTBOX — Detail view, edit, delete
   ========================================================================== */

function openJournalDetailLightbox(entry) {
    journalDetailEntryId = entry.id;
    var imageWrap = document.getElementById('journal-detail-image-wrap');
    var imageEl = document.getElementById('journal-detail-image');
    if (entry.imageKey) {
        imageWrap.classList.remove('hidden');
        imageEl.src = '';
        getImage(entry.imageKey).then(function (blob) {
            if (blob) { var url = URL.createObjectURL(blob); imageEl.src = url; imageEl.dataset.blobUrl = url; }
            else { imageWrap.classList.add('hidden'); }
        }).catch(function () { imageWrap.classList.add('hidden'); });
    } else { imageWrap.classList.add('hidden'); imageEl.src = ''; }
    document.getElementById('journal-detail-kode').textContent = entry.kode;
    document.getElementById('journal-detail-nama').textContent = entry.nama;
    document.getElementById('journal-detail-judul').textContent = entry.judul;
    document.getElementById('journal-detail-ringkasan').innerHTML = renderMarkdown(entry.ringkasan);
    document.getElementById('journal-detail-hari').textContent = entry.hari || '';
    document.getElementById('journal-detail-modal').classList.add('is-open');
    reinitLucide();
}

function closeJournalDetailLightbox() {
    document.getElementById('journal-detail-modal').classList.remove('is-open');
    var imageEl = document.getElementById('journal-detail-image');
    if (imageEl.dataset.blobUrl) { URL.revokeObjectURL(imageEl.dataset.blobUrl); delete imageEl.dataset.blobUrl; }
}

function requestDeleteJournalEntry(entryId) {
    journalDetailEntryId = entryId;
    document.getElementById('journal-delete-modal').classList.add('is-open');
}

function confirmDeleteJournalEntry() {
    var log = loadStudyLog();
    var entry = log.find(function (e) { return e.id === journalDetailEntryId; });
    log = log.filter(function (e) { return e.id !== journalDetailEntryId; });
    saveStudyLog(log);
    if (entry && entry.imageKey) deleteImage(entry.imageKey).catch(function () {});
    document.getElementById('journal-delete-modal').classList.remove('is-open');
    closeJournalDetailLightbox();
    renderStudyLogCards(studyFilteredWeek);
}

function openJournalEditModal(entry) {
    studyEntryKey = getStudyKey(entry);
    journalEditingId = entry.id;
    document.getElementById('study-entry-title').textContent = 'Edit Journal Entry';
    document.getElementById('study-entry-matkul').textContent = entry.kode + ' \u2014 ' + entry.nama;
    document.getElementById('study-entry-judul').value = entry.judul;
    document.getElementById('study-entry-ringkasan').value = entry.ringkasan;
    document.getElementById('study-input-image').value = '';
    var preview = document.getElementById('study-image-preview');
    var dropZone = document.getElementById('study-drop-zone');
    if (entry.imageKey) {
        getImage(entry.imageKey).then(function (blob) {
            if (blob) { var url = URL.createObjectURL(blob); preview.src = url; preview.dataset.existingImageKey = entry.imageKey; dropZone.classList.add('has-image'); }
        });
    } else { preview.src = ''; dropZone.classList.remove('has-image'); }
    document.getElementById('study-entry-modal').querySelector('.modal').classList.add('modal--edit-mode');
    document.getElementById('study-entry-modal').classList.add('is-open');
    reinitLucide();
}


/* ==========================================================================
    5. STUDY EDIT / ADD SUBJECT — CRUD
   ========================================================================== */

var studyEditKey = '';
var STUDY_HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu', '\u2013'];

/* Konversi format jam: storage "10.45" <-> input type="time" "10:45" */
function dotToColon(t) { return (t || '').replace(/\./g, ':'); }
function colonToDot(t) { return (t || '').replace(/:/g, '.'); }

function openStudyEditModal(key) {
    studyEditKey = key;
    var mk = getAllStudyCourses().find(function (m) { return getStudyKey(m) === key; });
    if (!mk) return;
    var edits = loadStudyEdits();
    if (edits[key]) mk = Object.assign({}, mk, edits[key]);
    var jamParsed = parseJamRange(mk.jam);

    document.getElementById('study-edit-kode').value = mk.kode || '';
    document.getElementById('study-edit-nama').value = mk.nama || '';

    createViewDropdown('study-edit-hari-container', STUDY_HARI_OPTIONS, mk.hari || 'Senin');

    document.getElementById('study-edit-jam-mulai').value = dotToColon(jamParsed.mulai);
    document.getElementById('study-edit-jam-selesai').value = dotToColon(jamParsed.selesai);

    document.getElementById('study-edit-kelas').value = mk.kelas || '';
    document.getElementById('study-edit-ruang').value = mk.ruang || '';
    document.getElementById('study-edit-paket').value = mk.paket || '';
    document.getElementById('study-edit-modal').querySelector('.modal').classList.add('modal--edit-mode');
    document.getElementById('study-edit-modal').classList.add('is-open');
}

function saveStudyEdit() {
    var kode = document.getElementById('study-edit-kode').value.trim();
    var nama = document.getElementById('study-edit-nama').value.trim();
    if (!kode || !nama) { showAlert('Kode dan Nama harus diisi.'); return; }
    var edits = loadStudyEdits();
    edits[studyEditKey] = {
        kode: kode, nama: nama,
        hari: getViewDropdownValue('study-edit-hari-container'),
        jam: formatJamRange(colonToDot(document.getElementById('study-edit-jam-mulai').value) || '08.00', colonToDot(document.getElementById('study-edit-jam-selesai').value) || '09.30'),
        kelas: document.getElementById('study-edit-kelas').value.trim(),
        ruang: document.getElementById('study-edit-ruang').value.trim(),
        paket: document.getElementById('study-edit-paket').value.trim(),
    };
    saveStudyEdits(edits);
    document.getElementById('study-edit-modal').classList.remove('is-open');
    renderStudy();
}

function closeStudyEditModal() {
    document.getElementById('study-edit-modal').classList.remove('is-open');
}

function openStudyAddModal() {
    ['study-add-kode', 'study-add-nama', 'study-add-kelas', 'study-add-ruang', 'study-add-paket'].forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ''; });

    createViewDropdown('study-add-hari-container', STUDY_HARI_OPTIONS, 'Senin');

    document.getElementById('study-add-jam-mulai').value = '08:00';
    document.getElementById('study-add-jam-selesai').value = '09:30';

    document.getElementById('study-add-modal').classList.add('is-open');
}

function saveStudyAdd() {
    var kode = document.getElementById('study-add-kode').value.trim();
    var nama = document.getElementById('study-add-nama').value.trim();
    if (!kode || !nama) { showAlert('Kode dan Nama harus diisi.'); return; }
    var existingKeys = getAllStudyCourses().map(function (m) { return m.kode; });
    if (existingKeys.indexOf(kode) !== -1) { showAlert('Kode "' + kode + '" sudah dipakai mata kuliah lain.'); return; }
    var subjects = loadCustomSubjects();
    subjects.push({
        kode: kode, nama: nama,
        hari: getViewDropdownValue('study-add-hari-container'),
        jam: formatJamRange(colonToDot(document.getElementById('study-add-jam-mulai').value) || '08.00', colonToDot(document.getElementById('study-add-jam-selesai').value) || '09.30'),
        kelas: document.getElementById('study-add-kelas').value.trim(),
        ruang: document.getElementById('study-add-ruang').value.trim(),
        paket: document.getElementById('study-add-paket').value.trim() || 'Jurusan',
    });
    saveCustomSubjects(subjects);
    document.getElementById('study-add-modal').classList.remove('is-open');
    renderStudy();
}

function closeStudyAddModal() {
    document.getElementById('study-add-modal').classList.remove('is-open');
}

function deleteStudySubject(key) {
    var customs = loadCustomSubjects();
    var isCustom = customs.some(function (m) { return getStudyKey(m) === key; });
    if (isCustom) {
        customs = customs.filter(function (m) { return getStudyKey(m) !== key; });
        saveCustomSubjects(customs);
        var completion = loadStudyCompletion();
        delete completion[key];
        saveStudyCompletion(completion);
    }
    var edits = loadStudyEdits();
    delete edits[key];
    saveStudyEdits(edits);
    renderStudy();
}
