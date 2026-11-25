# Demo Modul 3 — FlipPlay

Simulasi CLI ini menunjukkan penerapan PHP OOP untuk katalog media FlipPlay:
class abstrak dan inheritance, namespace, validasi data, katalog, pencarian judul,
detail media, dan koleksi pengguna.

## Persyaratan

- PHP 8.2 atau lebih baru
- Composer 2

## Menjalankan demo

Dari folder `modul3-demo`:

```sh
composer install
composer demo
```

Demo menampilkan daftar media, meminta kata kunci pencarian dari terminal,
menampilkan detail media dan koleksi pengguna, serta memberi respons ketika
judul tidak ditemukan. Saat diminta, ketik sebagian atau seluruh judul lalu tekan
Enter. Pencarian tidak membedakan huruf besar dan kecil. Tekan Enter tanpa kata
kunci untuk melewati pencarian.

## Menjalankan pemeriksaan

```sh
composer test
```

Pemeriksaan mencakup penolakan ID duplikat, pencarian tanpa hasil, pengelolaan
koleksi, serta validasi input yang tidak sah.

## Struktur

```text
modul3-demo/
├── index.php
├── composer.json
├── src/
│   ├── Models/
│   │   ├── Media.php
│   │   ├── Anime.php
│   │   ├── Manga.php
│   │   └── User.php
│   └── Services/
│       └── MediaLibrary.php
└── tests/
    └── run.php
```

Composer memetakan namespace `FlipPlay\` ke folder `src/` menggunakan PSR-4.
Folder `vendor/` dihasilkan oleh Composer dan tidak perlu disimpan ke version control.
