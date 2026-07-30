/* ==========================================================================
   onboarding.js — 3-step onboarding flow for Google OAuth users
   Depends on: dashboard-core.js (createViewDropdown, getViewDropdownValue)
   ========================================================================== */

(function () {

    var params = new URLSearchParams(window.location.search);
    var googleId = params.get('googleId');
    var email = params.get('email');
    var avatar = params.get('avatar');
    var currentStep = 1;
    var totalSteps = 3;

    var ROLE_OPTIONS = [
        'Product Management', 'Engineering', 'Human Resources', 'Finance',
        'Marketing', 'Sales', 'Operations', 'Data Science', 'Design',
        'Legal', 'Scientist', 'Student', 'Founder', 'Healthcare',
        'Writer', 'Educator', 'Consultant', 'Researcher', 'Software Engineer', 'Other',
    ];

    /* Redirect if no googleId */
    if (!googleId) {
        window.location.href = 'login.html';
        return;
    }

    /* Isi hidden fields */
    document.getElementById('onb-google-id').value = googleId;
    document.getElementById('onb-email').value = email || '';
    document.getElementById('onb-avatar').value = avatar || '';

    /* Init role dropdown */
    createViewDropdown('onb-role-container', ROLE_OPTIONS, 'Software Engineer', null, true);

    function showStep(step) {
        /* Hide all steps */
        document.querySelectorAll('.onb-step').forEach(function (el) {
            el.classList.add('hidden');
        });
        /* Show current step */
        var currentEl = document.querySelector('.onb-step[data-step="' + step + '"]');
        if (currentEl) currentEl.classList.remove('hidden');

        /* Update dot indicators */
        document.querySelectorAll('.onb-steps__item').forEach(function (item) {
            var s = parseInt(item.dataset.step);
            item.classList.remove('is-active', 'is-done');
            if (s === step) item.classList.add('is-active');
            else if (s < step) item.classList.add('is-done');
        });

        /* Update visual panel steps */
        document.querySelectorAll('.onb-brand__step').forEach(function (item) {
            var s = parseInt(item.dataset.step);
            item.classList.remove('is-active', 'is-done');
            if (s === step) item.classList.add('is-active');
            else if (s < step) item.classList.add('is-done');
        });

        currentStep = step;
    }

    function showError(msg) {
        var el = document.getElementById('onb-error');
        el.textContent = msg;
        el.classList.remove('hidden');
    }

    function hideError() {
        var el = document.getElementById('onb-error');
        el.classList.add('hidden');
        el.textContent = '';
    }

    /* Step 1 → Step 2 */
    document.getElementById('onb-step1-next').addEventListener('click', function () {
        var username = document.getElementById('onb-username').value.trim();
        if (!username) { showError('Username wajib diisi.'); return; }
        hideError();
        /* Simpan username di session */
        sessionStorage.setItem('onb_username', username);
        showStep(2);
    });

    /* Step 2 → Back to Step 1 */
    document.getElementById('onb-step2-back').addEventListener('click', function () {
        hideError();
        showStep(1);
    });

    /* Step 2 → Step 3 */
    document.getElementById('onb-step2-next').addEventListener('click', function () {
        hideError();
        showStep(3);
    });

    /* Step 3 → Back to Step 2 */
    document.getElementById('onb-step3-back').addEventListener('click', function () {
        hideError();
        showStep(2);
    });

    /* Step 3 → Submit */
    document.getElementById('onb-submit').addEventListener('click', async function () {
        hideError();

        var username = sessionStorage.getItem('onb_username');
        var role = getViewDropdownValue('onb-role-container');
        var raw = document.getElementById('onb-key').value.replace(/\s/g, '');
        var gId = document.getElementById('onb-google-id').value;
        var emailVal = document.getElementById('onb-email').value;
        var avatarVal = document.getElementById('onb-avatar').value;

        if (!username) { showError('Sesi habis. Silakan login ulang.'); return; }
        if (raw.length !== 6) { showError('Developer Key harus 6 huruf kapital. Contoh: XRD HTJ'); return; }

        var formattedKey = raw.slice(0, 3) + ' ' + raw.slice(3);
        var submitBtn = document.getElementById('onb-submit');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-circle"></i> Memproses...';
        if (window.lucide) lucide.createIcons();

        try {
            var res = await fetch('/api/login/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    googleId: gId,
                    email: emailVal,
                    avatarUrl: avatarVal,
                    username: username,
                    role: role,
                    developerKey: formattedKey,
                }),
            });

            var data = await res.json();
            if (!res.ok) { showError(data.error || 'Gagal mendaftar.'); submitBtn.disabled = false; submitBtn.innerHTML = 'Selesai <i data-lucide="check"></i>'; if (window.lucide) lucide.createIcons(); return; }

            sessionStorage.removeItem('onb_username');
            sessionStorage.setItem('session_token', data.token);
            sessionStorage.setItem('session_user', data.username);

            submitBtn.innerHTML = '<i data-lucide="check-circle"></i> Berhasil!';
            if (window.lucide) lucide.createIcons();
            setTimeout(function () { window.location.href = 'index.html'; }, 500);

        } catch (err) {
            showError('Tidak dapat terhubung ke server.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Selesai <i data-lucide="check"></i>';
            if (window.lucide) lucide.createIcons();
        }
    });

    /* Key auto-format */
    document.getElementById('onb-key').addEventListener('input', function () {
        var raw = this.value.toUpperCase().replace(/[^A-Z\s]/g, '').replace(/\s/g, '');
        var formatted = '';
        for (var i = 0; i < raw.length && i < 6; i++) {
            if (i === 3) formatted += ' ';
            formatted += raw[i];
        }
        this.value = formatted;
        hideError();
    });

    /* Enter key on username → next step */
    document.getElementById('onb-username').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') document.getElementById('onb-step1-next').click();
    });

    /* Enter key on key input → submit */
    document.getElementById('onb-key').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') document.getElementById('onb-submit').click();
    });

    showStep(1);

})();
