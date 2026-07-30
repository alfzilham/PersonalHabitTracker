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

    /* Cek parameter URL */
    var params = new URLSearchParams(window.location.search);
    var tokenParam = params.get('token');
    var onboarding = params.get('onboarding');
    var googleId = params.get('googleId');
    var googleEmail = params.get('email');
    var googleAvatar = params.get('avatar');
    var errorParam = params.get('error');

    /* Jika sudah login, redirect */
    if (sessionStorage.getItem('session_token') && sessionStorage.getItem('session_user')) {
        window.location.href = 'index.html';
        return;
    }

    /* Jika ada token dari Google callback — simpan & redirect */
    if (tokenParam) {
        sessionStorage.setItem('session_token', tokenParam);
        sessionStorage.setItem('session_user', 'user');
        window.location.href = 'index.html';
        return;
    }

    /* Jika ada error dari Google */
    if (errorParam === 'google_auth_failed') {
        showError('Login Google gagal. Silakan coba lagi.');
    }

    /* Mode onboarding Google */
    if (onboarding === 'google' && googleId) {
        formTitle.textContent = 'Lengkapi Data';
        formSubtitle.textContent = 'Satu langkah lagi untuk menyelesaikan pendaftaran';
        hiddenGoogleId.value = googleId;
        hiddenGoogleAvatar.value = googleAvatar || '';
        if (googleEmail) {
            /* Tampilkan email sebagai info */
            var emailHint = document.createElement('div');
            emailHint.className = 'modal__field';
            emailHint.innerHTML = '<label class="modal__label">Email (dari Google)</label>' +
                '<p class="text-sm text-primary" style="padding:var(--space-2) 0;">' + googleEmail + '</p>';
            form.insertBefore(emailHint, form.querySelector('.modal__field'));
        }
        googleBtn.style.display = 'none';
        document.getElementById('login-divider').style.display = 'none';
    }

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    }

    function hideError() {
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
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
        hideError();
    });

    /* Form submit */
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideError();

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

                sessionStorage.setItem('session_token', data.token);
                sessionStorage.setItem('session_user', data.username);
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

            sessionStorage.setItem('session_token', data.token);
            sessionStorage.setItem('session_user', data.username);

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
