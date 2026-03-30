<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Requisição de livro.
 *
 * status: pending | created | rejected | expired | returned | cancelled
 *
 * @property string|null $patron_visible_note Nota da biblioteca visível ao aluno (balcão)
 */
class BookRequest extends Model
{
    protected $fillable = [
        'book_id',
        'request_type',
        'book_title',
        'isbn',
        'card_number',
        'school_location',
        'cacifo_code',
        'pickup_deadline',
        'return_deadline',
        'status',
        'staff_rejection_reason',
        'patron_visible_note',
        'staff_reviewed_at',
        'returned_at',
        'fine_amount',
        'fine_applied_at',
        'notified_due_soon_at',
        'notified_overdue_at',
        'notified_available_at',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'pickup_deadline' => 'datetime',
            'return_deadline' => 'datetime',
            'staff_reviewed_at' => 'datetime',
            'returned_at' => 'datetime',
            'fine_applied_at' => 'datetime',
            'fine_amount' => 'decimal:2',
            'notified_due_soon_at' => 'datetime',
            'notified_overdue_at' => 'datetime',
            'notified_available_at' => 'datetime',
        ];
    }
}
