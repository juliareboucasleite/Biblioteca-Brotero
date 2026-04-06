<?php

namespace App\Models;

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
