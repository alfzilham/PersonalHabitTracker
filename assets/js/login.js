/* ==========================================================================
   login.js — Login page logic for Personal Habit Tracker
   Supports: manual login (key) & Google OAuth
   ========================================================================== */

(function () {

    var form = document.getElementById('login-form');
    var usernameInput = document.getElementById('login-username');
    var keyInput = document.getElementById('login-key');
    var errorEl = document.getElementById('login-error');
    var submitBtn = document.getElementById('login-submit');
    var googleBtn = document.getElementById('google-login-btn');
    var formTitle = document.getElementById('login-form-title');
    var formSubtitle = document.getElementById('login-form-subtitle');
    var hiddenGoogleId = document.getElementById('login-google-id');
    var hiddenGoogleAvatar = document.getElementById('login-google-avatar');
    var googleErrorEl = document.getElementById('google-error');

    /* Cek parameter URL */
    var params = new URLSearchParams(window.location.search);
    var oauthCode = params.get('oauth_code');
    var onboarding = params.get('onboarding');
    var errorParam = params.get('error');

    /* Jika sudah login, redirect */
    if (localStorage.getItem('session_token') && localStorage.getItem('session_user')) {
        window.location.href = 'index.html';
        return;
    }

    /* Mode onboarding Google — teruskan one-time code tanpa identitas di URL. */
    if (onboarding === 'google' && oauthCode) {
        window.location.replace('onboarding?oauth_code=' + encodeURIComponent(oauthCode));
        return;
    }

    /* Tukarkan one-time OAuth code; bearer token tidak pernah disimpan di URL. */
    if (oauthCode) {
        fetch('/api/oauth/exchange', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oauthCode: oauthCode }) })
            .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
            .then(function (result) {
                if (!result.ok || !result.data.token) { showGoogleError('Login Google gagal atau link sudah kedaluwarsa.'); return; }
                localStorage.setItem('session_token', result.data.token);
                localStorage.setItem('session_user', 'user');
                window.location.replace('index.html');
            })
            .catch(function () { showGoogleError('Tidak dapat terhubung ke server.'); });
        return;
    }

    /* Jika ada error dari Google */
    if (errorParam === 'google_auth_failed') {
        var errorMsg = params.get('msg') || 'Login Google gagal. Silakan coba lagi.';
        showGoogleError(errorMsg);
    }

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    }

    function showGoogleError(msg) {
        if (googleErrorEl) {
            googleErrorEl.textContent = msg;
            googleErrorEl.classList.remove('hidden');
        }
    }

    function hideError() {
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
    }

    function hideAllErrors() {
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
        if (googleErrorEl) {
            googleErrorEl.classList.add('hidden');
            googleErrorEl.textContent = '';
        }
    }

    function setLoading(loading) {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-lucide="loader-circle"></i><span>Memproses...</span>';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i data-lucide="log-in"></i><span>Masuk</span>';
        }
        if (window.lucide) lucide.createIcons();
    }

    /* Google login button */
    if (googleBtn) {
        googleBtn.addEventListener('click', function () {
            window.location.href = '/auth/google';
        });
    }

    /* Key input — auto-format */
    keyInput.addEventListener('input', function () {
        var raw = this.value.toUpperCase().replace(/[^A-Z\s]/g, '').replace(/\s/g, '');
        var formatted = '';
        for (var i = 0; i < raw.length && i < 6; i++) {
            if (i === 3) formatted += ' ';
            formatted += raw[i];
        }
        this.value = formatted;
        hideAllErrors();
    });

    /* Form submit */
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideAllErrors();

        var username = usernameInput.value.trim();
        var raw = keyInput.value.replace(/\s/g, '');
        var gId = hiddenGoogleId ? hiddenGoogleId.value : '';

        if (!username) { showError('Username wajib diisi.'); return; }
        if (raw.length !== 6) { showError('Developer Key harus 6 huruf kapital. Contoh: XRD HTJ'); return; }

        var formattedKey = raw.slice(0, 3) + ' ' + raw.slice(3);

        /* Jika onboarding Google */
        if (gId) {
            var avatarUrl = hiddenGoogleAvatar ? hiddenGoogleAvatar.value : '';
            // Dapatkan email dari field yang kita buat sebelumnya
            var email = '';
            var emailField = document.querySelector('#login-form .text-sm.text-primary');
            if (emailField) email = emailField.textContent.trim();

            try {
                var res = await fetch('/api/login/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        googleId: gId, email: email, avatarUrl: avatarUrl,
                        username: username, developerKey: formattedKey,
                    }),
                });

                var data = await res.json();
                if (!res.ok) { showError(data.error || 'Gagal mendaftar.'); return; }

                localStorage.setItem('session_token', data.token);
                localStorage.setItem('session_user', data.username);
                submitBtn.innerHTML = '<i data-lucide="check-circle"></i><span>Berhasil!</span>';
                if (window.lucide) lucide.createIcons();
                setTimeout(function () { window.location.href = 'index.html'; }, 500);

            } catch (err) {
                showError('Tidak dapat terhubung ke server.');
            }
            return;
        }

        /* Manual login */
        setLoading(true);

        try {
            var res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, developerKey: formattedKey }),
            });

            var data = await res.json();

            if (!res.ok) {
                showError(data.error || 'Login gagal. Periksa kembali key Anda.');
                setLoading(false);
                return;
            }

            if (data.mode === 'demo' && data.demoCode) {
                window.location.replace('/?demo_code=' + encodeURIComponent(data.demoCode));
                return;
            }

            localStorage.setItem('session_token', data.token);
            localStorage.setItem('session_user', data.username);

            submitBtn.innerHTML = '<i data-lucide="check-circle"></i><span>Berhasil!</span>';
            if (window.lucide) lucide.createIcons();

            setTimeout(function () {
                window.location.href = 'index.html';
            }, 500);

        } catch (err) {
            showError('Tidak dapat terhubung ke server. Pastikan server sedang berjalan.');
            setLoading(false);
        }
    });

})();
