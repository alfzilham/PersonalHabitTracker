/* ==========================================================================
   login.js — Login page logic for License Courses Tracker
   Depends on: Lucide Icons (loaded first)
   ========================================================================== */

(function () {

    var form = document.getElementById('login-form');
    var usernameInput = document.getElementById('login-username');
    var keyInput = document.getElementById('login-key');
    var errorEl = document.getElementById('login-error');
    var submitBtn = document.getElementById('login-submit');

    /* Jika sudah login, redirect ke dashboard */
    if (sessionStorage.getItem('session_token') && sessionStorage.getItem('session_user')) {
        window.location.href = 'index.html';
        return;
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
            submitBtn.innerHTML = '<i data-lucide="log-in"></i><span>Login</span>';
        }
        if (window.lucide) lucide.createIcons();
    }

    /* Input masking — auto-format FHGDIA jadi FHG DIA */
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

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideError();

        var username = usernameInput.value.trim();
        var raw = keyInput.value.replace(/\s/g, '');

        if (!username) { showError('Username wajib diisi.'); return; }
        if (raw.length !== 6) { showError('Developer Key harus 6 huruf kapital. Contoh: FHG DIA'); return; }

        var formattedKey = raw.slice(0, 3) + ' ' + raw.slice(3);

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
