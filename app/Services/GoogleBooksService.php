<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GoogleBooksService
{
    public function getByIsbn($isbn)
    {
        $response = Http::get("https://www.googleapis.com/books/v1/volumes", [
            'q' => 'isbn:' . $isbn
        ]);

        return $this->parseGoogleResponse($response);
    }

    public function getByQuery(string $query): ?array
    {
        $response = Http::get("https://www.googleapis.com/books/v1/volumes", [
            'q' => $query,
            'maxResults' => 1,
        ]);

        return $this->parseGoogleResponse($response);
    }

    private function parseGoogleResponse($response): ?array
    {
        if (!$response->successful()) {
            return null;
        }

        $data = $response->json();

        if (empty($data['items'][0]['volumeInfo'])) {
            return null;
        }

        $book = $data['items'][0]['volumeInfo'];

        $imageLinks = $book['imageLinks'] ?? [];
        $cover =
            $imageLinks['thumbnail'] ??
            $imageLinks['smallThumbnail'] ??
            $imageLinks['large'] ??
            $imageLinks['medium'] ??
            null;

        if (is_string($cover)) {
            // Evita mixed content quando a app estiver em https.
            $cover = preg_replace('/^http:\/\//i', 'https://', $cover) ?? $cover;
        }

        return [
            'title' => $book['title'] ?? null,
            'description' => $book['description'] ?? null,
            'authors' => $book['authors'] ?? [],
            'categories' => $book['categories'] ?? [],
            'publisher' => $book['publisher'] ?? null,
            'cover' => $cover,
            'published_year' => substr($book['publishedDate'] ?? '', 0, 4),
            'pages' => $book['pageCount'] ?? null,
            'language' => $book['language'] ?? null,
        ];
    }
}