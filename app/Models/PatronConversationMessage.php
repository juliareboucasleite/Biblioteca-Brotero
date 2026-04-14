<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $patron_conversation_id
 * @property int $library_patron_id
 * @property string $body
 */
class PatronConversationMessage extends Model
{
    protected $fillable = [
        'patron_conversation_id',
        'library_patron_id',
        'body',
    ];

    protected function casts(): array
    {
        return [
            'body' => 'encrypted',
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
    public function sender(): BelongsTo
    {
        return $this->belongsTo(LibraryPatron::class, 'library_patron_id');
    }
}
