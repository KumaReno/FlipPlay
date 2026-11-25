<?php

declare(strict_types=1);

require dirname(__DIR__) . '/vendor/autoload.php';

use FlipPlay\Models\Anime;
use FlipPlay\Models\Manga;
use FlipPlay\Models\User;
use FlipPlay\Services\MediaLibrary;

function expect(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function expectInvalidArgument(callable $operation, string $message): void
{
    try {
        $operation();
    } catch (InvalidArgumentException) {
        return;
    }

    throw new RuntimeException($message);
}

$library = new MediaLibrary();
$anime = new Anime(1, '  Spy x Family  ', 'Action, Comedy', 2022, 25);
$manga = new Manga(2, 'Blue Lock', 'Sports', 2018, 320);

expect($library->addMedia($anime), 'Media baru seharusnya berhasil ditambahkan.');
expect(!$library->addMedia($anime), 'ID media duplikat seharusnya ditolak.');
expect(count($library->getAll()) === 1, 'Katalog seharusnya tidak memuat media duplikat.');
expect($library->findById(1) === $anime, 'Pencarian berdasarkan ID seharusnya menemukan media.');
expect($library->findById(99) === null, 'ID yang tidak ada seharusnya menghasilkan null.');
expect(count($library->searchByTitle('spy')) === 1, 'Pencarian judul seharusnya tidak peka huruf besar-kecil.');
expect($library->searchByTitle('   ') === [], 'Pencarian kosong seharusnya menghasilkan daftar kosong.');
expect($library->searchByTitle('tidak-ada') === [], 'Judul yang tidak ada seharusnya menghasilkan daftar kosong.');
expect($anime->getTitle() === 'Spy x Family', 'Judul seharusnya disimpan tanpa spasi di awal/akhir.');
expect($anime->getType() === 'Anime', 'Jenis media Anime tidak sesuai.');
expect($manga->getType() === 'Manga', 'Jenis media Manga tidak sesuai.');

$user = new User(1, '  Nadia  ');
expect($user->getName() === 'Nadia', 'Nama pengguna seharusnya disimpan tanpa spasi di awal/akhir.');
expect($user->addToCollection($anime), 'Media baru seharusnya berhasil masuk koleksi.');
expect(!$user->addToCollection($anime), 'Media yang sama tidak boleh ditambahkan dua kali.');
expect(count($user->getCollection()) === 1, 'Koleksi seharusnya hanya berisi satu media.');
expect($user->removeFromCollection(1), 'Media yang ada seharusnya berhasil dihapus dari koleksi.');
expect(!$user->removeFromCollection(1), 'Penghapusan media yang tidak ada seharusnya menghasilkan false.');

expectInvalidArgument(
    static fn () => new Anime(0, 'Invalid ID', 'Drama', 2024, 12),
    'ID media tidak valid seharusnya melempar InvalidArgumentException.',
);
expectInvalidArgument(
    static fn () => new Anime(3, '   ', 'Drama', 2024, 12),
    'Judul kosong seharusnya melempar InvalidArgumentException.',
);
expectInvalidArgument(
    static fn () => new Anime(3, 'Invalid episodes', 'Drama', 2024, 0),
    'Jumlah episode tidak valid seharusnya melempar InvalidArgumentException.',
);
expectInvalidArgument(
    static fn () => new User(0, 'Invalid user'),
    'ID pengguna tidak valid seharusnya melempar InvalidArgumentException.',
);

echo "Semua pemeriksaan demo Modul 3 lulus.\n";
