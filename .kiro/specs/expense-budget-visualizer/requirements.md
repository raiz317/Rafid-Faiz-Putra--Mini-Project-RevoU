# Requirements Document

## Introduction

Expense & Budget Visualizer adalah aplikasi web mobile-friendly yang memungkinkan pengguna melacak pengeluaran harian mereka secara lokal di browser. Aplikasi ini dibangun dengan HTML, CSS, dan Vanilla JavaScript tanpa framework atau backend server. Semua data disimpan menggunakan browser Local Storage API sehingga persisten antar sesi. Fitur utama meliputi form input transaksi, daftar transaksi dengan penghapusan, ringkasan saldo total, grafik donat pengeluaran per kategori, serta fitur opsional seperti toggle tema gelap/terang, pengurutan transaksi, highlight batas pengeluaran, kategori kustom, dan ringkasan bulanan.

---

## Glossary

- **App**: Aplikasi Expense & Budget Visualizer yang berjalan di browser.
- **Transaction**: Satu entri pengeluaran yang terdiri dari nama item, jumlah (amount), kategori, dan timestamp pembuatan.
- **Transaction_List**: Komponen UI yang menampilkan semua transaksi yang telah ditambahkan dalam urutan yang dapat dikonfigurasi.
- **Form**: Komponen input HTML yang menerima nama item, jumlah, dan kategori dari pengguna.
- **Validator**: Logika validasi yang memeriksa kelengkapan dan kebenaran input sebelum transaksi disimpan.
- **Storage**: Browser Local Storage API yang menyimpan data transaksi, tema, batas pengeluaran, dan kategori kustom.
- **Balance_Summary**: Komponen UI yang menampilkan total pengeluaran, jumlah transaksi, dan jumlah kategori yang digunakan.
- **Chart**: Grafik donat (doughnut chart) yang dirender oleh Chart.js untuk memvisualisasikan pengeluaran per kategori.
- **Category**: Pengelompokan pengeluaran; kategori bawaan adalah Food, Transport, dan Fun; pengguna dapat menambahkan kategori kustom.
- **Spending_Limit**: Nilai ambang batas total pengeluaran yang ditetapkan oleh pengguna.
- **Monthly_Summary**: Komponen UI yang menampilkan ringkasan pengeluaran per kategori untuk bulan tertentu.
- **Theme**: Mode tampilan aplikasi, yaitu `light` (terang) atau `dark` (gelap).
- **Sort_Control**: Kontrol UI yang memungkinkan pengguna mengubah urutan tampilan transaksi.

---

## Requirements

### Requirement 1: Menambahkan Transaksi via Form

**User Story:** Sebagai pengguna, saya ingin memasukkan nama item, jumlah, dan kategori melalui sebuah form, sehingga saya dapat mencatat pengeluaran saya dengan cepat.

#### Acceptance Criteria

1. THE Form SHALL menyediakan field input untuk nama item (teks, maks. 60 karakter), jumlah dalam Rupiah (angka positif), dan pilihan kategori (dropdown).
2. THE Form SHALL menyertakan opsi "Add custom category…" di bagian bawah dropdown kategori untuk memungkinkan pengguna mendefinisikan kategori baru.
3. WHEN pengguna memilih opsi "Add custom category…", THE Form SHALL menampilkan field input tambahan untuk nama kategori kustom (teks, maks. 30 karakter).
4. WHEN pengguna mengirimkan Form dengan semua field terisi dan valid, THE App SHALL membuat sebuah Transaction baru dengan nama, jumlah, kategori, dan timestamp ISO saat ini, lalu menyimpannya ke Storage.
5. WHEN pengguna mengirimkan Form, THE Validator SHALL memeriksa bahwa nama item tidak kosong, jumlah adalah angka positif, dan kategori telah dipilih.
6. IF Validator mendeteksi satu atau lebih field tidak valid, THEN THE Form SHALL menampilkan pesan error per field di bawah field yang bersangkutan dan menambahkan class visual `input-error` pada field tersebut, tanpa menyimpan transaksi.
7. WHEN transaksi berhasil ditambahkan, THE Form SHALL mereset semua field ke kondisi awal dan menyembunyikan field kategori kustom.

---

### Requirement 2: Menampilkan dan Menghapus Transaksi

**User Story:** Sebagai pengguna, saya ingin melihat semua transaksi saya dalam daftar yang dapat di-scroll, sehingga saya dapat meninjau dan menghapus entri yang tidak diperlukan.

#### Acceptance Criteria

1. THE Transaction_List SHALL menampilkan semua Transaction yang tersimpan, masing-masing memuat nama item, jumlah yang diformat dalam Rupiah, nama kategori, dan tanggal pembuatan.
2. THE Transaction_List SHALL merender setiap item dalam urutan yang ditentukan oleh Sort_Control aktif.
3. WHEN tidak ada Transaction yang tersimpan, THE Transaction_List SHALL menampilkan pesan kosong yang memberi tahu pengguna untuk menambahkan transaksi pertama.
4. WHEN pengguna menekan tombol hapus pada sebuah Transaction, THE App SHALL menghapus Transaction tersebut dari state dan memperbarui Storage, lalu memperbarui seluruh UI secara sinkron.
5. WHEN pengguna menekan tombol "Clear All", THE App SHALL menampilkan dialog konfirmasi browser sebelum menghapus seluruh Transaction dari state dan Storage.
6. IF tidak ada Transaction yang tersimpan saat tombol "Clear All" ditekan, THEN THE App SHALL tidak melakukan tindakan apapun.

---

### Requirement 3: Menampilkan Ringkasan Saldo

**User Story:** Sebagai pengguna, saya ingin melihat total pengeluaran saya secara langsung di bagian atas halaman, sehingga saya dapat memantau kondisi anggaran saya sekilas.

#### Acceptance Criteria

1. THE Balance_Summary SHALL menampilkan total akumulasi semua nilai `amount` dari seluruh Transaction yang tersimpan, diformat sebagai mata uang Rupiah Indonesia.
2. THE Balance_Summary SHALL menampilkan jumlah total Transaction yang tersimpan.
3. THE Balance_Summary SHALL menampilkan jumlah Category unik yang digunakan oleh Transaction yang tersimpan.
4. WHEN sebuah Transaction ditambahkan atau dihapus, THE Balance_Summary SHALL memperbarui semua nilainya secara otomatis tanpa memerlukan reload halaman.

---

### Requirement 4: Visualisasi Chart Pengeluaran per Kategori

**User Story:** Sebagai pengguna, saya ingin melihat grafik yang menggambarkan proporsi pengeluaran per kategori, sehingga saya dapat memahami pola pengeluaran saya secara visual.

#### Acceptance Criteria

1. THE Chart SHALL menampilkan grafik donat (doughnut) yang merepresentasikan total pengeluaran per Category sebagai proporsi dari keseluruhan pengeluaran, menggunakan library Chart.js.
2. THE Chart SHALL menggunakan warna yang berbeda dan konsisten untuk setiap Category, termasuk kategori kustom.
3. WHEN sebuah Transaction ditambahkan atau dihapus, THE Chart SHALL memperbarui data dan tampilannya secara otomatis.
4. WHEN tidak ada Transaction yang tersimpan, THE Chart SHALL menyembunyikan elemen canvas dan menampilkan pesan teks yang menginformasikan bahwa belum ada data.
5. THE Chart SHALL menampilkan tooltip saat pengguna mengarahkan kursor ke segmen chart, memuat nilai dalam Rupiah dan persentase dari total pengeluaran.

---

### Requirement 5: Persistensi Data via Local Storage

**User Story:** Sebagai pengguna, saya ingin data pengeluaran saya tetap tersimpan setelah saya menutup atau me-refresh browser, sehingga saya tidak kehilangan riwayat transaksi.

#### Acceptance Criteria

1. WHEN sebuah Transaction ditambahkan, THE Storage SHALL menyimpan array Transaction yang diperbarui ke Local Storage menggunakan kunci `ebv_transactions`.
2. WHEN sebuah Transaction dihapus atau seluruh transaksi dihapus, THE Storage SHALL memperbarui entri `ebv_transactions` di Local Storage untuk mencerminkan state terkini.
3. WHEN App diinisialisasi, THE App SHALL memuat Transaction dari Local Storage dan merender ulang seluruh UI berdasarkan data yang dimuat.
4. IF data di Local Storage tidak dapat di-parse sebagai JSON yang valid, THEN THE App SHALL menginisialisasi state dengan array Transaction kosong tanpa menampilkan error kepada pengguna.
5. THE Storage SHALL menyimpan preferensi Theme, nilai Spending_Limit, dan daftar kategori kustom masing-masing di kunci `ebv_theme`, `ebv_limit`, dan `ebv_categories`.

---

### Requirement 6: Toggle Tema Gelap/Terang

**User Story:** Sebagai pengguna, saya ingin dapat beralih antara mode terang dan gelap, sehingga saya dapat menggunakan aplikasi dengan nyaman di berbagai kondisi pencahayaan.

#### Acceptance Criteria

1. THE App SHALL menyediakan sebuah tombol toggle Theme yang dapat diakses di header.
2. WHEN pengguna menekan tombol toggle Theme, THE App SHALL beralih dari Theme `light` ke `dark` atau sebaliknya, menerapkan atribut `data-theme` yang sesuai pada elemen `<html>`.
3. WHEN Theme berubah, THE App SHALL memperbarui ikon pada tombol toggle untuk mencerminkan Theme yang aktif (ikon bulan untuk light, ikon matahari untuk dark).
4. WHEN Theme berubah, THE App SHALL menyimpan nilai Theme ke Storage sehingga preferensi bertahan antar sesi.
5. WHEN App diinisialisasi, THE App SHALL memuat dan menerapkan Theme yang tersimpan; jika tidak ada data tersimpan, THE App SHALL menggunakan Theme `light` sebagai default.

---

### Requirement 7: Pengurutan Transaksi

**User Story:** Sebagai pengguna, saya ingin mengurutkan daftar transaksi berdasarkan berbagai kriteria, sehingga saya dapat menemukan dan menganalisis pengeluaran dengan lebih mudah.

#### Acceptance Criteria

1. THE Sort_Control SHALL menyediakan pilihan pengurutan: Newest First, Oldest First, Amount (tertinggi ke terendah), Amount (terendah ke tertinggi), dan By Category (alfabetis).
2. WHEN pengguna mengubah pilihan Sort_Control, THE Transaction_List SHALL segera merender ulang daftar Transaction dalam urutan yang dipilih.
3. THE App SHALL menerapkan pengurutan pada salinan array Transaction tanpa mengubah urutan penyimpanan data di Storage.

---

### Requirement 8: Highlight Batas Pengeluaran

**User Story:** Sebagai pengguna, saya ingin menetapkan batas total pengeluaran dan mendapat peringatan visual ketika batas tersebut terlampaui, sehingga saya dapat mengelola anggaran saya secara proaktif.

#### Acceptance Criteria

1. THE App SHALL menyediakan field input angka dan tombol "Set" untuk menetapkan nilai Spending_Limit dalam Rupiah.
2. WHEN pengguna menetapkan Spending_Limit dengan nilai angka positif yang valid, THE App SHALL menyimpan nilai tersebut ke Storage dan menampilkan konfirmasi teks di bawah field.
3. IF pengguna menekan tombol "Set" dengan nilai kosong atau non-positif, THEN THE App SHALL menampilkan pesan error di bawah field input tanpa mengubah Spending_Limit yang berlaku.
4. WHEN total semua Transaction melebihi Spending_Limit yang aktif, THE App SHALL menampilkan banner peringatan yang berisi pesan yang menyebutkan total aktual dan nilai Spending_Limit.
5. WHEN pengguna menekan tombol dismiss pada banner peringatan, THE App SHALL menyembunyikan banner tersebut.
6. WHEN total semua Transaction melebihi Spending_Limit yang aktif, THE Transaction_List SHALL menambahkan highlight visual pada setiap item Transaction.
7. WHEN App diinisialisasi, THE App SHALL memuat Spending_Limit dari Storage dan menampilkan nilainya di field input jika ada.

---

### Requirement 9: Kategori Kustom

**User Story:** Sebagai pengguna, saya ingin menambahkan kategori pengeluaran sendiri di luar kategori bawaan, sehingga saya dapat melacak jenis pengeluaran yang lebih relevan dengan kebutuhan saya.

#### Acceptance Criteria

1. THE Form SHALL menyimpan kategori kustom yang baru dibuat ke daftar `customCategories` di Storage jika belum pernah ada sebelumnya.
2. WHEN App diinisialisasi, THE App SHALL memuat daftar kategori kustom dari Storage dan menambahkannya ke dropdown kategori di Form.
3. THE Chart SHALL menggunakan warna yang ditentukan secara deterministik berdasarkan nama kategori untuk setiap kategori kustom, sehingga warna konsisten antar sesi.
4. THE Transaction_List SHALL menampilkan item Transaction dengan kategori kustom menggunakan ikon dan warna yang berbeda secara visual dari kategori bawaan.

---

### Requirement 10: Ringkasan Bulanan

**User Story:** Sebagai pengguna, saya ingin melihat ringkasan pengeluaran per kategori untuk bulan tertentu, sehingga saya dapat menganalisis tren pengeluaran saya dari waktu ke waktu.

#### Acceptance Criteria

1. THE Monthly_Summary SHALL menampilkan total pengeluaran per Category untuk bulan yang sedang ditampilkan, diurutkan dari total tertinggi ke terendah.
2. THE Monthly_Summary SHALL menampilkan total keseluruhan pengeluaran di bawah ringkasan per kategori untuk bulan tersebut.
3. THE App SHALL menyediakan tombol navigasi Previous Month dan Next Month untuk mengubah bulan yang ditampilkan di Monthly_Summary.
4. WHEN pengguna menekan tombol navigasi bulan, THE Monthly_Summary SHALL memperbarui tampilan untuk menampilkan data bulan yang bersangkutan dan memperbarui label nama bulan.
5. WHEN tidak ada Transaction pada bulan yang dipilih, THE Monthly_Summary SHALL menampilkan pesan informasi bahwa tidak ada transaksi pada bulan tersebut.
6. WHEN sebuah Transaction ditambahkan atau dihapus, THE Monthly_Summary SHALL memperbarui tampilannya secara otomatis jika Transaction tersebut termasuk dalam bulan yang sedang ditampilkan.

---

### Requirement 11: Kompatibilitas Browser dan Struktur Proyek

**User Story:** Sebagai developer, saya ingin aplikasi bekerja di browser modern dan mengikuti aturan struktur folder yang ditetapkan, sehingga kode mudah dipelihara dan dapat dijalankan tanpa setup tambahan.

#### Acceptance Criteria

1. THE App SHALL berfungsi penuh di versi terbaru browser Chrome, Firefox, Edge, dan Safari tanpa memerlukan plugin atau transpiler tambahan.
2. THE App SHALL terdiri dari tepat satu file HTML (index.html), tepat satu file CSS di direktori `css/`, dan tepat satu file JavaScript di direktori `js/`.
3. THE App SHALL tidak memerlukan backend server, build tool, atau package manager untuk dijalankan.
4. THE App SHALL memuat library Chart.js melalui CDN sehingga tidak ada dependensi lokal yang perlu diinstal.
5. WHILE App berjalan di perangkat mobile, THE App SHALL menampilkan layout yang responsif dan dapat digunakan pada layar dengan lebar minimal 320px.
