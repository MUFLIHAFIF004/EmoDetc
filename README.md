# EmoDetc (Emotional Detection Team's)

Aplikasi berbasis web untuk mendeteksi dan mengelola emosi dalam tim proyek digital.

## Deskripsi

EmoDetc adalah aplikasi yang dirancang untuk membantu tim dalam memantau, mengelola, dan menganalisis emosi anggota tim selama siklus pengembangan proyek. Aplikasi ini menggunakan pendekatan berbasis aturan (rule-based detection) untuk mendeteksi dan menganalisis emosi berdasarkan input dari pengguna.

## Arsitektur

Aplikasi ini dibangun dengan arsitektur 3 lapisan:
- **Input Layer**: Komponen untuk mengumpulkan data emosi (Cek Mood, FaceTracker, Form Feedback)
- **Core Layer**: Logika bisnis untuk memproses dan menganalisis data emosi
- **Output Layer**: Komponen untuk menampilkan hasil analisis (Dashboard, Weekly Report)

## Fitur Utama

1. **Cek Mood**: Form sederhana untuk merekam mood harian dengan emoji atau warna
2. **FaceTracker**: Deteksi emosi melalui ekspresi wajah menggunakan kamera perangkat
3. **Dashboard Emosi**: Visualisasi tren mood pengguna dan tim
4. **Diskusi Grup**: Ruang obrolan dengan konteks mood untuk setiap pesan
5. **Chat History**: Riwayat diskusi dengan filter berdasarkan tanggal dan mood
6. **Weekly Report**: Ringkasan mingguan mood, tren, dan interaksi tim
7. **Feed Tim**: Sistem feedback untuk memberikan masukan antar anggota tim

## Teknologi

- HTML5, CSS3, JavaScript
- TailwindCSS untuk styling
- Chart.js untuk visualisasi data

## Cara Menjalankan

1. Buka file `index.html` di browser web modern
2. Navigasi antar halaman menggunakan menu di navbar

## Pengembangan Selanjutnya

- Integrasi dengan backend untuk penyimpanan data persisten
- Implementasi algoritma machine learning untuk analisis emosi yang lebih akurat
- Fitur notifikasi untuk perubahan mood yang signifikan
- Integrasi dengan platform manajemen proyek