# 💰 Expense & Budget Visualizer

Expense & Budget Visualizer adalah aplikasi web berbasis *mobile-friendly* yang dirancang untuk membantu pengguna melacak dan mengelola pengeluaran harian mereka secara instan. Aplikasi ini menyajikan ringkasan saldo total, riwayat transaksi yang interaktif, serta visualisasi distribusi pengeluaran berbasis grafik lingkaran (*Pie/Doughnut Chart*).

---

## 🚀 Fitur Utama (MVP)

Aplikasi ini telah memenuhi seluruh spesifikasi fungsional utama (Minimum Viable Product):
*   **Form Input Valid**: Menginput Nama Item, Jumlah Angka (Amount), dan Kategori dengan validasi form instan sebelum data disimpan.
*   **Daftar Transaksi Interaktif**: Menyajikan daftar pengeluaran dalam bentuk *scrollable list* yang dilengkapi dengan informasi detail item serta tombol hapus (*delete button*) per item.
*   **Ringkasan Saldo Live**: Menampilkan total pengeluaran di bagian atas layar yang otomatis diperbarui (*real-time updates*) saat transaksi ditambah atau dihapus.
*   **Visualisasi Chart**: Menggunakan pustaka **Chart.js** untuk merender diagram lingkaran dinamis yang melacak persentase distribusi pengeluaran per kategori.

---

## ✨ Fitur Opsional & Bonus Tambahan

Untuk meningkatkan pengalaman pengguna (*User Experience*), 3 fitur opsional utama beserta fitur bonus telah diintegrasikan ke dalam sistem:
*   🌓 **Dark / Light Mode Toggle**: Peralihan tema gelap dan terang yang nyaman di mata. Preferensi tema pengguna disimpan secara permanen di browser (*persisted theme session*).
*   🔀 **Penyortiran Transaksi (Sorting)**: Memungkinkan pengguna mengurutkan riwayat transaksi berdasarkan Transaksi Terbaru, Terlama, Jumlah Pengeluaran tertinggi/terendah, hingga urutan alfabetis Kategori.
*   ⚠️ **Batas Anggaran (Spending Limit Highlight)**: Pengguna dapat menetapkan batas anggaran maksimal. Sistem akan menampilkan *warning banner* di bagian atas dan memberikan warna *highlight* merah pada item jika total pengeluaran melampaui batas tersebut.
*   ➕ **Kategori Kustom (Custom Categories)**: Pengguna tidak terbatas pada kategori bawaan (*Food, Transport, Fun*), melainkan bisa menambahkan kategori baru sesuai kebutuhan langsung dari menu drop-down.
*   📅 **Ringkasan Bulanan (Monthly Summary)**: Navigasi riwayat pengeluaran yang rapi berbasis bulan ke bulan disertai *breakdown* total pengeluaran per kategori spesifik pada bulan tersebut.

---

## 🛠️ Batasan Teknis (Technical Constraints)

Proyek ini dibangun murni mengikuti standar arsitektur ringan tanpa ketergantungan pada alat pihak ketiga yang kompleks:

*   **TC-1: Technology Stack**
    *   **HTML5** untuk standarisasi struktur semantik halaman web.
    *   **CSS3** untuk desain tata letak (*layouting*), animasi transisi, dan variabel tema.
    *   **Vanilla JavaScript** (ES6+) murni untuk memproses seluruh logika aplikasi, manipulasi DOM, dan event handling tanpa menggunakan framework (React, Vue, Angular, dsb).
    *   **Tanpa Server Backend**: Aplikasi berjalan 100% otonom di sisi klien (*client-side only*).
*   **TC-2: Data Storage**
    *   Memanfaatkan **Browser Local Storage API** untuk menyimpan seluruh data transaksi, kategori kustom, batas anggaran, dan status tema. Data tetap aman dan tidak hilang meskipun browser ditutup atau di-refresh.
*   **TC-3: Browser Compatibility**
    *   Kompatibel penuh dengan seluruh browser modern berbasis Chromium dan WebKit (Google Chrome, Mozilla Firefox, Microsoft Edge, dan Apple Safari).
    *   Dapat dijalankan langsung sebagai halaman web statis, aplikasi mandiri, maupun dikemas sebagai browser extension.

---

## 📐 Aturan Struktur Folder (Folder Rules)

Struktur repositori dijaga agar tetap bersih, minimalis, dan mudah dipahami:

```text
├── .kiro/
│   ├── requirements.md      # Dokumen kebutuhan proyek dari Kiro AI
│   ├── design.md            # Cetak biru arsitektur teknis
│   └── tasks.md             # Daftar centang tugas implementasi
├── css/
│   └── style.css            # Satu-satunya file CSS untuk seluruh styling aplikasi
├── js/
│   └── app.js               # Satu-satunya file JavaScript untuk seluruh logika fitur
├── index.html               # Struktur utama aplikasi dan integrasi CDN Chart.js
└── README.md                # Dokumentasi proyek
```

---

## 🎨 Desain Non-Fungsional (NFR)

*   **NFR-1: Simplicity**: Antarmuka bersih, minimalis, intuitif, dan tidak membutuhkan proses instalasi/setup dependensi yang rumit sebelum dijalankan.
*   **NFR-2: Performance**: Waktu pemuatan halaman (*load time*) super cepat dan interaksi UI sangat responsif tanpa adanya lag visual saat memperbarui data grafik maupun daftar transaksi.
*   **NFR-3: Visual Design**: Menerapkan konsep *Mobile-First Design* yang responsif hingga ukuran layar terkecil (320px), memiliki hierarki visual yang jelas, serta tipografi yang nyaman dibaca di perangkat seluler.

---

## 💻 Cara Menjalankan Proyek Secara Lokal

Karena proyek ini tidak menggunakan backend server, Anda bisa langsung menjalankannya di komputer Anda tanpa proses kompilasi:

1. Clone repositori ini ke komputer Anda:
   ```bash
   git clone https://github.com/raiz317/Rafid-Faiz-Putra--Mini-Project-RevoU.git
   ```
2. Masuk ke dalam folder proyek:
   ```bash
   cd nama-repositori
   ```
3. Buka file `index.html` langsung menggunakan browser pilihan Anda, atau gunakan ekstensi seperti **Live Server** di VS Code untuk pengalaman pengembangan yang lebih lancar.

## 📺 Tampilan Visual

<img width="959" height="416" alt="Screenshot 2026-08-21 155528" src="https://github.com/user-attachments/assets/e2824548-cf1c-41f7-93a8-0d76c703641c" />

