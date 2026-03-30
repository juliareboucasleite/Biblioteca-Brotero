<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GoogleBooksService
{
    public function getByIsbn($isbn): ?array
    {
        $digits = $this->normalizeIsbnDigits((string) $isbn);

        foreach ($this->isbnQueryVariants((string) $isbn) as $variant) {
            $response = Http::get('https://www.googleapis.com/books/v1/volumes', [
                'q' => 'isbn:'.$variant,
                'maxResults' => 5,
            ]);
            $parsed = $this->parseGoogleResponse($response, true, $digits !== '' ? $digits : null);
            if ($parsed !== null) {
                return $parsed;
            }
        }

        return null;
    }

    /**
     * @return list<string>
     */
    private function isbnQueryVariants(string $isbn): array
    {
        $trimmed = trim($isbn);
        $digits = preg_replace('/[^0-9X]/i', '', $trimmed) ?? '';

        return array_values(array_unique(array_filter([$trimmed, $digits])));
    }

    private function normalizeIsbnDigits(string $raw): string
    {
        return preg_replace('/[^0-9X]/i', '', $raw) ?? '';
    }

    public function getByQuery(string $query, int $maxResults = 1, bool $preferDescriptionWithoutAsciiQuestionMark = false, ?string $restrictToIsbnDigits = null): ?array
    {
        $maxResults = max(1, min(40, $maxResults));
        $response = Http::get('https://www.googleapis.com/books/v1/volumes', [
            'q' => $query,
            'maxResults' => $maxResults,
        ]);

        $digits = $restrictToIsbnDigits !== null && $restrictToIsbnDigits !== ''
            ? $this->normalizeIsbnDigits($restrictToIsbnDigits)
            : null;

        return $this->parseGoogleResponse($response, $preferDescriptionWithoutAsciiQuestionMark, $digits);
    }

    /**
     * Se a resposta por ISBN não trouxer sinopse legível, tenta uma pesquisa por título (só volumes com o mesmo ISBN, se conhecido).
     */
    public function fillMissingDescription(?array $data, string $title, ?string $rawIsbn = null): ?array
    {
        if ($data === null || trim($title) === '') {
            return $data;
        }

        $desc = $data['description'] ?? null;
        if (is_string($desc) && trim($desc) !== '' && ! str_contains($desc, '?')) {
            return $data;
        }

        $isbnDigits = $rawIsbn !== null && $rawIsbn !== '' ? $this->normalizeIsbnDigits($rawIsbn) : '';
        $alt = $this->getByQuery('intitle:'.trim($title), 15, true, $isbnDigits !== '' ? $isbnDigits : null);
        if ($alt !== null && is_string($alt['description'] ?? null) && trim((string) $alt['description']) !== '' && ! str_contains((string) $alt['description'], '?')) {
            $data['description'] = $alt['description'];
        }

        return $data;
    }

    /**
     * @param  Response  $response
     */
    private function parseGoogleResponse($response, bool $preferDescriptionWithoutAsciiQuestionMark = false, ?string $restrictToIsbnDigits = null): ?array
    {
        if (! $response->successful()) {
            return null;
        }

        /** @var array<string, mixed>|null $data */
        $data = $response->json();

        if (empty($data['items']) || ! is_array($data['items'])) {
            return null;
        }

        /** @var list<array<string, mixed>> $items */
        $items = $data['items'];

        $filtered = $this->filterItemsByIsbn($items, $restrictToIsbnDigits);
        if ($filtered === []) {
            $filtered = $items;
        }

        $candidates = [];
        foreach ($filtered as $item) {
            if (! is_array($item)) {
                continue;
            }
            $row = $this->volumeItemToArray($item);
            if ($row !== null) {
                $candidates[] = $row;
            }
        }

        if ($candidates === []) {
            return null;
        }

        if ($preferDescriptionWithoutAsciiQuestionMark) {
            foreach ($candidates as $row) {
                $d = $row['description'] ?? null;
                if (is_string($d) && trim($d) !== '' && ! str_contains($d, '?')) {
                    return $row;
                }
            }
        }

        return $candidates[0];
    }

    /**
     * @param  list<array<string, mixed>>  $items
     * @return list<array<string, mixed>>
     */
    private function filterItemsByIsbn(array $items, ?string $restrictToIsbnDigits): array
    {
        if ($restrictToIsbnDigits === null || $restrictToIsbnDigits === '') {
            return $items;
        }

        $digits = $this->normalizeIsbnDigits($restrictToIsbnDigits);
        if ($digits === '') {
            return $items;
        }

        $out = [];
        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }
            if ($this->volumeMatchesIsbnDigitsJson($item, $digits)) {
                $out[] = $item;
            }
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function volumeMatchesIsbnDigitsJson(array $item, string $digits): bool
    {
        $ids = $item['volumeInfo']['industryIdentifiers'] ?? [];
        if (! is_array($ids)) {
            return false;
        }

        foreach ($ids as $id) {
            if (! is_array($id)) {
                continue;
            }
            $identifier = isset($id['identifier']) ? (string) $id['identifier'] : '';
            $norm = $this->normalizeIsbnDigits($identifier);
            if ($norm === '') {
                continue;
            }
            if ($norm === $digits) {
                return true;
            }
            if (strlen($norm) === 10 && strlen($digits) === 13 && str_ends_with($digits, $norm)) {
                return true;
            }
            if (strlen($norm) === 13 && strlen($digits) === 10 && str_ends_with($norm, $digits)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function volumeItemToArray(array $item): ?array
    {
        if (empty($item['volumeInfo']) || ! is_array($item['volumeInfo'])) {
            return null;
        }

        /** @var array<string, mixed> $book */
        $book = $item['volumeInfo'];

        $description = $book['description'] ?? null;
        if (! is_string($description) || trim($description) === '') {
            $description = null;
        }

        $imageLinks = $book['imageLinks'] ?? [];
        $cover =
            $imageLinks['thumbnail'] ??
            $imageLinks['smallThumbnail'] ??
            $imageLinks['large'] ??
            $imageLinks['medium'] ??
            null;

        if (is_string($cover)) {
            $cover = preg_replace('/^http:\/\//i', 'https://', $cover) ?? $cover;
        }

        return [
            'title' => $book['title'] ?? null,
            'description' => $description,
            'authors' => $book['authors'] ?? [],
            'categories' => $book['categories'] ?? [],
            'publisher' => $book['publisher'] ?? null,
            'cover' => $cover,
            'published_year' => substr((string) ($book['publishedDate'] ?? ''), 0, 4),
            'pages' => $book['pageCount'] ?? null,
            'language' => $book['language'] ?? null,
        ];
    }
}
