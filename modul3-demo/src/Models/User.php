<?php

declare(strict_types=1);

namespace FlipPlay\Models;

final class User
{
    private readonly int $id;

    private readonly string $name;

    /** @var array<int, Media> */
    private array $collection = [];

    public function __construct(int $id, string $name)
    {
        $name = trim($name);

        if ($id < 1) {
            throw new \InvalidArgumentException('ID pengguna harus lebih besar dari 0.');
        }

        if ($name === '') {
            throw new \InvalidArgumentException('Nama pengguna wajib diisi.');
        }

        $this->id = $id;
        $this->name = $name;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function addToCollection(Media $media): bool
    {
        $mediaId = $media->getId();

        if (isset($this->collection[$mediaId])) {
            return false;
        }

        $this->collection[$mediaId] = $media;

        return true;
    }

    public function removeFromCollection(int $mediaId): bool
    {
        if (!isset($this->collection[$mediaId])) {
            return false;
        }

        unset($this->collection[$mediaId]);

        return true;
    }

    /** @return array<int, Media> */
    public function getCollection(): array
    {
        return array_values($this->collection);
    }
}
