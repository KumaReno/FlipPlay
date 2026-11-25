<?php

declare(strict_types=1);

namespace FlipPlay\Models;

abstract class Media
{
    private readonly int $id;

    protected readonly string $title;

    protected readonly string $genre;

    protected readonly int $releaseYear;

    public function __construct(int $id, string $title, string $genre, int $releaseYear)
    {
        $title = trim($title);
        $genre = trim($genre);

        if ($id < 1) {
            throw new \InvalidArgumentException('ID media harus lebih besar dari 0.');
        }

        if ($title === '') {
            throw new \InvalidArgumentException('Judul media wajib diisi.');
        }

        if ($genre === '') {
            throw new \InvalidArgumentException('Genre media wajib diisi.');
        }

        if ($releaseYear < 1) {
            throw new \InvalidArgumentException('Tahun rilis harus lebih besar dari 0.');
        }

        $this->id = $id;
        $this->title = $title;
        $this->genre = $genre;
        $this->releaseYear = $releaseYear;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getDetails(): string
    {
        return sprintf(
            '%s: %s | Genre: %s | Tahun: %d | %s',
            $this->getType(),
            $this->title,
            $this->genre,
            $this->releaseYear,
            $this->getFormatDetails(),
        );
    }

    abstract public function getType(): string;

    abstract protected function getFormatDetails(): string;
}
