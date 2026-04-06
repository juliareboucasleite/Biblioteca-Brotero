<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\LibraryPatron;
use App\Models\PatronBlock;
use App\Models\PatronConversation;
use App\Models\PatronPeerBookShare;
use App\Models\PatronPeerReport;
use App\Support\PatronPeerAccess;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PatronPeerSafetyController extends Controller
{
    public function report(Request $request, LibraryPatron $library_patron): RedirectResponse
    {
        /** @var LibraryPatron $viewer */
        $viewer = $request->user('patron');

        if ($viewer->is($library_patron)) {
            abort(403);
        }

        if (! PatronPeerAccess::haveOpenConversationTogether($viewer, $library_patron)) {
            abort(403);
        }

        $data = $request->validate([
            'category' => [
                'required',
                'string',
                Rule::in(['spam', 'insultos_ameacas', 'conteudo_inadequado', 'outro']),
            ],
            'details' => ['nullable', 'string', 'max:2000'],
        ]);

        $conversation = PatronPeerAccess::conversationBetweenOrNull($viewer, $library_patron);

        PatronPeerReport::query()->create([
            'reporter_library_patron_id' => $viewer->id,
            'reported_library_patron_id' => $library_patron->id,
            'patron_conversation_id' => $conversation?->id,
            'category' => $data['category'],
            'details' => isset($data['details']) ? trim((string) $data['details']) : null,
        ]);

        return redirect()
            ->back()
            ->with('success', 'Denúncia enviada. A equipa irá analisar com cuidado. Obrigado por ajudar a manter a comunidade segura.');
    }

    public function block(Request $request, LibraryPatron $library_patron): RedirectResponse
    {
        /** @var LibraryPatron $viewer */
        $viewer = $request->user('patron');

        if ($viewer->is($library_patron)) {
            abort(403);
        }

        if (! PatronPeerAccess::haveOpenConversationTogether($viewer, $library_patron)) {
            abort(403);
        }

        PatronBlock::query()->firstOrCreate([
            'blocker_library_patron_id' => $viewer->id,
            'blocked_library_patron_id' => $library_patron->id,
        ]);

        $pairKey = PatronConversation::pairKeyForPatronIds($viewer->id, $library_patron->id);
        $conversation = PatronConversation::query()->where('direct_pair_key', $pairKey)->first();

        if ($conversation !== null) {
            $conversation->messages()->delete();
            PatronPeerBookShare::query()->forPatronPair($viewer->id, $library_patron->id)->delete();
            $conversation->update(['status' => PatronConversation::STATUS_DECLINED]);
            $conversation->touch();
        }

        return redirect()
            ->route('biblioteca.conta.mensagens.index')
            ->with('success', 'Utilizador bloqueado. Deixará de ver conversas e pedidos dessa pessoa.');
    }
}
