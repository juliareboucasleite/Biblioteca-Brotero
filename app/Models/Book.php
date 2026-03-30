<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Book extends Model
{
    protected $fillable = [
        'title',
        'description',
        'isbn',
        'published_year',
        'pages',
        'cover_image',
        'language',
    ];

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
