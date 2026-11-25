<?php

declare(strict_types=1);

namespace FlipPlay\Services;

use FlipPlay\Models\Media;

final class MediaLibrary
{
    /** @var array<int, Media> */
    private array $media = [];

    public function addMedia(Media $media): bool
    {
        $mediaId = $media->getId();

        if (isset($this->media[$mediaId])) {
            return false;
        }

        $this->media[$mediaId] = $media;

        return true;
    }

    /** @return array<int, Media> */
    public function getAll(): array
    {
        return array_values($this->media);
    }

    /** @return array<int, Media> */
    public function searchByTitle(string $query): array
    {
        $query = trim($query);

        if ($query === '') {
            return [];
        }

        return array_values(array_filter(
            $this->media,
            static fn (Media $media): bool => stripos($media->getTitle(), $query) !== false,
        ));
    }

    public function findById(int $id): ?Media
    {
        return $this->media[$id] ?? null;
    }
}
