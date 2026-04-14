<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PatronReadingList extends Model
{
    public const TYPE_CUSTOM = 'custom';
    public const TYPE_READ_LATER = 'read_later';
    public const TYPE_READING_NOW = 'reading_now';
    public const TYPE_CLASSROOM = 'classroom';

    protected $fillable = [
        'library_patron_id',
        'name',
        'type',
        'visibility',
        'classroom',
        'theme',
        'share_code',
        'share_token',
        'reserved_copies',
        'reserved_for_date',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reserved_copies' => 'integer',
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
     * @return BelongsToMany<Book, $this>
     */
    public function books(): BelongsToMany
    {
        return $this->belongsToMany(Book::class, 'patron_reading_list_books', 'patron_reading_list_id', 'book_id')
            ->withPivot(['progress_percent', 'current_page', 'reading_status', 'started_at', 'finished_at'])
            ->withTimestamps();
    }
}
