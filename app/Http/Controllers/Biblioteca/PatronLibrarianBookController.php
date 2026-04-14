<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Services\GoogleBooksService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PatronLibrarianBookController extends Controller
{
    public function importPage(): Response
    {
        return Inertia::render('biblioteca/conta/livro-import');
    }

    public function importBatch(Request $request, GoogleBooksService $googleBooks): RedirectResponse
    {
        $data = $request->validate([
            'isbns_text' => ['nullable', 'string', 'max:10000'],
            'csv_file' => ['nullable', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $raw = (string) ($data['isbns_text'] ?? '');
        if ($request->hasFile('csv_file')) {
            $raw .= "\n".(string) file_get_contents((string) $request->file('csv_file')?->getRealPath());
        }

        $isbns = collect(preg_split('/[\s,;|]+/u', $raw, -1, PREG_SPLIT_NO_EMPTY))
            ->map(static fn ($v): string => preg_replace('/[^0-9Xx]/', '', (string) $v) ?? '')
            ->filter(static fn ($v): bool => $v !== '')
            ->unique()
            ->values();

        if ($isbns->isEmpty()) {
            return back()->with('error', 'Nenhum ISBN válido encontrado para importação.');
        }

        $created = 0;
        $updated = 0;
        $failed = 0;

        foreach ($isbns as $isbn) {
            $payload = $googleBooks->getByIsbn($isbn);
            if (! is_array($payload) || empty($payload['title'])) {
                $failed++;
                continue;
            }

            $book = Book::query()->where('isbn', $isbn)->first();
            if ($book === null) {
                $book = Book::query()->create([
                    'title' => (string) $payload['title'],
                    'description' => $payload['description'] ?? null,
                    'isbn' => $isbn,
                    'published_year' => $payload['published_year'] ?? null,
                    'pages' => $payload['pages'] ?? null,
                    'cover_image' => $payload['cover'] ?? null,
                    'language' => $payload['language'] ?? null,
                ]);
                $created++;
            } else {
                $book->fill([
                    'title' => $book->title ?: ($payload['title'] ?? null),
                    'description' => $book->description ?: ($payload['description'] ?? null),
                    'cover_image' => $book->cover_image ?: ($payload['cover'] ?? null),
                    'language' => $book->language ?: ($payload['language'] ?? null),
                ])->save();
                $updated++;
            }
        }

        return back()->with('success', "Importação concluída. Criados: {$created}, atualizados: {$updated}, falhas: {$failed}.");
    }

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
            'school_subject' => trim((string) $request->input('school_subject', '')) !== '' ? trim((string) $request->input('school_subject')) : null,
            'school_year' => trim((string) $request->input('school_year', '')) !== '' ? trim((string) $request->input('school_year')) : null,
        ]);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:65535'],
            'isbn' => ['nullable', 'string', 'max:128', Rule::unique('books', 'isbn')],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:2100'],
            'pages' => ['nullable', 'integer', 'min:1', 'max:50000'],
            'language' => ['nullable', 'string', 'max:32'],
            'publisher' => ['nullable', 'string', 'max:255'],
            'school_subject' => ['nullable', 'string', 'max:120'],
            'school_year' => ['nullable', Rule::in(['10', '11', '12'])],
            'target_age_min' => ['nullable', 'integer', 'min:3', 'max:25'],
            'target_age_max' => ['nullable', 'integer', 'min:3', 'max:25'],
            'authors_input' => ['nullable', 'string', 'max:2000'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', Rule::exists('categories', 'id')],
            'cover' => ['nullable', 'image', 'max:5120'],
            'ebook' => ['nullable', 'file', 'max:51200', 'mimes:pdf,epub'],
        ]);

        $coverUrl = null;
        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('book-covers', 'public');
            $coverUrl = Storage::url($path);
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
                'school_subject' => $data['school_subject'] ?? null,
                'school_year' => $data['school_year'] ?? null,
                'target_age_min' => $data['target_age_min'] ?? null,
                'target_age_max' => $data['target_age_max'] ?? null,
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
                'school_subject' => $book->school_subject ?? '',
                'school_year' => $book->school_year ?? '',
                'target_age_min' => $book->target_age_min !== null ? (string) $book->target_age_min : '',
                'target_age_max' => $book->target_age_max !== null ? (string) $book->target_age_max : '',
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
            'school_subject' => trim((string) $request->input('school_subject', '')) !== '' ? trim((string) $request->input('school_subject')) : null,
            'school_year' => trim((string) $request->input('school_year', '')) !== '' ? trim((string) $request->input('school_year')) : null,
        ]);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:65535'],
            'isbn' => ['nullable', 'string', 'max:128', Rule::unique('books', 'isbn')->ignore($book->id)],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:2100'],
            'pages' => ['nullable', 'integer', 'min:1', 'max:50000'],
            'language' => ['nullable', 'string', 'max:32'],
            'publisher' => ['nullable', 'string', 'max:255'],
            'school_subject' => ['nullable', 'string', 'max:120'],
            'school_year' => ['nullable', Rule::in(['10', '11', '12'])],
            'target_age_min' => ['nullable', 'integer', 'min:3', 'max:25'],
            'target_age_max' => ['nullable', 'integer', 'min:3', 'max:25'],
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
                'school_subject' => $data['school_subject'] ?? null,
                'school_year' => $data['school_year'] ?? null,
                'target_age_min' => $data['target_age_min'] ?? null,
                'target_age_max' => $data['target_age_max'] ?? null,
            ];

            if ($request->hasFile('cover')) {
                $path = $request->file('cover')->store('book-covers', 'public');
                $attrs['cover_image'] = Storage::url($path);
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
