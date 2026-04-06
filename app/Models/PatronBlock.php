<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Bloqueio unilateral: quem bloqueia deixa de ver / contactar o outro (e vice-versa na UI).
 *
 * @property int $id
 * @property int $blocker_library_patron_id
 * @property int $blocked_library_patron_id
 */
class PatronBlock extends Model
{
    protected $fillable = [
        'blocker_library_patron_id',
        'blocked_library_patron_id',
    ];

    /**
     * @return BelongsTo<LibraryPatron, $this>
     */
    public function blocker(): BelongsTo
    {
        return $this->belongsTo(LibraryPatron::class, 'blocker_library_patron_id');
    }

    /**
     * @return BelongsTo<LibraryPatron, $this>
     */
    public function blocked(): BelongsTo
    {
        return $this->belongsTo(LibraryPatron::class, 'blocked_library_patron_id');
    }

    /**
     * Leitores com quem $viewer não pode interagir (bloqueou ou foi bloqueado).
     *
     * @return list<int>
     */
    public static function blockedPatronIdsFor(LibraryPatron $viewer): array
    {
        $out = self::query()
            ->where('blocker_library_patron_id', $viewer->id)
            ->pluck('blocked_library_patron_id');

        $in = self::query()
            ->where('blocked_library_patron_id', $viewer->id)
            ->pluck('blocker_library_patron_id');

        return $out->merge($in)->unique()->values()->all();
    }

    public static function interactionBlocked(LibraryPatron $a, LibraryPatron $b): bool
    {
        if ($a->is($b)) {
            return false;
        }

        return self::query()
            ->where(function ($q) use ($a, $b): void {
                $q->where('blocker_library_patron_id', $a->id)
                    ->where('blocked_library_patron_id', $b->id);
            })
            ->orWhere(function ($q) use ($a, $b): void {
                $q->where('blocker_library_patron_id', $b->id)
                    ->where('blocked_library_patron_id', $a->id);
            })
            ->exists();
    }
}
