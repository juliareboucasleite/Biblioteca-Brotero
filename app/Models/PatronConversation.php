<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

/**
 * Conversa directa 1:1 entre dois leitores (chave estável `direct_pair_key`: "minId:maxId").
 *
 * @property int $id
 * @property string $direct_pair_key
 * @property string $status
 * @property int|null $initiated_by_library_patron_id
 */
class PatronConversation extends Model
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_PENDING = 'pending';

    public const STATUS_DECLINED = 'declined';

    public static function pairKeyForPatronIds(int $a, int $b): string
    {
        return min($a, $b).':'.max($a, $b);
    }

    protected $fillable = [
        'direct_pair_key',
        'status',
        'initiated_by_library_patron_id',
    ];

    /**
     * @param  Builder<PatronConversation>  $query
     * @return Builder<PatronConversation>
     */
    public function scopeVisibleInInbox($query)
    {
        return $query->whereIn('status', [self::STATUS_ACTIVE, self::STATUS_PENDING]);
    }

    /**
     * Quem pediu conversa (inexistente em conversas antigas sem consentimento).
     *
     * @return BelongsTo<LibraryPatron, $this>
     */
    public function initiatedBy(): BelongsTo
    {
        return $this->belongsTo(LibraryPatron::class, 'initiated_by_library_patron_id');
    }

    /**
     * @return HasMany<PatronConversationMember, $this>
     */
    public function members(): HasMany
    {
        return $this->hasMany(PatronConversationMember::class, 'patron_conversation_id');
    }

    /**
     * @return HasMany<PatronConversationMessage, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(PatronConversationMessage::class, 'patron_conversation_id');
    }

    /**
     * @return HasOne<PatronConversationMessage, $this>
     */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(PatronConversationMessage::class, 'patron_conversation_id')->latestOfMany();
    }

    /**
     * Abre ou reabre conversa: fica `pending` até o outro leitor aceitar.
     * Quem chama este método deve ser o leitor que inicia o pedido ($requester).
     */
    public static function findOrCreateDirect(LibraryPatron $requester, LibraryPatron $other): self
    {
        if ($requester->is($other)) {
            throw new \InvalidArgumentException('Conversa directa requer dois leitores distintos.');
        }

        $min = min($requester->id, $other->id);
        $max = max($requester->id, $other->id);
        $pairKey = self::pairKeyForPatronIds($requester->id, $other->id);

        return DB::transaction(function () use ($requester, $min, $max, $pairKey): self {
            $conversation = static::query()->where('direct_pair_key', $pairKey)->first();

            if ($conversation === null) {
                $conversation = static::query()->create([
                    'direct_pair_key' => $pairKey,
                    'status' => self::STATUS_PENDING,
                    'initiated_by_library_patron_id' => $requester->id,
                ]);
            } elseif ($conversation->status === self::STATUS_DECLINED) {
                $conversation->update([
                    'status' => self::STATUS_PENDING,
                    'initiated_by_library_patron_id' => $requester->id,
                ]);
                $conversation->refresh();
            }

            foreach ([$min, $max] as $patronId) {
                PatronConversationMember::query()->firstOrCreate([
                    'patron_conversation_id' => $conversation->id,
                    'library_patron_id' => $patronId,
                ]);
            }

            return $conversation;
        });
    }

    public function otherPatron(LibraryPatron $viewer): ?LibraryPatron
    {
        $id = $this->members()
            ->where('library_patron_id', '!=', $viewer->id)
            ->value('library_patron_id');

        if ($id === null) {
            return null;
        }

        return LibraryPatron::query()->find($id);
    }

    public function isInitiator(LibraryPatron $patron): bool
    {
        return $this->initiated_by_library_patron_id === $patron->id;
    }

    public function canSendMessages(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function recipientMayRespond(LibraryPatron $patron): bool
    {
        if ($this->status !== self::STATUS_PENDING) {
            return false;
        }

        if ($this->initiated_by_library_patron_id === null) {
            return false;
        }

        return ! $this->isInitiator($patron);
    }

    public function initiatorMayCancel(LibraryPatron $patron): bool
    {
        return $this->status === self::STATUS_PENDING && $this->isInitiator($patron);
    }
}
