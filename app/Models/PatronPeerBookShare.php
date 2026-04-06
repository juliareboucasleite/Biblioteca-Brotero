<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Sugestão de livro do catálogo entre dois leitores com conversa aceite.
 *
 * @property int $id
 * @property int $from_library_patron_id
 * @property int $to_library_patron_id
 * @property int $book_id
 * @property string|null $note
 */
class PatronPeerBookShare extends Model
{
    protected $fillable = [
        'from_library_patron_id',
        'to_library_patron_id',
        'book_id',
        'note',
    ];

    /**
     * @return BelongsTo<LibraryPatron, $this>
     */
    public function fromPatron(): BelongsTo
    {
        return $this->belongsTo(LibraryPatron::class, 'from_library_patron_id');
    }

    /**
     * @return BelongsTo<LibraryPatron, $this>
     */
    public function toPatron(): BelongsTo
    {
        return $this->belongsTo(LibraryPatron::class, 'to_library_patron_id');
    }

    /**
     * @return BelongsTo<Book, $this>
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'book_id');
    }

    /**
     * Partilhas entre o par de leitores (qualquer sentido).
     *
     * @param  Builder<PatronPeerBookShare>  $query
     * @return Builder<PatronPeerBookShare>
     */
    public function scopeForPatronPair($query, int $a, int $b)
    {
        return $query->where(function ($q) use ($a, $b): void {
            $q->where(function ($q2) use ($a, $b): void {
                $q2->where('from_library_patron_id', $a)->where('to_library_patron_id', $b);
            })->orWhere(function ($q2) use ($a, $b): void {
                $q2->where('from_library_patron_id', $b)->where('to_library_patron_id', $a);
            });
        });
    }
}
