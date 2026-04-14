<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherBookReservation extends Model
{
    protected $fillable = [
        'library_patron_id',
        'book_id',
        'classroom',
        'theme',
        'copies',
        'reserved_for_date',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'copies' => 'integer',
            'reserved_for_date' => 'date',
        ];
    }

    /**
     * @return BelongsTo<LibraryPatron, $this>
     */
    public function patron(): BelongsTo
    {
        return $this->belongsTo(LibraryPatron::class, 'library_patron_id');
    }

    /**
     * @return BelongsTo<Book, $this>
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'book_id');
    }
}
