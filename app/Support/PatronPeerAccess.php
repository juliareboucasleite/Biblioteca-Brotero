<?php

namespace App\Support;

use App\Models\LibraryPatron;
use App\Models\PatronConversation;

final class PatronPeerAccess
{
    /** Há conversa pendente ou activa entre os dois (membros da mesma conversa). */
    public static function haveOpenConversationTogether(LibraryPatron $viewer, LibraryPatron $peer): bool
    {
        if ($viewer->is($peer)) {
            return false;
        }

        return PatronConversation::query()
            ->whereIn('status', [PatronConversation::STATUS_ACTIVE, PatronConversation::STATUS_PENDING])
            ->whereHas('members', static fn ($q) => $q->where('library_patron_id', $viewer->id))
            ->whereHas('members', static fn ($q) => $q->where('library_patron_id', $peer->id))
            ->exists();
    }

    /** Conversa aceite: podem partilhar livros e ver perfil resumido. */
    public static function haveActiveConversationTogether(LibraryPatron $viewer, LibraryPatron $peer): bool
    {
        if ($viewer->is($peer)) {
            return false;
        }

        return PatronConversation::query()
            ->where('status', PatronConversation::STATUS_ACTIVE)
            ->whereHas('members', static fn ($q) => $q->where('library_patron_id', $viewer->id))
            ->whereHas('members', static fn ($q) => $q->where('library_patron_id', $peer->id))
            ->exists();
    }

    public static function conversationBetweenOrNull(LibraryPatron $a, LibraryPatron $b): ?PatronConversation
    {
        if ($a->is($b)) {
            return null;
        }

        $pairKey = PatronConversation::pairKeyForPatronIds($a->id, $b->id);

        return PatronConversation::query()->where('direct_pair_key', $pairKey)->first();
    }
}
