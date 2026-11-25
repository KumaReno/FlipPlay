<?php

declare(strict_types=1);

namespace FlipPlay\Models;

final class Anime extends Media
{
    private readonly int $episodeCount;

    public function __construct(
        int $id,
        string $title,
        string $genre,
        int $releaseYear,
        int $episodeCount,
    ) {
        if ($episodeCount < 1) {
            throw new \InvalidArgumentException('Jumlah episode harus lebih besar dari 0.');
        }

        parent::__construct($id, $title, $genre, $releaseYear);
        $this->episodeCount = $episodeCount;
    }

    public function getType(): string
    {
        return 'Anime';
    }

    protected function getFormatDetails(): string
    {
        return sprintf('Jumlah episode: %d', $this->episodeCount);
    }
}
