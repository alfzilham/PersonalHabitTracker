/* ==========================================================================
   certificate.js — Certificate gallery, modal, CRUD, image upload, WebP compress
   Depends on: dashboard-core.js
   ========================================================================== */


var certEditId = null;


/* ==========================================================================
    1. GALLERY — Render cards or empty state
   ========================================================================== */

function renderCertificateGallery() {
    var container = document.getElementById('cert-gallery');
    if (!container) return;
    var certs = loadCertificates();
    if (!certs.length) {
        container.classList.remove('has-certs');
        container.innerHTML = '<div class="cert-empty"><i data-lucide="award"></i><p class="cert-empty__title">No certificates yet</p><ol class="cert-empty__steps"><li>Click <strong>+ Add Certificate</strong> in the top-right corner.</li><li>Fill in the certificate title and Credential ID.</li><li>Drag &amp; drop the certificate image, or click <strong>browse</strong> to upload it.</li><li>Click <strong>Simpan</strong> to save it to your gallery.</li></ol></div>';
        reinitLucide();
        updateHeaderCounter(getCurrentActiveTab());
        return;
    }
    container.classList.add('has-certs');
    container.innerHTML = certs.map(function (c) { return buildCertCard(c); }).join('');
    reinitLucide();
    attachCertDropdownListeners();
    updateHeaderCounter(getCurrentActiveTab());
}

function buildCertCard(cert) {
    return '<div class="cert-card" data-cert-id="' + escapeHtml(cert.id) + '"><img class="cert-card__image" src="' + escapeHtml(safeImageDataUrl(cert.imageData)) + '" alt="' + escapeHtml(cert.title) + '" loading="lazy"><div class="cert-card__overlay"><div class="cert-card__dot-wrap"><button class="cert-card__dot-btn" data-cert-id="' + escapeHtml(cert.id) + '" aria-label="Actions"><i data-lucide="ellipsis-vertical"></i></button><div class="cert-dropdown" data-dropdown-for="' + escapeHtml(cert.id) + '"><button class="cert-dropdown__item" data-action="edit" data-cert-id="' + escapeHtml(cert.id) + '"><i data-lucide="pencil"></i> Edit</button><button class="cert-dropdown__item cert-dropdown__item--danger" data-action="delete" data-cert-id="' + escapeHtml(cert.id) + '"><i data-lucide="trash-2"></i> Delete</button></div></div><div class="cert-card__info"><span class="cert-card__info-title">' + escapeHtml(cert.title) + '</span><span class="cert-card__info-license">Credential ID: ' + escapeHtml(cert.license) + '</span></div></div></div>';
}


/* ==========================================================================
    2. MODAL — Add/Edit
   ========================================================================== */

function openCertModal(mode, cert) {
    certEditId = (mode === 'edit' && cert) ? cert.id : null;
    var titleEl = document.getElementById('cert-modal-title');
    var inputTitle = document.getElementById('cert-input-title');
    var inputLicense = document.getElementById('cert-input-license');
    var inputImage = document.getElementById('cert-input-image');
    var preview = document.getElementById('cert-image-preview');
    var dropZone = document.getElementById('cert-drop-zone');
    var modal = document.getElementById('cert-modal');
    if (certEditId && cert) {
        titleEl.textContent = 'Edit Certificate';
        inputTitle.value = cert.title;
        inputLicense.value = cert.license;
        preview.src = cert.imageData;
        dropZone.classList.add('has-image');
        modal.classList.add('modal--edit-mode');
    } else {
        titleEl.textContent = 'Add Certificate';
        inputTitle.value = ''; inputLicense.value = ''; inputImage.value = ''; preview.src = '';
        dropZone.classList.remove('has-image');
        modal.classList.remove('modal--edit-mode');
    }
    document.getElementById('cert-modal').classList.add('is-open');
}

function closeCertModal() {
    document.getElementById('cert-modal').classList.remove('is-open');
}


/* ==========================================================================
    3. IMAGE UPLOAD — WebP compression at 80% quality
   ========================================================================== */

function handleCertImageUpload(file, callback) {
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
                br.onload = function (ev) { callback(ev.target.result); };
                br.readAsDataURL(blob);
            }, 'image/webp', 0.8);
        };
        img.src = e.target.result;
        var preview = document.getElementById('cert-image-preview');
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function saveCertFromModal() {
    var title = document.getElementById('cert-input-title').value.trim();
    var license = document.getElementById('cert-input-license').value.trim();
    var preview = document.getElementById('cert-image-preview');
    var dropZone = document.getElementById('cert-drop-zone');
    if (!title) { alert('Please enter a certificate title.'); return; }
    if (!license) { alert('Please enter a Credential ID.'); return; }
    if (!preview.src || !dropZone.classList.contains('has-image')) { alert('Please upload a certificate image.'); return; }
    var certs = loadCertificates();
    if (certEditId) {
        for (var i = 0; i < certs.length; i++) {
            if (certs[i].id === certEditId) { certs[i].title = title; certs[i].license = license; if (preview.dataset.newImage) certs[i].imageData = preview.src; break; }
        }
    } else {
        certs.push({ id: 'cert_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), title: title, license: license, imageData: preview.src, createdAt: new Date().toISOString() });
    }
    saveCertificates(certs);
    closeCertModal();
    renderCertificateGallery();
}

function deleteCertById(id) {
    var certs = loadCertificates();
    saveCertificates(certs.filter(function (c) { return c.id !== id; }));
    renderCertificateGallery();
}

function openDeleteModal(id, title) {
    var body = document.getElementById('cert-delete-body');
    body.innerHTML = 'Are you sure you want to delete <strong>' + escapeHtml(title) + '</strong>? This action cannot be undone.';
    var confirmBtn = document.getElementById('cert-delete-confirm');
    var newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    newBtn.addEventListener('click', function () { deleteCertById(id); closeDeleteModal(); });
    document.getElementById('cert-delete-modal').classList.add('is-open');
}

function closeDeleteModal() {
    document.getElementById('cert-delete-modal').classList.remove('is-open');
}


/* ==========================================================================
    4. DROPDOWN — Three-dot actions
   ========================================================================== */

function attachCertDropdownListeners() {
    document.querySelectorAll('.cert-card__dot-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var id = btn.dataset.certId;
            var dropdown = document.querySelector('.cert-dropdown[data-dropdown-for="' + id + '"]');
            if (!dropdown) return;
            var isOpen = dropdown.classList.contains('is-open');
            closeAllCertDropdowns();
            if (!isOpen) dropdown.classList.add('is-open');
        });
    });
    document.querySelectorAll('.cert-dropdown__item[data-action="edit"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var id = btn.dataset.certId;
            var certs = loadCertificates();
            var cert = certs.find(function (c) { return c.id === id; });
            if (cert) openCertModal('edit', cert);
            closeAllCertDropdowns();
        });
    });
    document.querySelectorAll('.cert-dropdown__item[data-action="delete"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var id = btn.dataset.certId;
            var certs = loadCertificates();
            var cert = certs.find(function (c) { return c.id === id; });
            if (cert) { closeAllCertDropdowns(); openDeleteModal(id, cert.title); }
        });
    });
}

function closeAllCertDropdowns() {
    document.querySelectorAll('.cert-dropdown.is-open').forEach(function (d) { d.classList.remove('is-open'); });
}

document.addEventListener('click', closeAllCertDropdowns);
