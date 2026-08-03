/* ==========================================================================
   dashboard-i18n.js — EN/ID translator for the dashboard UI
   Self-contained, no dependencies on lang-switcher.js or JSON files.
   ========================================================================== */

var DASHBOARD_LANG = (function () {

    var STORAGE_KEY = 'settings_profile'; /* stored inside the same key as other settings */
    var currentLang = 'en';

    var TRANSLATIONS = {
        en: {
            /* Header */
            'header-completed': 'Completed',
            'header-total': 'Total',

            /* Sidebar tabs */
            'tab-courses': 'Online Courses',
            'tab-analytics': 'Analytics',
            'tab-certificate': 'Certificate',
            'tab-study': 'Study',
            'tab-journal': 'Journal',
            'tab-todo': 'To-do',
            'tab-finance': 'Finance',
            'tab-archived': 'Archived',
            'tab-notes': 'Notes',

            /* Courses panel */
            'courses-title': 'Online Courses',
            'courses-of': 'of',
            'courses-completed': 'completed',
            'th-num': '#',
            'th-course': 'Course',
            'th-desc': 'Description',
            'th-category': 'Category',
            'th-role': 'Role',
            'th-company': 'Company',
            'th-action': '',
            'search-placeholder': 'Search\u2026',
            'btn-add-course': 'Add Course',

            /* Analytics panel */
            'analytics-title': 'Analytics',
            'stat-total-completed': 'Total Completed',
            'stat-out-of': 'out of',
            'stat-courses': 'courses',
            'stat-phase1-done': 'Phase 1 Done',
            'stat-phase3-done': 'Phase 3 Done',
            'chart-by-phase': 'Completed by Phase',
            'chart-by-company': 'Progress by Company',
            'progress-by-role': 'Progress by Role',
            'study-analytics': 'Study Analytics',
            'study-progress-week': 'Progress Minggu Ini',
            'study-selesai': 'Selesai',
            'study-by-paket': 'Selesai by Paket',
            'study-tren': 'Tren per Minggu',
            'todo-analytics': 'To-do Analytics',
            'todo-progress': 'Progress',
            'chart-priority': 'By Priority',
            'chart-category': 'By Category',
            'finance-analytics': 'Finance Analytics',
            'finance-monthly': 'Total Bulan Ini',
            'finance-30days': '30 Hari Terakhir',
            'finance-all-cat': 'All Categories',

            /* Certificate panel */
            'cert-title': 'My Certificates',
            'btn-add-cert': 'Add Certificate',

            /* Archived panel */
            'archived-title': 'Archived Courses',
            'archived-sub-courses': 'Courses',
            'archived-sub-study': 'Study',
            'archived-sub-notes': 'Notes',
            'archived-empty-study': 'No archived study subjects.',
            'archived-empty-notes': 'No archived notes.',
            'archived-restore': 'Restore',
            'study-archive': 'Archive',

            /* Study panel */
            'study-title': 'Minggu Ini',
            'study-week': 'Minggu',
            'study-progress-label': 'Progress Minggu Ini',
            'study-kelas': 'Class',
            'th-code': 'Kode',
            'th-subject': 'Mata Kuliah',
            'th-day': 'Hari',
            'th-time': 'Jam',
            'th-room': 'Ruang',
            'th-class': 'Class',
            'th-package': 'Paket',

            /* Journal panel */
            'journal-title': 'Journal',
            'journal-mode-rich': 'Rich Text',
            'journal-mode-md': 'Markdown',

            /* Notes panel */
            'notes-take': 'Take a note...',
            'notes-title': 'Title',
            'notes-content': 'Take a note...',
            'notes-save': 'Save',
            'notes-close': 'Close',
            'notes-pin': 'Pin',
            'notes-edit': 'Edit',
            'notes-archive': 'Archive',
            'notes-restore': 'Restore',
            'notes-delete': 'Delete',
            'notes-delete-confirm': 'Delete this note?',
            'notes-empty': 'No notes yet. Tap \u201cTake a note...\u201d above to create one.',
            'notes-no-result': 'No notes match your search.',
            'notes-search': 'Search notes\u2026',
            'notes-required': 'The note is empty.',
            'head-notes': 'Notes',
            'head-pinned': 'Pinned',

            /* To-do panel */
            'todo-title': 'To-do List',
            'todo-search': 'Search\u2026',
            'btn-add-task': 'Add Task',
            'chart-by-priority': 'By Priority',
            'chart-by-category': 'By Category',

            /* Finance panel */
            'finance-title': 'Finance Tracker',
            'fin-tab-expense': 'Expense',
            'fin-tab-income': 'Income',
            'fin-expense-month': 'This month expenses',
            'fin-income-month': 'This month income',
            'fin-header-expense': 'Expense',
            'fin-header-income': 'Income',
            'finance-search': 'Cari minggu\u2026',
            'btn-add-expense': 'Add Expense',
            'finance-week-label': 'Minggu Ini',
            'finance-table-transaksi': 'Transaksi',
            'finance-export': 'Export',
            'finance-date': 'Tanggal',
            'finance-amount': 'Jumlah',
            'finance-category': 'Kategori',
            'finance-note': 'Catatan',
            'finance-daily-report': 'Laporan Mingguan',
            'finance-rank': 'Peringkat',
            'finance-day': 'Hari',
            'finance-total': 'Total',
            'finance-transaction-count': 'Transaksi',
            'chart-daily-spending': 'Daily Spending',
            'finance-by-cat': 'By Category',
            'finance-empty': 'Data belum tersedia.',
            'finance-top-text': 'Top',

            /* Modals — Add Course */
            'modal-add-course': 'Add Course',
            'modal-course-name': 'Course Name',
            'modal-course-desc': 'Description',
            'modal-course-cat': 'Category',
            'modal-course-company': 'Company / Platform',
            'modal-course-url': 'Course URL',
            'btn-cancel': 'Cancel',
            'btn-save': 'Save',

            /* Modals — Certificate */
            'modal-add-cert': 'Add Certificate',
            'modal-cert-title': 'Certificate Title',
            'modal-cert-id': 'Credential ID',
            'modal-cert-image': 'Certificate Image',
            'modal-drop-text': 'Drag &amp; drop certificate image here, or <span class="file-drop-browse">browse</span>',
            'modal-drop-hint': 'PNG, JPG, WebP \u2014 max 5MB',

            /* Modals — Delete confirm */
            'modal-delete-cert': 'Delete Certificate',
            'modal-delete-course': 'Delete Course',
            'modal-delete-task': 'Delete Task',
            'modal-delete-expense': 'Delete Expense',
            'modal-delete-areyou': 'Are you sure you want to delete',
            'modal-delete-undo': 'This action cannot be undone.',
            'btn-delete': 'Delete',

            /* Modals — Study entry */
            'modal-study-title': 'Catat Materi',
            'modal-study-subject': 'Mata Kuliah',
            'modal-study-judul': 'Judul Materi',
            'modal-study-ringkasan': 'Ringkasan Materi',
            'modal-study-image': 'Upload Gambar (opsional)',
            'modal-study-drop': 'Drag &amp; drop gambar praktikum, atau <span class="file-drop-browse">browse</span>',
            'modal-study-hint': 'PNG, JPG, WebP',
            'btn-batal': 'Batal',
            'btn-simpan': 'Simpan',
            'modal-study-detail': 'Detail Entry',
            'modal-study-placeholder-judul': 'e.g. Struktur Perulangan',
            'modal-study-placeholder-ringkasan': 'Apa yang kamu pelajari?',

            /* Modals — To-do */
            'modal-add-task': 'Add Task',
            'modal-task-name': 'Task',
            'modal-task-desc': 'Description (optional)',
            'modal-task-category': 'Category',
            'modal-task-priority': 'Priority',
            'modal-task-duedate': 'Due Date (optional)',
            'priority-low': 'Low',
            'priority-medium': 'Medium',
            'priority-high': 'High',

            /* Modals — Finance */
            'modal-add-expense': 'Add Expense',
            'modal-expense-amount': 'Amount',
            'modal-expense-cat': 'Category',
            'modal-expense-desc': 'Description (optional)',
            'modal-expense-date': 'Date',

            /* Modals — Finance export */
            'modal-export-title': 'Export Laporan',
            'modal-export-body': 'Pilih format untuk laporan',
            'modal-export-csv': 'Export CSV',
            'modal-export-pdf': 'Export PDF',
            'btn-tutup': 'Tutup',
            'currency': 'Currency',

            /* Settings — General */
            'settings': 'Settings',
            'section-general': 'General',
            'section-faq': 'FAQ',
            'section-about': 'About',
            'section-appearance': 'Appearance',
            'section-danger': 'Danger Zone',
            'general-title': 'General',
            'label-name': 'Name',
            'label-email': 'Email',
            'label-role': 'Role (optional)',
            'label-theme': 'Theme',
            'theme-light': 'Light',
            'theme-dark': 'Dark',
            'theme-system': 'System',
            'label-light-theme': 'Light Color',
            'light-theme-cream': 'Cream',
            'light-theme-sage': 'Sage',
            'light-theme-blue': 'Dusty Blue',
            'light-theme-white': 'Pure White',
            'light-theme-charcoal': 'Gray Charcoal',
            'label-language': 'Language',
            'lang-en': 'English',
            'lang-id': 'Indonesia',
            'label-notification': 'Notification',
            'notif-text': 'Remind me when To-do tasks are approaching deadline',
            'label-export': 'Export',
            'btn-export': 'Export All Data (.json)',
            'label-import': 'Import',
            'btn-import': 'Import Data (.json)',
            'import-warning': 'This will overwrite all current data.',
            'search-settings': 'Search settings\u2026',
            'photo-menu-upload': 'Tambah Photo',
            'photo-menu-ganti': 'Ganti Photo',
            'photo-menu-hapus': 'Hapus Photo',

            /* Settings — Danger Zone */
            'danger-title': 'Danger Zone',
            'danger-reset-text': 'Reset All Data',
            'danger-reset-desc': 'This will permanently delete all courses, tasks, expenses, and journals.',
            'btn-reset': 'Reset',
            'danger-delete-text': 'Delete Account',
            'danger-delete-desc': 'Permanently delete your account and all data.',
            'btn-delete-account': 'Delete Account',
            'danger-logout-text': 'Logout',
            'danger-logout-desc': 'Keluar dari akun Anda. Data tetap tersimpan di server.',
            'btn-logout': 'Logout',

            /* Settings — FAQ (questions only, answers stay EN as informative) */
            'faq-q1': 'What is Personal Habit Tracker?',
            'faq-q2': 'Where is my data stored?',
            'faq-q3': 'How do I back up or restore my data?',
            'faq-q4': 'What data appears in the Analytics tab?',
            'faq-q5': 'How do I track a certification course?',
            'faq-q6': 'How do I add a custom course?',
            'faq-q7': 'How do I archive a course?',
            'faq-q8': 'How do I add a certificate image?',
            'faq-q9': 'How do Study and Journal connect?',
            'faq-q10': 'Do Journal entries disappear after the weekly reset?',
            'faq-q11': 'How do I view or edit a past Journal entry?',
            'faq-q12': 'How do I manage tasks in To-do?',
            'faq-q13': 'How do I add an expense in Finance?',
            'faq-q14': 'What currencies are supported in Finance?',
            'faq-q15': 'How do I export Finance data?',
            'faq-q16': 'How do I change the theme?',
            'faq-q17': 'How do I change my profile or avatar?',
            'faq-q18': 'Can I reset or delete all my data?',
            'faq-q19': 'What is the naming note about Study and Journal?',

            /* Settings — About */
            'about-title': 'About',

            /* Misc */
            'progress-week': 'Minggu ke',
            'all': 'All',
            'priority': 'Priority',
            'category': 'Category',
            'no-data': 'Data belum tersedia.',

            /* FAQ headings + answers */
            'faq-title': 'FAQ',
            'faq-a1': 'A personal, all-in-one dashboard for tracking online certifications, university coursework, daily expenses, and tasks. Built as a single-page vanilla web app \u2014 no frameworks, no build tools. All data stays in your browser.',
            'faq-a2': 'All structured data (courses, tasks, expenses, settings) is stored in <strong>localStorage</strong>. Journal images are stored in <strong>IndexedDB</strong> (studyDB \u2192 images store). Nothing is sent to any server.',
            'faq-a3': 'Go to <strong>Settings \u2192 General</strong> and use the <strong>Export</strong> button to download a .json file. To restore, use the <strong>Import</strong> button and select your backup file. This will overwrite all current data.',
            'faq-a4': 'Analytics aggregates data from four features: <ul style="margin:var(--space-2) 0 0 var(--space-4);"><li><strong>Courses</strong> \u2014 completion progress per phase/role</li><li><strong>Study</strong> \u2014 weekly checklist progress + pie chart (Jurusan vs MKU)</li><li><strong>To-do</strong> \u2014 completion rate, priority and category distribution</li><li><strong>Finance</strong> \u2014 weekly total spending trend and category breakdown</li></ul>',
            'faq-a5': 'Open the <strong>Courses</strong> tab. Use the filter bar to narrow by Role (FullStack, Software, AI Engineer, Others), Category, or Company. Click the checkbox to mark a course as completed. You can also add <strong>custom courses</strong> using the + button at the top of the table.',
            'faq-a6': 'Click the <strong>+ Add Course</strong> button above the courses table. Fill in the name and select a role. Custom courses are saved to localStorage and appear alongside the built-in courses. You can archive or delete them at any time.',
            'faq-a7': 'Each course row has a \u2699\uFE0F button. Click it and select <strong>Archive</strong>. The course moves to the <strong>Archived</strong> tab. From there you can <strong>Restore</strong> it back to the active list or <strong>Delete</strong> it permanently.',
            'faq-a8': 'Go to the <strong>Certificate</strong> tab and click the + button. Fill in the title and upload an image. Each certificate card shows the title, date, and a preview of the uploaded image. You can delete certificates from the \u2699\uFE0F dropdown.',
            'faq-a9': 'When you check off a university class in the <strong>Study</strong> tab, a modal opens where you can write a <strong>title</strong> and <strong>summary</strong> of what you learned, and optionally upload an image. After saving, the entry appears in the <strong>Journal</strong> tab as a masonry card. Journal entries persist even after the weekly reset.',
            'faq-a10': 'No. Only the Study checkboxes reset every Sunday at 23:59 WIB. All your Journal entries (notes, summaries, images) remain saved and accessible in the <strong>Journal</strong> tab. You can filter them by week using the dropdown.',
            'faq-a11': 'Click any card in the <strong>Journal</strong> masonry grid to open a detail modal showing the full entry content and image. From the detail modal you cannot edit, but you can see the complete record. Use the week filter dropdown to browse entries from previous weeks.',
            'faq-a12': 'The <strong>To-do</strong> tab supports full CRUD. Click + to add a task with a name, category, priority (Low/Medium/High using the button group), and optional due date. Use the search bar to find tasks, and the category/priority dropdowns to filter. Click the checkbox to mark a task as done.',
            'faq-a13': 'Go to the <strong>Finance</strong> tab and click <strong>Add Expense</strong>. Fill in the amount, select a currency from the dropdown (18 currencies available), choose a category (Food, Transport, Shopping, etc.), add an optional description, and pick the date. The weekly summary updates immediately.',
            'faq-a14': '18 currencies are supported: IDR (Rp), USD ($), EUR (\u20ac), GBP (\u00a3), JPY (\u00a5), SGD (S$), MYR (RM), AUD (A$), THB (\u0e3f), PHP (\u20b1), KRW (\u20a9), CNY (\u00a5), INR (\u20b9), SAR (\ufdfc), AED (\u0631.\u0625), BND (B$), BRL (R$), and VND (\u20ab). Each transaction stores its own currency.',
            'faq-a15': 'Click the <strong>Export</strong> button next to the Finance table heading. A modal opens where you can choose <strong>CSV</strong> (opens in spreadsheet apps) or <strong>PDF</strong> (generated via jsPDF with a formatted table for the current week).',
            'faq-a16': 'Open <strong>Settings \u2192 General</strong>. Under Theme, choose <strong>Light</strong>, <strong>Dark</strong>, or <strong>System</strong> (follows your OS preference). The change saves automatically.',
            'faq-a17': 'Open <strong>Settings \u2192 General</strong>. Edit your <strong>Name</strong> and <strong>Role</strong> directly in the text fields. For the avatar, hover over the photo and click the camera icon to open the photo menu \u2192 upload a new image (auto-cropped to 256px WebP) or delete the current one. All changes auto-save.',
            'faq-a18': 'Yes. Go to <strong>Settings \u2192 Danger Zone</strong>. Use <strong>Reset All Data</strong> to clear all localStorage data (courses, tasks, expenses, journal entries). The <strong>Delete Account</strong> button is a demo placeholder. These actions cannot be undone.',
            'faq-a19': 'The tabs were originally named <em>Kuliah</em> and <em>Learning Log</em>. They were renamed to <strong>Study</strong> and <strong>Journal</strong> for a more professional, English-consistent UI. Internal identifiers like <code>MATAKULIAH</code> and labels like <em>Mata Kuliah</em> intentionally keep their Indonesian terms since they refer to actual university subject data.',

            /* About */
            'about-title': 'About',
            'about-desc': '<strong>Personal Habit Tracker</strong> \u2014 a personal, all-in-one dashboard by Alfiz Ilham for tracking learning progress, university coursework, daily expenses, and tasks. Built with vanilla HTML/CSS/JS + Express backend and NeonDB cloud database. Multi-user support with developer key authentication.',
            'about-tabs': 'Tabs',
            'about-th-tab': 'Tab',
            'about-th-purpose': 'Purpose',
            'about-tech-stack': 'Tech Stack',
            'about-th-component': 'Component',
            'about-th-technology': 'Technology',
            'about-data-privacy': 'Data &amp; Privacy',
            'about-data-text': 'All user data is stored in NeonDB (PostgreSQL cloud). Local storage is used as a cache for fast reads. Nothing is shared with third parties. Data can be exported via Settings \u2192 Export.',
            'about-naming': 'Naming Note',
            'about-naming-text': 'The tabs originally named Kuliah and Learning Log were renamed to Study and Journal.',
            'about-copyright': 'Developed by Alfiz Ilham \u00a9 2026 <strong>Alfiz Ilham</strong>. All rights reserved.',

            /* Danger Zone */
            'danger-title': 'Danger Zone',
            'danger-reset-text': 'Reset All Data',
            'danger-reset-desc': 'This will permanently delete all courses, tasks, expenses, and journals.',
            'btn-reset': 'Reset',
'danger-delete-text': 'Delete Account',
            'danger-delete-desc': 'Permanently delete your account and all data.',
            'btn-delete-account': 'Delete Account',
            'danger-logout-text': 'Logout',
            'danger-logout-desc': 'Keluar dari akun Anda. Data tetap tersimpan di server.',
            'btn-logout': 'Logout',

            /* Avatar sub-modal */
            'avatar-upload': 'Tambah Photo',
            'avatar-ganti': 'Ganti Photo',
            'avatar-hapus': 'Hapus Photo',

            /* Study empty states */
            'study-empty-log': 'Belum ada catatan. Centang mata kuliah di tab <strong>Minggu Ini</strong> untuk memulai.',
            'study-empty-week': 'Belum ada catatan di minggu ini.',
            'todo-empty': 'No tasks yet. Click <strong>Add Task</strong> to get started.',
            'todo-daily-badge': 'Daily',
            'todo-daily-add': 'Add Daily Task',
            'todo-daily-hint': 'This daily task will automatically reappear every day without re-adding it.',
            'finance-empty-week': 'Data belum tersedia untuk Minggu ini.',

            /* Header counter dynamic labels */
            'head-completed': 'Completed',
            'head-total': 'Total',
            'head-minggu-ini': 'Minggu Ini',
            'head-mata-kuliah': 'Mata Kuliah',
            'head-entries': 'Entries',
            'head-journal': 'Journal',
            'head-certificates': 'Certificates',
            'head-archived': 'Archived',
            'head-done': 'Done',
            'head-tasks': 'Tasks',
            'head-total-label': 'Total',
            'head-transactions': 'Transactions',
            'head-learning-log': 'Journal',

            /* Study table labels (JS-generated) */
            'study-empty-progress': 'Progress Minggu Ini',
        },

        id: {
            /* Header */
            'header-completed': 'Terselesaikan',
            'header-total': 'Total',

            /* Sidebar tabs */
            'tab-courses': 'Kursus',
            'tab-analytics': 'Analitik',
            'tab-certificate': 'Sertifikat',
            'tab-study': 'Belajar',
            'tab-journal': 'Jurnal',
            'tab-todo': 'Tugas',
            'tab-finance': 'Keuangan',
            'tab-archived': 'Arsip',
            'tab-notes': 'Catatan',

            /* Courses panel */
            'courses-title': 'Semua Kursus',
            'courses-of': 'dari',
            'courses-completed': 'selesai',
            'th-num': '#',
            'th-course': 'Kursus',
            'th-desc': 'Deskripsi',
            'th-category': 'Kategori',
            'th-role': 'Peran',
            'th-company': 'Perusahaan',
            'th-action': '',
            'search-placeholder': 'Cari\u2026',
            'btn-add-course': 'Tambah Kursus',

            /* Analytics panel */
            'analytics-title': 'Analitik',
            'stat-total-completed': 'Total Selesai',
            'stat-out-of': 'dari',
            'stat-courses': 'kursus',
            'stat-phase1-done': 'Fase 1 Selesai',
            'stat-phase3-done': 'Fase 3 Selesai',
            'chart-by-phase': 'Selesai per Fase',
            'chart-by-company': 'Progres per Perusahaan',
            'progress-by-role': 'Progres per Peran',
            'study-analytics': 'Analitik Belajar',
            'study-progress-week': 'Progres Belajar Minggu Ini',
            'study-selesai': 'Selesai',
            'study-by-paket': 'Selesai per Paket',
            'study-tren': 'Tren per Minggu',
            'todo-analytics': 'Analitik Tugas',
            'todo-progress': 'Progres',
            'chart-priority': 'Prioritas',
            'chart-category': 'Berdasarkan Kategori',
            'finance-analytics': 'Analitik Keuangan',
            'finance-monthly': 'Total Bulan Ini',
            'finance-30days': '30 Hari Terakhir',
            'finance-all-cat': 'Semua Kategori',

            /* Certificate panel */
            'cert-title': 'Sertifikat Saya',
            'btn-add-cert': 'Tambah Sertifikat',

            /* Archived panel */
            'archived-title': 'Kursus yang Diarsipkan',
            'archived-sub-courses': 'Kursus',
            'archived-sub-study': 'Belajar',
            'archived-sub-notes': 'Catatan',
            'archived-empty-study': 'Belum ada subjek yang diarsipkan.',
            'archived-empty-notes': 'Belum ada catatan yang diarsipkan.',
            'archived-restore': 'Kembalikan',
            'study-archive': 'Arsipkan',

            /* Study panel */
            'study-title': 'Minggu Ini',
            'study-week': 'Minggu',
            'study-progress-label': 'Progres Minggu Ini',
            'study-kelas': 'Kelas',
            'th-code': 'Kode',
            'th-subject': 'Mata Kuliah',
            'th-day': 'Hari',
            'th-time': 'Jam',
            'th-room': 'Ruang',
            'th-class': 'Kelas',
            'th-package': 'Paket',

            /* Journal panel */
            'journal-title': 'Jurnal',
            'journal-mode-rich': 'Teks Kaya',
            'journal-mode-md': 'Markdown',

            /* Notes panel */
            'notes-take': 'Ambil catatan...',
            'notes-title': 'Judul',
            'notes-content': 'Ambil catatan...',
            'notes-save': 'Simpan',
            'notes-close': 'Tutup',
            'notes-pin': 'Semat',
            'notes-edit': 'Ubah',
            'notes-archive': 'Arsipkan',
            'notes-restore': 'Kembalikan',
            'notes-delete': 'Hapus',
            'notes-delete-confirm': 'Hapus catatan ini?',
            'notes-empty': 'Belum ada catatan. Ketuk \u201cAmbil catatan...\u201d di atas untuk membuat.',
            'notes-no-result': 'Tidak ada catatan yang cocok dengan pencarian.',
            'notes-search': 'Cari catatan\u2026',
            'notes-required': 'Catatan kosong.',
            'head-notes': 'Catatan',
            'head-pinned': 'Disemat',

            /* To-do panel */
            'todo-title': 'Daftar Tugas',
            'todo-search': 'Cari\u2026',
            'btn-add-task': 'Tambah Tugas',
            'chart-by-priority': 'Berdasarkan Prioritas',
            'chart-by-category': 'Berdasarkan Kategori',

            /* Finance panel */
            'finance-title': 'Pelacak Keuangan',
            'fin-tab-expense': 'Pengeluaran',
            'fin-tab-income': 'Pemasukan',
            'fin-expense-month': 'Pengeluaran Bulan Ini',
            'fin-income-month': 'Pemasukan Bulan Ini',
            'fin-header-expense': 'Pengeluaran',
            'fin-header-income': 'Pemasukan',
            'finance-search': 'Cari minggu\u2026',
            'btn-add-expense': 'Tambah Biaya',
            'finance-week-label': 'Minggu Ini',
            'finance-table-transaksi': 'Transaksi',
            'finance-export': 'Ekspor',
            'finance-date': 'Tanggal',
            'finance-amount': 'Jumlah',
            'finance-category': 'Kategori',
            'finance-note': 'Catatan',
            'finance-daily-report': 'Laporan Mingguan',
            'finance-rank': 'Peringkat',
            'finance-day': 'Hari',
            'finance-total': 'Total',
            'finance-transaction-count': 'Transaksi',
            'chart-daily-spending': 'Pengeluaran Harian',
            'finance-by-cat': 'Per Kategori',
            'finance-empty': 'Data belum tersedia.',
            'finance-top-text': 'Teratas',

            /* Modals — Add Course */
            'modal-add-course': 'Tambah Kursus',
            'modal-course-name': 'Nama Kursus',
            'modal-course-desc': 'Deskripsi',
            'modal-course-cat': 'Kategori',
            'modal-course-company': 'Perusahaan / Platform',
            'modal-course-url': 'URL Kursus',
            'btn-cancel': 'Batal',
            'btn-save': 'Simpan',

            /* Modals — Certificate */
            'modal-add-cert': 'Tambah Sertifikat',
            'modal-cert-title': 'Judul Sertifikat',
            'modal-cert-id': 'ID Kredensial',
            'modal-cert-image': 'Gambar Sertifikat',
            'modal-drop-text': 'Seret gambar sertifikat ke sini, atau <span class="file-drop-browse">cari</span>',
            'modal-drop-hint': 'PNG, JPG, WebP \u2014 maks 5MB',

            /* Modals — Delete confirm */
            'modal-delete-cert': 'Hapus Sertifikat',
            'modal-delete-course': 'Hapus Kursus',
            'modal-delete-task': 'Hapus Tugas',
            'modal-delete-expense': 'Hapus Biaya',
            'modal-delete-areyou': 'Yakin ingin menghapus',
            'modal-delete-undo': 'Tindakan ini tidak bisa dibatalkan.',
            'btn-delete': 'Hapus',

            /* Modals — Study entry */
            'modal-study-title': 'Catat Materi',
            'modal-study-subject': 'Mata Kuliah',
            'modal-study-judul': 'Judul Materi',
            'modal-study-ringkasan': 'Ringkasan Materi',
            'modal-study-image': 'Upload Gambar (opsional)',
            'modal-study-drop': 'Seret gambar praktikum, atau <span class="file-drop-browse">cari</span>',
            'modal-study-hint': 'PNG, JPG, WebP',
            'btn-batal': 'Batal',
            'btn-simpan': 'Simpan',
            'modal-study-detail': 'Detail Entry',
            'modal-study-placeholder-judul': 'Contoh: Struktur Perulangan',
            'modal-study-placeholder-ringkasan': 'Apa yang kamu pelajari?',

            /* Modals — To-do */
            'modal-add-task': 'Tambah Tugas',
            'modal-task-name': 'Tugas',
            'modal-task-desc': 'Deskripsi (opsional)',
            'modal-task-category': 'Kategori',
            'modal-task-priority': 'Prioritas',
            'modal-task-duedate': 'Tenggat (opsional)',
            'priority-low': 'Rendah',
            'priority-medium': 'Sedang',
            'priority-high': 'Tinggi',

            /* Modals — Finance */
            'modal-add-expense': 'Tambah Biaya',
            'modal-expense-amount': 'Jumlah',
            'modal-expense-cat': 'Kategori',
            'modal-expense-desc': 'Deskripsi (opsional)',
            'modal-expense-date': 'Tanggal',

            /* Modals — Finance export */
            'modal-export-title': 'Ekspor Laporan',
            'modal-export-body': 'Pilih format untuk laporan',
            'modal-export-csv': 'Ekspor CSV',
            'modal-export-pdf': 'Ekspor PDF',
            'btn-tutup': 'Tutup',
            'currency': 'Mata Uang',

            /* Settings — General */
            'settings': 'Pengaturan',
            'section-general': 'Umum',
            'section-faq': 'FAQ',
            'section-about': 'Tentang',
            'section-appearance': 'Tampilan',
            'section-danger': 'Zona Berbahaya',
            'general-title': 'Umum',
            'label-name': 'Nama',
            'label-email': 'Email',
            'label-role': 'Peran (opsional)',
            'label-theme': 'Tema',
            'theme-light': 'Terang',
            'theme-dark': 'Gelap',
            'theme-system': 'Sistem',
            'label-light-theme': 'Warna Terang',
            'light-theme-cream': 'Krem',
            'light-theme-sage': 'Sage',
            'light-theme-blue': 'Biru Debu',
            'light-theme-white': 'Putih Murni',
            'light-theme-charcoal': 'Abu Terang',
            'label-language': 'Bahasa',
            'lang-en': 'English',
            'lang-id': 'Indonesia',
            'label-notification': 'Notifikasi',
            'notif-text': 'Ingatkan saya ketika tugas mendekati tenggat',
            'label-export': 'Ekspor',
            'btn-export': 'Ekspor Semua Data (.json)',
            'label-import': 'Impor',
            'btn-import': 'Impor Data (.json)',
            'import-warning': 'Ini akan menimpa semua data saat ini.',
            'search-settings': 'Cari pengaturan\u2026',
            'photo-menu-upload': 'Tambah Foto',
            'photo-menu-ganti': 'Ganti Foto',
            'photo-menu-hapus': 'Hapus Foto',

            /* Settings — Danger Zone */
            'danger-title': 'Zona Berbahaya',
            'danger-reset-text': 'Reset Semua Data',
            'danger-reset-desc': 'Ini akan menghapus permanen semua kursus, tugas, biaya, dan jurnal.',
            'btn-reset': 'Reset',
            'danger-delete-text': 'Hapus Akun',
            'danger-delete-desc': 'Hapus akun dan semua data Anda secara permanen.',
            'btn-delete-account': 'Hapus Akun',
            'danger-logout-text': 'Keluar',
            'danger-logout-desc': 'Keluar dari akun Anda. Data tetap tersimpan di server.',
            'btn-logout': 'Keluar',

            /* Settings — FAQ (questions only) */
            'faq-q1': 'Apa itu Personal Habit Tracker?',
            'faq-q2': 'Di mana data saya disimpan?',
            'faq-q3': 'Bagaimana cara mencadangkan atau memulihkan data?',
            'faq-q4': 'Data apa yang muncul di tab Analitik?',
            'faq-q5': 'Bagaimana cara melacak kursus sertifikasi?',
            'faq-q6': 'Bagaimana cara menambah kursus kustom?',
            'faq-q7': 'Bagaimana cara mengarsipkan kursus?',
            'faq-q8': 'Bagaimana cara menambah gambar sertifikat?',
            'faq-q9': 'Bagaimana hubungan antara Belajar dan Jurnal?',
            'faq-q10': 'Apakah entri Jurnal hilang setelah reset mingguan?',
            'faq-q11': 'Bagaimana cara melihat entri Jurnal lama?',
            'faq-q12': 'Bagaimana cara mengelola tugas di Tugas?',
            'faq-q13': 'Bagaimana cara menambah biaya di Keuangan?',
            'faq-q14': 'Mata uang apa saja yang didukung di Keuangan?',
            'faq-q15': 'Bagaimana cara mengekspor data Keuangan?',
            'faq-q16': 'Bagaimana cara mengganti tema?',
            'faq-q17': 'Bagaimana cara mengubah profil atau avatar?',
            'faq-q18': 'Bisakah saya mereset atau menghapus semua data?',
            'faq-q19': 'Apa catatan penamaan tentang Study dan Journal?',

            /* Settings — About */
            'about-title': 'Tentang',

            /* Misc */
            'progress-week': 'Minggu ke',
            'all': 'Semua',
            'priority': 'Prioritas',
            'category': 'Kategori',
            'no-data': 'Data belum tersedia.',

            /* FAQ headings + answers */
            'faq-title': 'FAQ',
            'faq-a1': 'Dasbor pribadi serba bisa untuk melacak sertifikasi online, mata kuliah universitas, biaya harian, dan tugas. Dibangun sebagai aplikasi web vanilla satu halaman \u2014 tanpa framework atau build tools. Semua data tetap di browser Anda.',
            'faq-a2': 'Semua data terstruktur (kursus, tugas, biaya, pengaturan) disimpan di <strong>localStorage</strong>. Gambar jurnal disimpan di <strong>IndexedDB</strong> (studyDB \u2192 images store). Tidak ada yang dikirim ke server mana pun.',
            'faq-a3': 'Buka <strong>Pengaturan \u2192 Umum</strong> dan gunakan tombol <strong>Ekspor</strong> untuk mengunduh file .json. Untuk memulihkan, gunakan tombol <strong>Impor</strong> dan pilih file cadangan Anda. Ini akan menimpa semua data saat ini.',
            'faq-a4': 'Analitik menggabungkan data dari empat fitur: <ul style="margin:var(--space-2) 0 0 var(--space-4);"><li><strong>Kursus</strong> \u2014 progres penyelesaian per fase/peran</li><li><strong>Belajar</strong> \u2014 progres checklist mingguan + diagram lingkaran (Jurusan vs MKU)</li><li><strong>Tugas</strong> \u2014 tingkat penyelesaian, distribusi prioritas dan kategori</li><li><strong>Keuangan</strong> \u2014 tren pengeluaran mingguan dan rincian kategori</li></ul>',
            'faq-a5': 'Buka tab <strong>Kursus</strong>. Gunakan bilah filter untuk mempersempit berdasarkan Peran (FullStack, Software, AI Engineer, Others), Kategori, atau Perusahaan. Centang kotak untuk menandai kursus selesai. Anda juga dapat menambahkan <strong>kursus kustom</strong> menggunakan tombol + di atas tabel.',
            'faq-a6': 'Klik tombol <strong>+ Tambah Kursus</strong> di atas tabel kursus. Isi nama dan pilih peran. Kursus kustom disimpan ke localStorage dan muncul bersama kursus bawaan. Anda dapat mengarsipkan atau menghapusnya kapan saja.',
            'faq-a7': 'Setiap baris kursus memiliki tombol \u2699\uFE0F. Klik dan pilih <strong>Arsipkan</strong>. Kursus akan pindah ke tab <strong>Arsip</strong>. Dari sana Anda dapat <strong>Memulihkan</strong> kembali ke daftar aktif atau <strong>Menghapus</strong> secara permanen.',
            'faq-a8': 'Buka tab <strong>Sertifikat</strong> dan klik tombol +. Isi judul dan unggah gambar. Setiap kartu sertifikat menampilkan judul, tanggal, dan pratinjau gambar yang diunggah. Anda dapat menghapus sertifikat dari dropdown \u2699\uFE0F.',
            'faq-a9': 'Saat Anda mencentang kelas universitas di tab <strong>Belajar</strong>, sebuah modal terbuka di mana Anda dapat menulis <strong>judul</strong> dan <strong>ringkasan</strong> dari apa yang Anda pelajari, dan opsional mengunggah gambar. Setelah disimpan, entri muncul di tab <strong>Jurnal</strong> sebagai kartu masonry. Entri jurnal tetap ada bahkan setelah reset mingguan.',
            'faq-a10': 'Tidak. Hanya checklist Belajar yang direset setiap hari Minggu pukul 23:59 WIB. Semua entri Jurnal Anda (catatan, ringkasan, gambar) tetap tersimpan dan dapat diakses di tab <strong>Jurnal</strong>. Anda dapat memfilternya berdasarkan minggu menggunakan dropdown.',
            'faq-a11': 'Klik kartu apa pun di kisi masonry <strong>Jurnal</strong> untuk membuka modal detail yang menampilkan konten dan gambar entri lengkap. Dari modal detail Anda tidak dapat mengedit, tetapi Anda dapat melihat catatan lengkapnya. Gunakan dropdown filter minggu untuk menelusuri entri dari minggu-minggu sebelumnya.',
            'faq-a12': 'Tab <strong>Tugas</strong> mendukung CRUD penuh. Klik + untuk menambahkan tugas dengan nama, kategori, prioritas (Rendah/Sedang/Tinggi menggunakan grup tombol), dan tanggal jatuh tempo opsional. Gunakan bilah pencarian untuk menemukan tugas, dan dropdown kategori/prioritas untuk memfilter. Centang kotak untuk menandai tugas selesai.',
            'faq-a13': 'Buka tab <strong>Keuangan</strong> dan klik <strong>Tambah Biaya</strong>. Isi jumlah, pilih mata uang dari dropdown (18 mata uang tersedia), pilih kategori (Makanan, Transportasi, Belanja, dll.), tambahkan deskripsi opsional, dan pilih tanggal. Ringkasan mingguan diperbarui segera.',
            'faq-a14': '18 mata uang didukung: IDR (Rp), USD ($), EUR (\u20ac), GBP (\u00a3), JPY (\u00a5), SGD (S$), MYR (RM), AUD (A$), THB (\u0e3f), PHP (\u20b1), KRW (\u20a9), CNY (\u00a5), INR (\u20b9), SAR (\ufdfc), AED (\u0631.\u0625), BND (B$), BRL (R$), dan VND (\u20ab). Setiap transaksi menyimpan mata uangnya sendiri.',
            'faq-a15': 'Klik tombol <strong>Ekspor</strong> di sebelah judul tabel Keuangan. Sebuah modal terbuka di mana Anda dapat memilih <strong>CSV</strong> (dibuka di aplikasi spreadsheet) atau <strong>PDF</strong> (dihasilkan melalui jsPDF dengan tabel terformat untuk minggu ini).',
            'faq-a16': 'Buka <strong>Pengaturan \u2192 Umum</strong>. Di bawah Tema, pilih <strong>Terang</strong>, <strong>Gelap</strong>, atau <strong>Sistem</strong> (mengikuti preferensi OS Anda). Perubahan disimpan secara otomatis.',
            'faq-a17': 'Buka <strong>Pengaturan \u2192 Umum</strong>. Edit <strong>Nama</strong> dan <strong>Peran</strong> langsung di kolom teks. Untuk avatar, arahkan kursor ke foto dan klik ikon kamera untuk membuka menu foto \u2192 unggah gambar baru (otomatis dipotong ke 256px WebP) atau hapus yang sekarang. Semua perubahan auto-simpan.',
            'faq-a18': 'Ya. Buka <strong>Pengaturan \u2192 Zona Berbahaya</strong>. Gunakan <strong>Reset Semua Data</strong> untuk menghapus semua data localStorage (kursus, tugas, biaya, entri jurnal). Tombol <strong>Hapus Akun</strong> adalah placeholder demo. Tindakan ini tidak dapat dibatalkan.',
            'faq-a19': 'Tab awalnya bernama <em>Kuliah</em> dan <em>Learning Log</em>. Mereka diganti nama menjadi <strong>Belajar</strong> dan <strong>Jurnal</strong> untuk antarmuka yang lebih profesional dan konsisten berbahasa Inggris. Pengidentifikasi internal seperti <code>MATAKULIAH</code> dan label seperti <em>Mata Kuliah</em> dengan tetap mempertahankan istilah Indonesia karena merujuk pada data mata kuliah universitas yang sebenarnya.',

            /* About */
            'about-title': 'Tentang',
            'about-desc': '<strong>Personal Habit Tracker</strong> \u2014 dasbor pribadi serba bisa oleh Alfiz Ilham untuk melacak kemajuan pembelajaran, mata kuliah universitas, biaya harian, dan tugas. Dibangun dengan vanilla HTML/CSS/JS + backend Express dan database cloud NeonDB. Mendukung multi-user dengan autentikasi developer key.',
            'about-tabs': 'Tab',
            'about-th-tab': 'Tab',
            'about-th-purpose': 'Fungsi',
            'about-tech-stack': 'Tumpukan Teknologi',
            'about-th-component': 'Komponen',
            'about-th-technology': 'Teknologi',
            'about-data-privacy': 'Data &amp; Privasi',
            'about-data-text': 'Semua data user disimpan di NeonDB (PostgreSQL cloud). Local storage digunakan sebagai cache untuk akses cepat. Data dapat diekspor melalui Pengaturan \u2192 Ekspor.',
            'about-naming': 'Catatan Penamaan',
            'about-naming-text': 'Tab awalnya bernama Kuliah dan Learning Log diganti menjadi Study dan Journal.',
            'about-copyright': 'Dikembangkan oleh Alfiz Ilham \u00a9 2026 <strong>Alfiz Ilham</strong>. Hak cipta dilindungi undang-undang.',

            /* Danger Zone */
            'danger-title': 'Zona Berbahaya',
            'danger-reset-text': 'Reset Semua Data',
            'danger-reset-desc': 'Ini akan menghapus permanen semua kursus, tugas, biaya, dan jurnal.',
            'btn-reset': 'Reset',
            'danger-delete-text': 'Hapus Akun',
            'danger-delete-desc': 'Hapus akun dan semua data Anda secara permanen.',
            'btn-delete-account': 'Hapus Akun',
            'danger-logout-text': 'Keluar',
            'danger-logout-desc': 'Keluar dari akun Anda. Data tetap tersimpan di server.',
            'btn-logout': 'Keluar',

            /* Avatar sub-modal */
            'avatar-upload': 'Tambah Foto',
            'avatar-ganti': 'Ganti Foto',
            'avatar-hapus': 'Hapus Foto',

            /* Study empty states */
            'study-empty-log': 'Belum ada catatan. Centang mata kuliah di tab <strong>Minggu Ini</strong> untuk memulai.',
            'study-empty-week': 'Belum ada catatan di minggu ini.',
            'todo-empty': 'Belum ada tugas. Klik <strong>Tambah Tugas</strong> untuk memulai.',
            'todo-daily-badge': 'Harian',
            'todo-daily-add': 'Tambah Tugas Harian',
            'todo-daily-hint': 'Tugas harian ini akan muncul otomatis setiap hari tanpa perlu ditambahkan ulang.',
            'finance-empty-week': 'Data belum tersedia untuk Minggu ini.',

            /* Header counter dynamic labels */
            'head-completed': 'Terselesaikan',
            'head-total': 'Total',
            'head-minggu-ini': 'Minggu Ini',
            'head-mata-kuliah': 'Mata Kuliah',
            'head-entries': 'Entri',
            'head-journal': 'Jurnal',
            'head-certificates': 'Sertifikat',
            'head-archived': 'Diarsipkan',
            'head-done': 'Selesai',
            'head-tasks': 'Tugas',
            'head-total-label': 'Total',
            'head-transactions': 'Transaksi',
            'head-learning-log': 'Jurnal',

            /* Study table labels (JS-generated) */
            'study-empty-progress': 'Progres Minggu Ini',
        }
    };


    function getSettings() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
    }

    function saveSettings(data) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { }
    }


    function setDashboardLang(lang) {
        currentLang = lang;

        /* Save to settings_profile — hanya jika sudah ada; jangan buat objek minimal
           yang bisa menghalangi loadFromServer mengisi profil penuh (name/email/avatar). */
        if (localStorage.getItem(STORAGE_KEY) !== null) {
            var s = getSettings();
            s.language = lang;
            saveSettings(s);
        }

        if (!TRANSLATIONS[lang]) return;

        var dict = TRANSLATIONS[lang];

        /* Apply data-i18n attributes */
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.setAttribute('placeholder', dict[key]);
                } else {
                    el.innerHTML = dict[key];
                }
            }
        });

        /* Update sidebar profile info if needed */
        var nameEl = document.querySelector('.sidebar-profile__name');
        var roleEl = document.querySelector('.sidebar-profile__role');
        if (nameEl && s.name) nameEl.textContent = s.name;
        if (roleEl && s.role) roleEl.textContent = s.role;
    }


    function getDashboardLang() {
        var s = getSettings();
        return s.language || 'en';
    }


    function init() {
        var saved = getDashboardLang();
        var apply = function () { setDashboardLang(saved); };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', apply);
        } else {
            apply();
        }
    }

    init();

    /* Expose globally */
    var api = {
        setLang: setDashboardLang,
        getLang: getDashboardLang,
    };

    /* Helper: translate a single key — usable from dashboard.js */
    api.t = function (key) {
        var lang = api.getLang();
        var dict = TRANSLATIONS[lang];
        return dict && dict[key] !== undefined ? dict[key] : key;
    };

    return api;

})();

/* Global shortcut for easy use in dashboard.js */
function __(key) {
    return DASHBOARD_LANG.t(key);
}