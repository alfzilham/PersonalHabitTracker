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

    function updateKeySlots() {
        var val = keyInput.value;
        var slots = document.querySelectorAll('.key-slot');
        slots.forEach(function (slot, i) {
            if (i < val.length) {
                slot.textContent = val[i];
                slot.classList.add('filled');
            } else {
                slot.textContent = 'X';
                slot.classList.remove('filled');
            }
        });
    }

    /* Input masking — hanya huruf kapital, max 6 */
    keyInput.addEventListener('input', function () {
        var val = this.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
        this.value = val;
        updateKeySlots();
        hideError();
    });

    /* Focus the hidden input when user clicks on the visual slots */
    document.querySelector('.key-input-wrap').addEventListener('click', function () {
        keyInput.focus();
    });

    /* Clear slots on backspace in empty field (visual feedback) */
    keyInput.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && this.value.length === 0) {
            /* izin reset — handled by input event */
        }
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideError();

        var username = usernameInput.value.trim();
        var rawKey = keyInput.value;

        if (!username) { showError('Username wajib diisi.'); return; }
        if (rawKey.length !== 6) { showError('Developer Key harus 6 huruf kapital. Contoh: FHG DIA'); return; }

        /* Format: "FHGDIA" → "FHG DIA" */
        var formattedKey = rawKey.slice(0, 3) + ' ' + rawKey.slice(3);

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
