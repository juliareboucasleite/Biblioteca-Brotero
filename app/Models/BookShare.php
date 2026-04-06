<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Recomendação pública de um leitor sobre um livro do catálogo.
 *
 * @property int $id
 * @property int $library_patron_id
 * @property int $book_id
 * @property string|null $message
 */
class BookShare extends Model
{
    protected $fillable = [
        'library_patron_id',
        'book_id',
        'message',
    ];

    /**
     * @return BelongsTo<LibraryPatron, $this>
     */
    public function libraryPatron(): BelongsTo
    {
        return $this->belongsTo(LibraryPatron::class, 'library_patron_id');
    }

    /**
     * @return BelongsTo<Book, $this>
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
