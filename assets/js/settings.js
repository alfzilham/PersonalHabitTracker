/* ==========================================================================
   settings.js — Profile, theme, language, data export/import, avatar, FAQ
   Depends on: dashboard-core.js
   ========================================================================== */


/* ==========================================================================
    1. MODAL — Open/close
   ========================================================================== */

function openSettings() {
    var settings = loadSettings();
    var defaults = getDefaultSettings();
    Object.keys(defaults).forEach(function (k) { if (settings[k] === undefined) settings[k] = defaults[k]; });
    document.getElementById('settings-name').value = settings.name || '';
    document.getElementById('settings-email').value = settings.email || '';
    document.getElementById('settings-role').value = settings.role || '';
    var theme = settings.theme || 'light';
    document.getElementById('settings-theme').value = theme;
    document.querySelectorAll('#settings-theme-group .btn-group__item').forEach(function (btn) { btn.classList.toggle('btn-group__item--active', btn.dataset.value === theme); });
    var lang = settings.language || 'en';
    document.getElementById('settings-lang').value = lang;
    document.querySelectorAll('#settings-lang-group .btn-group__item').forEach(function (btn) { btn.classList.toggle('btn-group__item--active', btn.dataset.value === lang); });
    document.getElementById('settings-notif-todo').checked = settings.notifTodo !== false;
    updateAvatarPreview(settings.avatar);
    switchSettingsSection('section-general');
    document.getElementById('settings-modal').classList.add('is-open');
    reinitLucide();
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('is-open');
}


/* ==========================================================================
    2. AUTO-SAVE — Debounced
   ========================================================================== */

function autoSaveSettings() {
    clearTimeout(settingsSaveTimer);
    settingsSaveTimer = setTimeout(function () {
        var name = document.getElementById('settings-name').value.trim();
        if (!name) return;
        var avatarSrc = document.getElementById('settings-avatar-preview').src;
        var data = {
            name: name,
            email: document.getElementById('settings-email').value.trim(),
            role: document.getElementById('settings-role').value.trim(),
            theme: document.getElementById('settings-theme').value,
            language: document.getElementById('settings-lang').value,
            avatar: avatarSrc.indexOf('emptyProfile') !== -1 ? null : avatarSrc,
            notifTodo: document.getElementById('settings-notif-todo').checked,
        };
        saveSettings(data);
        applyTheme(data.theme);
        updateSidebarProfile(data);
        if (typeof DASHBOARD_LANG !== 'undefined') DASHBOARD_LANG.setLang(data.language);
        refreshTodoDueReminders();
        showToast();
    }, 500);
}

function saveSettingsManual() { autoSaveSettings(); }


/* ==========================================================================
    3. SECTION NAVIGATION
   ========================================================================== */

function switchSettingsSection(sectionId) {
    document.querySelectorAll('.settings-nav__item').forEach(function (item) { item.classList.toggle('active', item.dataset.section === sectionId); });
    document.querySelectorAll('.settings-section').forEach(function (sec) { sec.classList.toggle('hidden', sec.id !== sectionId); });
    reinitLucide();
}


/* ==========================================================================
    4. AVATAR
   ========================================================================== */

function updateAvatarPreview(src) {
    var img = document.getElementById('settings-avatar-preview');
    if (!img) return;
    img.src = src || 'assets/image/emptyProfile.webp';
    updateAvatarActionButtons(img.src);
}

function updateAvatarActionButtons(src) {
    var isDefault = !src || src.indexOf('emptyProfile') !== -1;
    var uploadText = document.getElementById('avatar-action-upload-text');
    if (uploadText) uploadText.textContent = isDefault ? __('avatar-upload') : __('avatar-ganti');
    var delBtn = document.getElementById('avatar-action-delete');
    if (delBtn) delBtn.disabled = isDefault;
}

function openAvatarSubModal() {
    updateAvatarActionButtons(document.getElementById('settings-avatar-preview').src);
    document.getElementById('avatar-action-modal').classList.add('is-open');
}

function closeAvatarSubModal() {
    document.getElementById('avatar-action-modal').classList.remove('is-open');
}

function handleSettingsAvatarUpload(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
            var canvas = document.createElement('canvas');
            var size = 256;
            canvas.width = size; canvas.height = size;
            var ctx = canvas.getContext('2d');
            var sx = 0, sy = 0, sw = img.width, sh = img.height;
            if (sw !== sh) { var min = Math.min(sw, sh); sx = (sw - min) / 2; sy = (sh - min) / 2; sw = min; sh = min; }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
            canvas.toBlob(function (blob) {
                var br = new FileReader();
                br.onload = function (ev) { updateAvatarPreview(ev.target.result); closeAvatarSubModal(); autoSaveSettings(); };
                br.readAsDataURL(blob);
            }, 'image/webp', 0.8);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function deleteAvatarPhoto() {
    updateAvatarPreview(null);
    closeAvatarSubModal();
    autoSaveSettings();
}


/* ==========================================================================
    5. TOAST NOTIFICATION
   ========================================================================== */

function showToast() {
    var toast = document.getElementById('settings-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'settings-toast';
        toast.className = 'toast';
        toast.innerHTML = '<i data-lucide="check"></i><span>Perubahan disimpan</span>';
        document.body.appendChild(toast);
        reinitLucide();
    }
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2000);
}


/* ==========================================================================
    6. FAQ TOGGLE
   ========================================================================== */

function toggleFaqItem(trigger) {
    var item = trigger.closest('.faq-item');
    if (!item) return;
    var content = item.querySelector('.faq-item__content');
    if (!content) return;
    var isOpen = item.classList.contains('is-open');
    if (isOpen) { content.style.maxHeight = '0'; item.classList.remove('is-open'); }
    else { item.classList.add('is-open'); content.style.maxHeight = content.scrollHeight + 'px'; }
}


/* ==========================================================================
    7. DATA EXPORT / IMPORT
   ========================================================================== */

function exportScopedData(scope) {
    var scopeKeys = {
        all: ['course_completion', 'custom_courses', 'archived_courses', 'certificates', 'study_completion', 'study_log', 'study_minggu_terakhir', 'custom_subjects', 'study_edits', 'todos', 'finance_records', 'settings_profile'],
        courses: ['course_completion', 'custom_courses', 'archived_courses'],
        study: ['study_completion', 'study_minggu_terakhir', 'custom_subjects', 'study_edits'],
        journal: ['study_log'],
        todo: ['todos'],
        finance: ['finance_records'],
    };
    var scopeFilenames = { all: 'license-courses-tracker-backup', courses: 'online-courses-backup', study: 'study-backup', journal: 'journal-backup', todo: 'todo-backup', finance: 'finance-backup' };
    var keys = scopeKeys[scope] || scopeKeys.all;
    var data = {};
    keys.forEach(function (k) { var raw = localStorage.getItem(k); if (raw) data[k] = JSON.parse(raw); });
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (scopeFilenames[scope] || 'backup') + '.json';
    link.click();
}

function importAllData(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var data = JSON.parse(e.target.result);
            Object.keys(data).forEach(function (k) { localStorage.setItem(k, JSON.stringify(data[k])); });
            showAlert('Data berhasil diimport. Memuat ulang...');
            syncToServer().then(function () {
                window.location.reload();
            });
        } catch (err) { showAlert('Format file tidak valid.'); }
    };
    reader.readAsText(file);
}

function resetAllData() {
    showConfirm('Reset Data', 'Semua data akan dihapus permanen. Lanjutkan?', function () {
        var keys = ['course_completion', 'custom_courses', 'archived_courses', 'certificates', 'study_completion', 'study_log', 'study_minggu_terakhir', 'custom_subjects', 'study_edits', 'todos', 'finance_records', 'settings_profile'];
        keys.forEach(function (k) { localStorage.removeItem(k); });
        window.location.reload();
    });
}

function deleteAccount() {
    showConfirm('Hapus Akun', 'Yakin ingin menghapus AKUN DAN SEMUA DATA? Tindakan ini tidak dapat dibatalkan.', function () {
        fetch('/api/account', {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('session_token') },
        }).catch(function () {});

        var keys = ['course_completion', 'custom_courses', 'archived_courses', 'certificates',
            'study_completion', 'study_log', 'study_minggu_terakhir', 'custom_subjects', 'study_edits',
            'todos', 'finance_records', 'settings_profile'
        ];
        keys.forEach(function (k) { localStorage.removeItem(k); });

        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}

function logoutDemo() {
    showConfirm('Logout', 'Yakin ingin keluar? Data Anda akan disimpan ke cloud dan tidak hilang.', function () {
        syncToServer().then(function () {
            var keys = ['course_completion', 'custom_courses', 'archived_courses',
                'certificates', 'study_completion', 'study_log', 'study_minggu_terakhir',
                'custom_subjects', 'study_edits', 'todos', 'finance_records',
                'settings_profile', 'course_notes', 'course_edits'
            ];
            keys.forEach(function (k) { localStorage.removeItem(k); });
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    });
}
