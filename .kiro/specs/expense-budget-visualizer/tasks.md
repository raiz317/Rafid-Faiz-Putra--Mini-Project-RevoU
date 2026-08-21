# Implementation Plan: Expense & Budget Visualizer

## Overview

Implementasi dilakukan secara inkremental pada tiga file yang sudah ada: `index.html`, `css/style.css`, dan `js/app.js`. Setiap task membangun di atas task sebelumnya dan berakhir dengan integrasi penuh. Property-based tests menggunakan **fast-check** yang dimuat via CDN (tidak ada build tool). Semua task hanya memodifikasi ketiga file tersebut sesuai Requirement 11.

---

## Tasks

- [x] 1. Struktur HTML, konstanta state, dan persistence layer
  - [x] 1.1 Pastikan `index.html` memiliki semua elemen DOM yang direferensikan di `app.js`: `#totalBalance`, `#totalTransactions`, `#totalCategories`, `#limitBanner`, `#limitMessage`, `#dismissBanner`, `#transactionForm`, `#itemName`, `#amount`, `#category`, `#customCategoryGroup`, `#customCategory`, semua `#*Error` spans, `#spendingLimit`, `#setLimitBtn`, `#limitInfo`, `#expenseChart`, `#chartEmpty`, `#prevMonth`, `#nextMonth`, `#monthLabel`, `#monthlySummary`, `#transactionList`, `#sortSelect`, `#clearAllBtn`, `#themeToggle`, `#themeIcon`
    - Pastikan atribut `aria-label`, `role`, dan `aria-live` sudah lengkap untuk aksesibilitas
    - Pastikan `<canvas id="expenseChart">` memiliki `aria-label` dan `role="img"`
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 1.2 Definisikan konstanta storage keys dan struktur state awal di `js/app.js`
    - `STORAGE_KEY_TRANSACTIONS`, `STORAGE_KEY_THEME`, `STORAGE_KEY_LIMIT`, `STORAGE_KEY_CATEGORIES`
    - `DEFAULT_CATEGORIES`, `CATEGORY_COLORS`, `EXTRA_COLORS`
    - State variables: `transactions`, `customCategories`, `spendingLimit`, `currentTheme`, `monthOffset`, `chartInstance`
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 1.3 Implementasikan persistence layer di `js/app.js`: `saveTransactions()`, `loadTransactions()`, `saveTheme()`, `loadTheme()`, `saveLimit()`, `loadLimit()`, `saveCategories()`, `loadCategories()`
    - `loadTransactions()` dan `loadCategories()` harus membungkus `JSON.parse` dalam `try/catch` dengan fallback ke array kosong
    - `loadTheme()` menggunakan `|| 'light'` sebagai default
    - `loadLimit()` menggunakan `parseFloat` dengan fallback `null`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 1.4 Tulis property test untuk Transaction storage round-trip
    - **Property 1: Transaction storage round-trip**
    - **Validates: Requirements 1.4, 5.1, 5.2, 5.3**
    - Gunakan `fc.array(validTransactionArb)` untuk menghasilkan array transaksi acak, panggil `saveTransactions()` lalu `loadTransactions()`, verifikasi panjang dan nilai field identik

  - [x] 1.5 Tulis property test untuk settings storage round-trip
    - **Property 11: Settings storage round-trip**
    - **Validates: Requirements 5.5**
    - Test bahwa `saveTheme`/`loadTheme`, `saveLimit`/`loadLimit`, `saveCategories`/`loadCategories` masing-masing mengembalikan nilai yang setara setelah save-load

- [x] 2. Utilitas dan helper functions
  - [x] 2.1 Implementasikan utility functions di `js/app.js`: `formatRp()`, `formatDate()`, `generateId()`, `getCategorySlug()`, `getCategoryIcon()`, `getCategoryColor()`, `escapeHtml()`, `getAllCategories()`
    - `getCategoryColor()` untuk built-in menggunakan `CATEGORY_COLORS`, untuk custom menggunakan hash deterministik `(hash * 31 + charCode) % EXTRA_COLORS.length`
    - `escapeHtml()` harus meng-escape `&`, `<`, `>`, `"`, `'`
    - `getCategorySlug()` mengembalikan `'custom'` untuk semua kategori non-built-in
    - _Requirements: 3.1, 4.2, 9.3, 9.4_

  - [x] 2.2 Tulis property test untuk deterministic category color
    - **Property 9: Category color is deterministic**
    - **Validates: Requirements 4.2, 9.3**
    - Gunakan `fc.string({ minLength: 1 })` sebagai nama kategori, verifikasi `getCategoryColor(name) === getCategoryColor(name)` untuk setiap pemanggilan

  - [x] 2.3 Tulis property test untuk custom category slug classification
    - **Property 16: Custom category slug classification**
    - **Validates: Requirements 9.4**
    - Gunakan `fc.string({ minLength: 1 })` yang difilter bukan salah satu dari `['Food', 'Transport', 'Fun']`, verifikasi `getCategorySlug(name) === 'custom'`

  - [x] 2.4 Tulis property test untuk tooltip formatter
    - **Property 10: Tooltip formatter produces valid output**
    - **Validates: Requirements 4.5**
    - Gunakan `fc.float({ min: 0.01 })` untuk `value` dan `total` (dengan `value ≤ total`), verifikasi output mengandung string "Rp" dan persentase dengan tepat satu desimal

- [ ] 3. Form input, validasi, dan kategori kustom
  - [x] 3.1 Implementasikan `rebuildCategorySelect()` di `js/app.js` yang membangun ulang dropdown dari `getAllCategories()` ditambah opsi `__custom__` di bagian bawah
    - Pertahankan seleksi sebelumnya jika masih valid
    - _Requirements: 1.1, 1.2, 9.2_

  - [x] 3.2 Implementasikan event listener `dom.category.addEventListener('change')` untuk menampilkan/menyembunyikan `#customCategoryGroup` ketika `__custom__` dipilih
    - _Requirements: 1.3_

  - [x] 3.3 Implementasikan `validateForm()` dan `clearErrors()` di `js/app.js`
    - Validasi: nama tidak kosong/hanya spasi, amount > 0 dan numerik, kategori dipilih, custom category name tidak kosong jika `__custom__`
    - Tampilkan pesan error per field dan tambahkan class `input-error`
    - _Requirements: 1.5, 1.6_

  - [x] 3.4 Tulis property test untuk form validation menolak input tidak valid
    - **Property 2: Form validation rejects invalid inputs**
    - **Validates: Requirements 1.5, 1.6**
    - Gunakan generator invalid inputs: nama kosong ATAU amount ≤ 0 ATAU kategori kosong, verifikasi `validateForm()` mengembalikan `false` dan error message tidak kosong

  - [x] 3.5 Implementasikan form submit handler di `js/app.js`: buat objek `Transaction` dengan `generateId()`, `name`, `amount`, `category`, `createdAt: new Date().toISOString()`, push ke `transactions`, simpan, reset form
    - Jika kategori `__custom__`: registrasi ke `customCategories` jika belum ada, simpan, rebuild select
    - Reset: `dom.form.reset()`, sembunyikan `#customCategoryGroup`, panggil `clearErrors()`
    - _Requirements: 1.4, 1.7, 9.1_

  - [ ] 3.6 Tulis property test untuk form reset setelah submit berhasil
    - **Property 3: Form resets after successful submission**
    - **Validates: Requirements 1.7**
    - Untuk setiap triple (name, amount, category) valid, verifikasi bahwa setelah submit semua field form kembali ke kondisi awal

  - [ ] 3.7 Tulis property test untuk idempotency custom category addition
    - **Property 15: Custom category addition is idempotent**
    - **Validates: Requirements 9.1**
    - Untuk kategori yang sudah ada di `customCategories`, menambahkannya lagi tidak mengubah panjang array; untuk kategori baru, panjang bertambah 1

- [ ] 4. Checkpoint — Pastikan persistence dan form berfungsi
  - Pastikan semua tests pass, tanya pengguna jika ada pertanyaan.

- [ ] 5. Rendering balance, transaction list, dan sorting
  - [ ] 5.1 Implementasikan `renderBalance()` di `js/app.js`
    - Hitung total amount dari `transactions`, tampilkan di `#totalBalance` sebagai `formatRp(total)`
    - Tampilkan `transactions.length` di `#totalTransactions`
    - Tampilkan jumlah unique categories (Set) di `#totalCategories`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 5.2 Tulis property test untuk balance computation correctness
    - **Property 7: Balance computation correctness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - Untuk setiap array transaksi acak, verifikasi bahwa nilai yang ditampilkan di `#totalBalance` sama dengan jumlah aritmatika semua `amount`, `#totalTransactions` = `transactions.length`, `#totalCategories` = ukuran set kategori unik

  - [x] 5.3 Implementasikan `getSortedTransactions()` di `js/app.js`
    - Mode: `newest` (sort by `createdAt` desc), `oldest` (asc), `amount-desc`, `amount-asc`, `category` (alfabetis)
    - Harus menggunakan salinan array (`[...transactions]`) tanpa memutasi original
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 5.4 Tulis property test untuk sort produces correctly ordered copy
    - **Property 5: Sort produces a correctly ordered copy**
    - **Validates: Requirements 2.2, 7.2, 7.3**
    - Untuk setiap array transaksi dan mode sort valid, verifikasi array terurut sesuai kriteria, berisi transaksi yang sama, dan tidak memutasi `transactions` original

  - [ ] 5.5 Implementasikan `renderTransactionList()` di `js/app.js`
    - Jika tidak ada transaksi: tampilkan empty state `<div class="empty-list">` dengan ikon dan pesan
    - Untuk setiap transaksi: render `.transaction-item` dengan `tx-icon`, `tx-info` (nama, badge kategori, tanggal), `tx-amount`, tombol hapus `.tx-delete`
    - Tambahkan class `over-limit` pada item jika total melebihi `spendingLimit`
    - Gunakan `escapeHtml()` untuk semua data user-generated
    - Tambahkan `role="listitem"` dan `aria-label` pada tombol hapus
    - _Requirements: 2.1, 2.2, 2.3, 8.6_

  - [ ] 5.6 Tulis property test untuk transaction list renders all required fields
    - **Property 4: Transaction list renders all required fields**
    - **Validates: Requirements 2.1**
    - Untuk setiap array transaksi non-kosong, setiap elemen `.transaction-item` yang dirender harus mengandung nama, jumlah Rupiah, nama kategori, dan tanggal terformat

  - [ ] 5.7 Implementasikan `deleteTransaction(id)` di `js/app.js` dan event listener hapus via delegation
    - Filter `transactions` array untuk menghapus transaksi dengan id yang sesuai
    - Panggil `saveTransactions()` lalu `renderAll()`
    - _Requirements: 2.4_

  - [ ] 5.8 Tulis property test untuk delete removes exactly the target transaction
    - **Property 6: Delete removes exactly the target transaction**
    - **Validates: Requirements 2.4**
    - Untuk setiap array transaksi (min 1) dan id target valid, setelah `deleteTransaction(id)` tidak ada transaksi dengan id tersebut, dan semua transaksi lain tetap utuh

  - [ ] 5.9 Implementasikan "Clear All" handler di `js/app.js`
    - Jika `transactions.length === 0`: tidak melakukan apa-apa
    - Tampilkan `confirm()` browser; jika dikonfirmasi: kosongkan `transactions`, simpan, `renderAll()`
    - _Requirements: 2.5, 2.6_

  - [ ] 5.10 Tambahkan event listener `dom.sortSelect.addEventListener('change')` yang memanggil `renderTransactionList()`
    - _Requirements: 7.2_

- [ ] 6. Rendering chart dan spending limit
  - [ ] 6.1 Implementasikan `renderChart()` di `js/app.js`
    - Agregasi total per kategori dari `transactions`
    - Jika tidak ada data: sembunyikan canvas, tampilkan `#chartEmpty`, destroy instance jika ada
    - Jika ada data: sembunyikan `#chartEmpty`, tampilkan canvas; update instance yang ada (jangan recreate) atau buat baru dengan tipe `doughnut`
    - Konfigurasi tooltip callback untuk menampilkan `formatRp(val)` dan persentase satu desimal
    - Gunakan `getCategoryColor()` untuk warna setiap kategori
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 6.2 Tulis property test untuk chart data aggregation correctness
    - **Property 8: Chart data aggregation correctness**
    - **Validates: Requirements 4.1**
    - Untuk setiap array transaksi non-kosong, label dan nilai dataset chart harus mencakup tepat set kategori yang berbeda, dengan setiap nilai kategori sama dengan jumlah amount transaksi dalam kategori tersebut, dan semua nilai berjumlah sama dengan total keseluruhan

  - [ ] 6.3 Implementasikan `checkSpendingLimit()` di `js/app.js`
    - Jika `spendingLimit === null`: sembunyikan banner
    - Jika total > limit: tampilkan `#limitBanner` dengan pesan yang menyebutkan total aktual dan nilai limit (keduanya dengan `formatRp`); jika tidak: sembunyikan banner
    - _Requirements: 8.4_

  - [ ] 6.4 Tulis property test untuk spending limit banner reflects total vs limit
    - **Property 13: Spending limit banner reflects total vs. limit**
    - **Validates: Requirements 8.4**
    - Untuk setiap array transaksi dan spending limit positif, verifikasi banner visible jika sum > limit (dan pesan mengandung total dan limit sebagai Rupiah), banner hidden jika sum ≤ limit

  - [ ] 6.5 Tulis property test untuk over-limit highlight applied to all transaction items
    - **Property 14: Over-limit highlight applied to all transaction items**
    - **Validates: Requirements 8.6**
    - Untuk setiap array transaksi di mana total melebihi `spendingLimit`, setiap `.transaction-item` yang dirender harus memiliki class `over-limit`

  - [ ] 6.6 Implementasikan `renderLimitUI()` di `js/app.js`
    - Jika `spendingLimit !== null`: pre-fill `dom.spendingLimit.value` dan tampilkan teks konfirmasi di `#limitInfo`
    - _Requirements: 8.7_

  - [ ] 6.7 Implementasikan spending limit set handler (`dom.setLimitBtn.addEventListener('click')`) di `js/app.js`
    - Jika nilai kosong, NaN, atau ≤ 0: tampilkan error di `#limitInfo` dengan warna danger, jangan ubah `spendingLimit`
    - Jika valid: set `spendingLimit`, simpan, tampilkan konfirmasi di `#limitInfo` dengan warna success, panggil `renderAll()`
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 6.8 Tulis property test untuk spending limit validation rejects non-positive inputs
    - **Property 12: Spending limit validation rejects non-positive inputs**
    - **Validates: Requirements 8.3**
    - Untuk setiap input yang kosong, nol, atau negatif, handler set-limit tidak boleh mengubah nilai `spendingLimit` saat ini, dan pesan error harus terlihat di `#limitInfo`

  - [ ] 6.9 Implementasikan dismiss banner handler (`dom.dismissBanner.addEventListener('click')`) di `js/app.js`
    - Tambahkan class `hidden` ke `#limitBanner`
    - _Requirements: 8.5_

- [ ] 7. Checkpoint — Pastikan form, list, chart, dan spending limit terintegrasi
  - Pastikan semua tests pass, tanya pengguna jika ada pertanyaan.

- [ ] 8. Dark/light theme toggle
  - [ ] 8.1 Implementasikan `applyTheme(theme)` di `js/app.js`
    - Set `document.documentElement.setAttribute('data-theme', theme)`
    - Update `dom.themeIcon.textContent`: `'☀️'` untuk dark, `'🌙'` untuk light
    - Jika `chartInstance` ada: update `chartInstance.options.plugins.legend.labels.color` dan panggil `chartInstance.update()`
    - _Requirements: 6.2, 6.3_

  - [ ] 8.2 Implementasikan theme toggle event listener di `js/app.js`
    - Toggle `currentTheme` antara `'light'` dan `'dark'`, panggil `applyTheme()` dan `saveTheme()`
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ] 8.3 Tambahkan CSS dark theme overrides di `css/style.css` menggunakan `[data-theme="dark"]` selector
    - Override variabel CSS: `--bg-body`, `--bg-card`, `--bg-header`, `--bg-input`, `--bg-badge`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-color`, dll.
    - Override warna badge dan item `.over-limit` untuk dark mode
    - _Requirements: 6.2_

- [ ] 9. Monthly summary dengan navigasi bulan
  - [ ] 9.1 Implementasikan `getViewedMonth()` dan `renderMonthlySummary()` di `js/app.js`
    - `getViewedMonth()`: kembalikan `new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)`
    - Filter transaksi berdasarkan year dan month dari `createdAt`
    - Jika tidak ada transaksi bulan tersebut: tampilkan pesan kosong di `#monthlySummary`
    - Kelompokkan per kategori, hitung total, urutkan descending
    - Render rows + total row; update `#monthLabel` dengan nama bulan dan tahun
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

  - [ ] 9.2 Implementasikan event listeners navigasi bulan (`dom.prevMonth`, `dom.nextMonth`) di `js/app.js`
    - Decrement/increment `monthOffset`, panggil `renderMonthlySummary()`
    - _Requirements: 10.3, 10.4_

  - [ ] 9.3 Tulis property test untuk monthly summary grouping and sorting correctness
    - **Property 17: Monthly summary grouping and sorting correctness**
    - **Validates: Requirements 10.1, 10.2**
    - Untuk setiap array transaksi dan month offset, `renderMonthlySummary()` hanya menampilkan transaksi yang `createdAt`-nya jatuh dalam bulan yang dilihat, dikelompokkan per kategori dengan total yang benar, dan diurutkan descending

  - [ ] 9.4 Tulis property test untuk month navigation consistency
    - **Property 18: Month navigation is consistent with offset**
    - **Validates: Requirements 10.3, 10.4**
    - Untuk setiap `monthOffset` awal, increment +1 lalu decrement -1 harus kembali ke offset asal; `getViewedMonth()` harus mengembalikan Date yang year dan month-nya cocok dengan kalender expected untuk offset tersebut

- [ ] 10. Inisialisasi aplikasi dan responsive layout
  - [ ] 10.1 Implementasikan fungsi `init()` dan panggil di bagian bawah `js/app.js`
    - Urutan: `loadTransactions()`, `loadTheme()`, `loadLimit()`, `loadCategories()`, `applyTheme(currentTheme)`, `rebuildCategorySelect()`, `renderLimitUI()`, `renderAll()`
    - _Requirements: 5.3, 5.5, 6.5_

  - [ ] 10.2 Implementasikan `renderAll()` di `js/app.js` yang memanggil semua render function secara berurutan
    - `renderBalance()`, `renderTransactionList()`, `renderChart()`, `renderMonthlySummary()`, `checkSpendingLimit()`
    - _Requirements: 2.4, 3.4, 4.3, 10.6_

  - [ ] 10.3 Tambahkan responsive CSS di `css/style.css` untuk layout mobile-first
    - Grid layout: `grid-template-columns: 1fr` default; `380px 1fr` di ≥768px; `420px 1fr` di ≥1024px
    - Max transaction list height: 480px dengan `overflow-y: auto`
    - Pastikan layout dapat digunakan di viewport minimal 320px (test via DevTools)
    - _Requirements: 11.5_

  - [ ] 10.4 Pastikan semua DOM references tersedia sebelum script berjalan; `<script src="js/app.js">` diletakkan sebelum closing `</body>` di `index.html`
    - Pastikan Chart.js CDN `<script>` dimuat sebelum `app.js`
    - _Requirements: 11.3, 11.4_

- [ ] 11. Final Checkpoint — Pastikan semua tests pass dan semua fitur terintegrasi
  - Pastikan semua tests pass, tanya pengguna jika ada pertanyaan.

---

## Notes

- Task bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirement spesifik untuk traceability
- Property tests menggunakan **fast-check** via CDN; tambahkan `<script src="https://cdn.jsdelivr.net/npm/fast-check@3/lib/bundle/fast-check.min.js"></script>` sementara di `index.html` selama fase testing, lalu hapus setelah selesai
- Checkpoint memastikan validasi inkremental sebelum lanjut ke fase berikutnya
- Semua perubahan hanya pada tiga file: `index.html`, `css/style.css`, `js/app.js`
- Urutan task dirancang agar tidak ada kode yang "menggantung" tanpa integrasi

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1"] },
    { "id": 2, "tasks": ["1.4", "1.5", "2.2", "2.3", "2.4", "3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3", "5.3"] },
    { "id": 4, "tasks": ["3.4", "3.5", "5.4"] },
    { "id": 5, "tasks": ["3.6", "3.7", "5.1", "5.5", "6.3", "8.1", "8.3", "9.1"] },
    { "id": 6, "tasks": ["5.2", "5.6", "5.7", "6.1", "6.6", "6.7", "8.2", "9.2"] },
    { "id": 7, "tasks": ["5.8", "5.9", "5.10", "6.2", "6.4", "6.5", "6.8", "6.9", "9.3", "9.4"] },
    { "id": 8, "tasks": ["10.1", "10.2", "10.3", "10.4"] }
  ]
}
```
