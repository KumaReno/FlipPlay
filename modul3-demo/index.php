<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit("Demo ini hanya dapat dijalankan melalui CLI.\n");
}

$autoloadPath = __DIR__ . '/vendor/autoload.php';

if (!is_file($autoloadPath)) {
    fwrite(STDERR, "Autoloader belum tersedia. Jalankan `composer install` di folder modul3-demo.\n");
    exit(1);
}

require $autoloadPath;

use FlipPlay\Models\Anime;
use FlipPlay\Models\Manga;
use FlipPlay\Models\User;
use FlipPlay\Services\MediaLibrary;

$library = new MediaLibrary();

foreach ([
    new Anime(1, 'Frieren: Beyond Journey\'s End', 'Fantasy, Adventure', 2023, 28),
    new Anime(2, 'Spy x Family', 'Action, Comedy', 2022, 25),
    new Manga(3, 'Blue Lock', 'Sports', 2018, 320),
] as $media) {
    if (!$library->addMedia($media)) {
        throw new RuntimeException(sprintf('ID media %d sudah terdaftar.', $media->getId()));
    }
}

$user = new User(1, 'Nikko');

foreach ([1, 3] as $mediaId) {
    $media = $library->findById($mediaId);

    if ($media === null) {
        throw new RuntimeException(sprintf('Media dengan ID %d tidak ditemukan.', $mediaId));
    }

    if (!$user->addToCollection($media)) {
        throw new RuntimeException(sprintf('Media "%s" sudah ada di koleksi.', $media->getTitle()));
    }
}

echo "=== FLIPPLAY MEDIA LIBRARY ===\n\n";

echo "Daftar media:\n";
foreach ($library->getAll() as $media) {
    echo sprintf("- [%d] %s\n", $media->getId(), $media->getDetails());
}

fwrite(STDOUT, "\nMasukkan judul media yang ingin dicari: ");
$searchQuery = fgets(STDIN);

if ($searchQuery === false) {
    echo "\nInput pencarian tidak tersedia; pencarian dilewati.\n";
} else {
    $searchQuery = trim($searchQuery);

    if ($searchQuery === '') {
        echo "Kata kunci kosong; pencarian dilewati.\n";
    } else {
        echo sprintf("\nHasil pencarian untuk \"%s\":\n", $searchQuery);
        $searchResults = $library->searchByTitle($searchQuery);

        if ($searchResults === []) {
            echo "- Tidak ada media yang ditemukan.\n";
        } else {
            foreach ($searchResults as $media) {
                echo sprintf("- [%d] %s\n", $media->getId(), $media->getDetails());
            }
        }
    }
}

echo "\nDetail media ID 1:\n";
$selectedMedia = $library->findById(1);
echo $selectedMedia === null
    ? "- Media tidak ditemukan.\n"
    : sprintf("- [%d] %s\n", $selectedMedia->getId(), $selectedMedia->getDetails());

echo sprintf("\nKoleksi media milik %s:\n", $user->getName());
foreach ($user->getCollection() as $media) {
    echo sprintf("- [%d] %s\n", $media->getId(), $media->getDetails());
}
