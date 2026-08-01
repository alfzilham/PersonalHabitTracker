/* ==========================================================================
   dashboard-core.js — License Courses Tracker
   Core: constants, utilities, data access layer, init(), tab/completion UI
   Depends on: data.js, data-study.js, study-db.js, dashboard-i18n.js
   Must load BEFORE all feature files.
   ========================================================================== */

/* ==========================================================================
    1. CONSTANTS
   ========================================================================== */

/* Courses */
const STORAGE_KEY = "course_completion";
const COURSE_EDIT_KEY = "course_edits";

/* Phase counts */
const PHASE_TOTALS = { 1: 20, 2: 21, 3: 40 };

/* Study */
const STUDY_STORAGE_KEY = "study_completion";
const STUDY_LOG_KEY = "study_log";
const STUDY_WEEK_KEY = "study_minggu_terakhir";
const STUDY_EDIT_KEY = "study_edits";
const CUSTOM_SUBJECT_KEY = "custom_subjects";
const TODO_STORAGE_KEY = "todos";
const TODO_BANNER_DISMISS_KEY = "todo_due_banner_dismissed";
const DAILY_TASKS_KEY = "daily_tasks";
const FINANCE_STORAGE_KEY = "finance_records";
const CERT_STORAGE_KEY = "certificates";
const CUSTOM_STORAGE_KEY = "custom_courses";
const ARCHIVED_STORAGE_KEY = "archived_courses";
const COURSE_NOTES_KEY = "course_notes";
const SETTINGS_KEY = "settings_profile";

/* Role totals */
const ROLE_TOTALS = {
  "FullStack Developer": 14,
  "Software Engineer": 20,
  "AI Engineer": 40,
};

/* Chart.js instances */
let pieChart = null;
let barChart = null;

/* Search + filter state */
let searchQuery = "";
let filterRole = "";
let filterCategory = "";
let filterCompany = "";

/* Study state */
let studyFilteredWeek = "";
let studyEntryKey = "";
let journalEditingId = "";
let journalDetailEntryId = "";
let studyPendingDeleteKey = "";

/* Course state */
let pendingDeleteKey = null;
let courseEditKey = null;

/* Todo state */
let todoEditId = null;
let todoFilterCategory = "";
let todoFilterPriority = "";
let todoCompletedExpanded = false;
let todoBannerDismissedToday =
  sessionStorage.getItem(TODO_BANNER_DISMISS_KEY) === "" + getTodayDateStr();

/* Settings */
let settingsSaveTimer = null;

function getTodayDateStr() {
  var d = new Date();
  var y = d.getFullYear();
  var m = ("0" + (d.getMonth() + 1)).slice(-2);
  var dd = ("0" + d.getDate()).slice(-2);
  return y + "-" + m + "-" + dd;
}

/* ==========================================================================
    2. DATA ACCESS — localStorage CRUD for all features
   ========================================================================== */

/* --- Courses --- */
function loadCompletion() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}
function saveCompletion(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

function toggleCompletion(key) {
  var map = loadCompletion();
  map[key] = !map[key];
  saveCompletion(map);
  updateRowCompletionState(key, map[key]);
  refreshCompletionUI();
}

function loadArchived() {
  try {
    var raw = localStorage.getItem(ARCHIVED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveArchived(list) {
  try {
    localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
}

function loadCustomCourses() {
  try {
    var raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveCustomCourses(courses) {
  try {
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(courses));
  } catch (e) {
    alert("Failed to save. Storage may be full.");
  }
}

function loadCourseEdits() {
  try {
    return JSON.parse(localStorage.getItem(COURSE_EDIT_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function saveCourseEdits(edits) {
  try {
    localStorage.setItem(COURSE_EDIT_KEY, JSON.stringify(edits));
  } catch (e) {}
}

/* --- Study --- */
function loadStudyCompletion() {
  try {
    return JSON.parse(localStorage.getItem(STUDY_STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function saveStudyCompletion(map) {
  try {
    localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

function loadStudyLog() {
  try {
    return JSON.parse(localStorage.getItem(STUDY_LOG_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveStudyLog(log) {
  try {
    localStorage.setItem(STUDY_LOG_KEY, JSON.stringify(log));
  } catch (e) {}
}

function loadStudyWeek() {
  try {
    return localStorage.getItem(STUDY_WEEK_KEY) || "";
  } catch (e) {
    return "";
  }
}
function saveStudyWeek(val) {
  try {
    localStorage.setItem(STUDY_WEEK_KEY, val);
  } catch (e) {}
}

function loadStudyEdits() {
  try {
    return JSON.parse(localStorage.getItem(STUDY_EDIT_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function saveStudyEdits(edits) {
  try {
    localStorage.setItem(STUDY_EDIT_KEY, JSON.stringify(edits));
  } catch (e) {}
}

function loadCustomSubjects() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_SUBJECT_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveCustomSubjects(subjects) {
  try {
    localStorage.setItem(CUSTOM_SUBJECT_KEY, JSON.stringify(subjects));
  } catch (e) {}
}

function getAllStudyCourses() {
  return STUDY_COURSES.concat(loadCustomSubjects());
}

/* --- Todo --- */
function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(TODO_STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveTodos(list) {
  try {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
}

/* --- Daily task templates (recurring todos) --- */
function loadDailyTasks() {
  try {
    return JSON.parse(localStorage.getItem(DAILY_TASKS_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveDailyTasks(list) {
  try {
    localStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(list));
  } catch (e) {}
}

/* --- Finance --- */
function loadFinanceRecords() {
  try {
    if (
      !localStorage.getItem(FINANCE_STORAGE_KEY) &&
      localStorage.getItem("Finance_records")
    ) {
      localStorage.setItem(
        FINANCE_STORAGE_KEY,
        localStorage.getItem("Finance_records"),
      );
      localStorage.removeItem("Finance_records");
    }
  } catch (e) {}
  try {
    return JSON.parse(localStorage.getItem(FINANCE_STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveFinanceRecords(list) {
  try {
    localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
}

/* --- Certificate --- */
function loadCertificates() {
  try {
    var raw = localStorage.getItem(CERT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveCertificates(certs) {
  try {
    localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(certs));
  } catch (e) {
    alert("Gagal menyimpan: ukuran gambar terlalu besar untuk localStorage.");
  }
}

/* --- Settings --- */
function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function saveSettings(data) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  } catch (e) {}
}
function getDefaultSettings() {
  return {
    name: "",
    email: "",
    role: "",
    theme: "light",
    lightTheme: "cream",
    notifTodo: true,
    language: "en",
  };
}

/* Course notes */
function loadCourseNotes() {
  try {
    return JSON.parse(localStorage.getItem(COURSE_NOTES_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function saveCourseNotes(notes) {
  try {
    localStorage.setItem(COURSE_NOTES_KEY, JSON.stringify(notes));
  } catch (e) {}
}

/* ==========================================================================
     3. COURSE DATA HELPERS
   ========================================================================== */

function getCourseKey(course) {
  if (course.slug) return course.slug;
  if (typeof course.id === "string" && course.id.indexOf("custom_") === 0)
    return course.id;
  return "c_" + course.id;
}

function getCoursesWithCompletion() {
  var map = loadCompletion();
  var result = COURSES.map(function (course) {
    return Object.assign({}, course, {
      completed: !!map[getCourseKey(course)],
    });
  });
  var custom = loadCustomCourses();
  custom.forEach(function (c) {
    result.push(Object.assign({}, c, { completed: !!map[getCourseKey(c)] }));
  });
  var edits = loadCourseEdits();
  result.forEach(function (course) {
    var key = getCourseKey(course);
    if (edits[key]) Object.assign(course, edits[key]);
  });
  return result;
}

function applySearch(courses) {
  if (!searchQuery) return courses;
  var q = searchQuery.toLowerCase();
  return courses.filter(function (course) {
    var haystack = (
      course.title +
      " " +
      (course.description || "") +
      " " +
      (course.company || "") +
      " " +
      (course.role || "") +
      " " +
      (course.subCategory || "")
    ).toLowerCase();
    return haystack.indexOf(q) !== -1;
  });
}

function excludeArchived(courses) {
  var archived = loadArchived();
  if (!archived.length) return courses;
  return courses.filter(function (c) {
    return archived.indexOf(getCourseKey(c)) === -1;
  });
}

function getFilteredCourses() {
  var courses = getCoursesWithCompletion();
  courses = applySearch(courses);
  courses = excludeArchived(courses);
  if (filterRole)
    courses = courses.filter(function (c) {
      return c.role === filterRole;
    });
  if (filterCategory)
    courses = courses.filter(function (c) {
      return c.subCategory === filterCategory;
    });
  if (filterCompany)
    courses = courses.filter(function (c) {
      return c.company === filterCompany;
    });
  return courses;
}

function getAnalyticsCourses() {
  var courses = getCoursesWithCompletion();
  var archived = loadArchived();
  return courses.filter(function (c) {
    var key = getCourseKey(c);
    if (archived.indexOf(key) === -1) return true;
    if (c.completed) return true;
    return false;
  });
}

function getUniqueValues(field) {
  var seen = {};
  var result = [];
  getCoursesWithCompletion().forEach(function (c) {
    var val = c[field];
    if (val && !seen[val]) {
      seen[val] = true;
      result.push(val);
    }
  });
  return result.sort();
}

/* ==========================================================================
    4. STUDY HELPERS — Time, week, and course utilities
   ========================================================================== */

function parseJamRange(jamStr) {
  if (!jamStr || jamStr === "\u2013" || jamStr === "-")
    return { mulai: "08.00", selesai: "09.30" };
  var parts = jamStr.split(/[\u2013-]/).map(function (s) {
    return s.trim();
  });
  return { mulai: parts[0] || "08.00", selesai: parts[1] || "09.30" };
}

function formatJamRange(mulai, selesai) {
  return mulai + "\u2013" + selesai;
}

function getWeekNumber(date) {
  var d = new Date(date);
  d.setHours(0, 0, 0, 0);
  var day = d.getDay();
  var diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff + 1);
  var month = d.getMonth();
  var year = d.getFullYear();
  var firstJan = new Date(year, 0, 1);
  var days = Math.floor((d - firstJan) / 86400000);
  return Math.ceil((days + firstJan.getDay() + 1) / 7);
}

function getWeekLabel(weekNum) {
  var current = getWeekNumber(new Date());
  return weekNum === current ? "Minggu ini" : "Minggu ke-" + weekNum;
}

function checkStudyReset() {
  var now = new Date();
  var currentWeek = getWeekNumber(now);
  var savedWeek = loadStudyWeek();
  if (savedWeek !== "" && savedWeek == currentWeek) return false;
  saveStudyCompletion({});
  saveStudyWeek("" + currentWeek);
  return true;
}

function getHariIni() {
  var names = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return names[new Date().getDay()];
}

function getWeekDateRange() {
  var now = new Date();
  var day = now.getDay();
  var diff = day === 0 ? 6 : day - 1;
  var monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  var sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  var fmt = function (d) {
    return (
      d.getDate() +
      " " +
      [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ][d.getMonth()] +
      " " +
      d.getFullYear()
    );
  };
  return fmt(monday) + " \u2013 " + fmt(sunday);
}

function getStudyKey(mk) {
  return "mk_" + mk.kode;
}

/* ==========================================================================
    5. NAVIGATION
   ========================================================================== */

function navigateToCourse(key, slug) {
  window.location.href = "pages/course.html?id=" + key;
}

/* ==========================================================================
    6. UTILITY FUNCTIONS
   ========================================================================== */

function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function reinitLucide() {
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
}

function renderMarkdown(src) {
  if (!src) return "";
  var escaped = escapeHtml(src);
  var lines = escaped.split("\n");
  var html = [];
  var inList = false;
  function inline(text) {
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/(?:^|[^*_])_(.+?)_(?!\w)/g, function (m, p1) {
      return m.replace("_" + p1 + "_", "<em>" + p1 + "</em>");
    });
    text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
    text = text.replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
    return text;
  }
  lines.forEach(function (line) {
    var headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    var listMatch = line.match(/^[-*]\s+(.*)$/);
    if (headingMatch) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      var level = headingMatch[1].length;
      html.push(
        "<h" +
          (level + 3) +
          ">" +
          inline(headingMatch[2]) +
          "</h" +
          (level + 3) +
          ">",
      );
    } else if (listMatch) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push("<li>" + inline(listMatch[1]) + "</li>");
    } else if (line.trim() === "") {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
    } else {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push("<p>" + inline(line) + "</p>");
    }
  });
  if (inList) html.push("</ul>");
  return html.join("");
}

function stripMarkdown(src) {
  if (!src) return "";
  return src
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/^[-*]\s+/gm, "\u2022 ")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}

function insertMarkdownSyntax(textarea, type) {
  if (!textarea) return;
  var start = textarea.selectionStart,
    end = textarea.selectionEnd;
  var value = textarea.value,
    selected = value.slice(start, end);
  var before = value.slice(0, start),
    after = value.slice(end);
  var newText = "",
    cursorOffset = 0;
  switch (type) {
    case "bold":
      newText = "**" + (selected || "teks tebal") + "**";
      cursorOffset = selected ? newText.length : 2;
      break;
    case "italic":
      newText = "_" + (selected || "teks miring") + "_";
      cursorOffset = selected ? newText.length : 1;
      break;
    case "heading":
      newText = "### " + (selected || "Judul");
      cursorOffset = newText.length;
      break;
    case "list":
      newText = selected
        ? selected
            .split("\n")
            .map(function (l) {
              return "- " + l;
            })
            .join("\n")
        : "- item";
      cursorOffset = newText.length;
      break;
    case "link":
      newText = "[" + (selected || "teks link") + "](https://)";
      cursorOffset = newText.length;
      break;
    default:
      return;
  }
  textarea.value = before + newText + after;
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + cursorOffset;
}

/* ==========================================================================
    6a. BACKEND SYNC — API fetch, sync to/from server
   ========================================================================== */

const API_BASE = "/api";

async function apiFetch(path, options) {
  var token = sessionStorage.getItem("session_token");
  try {
    var res = await fetch(
      API_BASE + path,
      Object.assign(
        {
          headers: Object.assign(
            {
              "Content-Type": "application/json",
            },
            token ? { Authorization: "Bearer " + token } : {},
          ),
        },
        options,
      ),
    );
    if (res.status === 401) {
      sessionStorage.clear();
      window.location.href = "login.html";
      return null;
    }
    return res;
  } catch (e) {
    return null;
  }
}

async function syncToServer() {
  var token = sessionStorage.getItem("session_token");
  if (!token) return;
  var data = {
    courses: {},
    study: {},
    todos: {},
    finance: {},
    certificates: {},
    settings: {},
  };
  data.courses[STORAGE_KEY] = loadCompletion();
  data.courses[CUSTOM_STORAGE_KEY] = loadCustomCourses();
  data.courses[ARCHIVED_STORAGE_KEY] = loadArchived();
  data.courses[COURSE_EDIT_KEY] = loadCourseEdits();
  data.courses[COURSE_NOTES_KEY] = loadCourseNotes();
  data.study[STUDY_STORAGE_KEY] = loadStudyCompletion();
  data.study[STUDY_LOG_KEY] = loadStudyLog();
  data.study[STUDY_WEEK_KEY] = loadStudyWeek();
  data.study[STUDY_EDIT_KEY] = loadStudyEdits();
  data.study[CUSTOM_SUBJECT_KEY] = loadCustomSubjects();
  data.todos[TODO_STORAGE_KEY] = loadTodos();
  data.todos[DAILY_TASKS_KEY] = loadDailyTasks();
  data.finance[FINANCE_STORAGE_KEY] = loadFinanceRecords();
  data.certificates[CERT_STORAGE_KEY] = loadCertificates();
  data.settings[SETTINGS_KEY] = loadSettings();
  try {
    await apiFetch("/data", { method: "POST", body: JSON.stringify(data) });
  } catch (e) {}
}

async function loadFromServer() {
  var token = sessionStorage.getItem("session_token");
  if (!token) return false;
  try {
    var res = await apiFetch("/data");
    if (!res || !res.ok) return false;
    var data = await res.json();
    Object.keys(data).forEach(function (feature) {
      Object.keys(data[feature]).forEach(function (key) {
        try {
          /* Merge: isi hanya key yang belum ada di localStorage agar data lokal (yang lebih baru) tidak ditimpa */
          if (localStorage.getItem(key) === null) {
            localStorage.setItem(key, JSON.stringify(data[feature][key]));
          }
        } catch (e) {}
      });
    });
    return true;
  } catch (e) {
    return false;
  }
}

/* ==========================================================================
    6b. CUSTOM DROPDOWN — Generic view-dropdown builder
   ========================================================================== */

function createViewDropdown(
  containerId,
  options,
  selectedValue,
  onChange,
  isTime,
) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var panelCls = isTime ? " view-dropdown__panel--time" : "";
  var selVal = selectedValue || options[0] || "";
  var html =
    '<div class="view-dropdown" id="dd-' +
    containerId +
    '" style="min-width:100%;">' +
    '<button class="view-dropdown__trigger" type="button"><span class="view-dropdown__label">' +
    selVal +
    '</span><i data-lucide="chevron-down"></i></button>' +
    '<div class="view-dropdown__panel' +
    panelCls +
    '">';
  options.forEach(function (opt) {
    var sel = opt === selVal ? " is-selected" : "";
    html +=
      '<button class="view-dropdown__item' +
      sel +
      '" data-value="' +
      opt.replace(/"/g, "&quot;") +
      '">' +
      opt +
      "</button>";
  });
  html += "</div></div>";
  container.innerHTML = html;
  reinitLucide();
  var dd = document.getElementById("dd-" + containerId);
  var trigger = dd.querySelector(".view-dropdown__trigger");
  var items = dd.querySelectorAll(".view-dropdown__item");
  var labelEl = trigger.querySelector(".view-dropdown__label");
  trigger.addEventListener("click", function (e) {
    e.stopPropagation();
    dd.classList.toggle("is-open");
  });
  items.forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.stopPropagation();
      items.forEach(function (i) {
        i.classList.remove("is-selected");
      });
      item.classList.add("is-selected");
      labelEl.textContent = item.textContent.trim();
      dd.classList.remove("is-open");
      if (onChange) onChange(item.dataset.value);
    });
  });
  document.addEventListener("click", function () {
    dd.classList.remove("is-open");
  });
  return selVal;
}

function getViewDropdownValue(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return "";
  var selected = container.querySelector(".view-dropdown__item.is-selected");
  return selected ? selected.dataset.value : "";
}

/* Finance formatters (also used by header counter) */
function formatRupiah(num) {
  if (num === undefined || num === null) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getCurrencySymbol(currency) {
  var map = {
    IDR: "Rp",
    USD: "$",
    EUR: "\u20ac",
    GBP: "\u00a3",
    JPY: "\u00a5",
    KRW: "\u20a9",
    CNY: "\u00a5",
    SGD: "$",
    MYR: "RM",
    AUD: "$",
    CAD: "$",
    CHF: "Fr",
    HKD: "$",
    THB: "\u0e3f",
    INR: "\u20b9",
    PHP: "\u20b1",
    VND: "\u20ab",
    SAR: "\ufdfc",
  };
  return map[currency] || currency;
}

function formatCurrency(amount, currency) {
  return getCurrencySymbol(currency || "IDR") + " " + formatRupiah(amount || 0);
}

/* ==========================================================================
    7. TAB SWITCHING — Sidebar navigation, header counters
   ========================================================================== */

function getCurrentActiveTab() {
  var activeTab = document.querySelector(".tab[data-tab].active");
  return activeTab ? activeTab.dataset.tab : "courses";
}

function switchTab(tabName) {
  syncToServer();
  document.querySelectorAll(".tab[data-tab]").forEach(function (tab) {
    var isActive = tab.dataset.tab === tabName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive);
  });
  document
    .querySelectorAll(".bottom-nav__item[data-tab]")
    .forEach(function (item) {
      item.classList.toggle("active", item.dataset.tab === tabName);
    });
  updateHeaderCounter(tabName);
  updateTodoDueBadge();
  document
    .getElementById("panel-courses")
    .classList.toggle("hidden", tabName !== "courses");
  document
    .getElementById("panel-analytics")
    .classList.toggle("hidden", tabName !== "analytics");
  document
    .getElementById("panel-certificate")
    .classList.toggle("hidden", tabName !== "certificate");
  document
    .getElementById("panel-archived")
    .classList.toggle("hidden", tabName !== "archived");
  document
    .getElementById("panel-study")
    .classList.toggle("hidden", tabName !== "study");
  document
    .getElementById("panel-journal")
    .classList.toggle("hidden", tabName !== "journal");
  document
    .getElementById("panel-todo")
    .classList.toggle("hidden", tabName !== "todo");
  document
    .getElementById("panel-finance")
    .classList.toggle("hidden", tabName !== "finance");
  var headerCounter = document.getElementById("header-counter");
  if (headerCounter)
    headerCounter.classList.toggle("hidden", tabName === "analytics");
  switch (tabName) {
    case "analytics":
      renderAnalytics();
      renderStudyAnalytics();
      renderTodoAnalytics();
      renderFinanceAnalytics();
      break;
    case "certificate":
      renderCertificateGallery();
      break;
    case "archived":
      renderArchivedTable();
      break;
    case "study":
      renderStudy();
      break;
    case "journal":
      renderStudyLog();
      break;
    case "todo":
      renderTodos();
      break;
    case "finance":
      renderFinance();
      break;
  }
}

function attachTabListeners() {
  document.querySelectorAll(".tab[data-tab]").forEach(function (tab) {
    tab.addEventListener("click", function () {
      switchTab(tab.dataset.tab);
    });
  });
  document
    .querySelectorAll(".bottom-nav__item[data-tab]")
    .forEach(function (item) {
      item.addEventListener("click", function () {
        switchTab(item.dataset.tab);
        closeBottomSheet();
      });
    });
  document
    .querySelectorAll(".bottom-sheet__item[data-tab]")
    .forEach(function (item) {
      item.addEventListener("click", function () {
        switchTab(item.dataset.tab);
        closeBottomSheet();
      });
    });
}

function closeBottomSheet() {
  document.getElementById("bottom-sheet").classList.remove("is-open");
  document.getElementById("bottom-sheet-overlay").classList.remove("is-open");
}

function toggleBottomSheet() {
  var sheet = document.getElementById("bottom-sheet");
  var overlay = document.getElementById("bottom-sheet-overlay");
  var isOpen = sheet.classList.contains("is-open");
  sheet.classList.toggle("is-open", !isOpen);
  overlay.classList.toggle("is-open", !isOpen);
}

function updateHeaderCounter(tabName) {
  var labelLeft = document.querySelector(
    "#header-required-count",
  ).previousElementSibling;
  var valueLeft = document.getElementById("header-required-count");
  var labelRight = document.querySelector(
    "#header-total-count",
  ).previousElementSibling;
  var valueRight = document.getElementById("header-total-count");
  switch (tabName) {
    case "courses":
    case "analytics": {
      var allCourses = getCoursesWithCompletion();
      var completed = allCourses.filter(function (c) {
        return c.completed;
      }).length;
      labelLeft.textContent = __("head-completed");
      valueLeft.textContent = completed + " / " + allCourses.length;
      labelRight.textContent = __("head-total");
      valueRight.textContent = allCourses.length;
      break;
    }
    case "study": {
      var studyComp = loadStudyCompletion();
      var studyDone = getAllStudyCourses().filter(function (m) {
        return !!studyComp["mk_" + m.kode];
      }).length;
      labelLeft.textContent = __("head-minggu-ini");
      valueLeft.textContent = studyDone + " / " + getAllStudyCourses().length;
      labelRight.textContent = __("head-mata-kuliah");
      valueRight.textContent = getAllStudyCourses().length;
      break;
    }
    case "journal": {
      var log = loadStudyLog();
      labelLeft.textContent = __("head-entries");
      valueLeft.textContent = log.length;
      labelRight.textContent = __("head-learning-log");
      valueRight.textContent = "";
      break;
    }
    case "certificate": {
      var certs = loadCertificates();
      labelLeft.textContent = __("head-certificates");
      valueLeft.textContent = certs.length;
      labelRight.textContent = __("head-total-label");
      valueRight.textContent = certs.length;
      break;
    }
    case "archived": {
      var archivedKeys = loadArchived();
      var allArch = getCoursesWithCompletion();
      var archivedCount = allArch.filter(function (c) {
        return archivedKeys.indexOf(getCourseKey(c)) !== -1;
      }).length;
      labelLeft.textContent = __("head-archived");
      valueLeft.textContent = archivedCount;
      labelRight.textContent = __("head-total-label");
      valueRight.textContent = archivedCount;
      break;
    }
    case "todo": {
      var todos = loadTodos();
      var todoDone = todos.filter(function (t) {
        return t.completed;
      }).length;
      labelLeft.textContent = __("head-done");
      valueLeft.textContent = todoDone + " / " + todos.length;
      labelRight.textContent = __("head-tasks");
      valueRight.textContent = todos.length;
      break;
    }
    case "finance": {
      var financeRecords = loadFinanceRecords();
      var financeTotal = financeRecords.reduce(function (sum, r) {
        return sum + (r.amount || 0);
      }, 0);
      labelLeft.textContent = __("head-total-label");
      valueLeft.textContent = "Rp " + formatRupiah(financeTotal);
      labelRight.textContent = __("head-transactions");
      valueRight.textContent = financeRecords.length;
      break;
    }
  }
}

/* ==========================================================================
    8. COMPLETION UI — Header counters, progress bars, analytics sync
   ========================================================================== */

function refreshCompletionUI() {
  var allCourses = getCoursesWithCompletion();
  var courses = getAnalyticsCourses();
  var completed = courses.filter(function (c) {
    return c.completed;
  });
  var totalCompleted = completed.length;
  var phase1Done = completed.filter(function (c) {
    return c.phase === 1;
  }).length;
  var phase3Done = completed.filter(function (c) {
    return c.phase === 3;
  }).length;

  var completedCount = document.getElementById("courses-completed-count");
  var totalCount = document.getElementById("courses-total-count");
  if (completedCount) completedCount.textContent = totalCompleted;
  if (totalCount) totalCount.textContent = courses.length;

  var statTotal = document.getElementById("stat-total-completed");
  var statTotalAll = document.getElementById("stat-total-all");
  var statPhase1 = document.getElementById("stat-phase1-completed");
  var statPhase3 = document.getElementById("stat-phase3-completed");
  if (statTotal) statTotal.textContent = totalCompleted;
  if (statTotalAll) statTotalAll.textContent = courses.length;
  if (statPhase1) statPhase1.textContent = phase1Done;
  if (statPhase3) statPhase3.textContent = phase3Done;

  /* Update dynamic Phase totals */
  var phase1Total = courses.filter(function (c) {
    return c.phase === 1;
  }).length;
  var phase3Total = courses.filter(function (c) {
    return c.phase === 3;
  }).length;
  var elPhase1 = document.getElementById("stat-phase1-total");
  var elPhase3 = document.getElementById("stat-phase3-total");
  if (elPhase1) elPhase1.textContent = phase1Total;
  if (elPhase3) elPhase3.textContent = phase3Total;

  updateProgressBars(courses);

  var analyticsPanel = document.getElementById("panel-analytics");
  if (analyticsPanel && !analyticsPanel.classList.contains("hidden"))
    renderCharts(courses);

  updateHeaderCounter(getCurrentActiveTab());
}

function updateProgressBars(courses) {
  var roles = [
    { key: "fullstack", field: "FullStack Developer" },
    { key: "software", field: "Software Engineer" },
    { key: "ai", field: "AI Engineer" },
    { key: "others", field: "Others" },
  ];
  roles.forEach(function (role) {
    var total = courses.filter(function (c) {
      return c.role === role.field;
    }).length;
    var done = courses.filter(function (c) {
      return c.role === role.field && c.completed;
    }).length;
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    var label = document.getElementById("progress-label-" + role.key);
    var fill = document.getElementById("progress-fill-" + role.key);
    if (label) label.textContent = done + " / " + total;
    if (fill) fill.style.width = pct + "%";
  });
}

function updateRowCompletionState(key, completed) {
  var row = document.querySelector('tr[data-course-key="' + key + '"]');
  if (!row) return;
  row.classList.toggle("is-completed", completed);
  var input = row.querySelector('input[data-course-key="' + key + '"]');
  if (input) {
    input.checked = completed;
    input.setAttribute("aria-checked", completed);
  }
}

/* ==========================================================================
    9. TODO DUE-DATE HELPERS (used by init and other modules)
   ========================================================================== */

function getTodoDueStatus(t) {
  if (t.completed || !t.dueDate) return null;
  var today = getTodayDateStr();
  if (t.dueDate < today) return "overdue";
  if (t.dueDate === today) return "due-today";
  return null;
}

function getDueTodos() {
  return loadTodos().filter(function (t) {
    return !!getTodoDueStatus(t);
  });
}

function isNotifTodoEnabled() {
  var settings = loadSettings();
  return settings.notifTodo !== false;
}

function updateTodoDueBadge() {
  var badge = document.getElementById("todo-due-badge");
  if (!badge) return;
  if (!isNotifTodoEnabled()) {
    badge.classList.add("hidden");
    return;
  }
  var due = getDueTodos();
  if (due.length > 0) {
    badge.textContent = due.length > 99 ? "99+" : "" + due.length;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function renderTodoDueBanner() {
  var banner = document.getElementById("todo-due-banner");
  if (!banner) return;
  if (!isNotifTodoEnabled() || todoBannerDismissedToday) {
    banner.classList.add("hidden");
    banner.innerHTML = "";
    return;
  }
  var due = getDueTodos();
  if (!due.length) {
    banner.classList.add("hidden");
    banner.innerHTML = "";
    return;
  }
  var overdueCount = due.filter(function (t) {
    return getTodoDueStatus(t) === "overdue";
  }).length;
  var todayCount = due.length - overdueCount;
  var parts = [];
  if (overdueCount) parts.push(overdueCount + " overdue");
  if (todayCount) parts.push(todayCount + " due today");
  var message = parts.join(", ") + (due.length === 1 ? " task" : " tasks");
  banner.innerHTML =
    '<div class="todo-due-banner__text"><i data-lucide="alert-triangle"></i><span>' +
    escapeHtml(message.charAt(0).toUpperCase() + message.slice(1)) +
    '</span></div><button class="todo-due-banner__close" id="todo-due-banner-close" aria-label="Dismiss" title="Dismiss"><i data-lucide="x"></i></button>';
  banner.classList.remove("hidden");
  reinitLucide();
  var closeBtn = document.getElementById("todo-due-banner-close");
  if (closeBtn)
    closeBtn.addEventListener("click", function () {
      todoBannerDismissedToday = true;
      sessionStorage.setItem(TODO_BANNER_DISMISS_KEY, getTodayDateStr());
      banner.classList.add("hidden");
      banner.innerHTML = "";
    });
}

function refreshTodoDueReminders() {
  updateTodoDueBadge();
  renderTodoDueBanner();
}

/* ==========================================================================
    10. SETTINGS HELPERS — Theme and profile
   ========================================================================== */

function applyTheme(theme, lightTheme) {
  var lt = lightTheme || "cream";
  var setLight = function () {
    if (lt === "cream") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", lt);
  };
  if (theme === "dark")
    document.documentElement.setAttribute("data-theme", "dark");
  else if (theme === "light") setLight();
  else {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      document.documentElement.setAttribute("data-theme", "dark");
    else setLight();
  }
}

function updateLightThemeVisibility(theme) {
  var wrap = document.getElementById("settings-light-theme-wrap");
  if (!wrap) return;
  var isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  wrap.classList.toggle("hidden", isDark);
}

function initProfile() {
  var settings = loadSettings();
  var sessionUser = sessionStorage.getItem("session_user");

  /* Jika belum ada nama profil, pakai username dari login */
  if (!settings.name && sessionUser) {
    settings.name = sessionUser;
    saveSettings(settings);
  }

  if (settings.theme) applyTheme(settings.theme, settings.lightTheme);
  updateSidebarProfile(Object.assign(getDefaultSettings(), settings));
}

function updateSidebarProfile(data) {
  var nameEl = document.querySelector(".sidebar-profile__name");
  var emailEl = document.querySelector(".sidebar-profile__email");
  var imgEl = document.querySelector(".sidebar-profile__img");
  if (nameEl) nameEl.textContent = data.name || "User";
  if (emailEl) emailEl.textContent = data.email || "—";
  if (imgEl) imgEl.src = data.avatar || "assets/image/emptyProfile.webp";

  /* Sync bottom sheet profile */
  var bsName = document.getElementById("bottom-sheet-name");
  var bsRole = document.getElementById("bottom-sheet-role");
  var bsAvatar = document.getElementById("bottom-sheet-avatar");
  if (bsName) bsName.textContent = data.name || "User";
  if (bsRole) bsRole.textContent = data.email || "";
  if (bsAvatar) bsAvatar.src = data.avatar || "assets/image/emptyProfile.webp";
}

/* ==========================================================================
    11a. CONFIRM MODAL — Generic confirmation dialog
   ========================================================================== */

var confirmCallback = null;

function showConfirm(title, message, onConfirm) {
  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-body").textContent = message;
  confirmCallback = onConfirm;
  var okBtn = document.getElementById("confirm-ok");
  okBtn.innerHTML = '<i data-lucide="trash-2"></i> Ya';
  reinitLucide();
  document.getElementById("confirm-modal").classList.add("is-open");
}

function showAlert(message) {
  document.getElementById("confirm-title").textContent = "Perhatian";
  document.getElementById("confirm-body").textContent = message;
  confirmCallback = function () {};
  var okBtn = document.getElementById("confirm-ok");
  okBtn.innerHTML = '<i data-lucide="check"></i> OK';
  reinitLucide();
  document.getElementById("confirm-modal").classList.add("is-open");
}

/* ==========================================================================
    12. INIT — Entry point, wires all event listeners
   ========================================================================== */

function init() {
  attachTabListeners();
  attachFilterListeners();
  buildFilterDropdowns();
  reinitLucide();
  showSkeletonRows(20);

  /* Bottom nav & sheet listeners */
  var moreBtn = document.getElementById("bottom-nav-more");
  if (moreBtn) moreBtn.addEventListener("click", toggleBottomSheet);
  var sheetOverlay = document.getElementById("bottom-sheet-overlay");
  if (sheetOverlay) sheetOverlay.addEventListener("click", closeBottomSheet);
  var sheetProfile = document.getElementById("bottom-sheet-profile");
  if (sheetProfile)
    sheetProfile.addEventListener("click", function () {
      closeBottomSheet();
      openSettings();
    });

  /* Load data dari server jika ada session */
  var hasSession = !!sessionStorage.getItem("session_token");
  if (hasSession) {
    loadFromServer().then(function (loaded) {
      if (!loaded) syncToServer();
      initProfile();
      /* Terapkan bahasa dari settings yang baru dimuat dari server */
      var s = loadSettings();
      if (s && s.language && typeof DASHBOARD_LANG !== "undefined" && DASHBOARD_LANG.setLang) {
        DASHBOARD_LANG.setLang(s.language);
      }
      renderTable();
      refreshCompletionUI();
      updateTodoDueBadge();
    });
  } else {
    setTimeout(function () {
      initProfile();
      renderTable();
      refreshCompletionUI();
      updateTodoDueBadge();
    }, 300);
  }

  /* --- Certificate modal --- */
  var addBtn = document.getElementById("cert-add-btn");
  if (addBtn)
    addBtn.addEventListener("click", function () {
      openCertModal("add");
    });
  var cancelBtn = document.getElementById("cert-modal-cancel");
  if (cancelBtn) cancelBtn.addEventListener("click", closeCertModal);
  var saveBtn = document.getElementById("cert-modal-save");
  if (saveBtn) saveBtn.addEventListener("click", saveCertFromModal);
  var imageInput = document.getElementById("cert-input-image");
  if (imageInput) {
    imageInput.addEventListener("change", function () {
      var file = imageInput.files[0];
      if (!file) return;
      handleCertImageUpload(file, function (base64) {
        var preview = document.getElementById("cert-image-preview");
        preview.src = base64;
        preview.dataset.newImage = "true";
        document.getElementById("cert-drop-zone").classList.add("has-image");
      });
    });
  }
  var dropZone = document.getElementById("cert-drop-zone");
  if (dropZone && imageInput) {
    ["dragenter", "dragover"].forEach(function (evt) {
      dropZone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("drag-over");
      });
    });
    ["dragleave", "drop"].forEach(function (evt) {
      dropZone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("drag-over");
      });
    });
    dropZone.addEventListener("drop", function (e) {
      var files = e.dataTransfer.files;
      if (files && files.length) {
        imageInput.files = files;
        imageInput.dispatchEvent(new Event("change"));
      }
    });
    dropZone.addEventListener("click", function (e) {
      if (e.target.closest(".file-drop-zone__preview-actions")) return;
      imageInput.click();
    });
  }
  var certImageChange = document.getElementById("cert-image-change");
  if (certImageChange)
    certImageChange.addEventListener("click", function (e) {
      e.stopPropagation();
      imageInput.click();
    });
  var certImageRemove = document.getElementById("cert-image-remove");
  if (certImageRemove)
    certImageRemove.addEventListener("click", function (e) {
      e.stopPropagation();
      imageInput.value = "";
      var preview = document.getElementById("cert-image-preview");
      preview.src = "";
      delete preview.dataset.newImage;
      document.getElementById("cert-drop-zone").classList.remove("has-image");
    });
  var certModal = document.getElementById("cert-modal");
  if (certModal)
    certModal.addEventListener("click", function (e) {
      if (e.target === certModal) closeCertModal();
    });
  var deleteCancel = document.getElementById("cert-delete-cancel");
  if (deleteCancel) deleteCancel.addEventListener("click", closeDeleteModal);
  var deleteModal = document.getElementById("cert-delete-modal");
  if (deleteModal)
    deleteModal.addEventListener("click", function (e) {
      if (e.target === deleteModal) closeDeleteModal();
    });

  /* --- Add Course modal --- */
  var addCourseBtn = document.getElementById("add-course-btn");
  if (addCourseBtn)
    addCourseBtn.addEventListener("click", function () {
      createViewDropdown(
        "add-course-role-container",
        ["FullStack Developer", "Software Engineer", "AI Engineer", "Others"],
        "Others",
      );
      createViewDropdown("add-course-phase-container", ["1", "2", "3"], "1");
      courseEditKey = null;
      document.getElementById("add-course-modal").classList.add("is-open");
    });
  var addCourseCancel = document.getElementById("add-course-cancel");
  if (addCourseCancel)
    addCourseCancel.addEventListener("click", function () {
      document.getElementById("add-course-modal").classList.remove("is-open");
    });
  var addCourseSave = document.getElementById("add-course-save");
  if (addCourseSave)
    addCourseSave.addEventListener("click", function () {
      var title = document.getElementById("add-course-title").value.trim();
      var desc = document.getElementById("add-course-desc").value.trim();
      var category = document
        .getElementById("add-course-category")
        .value.trim();
      var company = document.getElementById("add-course-company").value.trim();
      var url = document.getElementById("add-course-url").value.trim();
      var role = getViewDropdownValue("add-course-role-container") || "Others";
      var phase =
        parseInt(getViewDropdownValue("add-course-phase-container")) || 1;
      if (!title) {
        showAlert("Please enter a course name.");
        return;
      }
      if (!category) {
        showAlert("Please enter a category.");
        return;
      }
      if (!company) {
        showAlert("Please enter a company or platform.");
        return;
      }
      var courses = loadCustomCourses();
      if (courseEditKey) {
        var found = false;
        for (var ci = 0; ci < courses.length; ci++) {
          if (getCourseKey(courses[ci]) === courseEditKey) {
            courses[ci].title = title;
            courses[ci].description = desc;
            courses[ci].subCategory = category;
            courses[ci].company = company;
            courses[ci].url = url;
            courses[ci].role = role;
            courses[ci].phase = phase;
            found = true;
            break;
          }
        }
        if (!found) {
          var edits = loadCourseEdits();
          edits[courseEditKey] = {
            title: title,
            description: desc,
            subCategory: category,
            company: company,
            url: url,
            role: role,
            phase: phase,
          };
          saveCourseEdits(edits);
        }
        courseEditKey = null;
      } else {
        courses.push({
          id: "custom_" + Date.now(),
          title: title,
          description: desc,
          subCategory: category,
          company: company,
          url: url,
          role: role,
          phase: phase,
          completed: false,
        });
      }
      saveCustomCourses(courses);
      [
        "add-course-title",
        "add-course-desc",
        "add-course-category",
        "add-course-company",
        "add-course-url",
      ].forEach(function (id) {
        document.getElementById(id).value = "";
      });
      document.getElementById("add-course-modal").classList.remove("is-open");
      renderTable();
      refreshCompletionUI();
    });
  var addModal = document.getElementById("add-course-modal");
  if (addModal)
    addModal.addEventListener("click", function (e) {
      if (e.target === addModal) addModal.classList.remove("is-open");
    });

  /* --- Study entry modal --- */
  var studySave = document.getElementById("study-entry-save");
  var studyCancel = document.getElementById("study-entry-cancel");
  var studyModal = document.getElementById("study-entry-modal");
  if (studySave) studySave.addEventListener("click", saveStudyEntry);
  if (studyCancel) studyCancel.addEventListener("click", closeStudyEntryModal);
  if (studyModal)
    studyModal.addEventListener("click", function (e) {
      if (e.target === studyModal) closeStudyEntryModal();
    });
  var studyImageInput = document.getElementById("study-input-image");
  if (studyImageInput)
    studyImageInput.addEventListener("change", function () {
      var file = studyImageInput.files[0];
      if (file) handleStudyImageUpload(file);
    });
  var studyDropZone = document.getElementById("study-drop-zone");
  if (studyDropZone && studyImageInput) {
    ["dragenter", "dragover"].forEach(function (evt) {
      studyDropZone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        studyDropZone.classList.add("drag-over");
      });
    });
    ["dragleave", "drop"].forEach(function (evt) {
      studyDropZone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        studyDropZone.classList.remove("drag-over");
      });
    });
    studyDropZone.addEventListener("drop", function (e) {
      var files = e.dataTransfer.files;
      if (files && files.length) {
        studyImageInput.files = files;
        studyImageInput.dispatchEvent(new Event("change"));
      }
    });
    studyDropZone.addEventListener("click", function (e) {
      if (e.target.closest(".file-drop-zone__preview-actions")) return;
      studyImageInput.click();
    });
  }
  var studyImageChange = document.getElementById("study-image-change");
  if (studyImageChange)
    studyImageChange.addEventListener("click", function (e) {
      e.stopPropagation();
      studyImageInput.click();
    });
  var studyImageRemove = document.getElementById("study-image-remove");
  if (studyImageRemove)
    studyImageRemove.addEventListener("click", function (e) {
      e.stopPropagation();
      studyImageInput.value = "";
      var preview = document.getElementById("study-image-preview");
      preview.src = "";
      delete preview.dataset.blob;
      document.getElementById("study-drop-zone").classList.remove("has-image");
    });
  var mdToolbar = document.getElementById("study-ringkasan-toolbar");
  if (mdToolbar)
    mdToolbar.addEventListener("click", function (e) {
      var btn = e.target.closest(".markdown-toolbar__btn");
      if (!btn) return;
      insertMarkdownSyntax(
        document.getElementById("study-entry-ringkasan"),
        btn.dataset.md,
      );
    });

  /* --- Journal detail lightbox --- */
  var journalDetailClose = document.getElementById("journal-detail-close");
  if (journalDetailClose)
    journalDetailClose.addEventListener("click", closeJournalDetailLightbox);
  var journalDetailModal = document.getElementById("journal-detail-modal");
  if (journalDetailModal)
    journalDetailModal.addEventListener("click", function (e) {
      if (e.target === journalDetailModal) closeJournalDetailLightbox();
    });
  var journalDetailEdit = document.getElementById("journal-detail-edit");
  if (journalDetailEdit)
    journalDetailEdit.addEventListener("click", function () {
      var log = loadStudyLog();
      var entry = log.find(function (e) {
        return e.id === journalDetailEntryId;
      });
      if (!entry) return;
      closeJournalDetailLightbox();
      openJournalEditModal(entry);
    });
  var journalDetailDelete = document.getElementById("journal-detail-delete");
  if (journalDetailDelete)
    journalDetailDelete.addEventListener("click", function () {
      requestDeleteJournalEntry(journalDetailEntryId);
    });
  var journalDeleteCancel = document.getElementById("journal-delete-cancel");
  if (journalDeleteCancel)
    journalDeleteCancel.addEventListener("click", function () {
      document
        .getElementById("journal-delete-modal")
        .classList.remove("is-open");
    });
  var journalDeleteConfirmBtn = document.getElementById(
    "journal-delete-confirm",
  );
  if (journalDeleteConfirmBtn)
    journalDeleteConfirmBtn.addEventListener(
      "click",
      confirmDeleteJournalEntry,
    );
  var journalDeleteModal = document.getElementById("journal-delete-modal");
  if (journalDeleteModal)
    journalDeleteModal.addEventListener("click", function (e) {
      if (e.target === journalDeleteModal)
        journalDeleteModal.classList.remove("is-open");
    });

  /* --- Study edit modal --- */
  var studyEditSave = document.getElementById("study-edit-save");
  if (studyEditSave) studyEditSave.addEventListener("click", saveStudyEdit);
  var studyEditCancel = document.getElementById("study-edit-cancel");
  if (studyEditCancel)
    studyEditCancel.addEventListener("click", closeStudyEditModal);
  var studyEditModal = document.getElementById("study-edit-modal");
  if (studyEditModal)
    studyEditModal.addEventListener("click", function (e) {
      if (e.target === studyEditModal) closeStudyEditModal();
    });

  /* --- Study add subject modal --- */
  var studyAddBtn = document.getElementById("study-add-subject-btn");
  if (studyAddBtn) studyAddBtn.addEventListener("click", openStudyAddModal);
  var studyAddSave = document.getElementById("study-add-save");
  if (studyAddSave) studyAddSave.addEventListener("click", saveStudyAdd);
  var studyAddCancel = document.getElementById("study-add-cancel");
  if (studyAddCancel)
    studyAddCancel.addEventListener("click", closeStudyAddModal);
  var studyAddModal = document.getElementById("study-add-modal");
  if (studyAddModal)
    studyAddModal.addEventListener("click", function (e) {
      if (e.target === studyAddModal) closeStudyAddModal();
    });

  /* --- To-do tab --- */
  var todoAddBtn = document.getElementById("todo-add-btn");
  if (todoAddBtn)
    todoAddBtn.addEventListener("click", function () {
      openTodoModal("add");
    });
  var todoAddDailyBtn = document.getElementById("todo-add-daily-btn");
  if (todoAddDailyBtn)
    todoAddDailyBtn.addEventListener("click", function () {
      openTodoModal("daily");
    });
  var todoSave = document.getElementById("todo-modal-save");
  if (todoSave) todoSave.addEventListener("click", saveTodoFromModal);
  var todoCancel = document.getElementById("todo-modal-cancel");
  if (todoCancel) todoCancel.addEventListener("click", closeTodoModal);
  var todoModal = document.getElementById("todo-modal");
  if (todoModal)
    todoModal.addEventListener("click", function (e) {
      if (e.target === todoModal) closeTodoModal();
    });
  var todoDelConfirm = document.getElementById("todo-delete-confirm");
  if (todoDelConfirm)
    todoDelConfirm.addEventListener("click", function () {
      var id = todoDelConfirm.dataset.targetId;
      if (id) {
        var list = loadTodos();
        var target = list.find(function (t) {
          return t.id === id;
        });
        if (target && target.isDaily) {
          var templates = loadDailyTasks();
          templates = templates.filter(function (tmpl) {
            return tmpl.id !== target.dailyTemplateId;
          });
          saveDailyTasks(templates);
          list = list.filter(function (t) {
            return !(t.isDaily && t.dailyTemplateId === target.dailyTemplateId);
          });
        } else {
          list = list.filter(function (t) {
            return t.id !== id;
          });
        }
        saveTodos(list);
        renderTodos();
        if (typeof scheduleTodoSync === "function") scheduleTodoSync();
      }
      document.getElementById("todo-delete-modal").classList.remove("is-open");
    });
  var todoDelCancel = document.getElementById("todo-delete-cancel");
  if (todoDelCancel)
    todoDelCancel.addEventListener("click", function () {
      document.getElementById("todo-delete-modal").classList.remove("is-open");
    });
  var todoDelModal = document.getElementById("todo-delete-modal");
  if (todoDelModal)
    todoDelModal.addEventListener("click", function (e) {
      if (e.target === todoDelModal) todoDelModal.classList.remove("is-open");
    });
  var todoPrioGroup = document.getElementById("todo-priority-group");
  if (todoPrioGroup)
    todoPrioGroup.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn-group__item");
      if (!btn) return;
      todoPrioGroup.querySelectorAll(".btn-group__item").forEach(function (b) {
        b.classList.remove("btn-group__item--active");
      });
      btn.classList.add("btn-group__item--active");
      document.getElementById("todo-input-priority").value = btn.dataset.value;
    });

  /* --- Daily task rollover: auto re-spawn at midnight while page is open --- */
  setInterval(function () {
    if (typeof ensureDailyTasksForToday === "function") {
      ensureDailyTasksForToday();
      var todoTab = document.querySelector('.tab[data-tab="todo"]');
      if (todoTab && todoTab.classList.contains("active")) renderTodos();
    }
  }, 60000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && typeof ensureDailyTasksForToday === "function") {
      ensureDailyTasksForToday();
      var todoTab = document.querySelector('.tab[data-tab="todo"]');
      if (todoTab && todoTab.classList.contains("active")) renderTodos();
    }
  });

  /* --- Finance tab --- */
  var FinanceAddBtn = document.getElementById("finance-add-btn");
  if (FinanceAddBtn) FinanceAddBtn.addEventListener("click", openFinanceModal);
  var FinanceCurrDD = document.getElementById("finance-currency-dropdown");
  if (FinanceCurrDD) {
    var currTrigger = FinanceCurrDD.querySelector(".view-dropdown__trigger");
    var currLabel = document.getElementById("finance-currency-label");
    if (currTrigger)
      currTrigger.addEventListener("click", function (e) {
        e.stopPropagation();
        FinanceCurrDD.classList.toggle("is-open");
      });
    FinanceCurrDD.querySelectorAll(".view-dropdown__item").forEach(
      function (item) {
        item.addEventListener("click", function (e) {
          e.stopPropagation();
          FinanceCurrDD.querySelectorAll(".view-dropdown__item").forEach(
            function (i) {
              i.classList.remove("is-selected");
            },
          );
          item.classList.add("is-selected");
          if (currLabel) currLabel.textContent = item.textContent.trim();
          document.getElementById("finance-input-currency").value =
            item.dataset.value;
          FinanceCurrDD.classList.remove("is-open");
        });
      },
    );
    document.addEventListener("click", function () {
      FinanceCurrDD.classList.remove("is-open");
    });
  }
  var FinanceWeekSearch = document.getElementById("finance-week-search");
  if (FinanceWeekSearch) {
    var FinanceSearchTimer;
    FinanceWeekSearch.addEventListener("input", function () {
      clearTimeout(FinanceSearchTimer);
      FinanceSearchTimer = setTimeout(function () {
        var val = FinanceWeekSearch.value.trim().toLowerCase();
        var match = val.match(/minggu\s*(\d+)/i);
        if (match) {
          var wn = parseInt(match[1]);
          updateFinanceWeekLabel(wn);
          renderFinanceWeek(wn);
        } else {
          var cw = getWeekNumber(new Date());
          updateFinanceWeekLabel(cw);
          renderFinanceWeek(cw);
        }
      }, 300);
    });
  }
  var studyLogSearch = document.getElementById("study-log-search");
  if (studyLogSearch) {
    var studyLogTimer;
    studyLogSearch.addEventListener("input", function () {
      clearTimeout(studyLogTimer);
      studyLogTimer = setTimeout(function () {
        var val = studyLogSearch.value.trim().toLowerCase();
        var match = val.match(/minggu\s*(\d+)/i);
        if (match) filterStudyLogByWeek(match[1]);
        else filterStudyLogByWeek("" + getWeekNumber(new Date()));
      }, 300);
    });
  }
  var FinanceModalSave = document.getElementById("finance-modal-save");
  if (FinanceModalSave)
    FinanceModalSave.addEventListener("click", saveFinanceFromModal);
  var FinanceModalCancel = document.getElementById("finance-modal-cancel");
  if (FinanceModalCancel)
    FinanceModalCancel.addEventListener("click", closeFinanceModal);
  var FinanceModal = document.getElementById("finance-modal");
  if (FinanceModal)
    FinanceModal.addEventListener("click", function (e) {
      if (e.target === FinanceModal) closeFinanceModal();
    });
  var FinanceDelConfirm = document.getElementById("finance-delete-confirm");
  if (FinanceDelConfirm)
    FinanceDelConfirm.addEventListener("click", function () {
      var id = FinanceDelConfirm.dataset.targetId;
      if (id) {
        var list = loadFinanceRecords();
        list = list.filter(function (r) {
          return r.id !== id;
        });
        saveFinanceRecords(list);
        renderFinance();
      }
      document
        .getElementById("finance-delete-modal")
        .classList.remove("is-open");
    });
  var FinanceDelCancel = document.getElementById("finance-delete-cancel");
  if (FinanceDelCancel)
    FinanceDelCancel.addEventListener("click", function () {
      document
        .getElementById("finance-delete-modal")
        .classList.remove("is-open");
    });
  var FinanceDelModal = document.getElementById("finance-delete-modal");
  if (FinanceDelModal)
    FinanceDelModal.addEventListener("click", function (e) {
      if (e.target === FinanceDelModal)
        FinanceDelModal.classList.remove("is-open");
    });
  var FinanceExportBtn = document.getElementById("finance-export-btn");
  if (FinanceExportBtn)
    FinanceExportBtn.addEventListener("click", function () {
      var label = document.getElementById("finance-week-label");
      var weekLabel = label
        ? label.textContent
        : "Minggu " + getWeekNumber(new Date());
      document.getElementById("finance-export-week-label").textContent =
        weekLabel;
      document.getElementById("finance-export-modal").classList.add("is-open");
    });
  var FinanceExportCsv = document.getElementById("finance-export-modal-csv");
  if (FinanceExportCsv)
    FinanceExportCsv.addEventListener("click", function () {
      var label = document.getElementById("finance-week-label");
      var week = label
        ? parseInt(label.textContent.replace("Minggu ", ""))
        : getWeekNumber(new Date());
      exportFinanceCSV(week);
      document
        .getElementById("finance-export-modal")
        .classList.remove("is-open");
    });
  var FinanceExportPdf = document.getElementById("finance-export-modal-pdf");
  if (FinanceExportPdf)
    FinanceExportPdf.addEventListener("click", function () {
      var label = document.getElementById("finance-week-label");
      var week = label
        ? parseInt(label.textContent.replace("Minggu ", ""))
        : getWeekNumber(new Date());
      exportFinancePDF(week);
      document
        .getElementById("finance-export-modal")
        .classList.remove("is-open");
    });
  var FinanceExportClose = document.getElementById(
    "finance-export-modal-close",
  );
  if (FinanceExportClose)
    FinanceExportClose.addEventListener("click", function () {
      document
        .getElementById("finance-export-modal")
        .classList.remove("is-open");
    });
  var FinanceExportModal = document.getElementById("finance-export-modal");
  if (FinanceExportModal)
    FinanceExportModal.addEventListener("click", function (e) {
      if (e.target === FinanceExportModal)
        FinanceExportModal.classList.remove("is-open");
    });

  /* --- Settings modal --- */
  var settingsBtn = document.getElementById("settings-btn");
  if (settingsBtn) settingsBtn.addEventListener("click", openSettings);
  var settingsClose = document.getElementById("settings-close-btn");
  if (settingsClose) settingsClose.addEventListener("click", closeSettings);
  var settingsModal = document.getElementById("settings-modal");
  if (settingsModal)
    settingsModal.addEventListener("click", function (e) {
      if (e.target === settingsModal) closeSettings();
    });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var actionModal = document.getElementById("avatar-action-modal");
      if (actionModal && actionModal.classList.contains("is-open"))
        closeAvatarSubModal();
      else if (settingsModal && settingsModal.classList.contains("is-open"))
        closeSettings();
    }
  });
  document.querySelectorAll(".settings-nav__item").forEach(function (item) {
    item.addEventListener("click", function () {
      switchSettingsSection(item.dataset.section);
    });
  });
  var avatarOverlay = document.getElementById("settings-avatar-overlay");
  if (avatarOverlay)
    avatarOverlay.addEventListener("click", function (e) {
      e.stopPropagation();
      openAvatarSubModal();
    });
  var avatarActionModal = document.getElementById("avatar-action-modal");
  if (avatarActionModal)
    avatarActionModal.addEventListener("click", function (e) {
      if (e.target === avatarActionModal) closeAvatarSubModal();
    });
  var avatarActionUpload = document.getElementById("avatar-action-upload");
  var avatarInput = document.getElementById("settings-avatar-input");
  if (avatarActionUpload && avatarInput) {
    avatarActionUpload.addEventListener("click", function () {
      closeAvatarSubModal();
      avatarInput.click();
    });
    avatarInput.addEventListener("change", function () {
      if (avatarInput.files[0])
        handleSettingsAvatarUpload(avatarInput.files[0]);
    });
  }
  var avatarActionDelete = document.getElementById("avatar-action-delete");
  if (avatarActionDelete)
    avatarActionDelete.addEventListener("click", function () {
      deleteAvatarPhoto();
    });
  var settingsThemeGroup = document.getElementById("settings-theme-group");
  if (settingsThemeGroup)
    settingsThemeGroup.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn-group__item");
      if (!btn) return;
      settingsThemeGroup
        .querySelectorAll(".btn-group__item")
        .forEach(function (b) {
          b.classList.remove("btn-group__item--active");
        });
      btn.classList.add("btn-group__item--active");
      document.getElementById("settings-theme").value = btn.dataset.value;
      updateLightThemeVisibility(btn.dataset.value);
      autoSaveSettings();
    });
  var settingsLightThemeGroup = document.getElementById("settings-light-theme-group");
  if (settingsLightThemeGroup)
    settingsLightThemeGroup.addEventListener("click", function (e) {
      var sw = e.target.closest(".theme-swatch");
      if (!sw) return;
      settingsLightThemeGroup
        .querySelectorAll(".theme-swatch")
        .forEach(function (s) {
          s.classList.remove("is-active");
        });
      sw.classList.add("is-active");
      document.getElementById("settings-light-theme").value = sw.dataset.value;
      reinitLucide();
      autoSaveSettings();
    });
  var settingsLangGroup = document.getElementById("settings-lang-group");
  if (settingsLangGroup)
    settingsLangGroup.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn-group__item");
      if (!btn) return;
      settingsLangGroup
        .querySelectorAll(".btn-group__item")
        .forEach(function (b) {
          b.classList.remove("btn-group__item--active");
        });
      btn.classList.add("btn-group__item--active");
      document.getElementById("settings-lang").value = btn.dataset.value;
      autoSaveSettings();
    });
  ["settings-name", "settings-role"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", autoSaveSettings);
  });
  var notifToggle = document.getElementById("settings-notif-todo");
  if (notifToggle) notifToggle.addEventListener("change", autoSaveSettings);
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest(".faq-item__trigger");
    if (trigger) toggleFaqItem(trigger);
  });
  var exportWrap = document.getElementById("settings-export-wrap");
  var exportBtn = document.getElementById("settings-export-btn");
  var exportMenu = document.getElementById("settings-export-menu");
  if (exportBtn && exportWrap)
    exportBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      exportWrap.classList.toggle("is-open");
    });
  if (exportMenu)
    exportMenu
      .querySelectorAll(".export-dropdown-menu__item")
      .forEach(function (item) {
        item.addEventListener("click", function (e) {
          e.stopPropagation();
          exportScopedData(item.dataset.export);
          exportWrap.classList.remove("is-open");
        });
      });
  document.addEventListener("click", function () {
    if (exportWrap) exportWrap.classList.remove("is-open");
  });
  var importBtn = document.getElementById("settings-import-btn");
  var importInput = document.getElementById("settings-import-input");
  if (importBtn && importInput) {
    importBtn.addEventListener("click", function () {
      importInput.click();
    });
    importInput.addEventListener("change", function () {
      if (importInput.files[0]) importAllData(importInput.files[0]);
    });
  }
  var resetBtn = document.getElementById("settings-reset-btn");
  if (resetBtn) resetBtn.addEventListener("click", resetAllData);
  var deleteBtn = document.getElementById("settings-delete-btn");
  if (deleteBtn) deleteBtn.addEventListener("click", deleteAccount);
  var logoutBtn = document.getElementById("settings-logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutDemo);

  /* --- Confirm modal --- */
  var confirmOk = document.getElementById("confirm-ok");
  if (confirmOk)
    confirmOk.addEventListener("click", function () {
      if (confirmCallback) confirmCallback();
      confirmCallback = null;
      document.getElementById("confirm-modal").classList.remove("is-open");
    });
  var confirmCancel = document.getElementById("confirm-cancel");
  if (confirmCancel)
    confirmCancel.addEventListener("click", function () {
      document.getElementById("confirm-modal").classList.remove("is-open");
    });

  /* --- Course delete modal --- */
  var courseDelModal = document.getElementById("course-delete-modal");
  var courseDelConfirm = document.getElementById("course-delete-confirm");
  var courseDelCancel = document.getElementById("course-delete-cancel");
  if (courseDelConfirm)
    courseDelConfirm.addEventListener("click", function () {
      if (pendingDeleteKey) {
        deleteCourseByKey(pendingDeleteKey);
        pendingDeleteKey = null;
      }
      if (studyPendingDeleteKey) {
        deleteStudySubject(studyPendingDeleteKey);
        studyPendingDeleteKey = "";
      }
      courseDelModal.classList.remove("is-open");
    });
  if (courseDelCancel)
    courseDelCancel.addEventListener("click", function () {
      pendingDeleteKey = null;
      studyPendingDeleteKey = "";
      courseDelModal.classList.remove("is-open");
    });
  if (courseDelModal)
    courseDelModal.addEventListener("click", function (e) {
      if (e.target === courseDelModal) {
        pendingDeleteKey = null;
        studyPendingDeleteKey = "";
        courseDelModal.classList.remove("is-open");
      }
    });
}

/* ==========================================================================
    12. DOM READY — Boot
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  if (typeof COURSES === "undefined") {
    console.error(
      "dashboard-core.js: COURSES tidak ditemukan. Pastikan data.js dimuat.",
    );
    return;
  }
  /* Cegah init() jalan di halaman onboarding yang tidak perlu dashboard penuh */
  if (window.location.pathname.indexOf("onboarding") !== -1) return;
  init();
});
