<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $patron_conversation_id
 * @property int $library_patron_id
 * @property Carbon|null $last_read_at
 */
class PatronConversationMember extends Model
{
    protected $fillable = [
        'patron_conversation_id',
        'library_patron_id',
        'last_read_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_read_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<PatronConversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(PatronConversation::class, 'patron_conversation_id');
    }

    /**
     * @return BelongsTo<LibraryPatron, $this>
     */
    public function libraryPatron(): BelongsTo
    {
        return $this->belongsTo(LibraryPatron::class, 'library_patron_id');
    }
}
