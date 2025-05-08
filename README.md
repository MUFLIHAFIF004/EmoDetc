# EmoDetc - Emotional Detection Team's

EmoDetc adalah aplikasi web untuk mendeteksi dan mengelola emosi tim selama proyek digital. Aplikasi ini berjalan secara lokal dengan penyimpanan data di localStorage dan siap untuk di-deploy ke GitHub Pages.

## Fitur Utama

- **Cek Mood Harian**: Form untuk memasukkan mood dengan emoji dan kata emosi
- **Diskusi Tim**: Ruang chat dengan indikator mood untuk setiap pesan
- **Dashboard Emosi**: Visualisasi tren mood tim dengan grafik interaktif
- **Feed Tim**: Berbagi update dan pengumuman dengan tim
- **Laporan Mingguan**: Ringkasan mood tim dengan rekomendasi

## Struktur Aplikasi

Aplikasi terdiri dari beberapa halaman:

1. **Halaman Cek Mood** (`index.html`): Halaman awal untuk input mood harian
2. **Halaman Diskusi Tim** (`chat.html`): Ruang chat untuk diskusi tim
3. **Halaman Dashboard** (`dashboard.html`): Visualisasi tren mood tim
4. **Halaman Feed** (`feed.html`): Berbagi update dengan tim
5. **Halaman Laporan** (`report.html`): Laporan mingguan mood tim

## Teknologi

- HTML5, CSS3, JavaScript (ES6+)
- Chart.js untuk visualisasi data
- LocalStorage untuk penyimpanan data
- Font Awesome untuk ikon
- Desain responsif untuk semua ukuran perangkat

## Cara Menjalankan

1. Clone repositori ini
2. Buka `index.html` di browser
3. Tidak memerlukan setup server - semua data disimpan secara lokal

## Deployment

Aplikasi ini dirancang untuk di-deploy sebagai website statis di GitHub Pages:

1. Push kode ke repositori GitHub
2. Aktifkan GitHub Pages di pengaturan repositori
3. Pilih branch main sebagai sumber

## Penyimpanan Data

Semua data disimpan di localStorage browser. Tidak memerlukan database eksternal.

## Lisensi

MIT License
