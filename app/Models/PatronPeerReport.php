<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Denúncia de comportamento entre leitores (revisão manual pela equipa).
 *
 * @property int $id
 * @property int $reporter_library_patron_id
 * @property int $reported_library_patron_id
 * @property int|null $patron_conversation_id
 * @property string $category
 * @property string|null $details
 */
class PatronPeerReport extends Model
{
    protected $fillable = [
        'reporter_library_patron_id',
        'reported_library_patron_id',
        'patron_conversation_id',
        'category',
        'details',
    ];

    /**
     * @return BelongsTo<LibraryPatron, $this>
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(LibraryPatron::class, 'reporter_library_patron_id');
    }

    /**
     * @return BelongsTo<LibraryPatron, $this>
     */
    public function reported(): BelongsTo
    {
        return $this->belongsTo(LibraryPatron::class, 'reported_library_patron_id');
    }

    /**
     * @return BelongsTo<PatronConversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(PatronConversation::class, 'patron_conversation_id');
    }
}
