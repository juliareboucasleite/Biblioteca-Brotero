<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    /** @var list<string> */
    protected $hidden = [
        'ebook_path',
        'ebook_disk',
    ];

    protected $fillable = [
        'title',
        'description',
        'isbn',
        'published_year',
        'pages',
        'cover_image',
        'language',
        'ebook_disk',
        'ebook_path',
        'ebook_mime',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ebook_downloads_count' => 'integer',
        ];
    }

    public function hasEbook(): bool
    {
        $path = $this->ebook_path;

        return is_string($path) && $path !== '';
    }

    public function ebookFormat(): ?string
    {
        if (! $this->hasEbook()) {
            return null;
        }

        $mime = (string) ($this->ebook_mime ?? '');

        return match ($mime) {
            'application/pdf', 'application/x-pdf' => 'pdf',
            'application/epub+zip', 'application/epub', 'application/x-epub+zip' => 'epub',
            default => null,
        };
    }

    /**
     * PDF ou EPUB no armazenamento (mesmo critério que {@see ebookFormat()}).
     *
     * @param  Builder<Book>  $query
     */
    public function scopeWithReadableEbookFile(Builder $query): Builder
    {
        return $query->whereNotNull('ebook_path')
            ->where('ebook_path', '!=', '')
            ->whereIn('ebook_mime', [
                'application/pdf',
                'application/x-pdf',
                'application/epub+zip',
                'application/epub',
                'application/x-epub+zip',
            ]);
    }

    /**
     * Filtro do catálogo: categoria normal, ou «E-books» (id em config / slug e-books) por ficheiro digital.
     *
     * @param  Builder<Book>  $query
     */
    public function scopeForCatalogCategory(Builder $query, string $categoryId): Builder
    {
        if (self::categoryIdIsEbooksListing($categoryId)) {
            return $query->withReadableEbookFile();
        }

        if (self::categoryIdIsRecentBooksListing($categoryId)) {
            return $query;
        }

        return $query->whereHas('categories', function ($q2) use ($categoryId): void {
            $q2->whereKey($categoryId);
        });
    }

    /**
     * Categoria «E-books» do carrossel: lista por ficheiro, não só por etiqueta.
     */
    public static function categoryIdIsEbooksListing(string $categoryId): bool
    {
        $configured = (int) config('biblioteca_canonical_categories.ebooks_category_id', 64);
        if ($configured > 0 && ctype_digit($categoryId) && (int) $categoryId === $configured) {
            return true;
        }

        $cat = Category::query()->find($categoryId);

        return $cat !== null && $cat->slug === 'e-books';
    }

    /**
     * Categoria «Livros novos»: listagem por data de entrada no catálogo (não só pivot).
     */
    public static function categoryIdIsRecentBooksListing(string $categoryId): bool
    {
        $configured = (int) config('biblioteca_canonical_categories.recent_books_category_id', 0);
        if ($configured > 0 && ctype_digit($categoryId) && (int) $categoryId === $configured) {
            return true;
        }

        $cat = Category::query()->find($categoryId);

        return $cat !== null && $cat->slug === 'livros-novos';
    }

    public function authors()
    {
        return $this->belongsToMany(Author::class, 'book_author');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'book_category');
    }

    public function details()
    {
        return $this->hasOne(BookDetail::class);
    }

    public function bookRequests()
    {
        return $this->hasMany(BookRequest::class);
    }

    /**
     * @return HasMany<BookShare, $this>
     */
    public function bookShares(): HasMany
    {
        return $this->hasMany(BookShare::class);
    }

    /**
     * @return BelongsToMany<LibraryPatron, $this>
     */
    public function favoritedByPatrons()
    {
        return $this->belongsToMany(LibraryPatron::class, 'book_favorites', 'book_id', 'library_patron_id')
            ->withTimestamps();
    }

    /**
     * Indica se o exemplar está livre para nova requisição (sem empréstimo ativo).
     */
    public function isAvailableForRequest(): bool
    {
        return ! $this->bookRequests()
            ->whereIn('status', ['pending', 'created'])
            ->whereNull('returned_at')
            ->exists();
    }
}
