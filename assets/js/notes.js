/* ==========================================================================
   notes.js — Catatan pribadi (gaya Google Keep)
   Fitur: buat/edit via composer inline, warna preset, pin, hapus,
          cari, markdown preview
   Depends on: dashboard-core.js (escapeHtml, reinitLucide, showConfirm,
               showAlert, syncToServer, __)
   ========================================================================== */

/* ==========================================================================
    1. DATA LAYER — localStorage + cloud sync
   ========================================================================== */

var NOTES_STORAGE_KEY = "personal_notes";
var NOTES_COLORS = ["yellow", "green", "blue", "pink", "purple", "gray"];
var notesEditingId = null;
var notesColor = "yellow";
var notesPinned = false;
var notesSearchQuery = "";

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveNotes(list) {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
}

function scheduleNotesSync() {
  if (typeof syncToServer !== "function") return;
  clearTimeout(window._notesSyncTimer);
  window._notesSyncTimer = setTimeout(function () {
    syncToServer().catch(function () {});
  }, 600);
}

/* ==========================================================================
    2. RENDER — Masonry grid kartu catatan
   ========================================================================== */

function renderNoteMarkdown(md) {
  if (typeof marked !== "undefined")
    return marked.parse(md || "", { gfm: true, breaks: true });
  return '<div style="white-space:pre-wrap;">' + escapeHtml(md) + "</div>";
}

function formatNoteDate(iso) {
  var lang =
    typeof DASHBOARD_LANG !== "undefined" && DASHBOARD_LANG.getLang
      ? DASHBOARD_LANG.getLang()
      : "en";
  var now = new Date();
  var d = new Date(iso);
  var diffMin = Math.floor((now - d) / 60000);
  if (diffMin < 1) return lang === "id" ? "Baru saja" : "Just now";
  if (diffMin < 60)
    return lang === "id" ? diffMin + " mnt lalu" : diffMin + "m ago";
  var diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)
    return lang === "id" ? diffHr + " jam lalu" : diffHr + "h ago";
  var months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
}

function buildNoteCard(note) {
  var color = NOTES_COLORS.indexOf(note.color) !== -1 ? note.color : "yellow";
  var title = note.title
    ? '<div class="note-card__title">' + escapeHtml(note.title) + "</div>"
    : "";
  var content = note.content
    ? '<div class="note-card__content md-preview">' +
      renderNoteMarkdown(note.content) +
      "</div>"
    : "";
  var pinCls = note.pinned
    ? "note-card__btn is-active"
    : "note-card__btn";
  var pinTitle = __("notes-pin") || "Pin";
  var delTitle = __("notes-delete") || "Delete";
  return (
    '<div class="note-card note-card--' +
    color +
    (note.pinned ? " note-card--pinned" : "") +
    '" data-note-id="' +
    note.id +
    '">' +
    '<div class="note-card__body">' +
    title +
    content +
    "</div>" +
    '<div class="note-card__footer">' +
    '<span class="note-card__date">' +
    formatNoteDate(note.updatedAt || note.createdAt) +
    "</span>" +
    '<div class="note-card__actions">' +
    '<button type="button" class="' +
    pinCls +
    '" data-action="pin" data-note-id="' +
    note.id +
    '" title="' +
    pinTitle +
    '"><i data-lucide="pin"></i></button>' +
    '<button type="button" class="note-card__btn" data-action="delete" data-note-id="' +
    note.id +
    '" title="' +
    delTitle +
    '"><i data-lucide="trash-2"></i></button>' +
    "</div>" +
    "</div>" +
    "</div>"
  );
}

function renderNotes() {
  var list = loadNotes();
  var q = (notesSearchQuery || "").trim().toLowerCase();
  if (q) {
    list = list.filter(function (n) {
      return (
        (n.title || "").toLowerCase().indexOf(q) !== -1 ||
        (n.content || "").toLowerCase().indexOf(q) !== -1
      );
    });
  }
  var ordered = list.slice().sort(function (a, b) {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return (
      new Date(b.updatedAt || b.createdAt) -
      new Date(a.updatedAt || a.createdAt)
    );
  });
  var grid = document.getElementById("notes-grid");
  if (grid) grid.innerHTML = ordered.map(buildNoteCard).join("");
  reinitLucide();
  var empty = document.getElementById("notes-empty");
  if (empty) {
    var p = empty.querySelector("p");
    if (ordered.length === 0 && loadNotes().length === 0) {
      empty.classList.remove("hidden");
      if (p) p.textContent = __("notes-empty") || "Belum ada catatan.";
    } else if (ordered.length === 0) {
      empty.classList.remove("hidden");
      if (p) p.textContent = __("notes-no-result") || "Tidak ada catatan yang cocok.";
    } else {
      empty.classList.add("hidden");
    }
  }
}

/* ==========================================================================
    3. COMPOSER — buat / edit catatan
   ========================================================================== */

function openNoteComposer() {
  var composer = document.getElementById("notes-composer");
  var form = document.getElementById("notes-composer-form");
  var collapsed = document.getElementById("notes-composer-collapsed");
  if (!composer) return;
  composer.classList.add("notes-composer--open");
  if (form) form.classList.remove("hidden");
  if (collapsed) collapsed.classList.add("hidden");
}

function closeNoteComposer() {
  notesEditingId = null;
  var composer = document.getElementById("notes-composer");
  var form = document.getElementById("notes-composer-form");
  var collapsed = document.getElementById("notes-composer-collapsed");
  if (!composer) return;
  composer.classList.remove("notes-composer--open");
  if (form) form.classList.add("hidden");
  if (collapsed) collapsed.classList.remove("hidden");
  var title = document.getElementById("notes-input-title");
  var content = document.getElementById("notes-input-content");
  if (title) title.value = "";
  if (content) content.value = "";
  setNotesColor("yellow");
  setNotesPin(false);
}

function setNotesColor(color) {
  notesColor = NOTES_COLORS.indexOf(color) !== -1 ? color : "yellow";
  var palette = document.getElementById("notes-color-palette");
  if (palette) {
    palette.querySelectorAll(".notes-color-swatch").forEach(function (s) {
      s.classList.toggle("is-active", s.dataset.color === notesColor);
    });
  }
}

function setNotesPin(pinned) {
  notesPinned = !!pinned;
  var btn = document.getElementById("notes-pin-toggle");
  if (btn) btn.classList.toggle("is-active", notesPinned);
}

function editNote(id) {
  var note = loadNotes().find(function (n) {
    return n.id === id;
  });
  if (!note) return;
  notesEditingId = id;
  var title = document.getElementById("notes-input-title");
  var content = document.getElementById("notes-input-content");
  if (title) title.value = note.title || "";
  if (content) content.value = note.content || "";
  setNotesColor(note.color || "yellow");
  setNotesPin(note.pinned);
  openNoteComposer();
  var composer = document.getElementById("notes-composer");
  if (composer && composer.scrollIntoView)
    composer.scrollIntoView({ behavior: "smooth", block: "center" });
  if (title) title.focus();
}

function saveNote() {
  var title = document.getElementById("notes-input-title").value.trim();
  var content = document.getElementById("notes-input-content").value.trim();
  if (!title && !content) {
    showAlert(__("notes-required") || "Catatan kosong.");
    return;
  }
  var list = loadNotes();
  var now = new Date().toISOString();
  if (notesEditingId) {
    var idx = list.findIndex(function (n) {
      return n.id === notesEditingId;
    });
    if (idx !== -1) {
      list[idx].title = title;
      list[idx].content = content;
      list[idx].color = notesColor;
      list[idx].pinned = notesPinned;
      list[idx].updatedAt = now;
    }
  } else {
    list.push({
      id: "note_" + Date.now(),
      title: title,
      content: content,
      color: notesColor,
      pinned: notesPinned,
      createdAt: now,
      updatedAt: now,
    });
  }
  saveNotes(list);
  closeNoteComposer();
  renderNotes();
  scheduleNotesSync();
}

function deleteNote(id) {
  showConfirm(
    __("notes-delete") || "Hapus",
    __("notes-delete-confirm") || "Hapus catatan ini?",
    function () {
      var list = loadNotes().filter(function (n) {
        return n.id !== id;
      });
      saveNotes(list);
      if (notesEditingId === id) closeNoteComposer();
      renderNotes();
      scheduleNotesSync();
    },
  );
}

function togglePinFromCard(id) {
  var list = loadNotes();
  var note = list.find(function (n) {
    return n.id === id;
  });
  if (!note) return;
  note.pinned = !note.pinned;
  saveNotes(list);
  renderNotes();
  scheduleNotesSync();
}

/* ==========================================================================
    4. INIT — wire listeners (dipanggil dari dashboard-core init)
   ========================================================================== */

function initNotes() {
  var collapsed = document.getElementById("notes-composer-collapsed");
  if (collapsed) collapsed.addEventListener("click", openNoteComposer);

  var saveBtn = document.getElementById("notes-save-btn");
  if (saveBtn) saveBtn.addEventListener("click", saveNote);

  var cancelBtn = document.getElementById("notes-cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", closeNoteComposer);

  var pinToggle = document.getElementById("notes-pin-toggle");
  if (pinToggle)
    pinToggle.addEventListener("click", function () {
      setNotesPin(!notesPinned);
    });

  var palette = document.getElementById("notes-color-palette");
  if (palette) {
    palette.addEventListener("click", function (e) {
      var swatch = e.target.closest(".notes-color-swatch");
      if (swatch) setNotesColor(swatch.dataset.color);
    });
  }

  var grid = document.getElementById("notes-grid");
  if (grid) {
    grid.addEventListener("click", function (e) {
      var actionBtn = e.target.closest("[data-action]");
      if (actionBtn) {
        var id = actionBtn.dataset.noteId;
        if (actionBtn.dataset.action === "pin") togglePinFromCard(id);
        else if (actionBtn.dataset.action === "delete") deleteNote(id);
        return;
      }
      var card = e.target.closest(".note-card");
      if (card) editNote(card.dataset.noteId);
    });
  }

  var search = document.getElementById("notes-search");
  if (search) {
    search.addEventListener("input", function () {
      clearTimeout(window._notesSearchTimer);
      window._notesSearchTimer = setTimeout(function () {
        notesSearchQuery = search.value;
        renderNotes();
      }, 250);
    });
  }
}
