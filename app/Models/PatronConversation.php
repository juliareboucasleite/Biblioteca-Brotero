<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

/**
 * Conversa directa 1:1 entre dois leitores (chave estável `direct_pair_key`: "minId:maxId").
 *
 * @property int $id
 * @property string $direct_pair_key
 */
class PatronConversation extends Model
{
    protected $fillable = [
        'direct_pair_key',
    ];

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

    public static function findOrCreateDirect(LibraryPatron $a, LibraryPatron $b): self
    {
        if ($a->is($b)) {
            throw new \InvalidArgumentException('Conversa directa requer dois leitores distintos.');
        }

        $min = min($a->id, $b->id);
        $max = max($a->id, $b->id);
        $pairKey = $min.':'.$max;

        return DB::transaction(function () use ($min, $max, $pairKey): self {
            $conversation = static::query()->firstOrCreate(
                ['direct_pair_key' => $pairKey],
            );

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
}
