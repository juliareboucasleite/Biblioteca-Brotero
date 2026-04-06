<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\LibraryPatron;
use App\Models\PatronBlock;
use App\Support\PatronLabel;
use App\Support\PatronPeerAccess;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatronPeerProfileController extends Controller
{
    public function show(Request $request, LibraryPatron $library_patron): Response
    {
        /** @var LibraryPatron $viewer */
        $viewer = $request->user('patron');

        if ($viewer->is($library_patron)) {
            abort(404);
        }

        if (PatronBlock::interactionBlocked($viewer, $library_patron)) {
            abort(403);
        }

        if (! PatronPeerAccess::haveActiveConversationTogether($viewer, $library_patron)) {
            abort(403);
        }

        $card = (string) $library_patron->card_number;
        $cartaoMascarado = strlen($card) >= 2
            ? '····'.substr($card, -2)
            : '····';

        return Inertia::render('biblioteca/conta/leitor-perfil', [
            'leitor' => [
                'id' => (string) $library_patron->id,
                'label' => PatronLabel::format($library_patron),
                'cartao_mascarado' => $cartaoMascarado,
                'pontos' => (int) ($library_patron->points ?? 0),
            ],
        ]);
    }
}
