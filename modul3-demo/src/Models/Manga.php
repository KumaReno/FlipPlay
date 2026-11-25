<?php

declare(strict_types=1);

namespace FlipPlay\Models;

final class Manga extends Media
{
    private readonly int $chapterCount;

    public function __construct(
        int $id,
        string $title,
        string $genre,
        int $releaseYear,
        int $chapterCount,
    ) {
        if ($chapterCount < 1) {
            throw new \InvalidArgumentException('Jumlah chapter harus lebih besar dari 0.');
        }

        parent::__construct($id, $title, $genre, $releaseYear);
        $this->chapterCount = $chapterCount;
    }

    public function getType(): string
    {
        return 'Manga';
    }

    protected function getFormatDetails(): string
    {
        return sprintf('Jumlah chapter: %d', $this->chapterCount);
    }
}
