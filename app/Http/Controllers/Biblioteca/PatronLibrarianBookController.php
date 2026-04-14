<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PatronLibrarianBookController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('biblioteca/conta/livro-novo', [
            'availableCategories' => Category::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get()
                ->map(fn (Category $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $publishedRaw = $request->input('published_year');
        $pagesRaw = $request->input('pages');

        $request->merge([
            'isbn' => trim((string) $request->input('isbn', '')) !== '' ? trim((string) $request->input('isbn')) : null,
            'published_year' => $publishedRaw === '' || $publishedRaw === null ? null : (int) $publishedRaw,
            'pages' => $pagesRaw === '' || $pagesRaw === null ? null : (int) $pagesRaw,
            'language' => trim((string) $request->input('language', '')) !== '' ? trim((string) $request->input('language')) : null,
        ]);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:65535'],
            'isbn' => ['nullable', 'string', 'max:128', Rule::unique('books', 'isbn')],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:2100'],
            'pages' => ['nullable', 'integer', 'min:1', 'max:50000'],
            'language' => ['nullable', 'string', 'max:32'],
            'publisher' => ['nullable', 'string', 'max:255'],
            'authors_input' => ['nullable', 'string', 'max:2000'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', Rule::exists('categories', 'id')],
            'cover' => ['nullable', 'image', 'max:5120'],
            'ebook' => ['nullable', 'file', 'max:51200', 'mimes:pdf,epub'],
        ]);

        $coverUrl = null;
        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('book-covers', 'public');
            $coverUrl = Storage::disk('public')->url($path);
        }

        $authors = $this->splitNames($data['authors_input'] ?? null);
        $categoryIds = collect($data['category_ids'] ?? [])
            ->map(fn (mixed $id): int => (int) $id)
            ->unique()
            ->values()
            ->all();

        $book = DB::transaction(function () use ($data, $coverUrl, $authors, $categoryIds): Book {
            $book = Book::query()->create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'isbn' => $data['isbn'] ?? null,
                'published_year' => $data['published_year'] ?? null,
                'pages' => $data['pages'] ?? null,
                'language' => $data['language'] ?? null,
                'cover_image' => $coverUrl,
            ]);

            foreach ($authors as $name) {
                $author = Author::query()->firstOrCreate(['name' => $name]);
                $book->authors()->syncWithoutDetaching([$author->id]);
            }

            if ($categoryIds !== []) {
                $book->categories()->syncWithoutDetaching($categoryIds);
            }

            if (! empty($data['publisher'])) {
                $book->details()->create([
                    'publisher' => $data['publisher'],
                ]);
            }

            return $book;
        });

        if ($request->hasFile('ebook')) {
            $this->attachEbook($request, $book);
        }

        return redirect()
            ->route('biblioteca.livro.show', $book)
            ->with('success', 'Livro adicionado ao catálogo.');
    }

    public function edit(Book $book): Response
    {
        $book->load(['authors', 'categories', 'details']);

        return Inertia::render('biblioteca/conta/livro-edit', [
            'book' => [
                'id' => $book->id,
                'title' => $book->title,
                'description' => $book->description ?? '',
                'isbn' => $book->isbn ?? '',
                'published_year' => $book->published_year !== null ? (string) $book->published_year : '',
                'pages' => $book->pages !== null ? (string) $book->pages : '',
                'language' => $book->language ?? 'pt',
                'publisher' => $book->details?->publisher ?? '',
                'authors_input' => $book->authors->pluck('name')->implode("\n"),
                'categories_input' => $book->categories->pluck('name')->implode(', '),
                'cover_image' => $book->cover_image,
                'has_ebook' => $book->hasEbook() && $book->ebookFormat() !== null,
            ],
        ]);
    }

    public function update(Request $request, Book $book): RedirectResponse
    {
        $publishedRaw = $request->input('published_year');
        $pagesRaw = $request->input('pages');

        $request->merge([
            'isbn' => trim((string) $request->input('isbn', '')) !== '' ? trim((string) $request->input('isbn')) : null,
            'published_year' => $publishedRaw === '' || $publishedRaw === null ? null : (int) $publishedRaw,
            'pages' => $pagesRaw === '' || $pagesRaw === null ? null : (int) $pagesRaw,
            'language' => trim((string) $request->input('language', '')) !== '' ? trim((string) $request->input('language')) : null,
        ]);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:65535'],
            'isbn' => ['nullable', 'string', 'max:128', Rule::unique('books', 'isbn')->ignore($book->id)],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:2100'],
            'pages' => ['nullable', 'integer', 'min:1', 'max:50000'],
            'language' => ['nullable', 'string', 'max:32'],
            'publisher' => ['nullable', 'string', 'max:255'],
            'authors_input' => ['nullable', 'string', 'max:2000'],
            'categories_input' => ['nullable', 'string', 'max:2000'],
            'cover' => ['nullable', 'image', 'max:5120'],
            'ebook' => ['nullable', 'file', 'max:51200', 'mimes:pdf,epub'],
            'remove_ebook' => ['nullable', 'boolean'],
        ]);

        $authors = $this->splitNames($data['authors_input'] ?? null);
        $categories = $this->splitNames($data['categories_input'] ?? null);

        DB::transaction(function () use ($request, $book, $data, $authors, $categories): void {
            $attrs = [
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'isbn' => $data['isbn'] ?? null,
                'published_year' => $data['published_year'] ?? null,
                'pages' => $data['pages'] ?? null,
                'language' => $data['language'] ?? null,
            ];

            if ($request->hasFile('cover')) {
                $path = $request->file('cover')->store('book-covers', 'public');
                $attrs['cover_image'] = Storage::disk('public')->url($path);
            }

            $book->update($attrs);

            $authorIds = [];
            foreach ($authors as $name) {
                $author = Author::query()->firstOrCreate(['name' => $name]);
                $authorIds[] = $author->id;
            }
            $book->authors()->sync($authorIds);

            $categoryIds = [];
            foreach ($categories as $name) {
                $category = Category::query()->firstOrCreate(['name' => $name]);
                $categoryIds[] = $category->id;
            }
            $book->categories()->sync($categoryIds);

            if (! empty($data['publisher'])) {
                $book->details()->updateOrCreate(
                    ['book_id' => $book->id],
                    ['publisher' => $data['publisher']],
                );
            } else {
                $book->details()->update(['publisher' => null]);
            }

            if ($request->boolean('remove_ebook')) {
                $this->deleteStoredEbook($book);
                $book->forceFill([
                    'ebook_disk' => null,
                    'ebook_path' => null,
                    'ebook_mime' => null,
                ])->save();
            } elseif ($request->hasFile('ebook')) {
                $this->attachEbook($request, $book);
            }
        });

        return redirect()
            ->route('biblioteca.livro.show', $book)
            ->with('success', 'Ficha do livro actualizada.');
    }

    private function attachEbook(Request $request, Book $book): void
    {
        $file = $request->file('ebook');

        if ($file === null || ! $file->isValid()) {
            return;
        }

        $this->deleteStoredEbook($book);

        $path = $file->store('ebooks', 'local');
        $mime = $file->getClientMimeType() ?: $file->getMimeType() ?: 'application/octet-stream';

        $book->forceFill([
            'ebook_disk' => 'local',
            'ebook_path' => $path,
            'ebook_mime' => $mime,
        ])->save();
    }

    private function deleteStoredEbook(Book $book): void
    {
        if (! $book->hasEbook()) {
            return;
        }

        $disk = Storage::disk($book->ebook_disk ?: 'local');
        $path = (string) $book->ebook_path;

        if ($path !== '' && $disk->exists($path)) {
            $disk->delete($path);
        }
    }

    /**
     * @return list<string>
     */
    private function splitNames(?string $raw): array
    {
        if ($raw === null || trim($raw) === '') {
            return [];
        }

        $parts = preg_split('/[\n,;|]+/u', $raw, -1, PREG_SPLIT_NO_EMPTY);
        $out = [];

        foreach ($parts as $p) {
            $t = trim((string) $p);
            if ($t !== '') {
                $out[] = $t;
            }
        }

        return array_values(array_unique($out));
    }
}
