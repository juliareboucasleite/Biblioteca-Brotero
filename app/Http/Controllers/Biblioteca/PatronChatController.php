<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\LibraryPatron;
use App\Models\PatronBlock;
use App\Models\PatronConversation;
use App\Models\PatronConversationMember;
use App\Models\PatronConversationMessage;
use App\Models\PatronPeerBookShare;
use App\Support\PatronLabel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatronChatController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var LibraryPatron $patron */
        $patron = $request->user('patron');

        $blockedIds = PatronBlock::blockedPatronIdsFor($patron);

        $conversations = PatronConversation::query()
            ->visibleInInbox()
            ->whereHas('members', static fn ($q) => $q->where('library_patron_id', $patron->id))
            ->withMax('messages', 'created_at')
            ->with(['latestMessage.sender'])
            ->orderByRaw(
                '(case when status = ? and (initiated_by_library_patron_id is not null and initiated_by_library_patron_id <> ?) then 0 else 1 end) asc',
                [PatronConversation::STATUS_PENDING, $patron->id],
            )
            ->orderByDesc('messages_max_created_at')
            ->orderByDesc('id')
            ->limit(100)
            ->get()
            ->filter(function (PatronConversation $c) use ($patron, $blockedIds): bool {
                $other = $c->otherPatron($patron);

                return $other !== null && ! in_array($other->id, $blockedIds, true);
            })
            ->values()
            ->map(fn (PatronConversation $c): array => $this->conversationListPayload($c, $patron));

        return Inertia::render('biblioteca/conta/mensagens', [
            'conversas' => $conversations,
        ]);
    }

    public function open(Request $request): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = $request->user('patron');

        $data = $request->validate([
            'library_patron_id' => ['required', 'integer', 'exists:library_patrons,id'],
        ]);

        $otherId = (int) $data['library_patron_id'];

        if ($otherId === $patron->id) {
            return redirect()
                ->route('biblioteca.conta.mensagens.index')
                ->with('error', 'Não pode iniciar uma conversa consigo mesmo.');
        }

        $other = LibraryPatron::query()->findOrFail($otherId);

        if (PatronBlock::interactionBlocked($patron, $other)) {
            return redirect()
                ->route('biblioteca.conta.mensagens.index')
                ->with('error', 'Não pode contactar este leitor.');
        }

        try {
            $conversation = PatronConversation::findOrCreateDirect($patron, $other);
        } catch (\InvalidArgumentException) {
            return redirect()
                ->route('biblioteca.conta.mensagens.index')
                ->with('error', 'Não foi possível abrir a conversa.');
        }

        return redirect()->route('biblioteca.conta.mensagens.show', $conversation);
    }

    public function show(Request $request, PatronConversation $patron_conversation): Response
    {
        /** @var LibraryPatron $patron */
        $patron = $request->user('patron');

        if (! $this->isMember($patron_conversation, $patron)) {
            abort(403);
        }

        $other = $patron_conversation->otherPatron($patron);

        if ($other !== null && PatronBlock::interactionBlocked($patron, $other)) {
            abort(403);
        }

        if (in_array($patron_conversation->status, [PatronConversation::STATUS_ACTIVE, PatronConversation::STATUS_PENDING], true)) {
            $this->markRead($patron_conversation, $patron);
        }

        $messages = $patron_conversation->canSendMessages()
            ? $patron_conversation->messages()
                ->with('sender')
                ->orderBy('id')
                ->limit(300)
                ->get()
                ->map(fn ($m): array => $this->messagePayload($m, $patron))
            : collect();

        $livrosPartilhados = collect();
        if ($other !== null && $patron_conversation->status === PatronConversation::STATUS_ACTIVE) {
            $livrosPartilhados = PatronPeerBookShare::query()
                ->forPatronPair($patron->id, $other->id)
                ->with(['book.authors'])
                ->latest('id')
                ->limit(50)
                ->get()
                ->map(fn (PatronPeerBookShare $s): array => $this->peerBookSharePayload($s, $patron));
        }

        return Inertia::render('biblioteca/conta/mensagens-conversa', [
            'conversa' => [
                'id' => (string) $patron_conversation->id,
                'outro_id' => $other !== null ? (string) $other->id : null,
                'outro_label' => PatronLabel::format($other),
                'estado' => $patron_conversation->status,
                'sou_iniciador' => $patron_conversation->isInitiator($patron),
                'pode_enviar_mensagens' => $patron_conversation->canSendMessages(),
                'pode_partilhar_livros' => $patron_conversation->canSendMessages(),
                'pode_aceitar' => $patron_conversation->recipientMayRespond($patron),
                'pode_recusar' => $patron_conversation->recipientMayRespond($patron),
                'pode_cancelar_pedido' => $patron_conversation->initiatorMayCancel($patron),
                'mostrar_menu_seguranca' => in_array($patron_conversation->status, [
                    PatronConversation::STATUS_ACTIVE,
                    PatronConversation::STATUS_PENDING,
                ], true) && $other !== null,
                'mostrar_perfil_peer' => $patron_conversation->status === PatronConversation::STATUS_ACTIVE
                    && $other !== null,
            ],
            'mensagens' => $messages,
            'livros_partilhados' => $livrosPartilhados,
        ]);
    }

    public function searchBooksForShare(Request $request, PatronConversation $patron_conversation): JsonResponse
    {
        /** @var LibraryPatron $patron */
        $patron = $request->user('patron');

        if (! $this->isMember($patron_conversation, $patron) || ! $patron_conversation->canSendMessages()) {
            abort(403);
        }

        $other = $patron_conversation->otherPatron($patron);

        if ($other === null || PatronBlock::interactionBlocked($patron, $other)) {
            abort(403);
        }

        $q = trim((string) $request->query('q', ''));
        $limit = min(max((int) $request->query('limit', 12), 1), 25);

        $query = Book::query()
            ->with(['authors'])
            ->latest('id');

        if ($q !== '') {
            $query->where(function ($inner) use ($q): void {
                $inner->where('title', 'like', '%'.$q.'%')
                    ->orWhereHas('authors', function ($a) use ($q): void {
                        $a->where('name', 'like', '%'.$q.'%');
                    });
            });
        }

        $books = $query->limit($limit)->get();

        $livros = $books->map(static function (Book $b): array {
            $b->loadMissing(['authors']);

            return [
                'id' => (string) $b->id,
                'titulo' => (string) ($b->title ?? ''),
                'autor' => $b->authors?->pluck('name')->filter()->implode(', ') ?: 'Autor desconhecido',
                'capa' => $b->cover_image ? (string) $b->cover_image : null,
            ];
        })->values()->all();

        return response()->json(['livros' => $livros]);
    }

    public function shareBook(Request $request, PatronConversation $patron_conversation): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = $request->user('patron');

        if (! $this->isMember($patron_conversation, $patron)) {
            abort(403);
        }

        if (! $patron_conversation->canSendMessages()) {
            return redirect()
                ->back()
                ->with('error', 'Só pode partilhar livros depois da conversa estar aceite.');
        }

        $other = $patron_conversation->otherPatron($patron);

        if ($other === null || PatronBlock::interactionBlocked($patron, $other)) {
            abort(403);
        }

        $data = $request->validate([
            'book_id' => ['required', 'integer', 'exists:books,id'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $note = isset($data['note']) ? trim((string) $data['note']) : '';
        $note = $note === '' ? null : $note;

        PatronPeerBookShare::query()->updateOrCreate(
            [
                'from_library_patron_id' => $patron->id,
                'to_library_patron_id' => $other->id,
                'book_id' => (int) $data['book_id'],
            ],
            [
                'note' => $note,
            ],
        );

        $patron_conversation->touch();

        return redirect()
            ->back()
            ->with('success', 'Livro sugerido na conversa.');
    }

    public function store(Request $request, PatronConversation $patron_conversation): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = $request->user('patron');

        if (! $this->isMember($patron_conversation, $patron)) {
            abort(403);
        }

        $other = $patron_conversation->otherPatron($patron);

        if ($other !== null && PatronBlock::interactionBlocked($patron, $other)) {
            abort(403);
        }

        if (! $patron_conversation->canSendMessages()) {
            return redirect()
                ->back()
                ->with('error', 'A conversa ainda não foi aceite. Só depois do consentimento é possível enviar mensagens.');
        }

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $body = trim($data['body']);

        if ($body === '') {
            return redirect()->back()->with('error', 'Escreva uma mensagem antes de enviar.');
        }

        $patron_conversation->messages()->create([
            'library_patron_id' => $patron->id,
            'body' => $body,
        ]);

        $patron_conversation->touch();
        $this->markRead($patron_conversation, $patron);

        return redirect()
            ->back()
            ->with('success', 'Mensagem enviada.');
    }

    public function accept(Request $request, PatronConversation $patron_conversation): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = $request->user('patron');

        if (! $this->isMember($patron_conversation, $patron) || ! $patron_conversation->recipientMayRespond($patron)) {
            abort(403);
        }

        $other = $patron_conversation->otherPatron($patron);

        if ($other !== null && PatronBlock::interactionBlocked($patron, $other)) {
            abort(403);
        }

        $patron_conversation->update([
            'status' => PatronConversation::STATUS_ACTIVE,
        ]);
        $patron_conversation->touch();

        return redirect()
            ->route('biblioteca.conta.mensagens.show', $patron_conversation)
            ->with('success', 'Conversa aceite. Já pode enviar mensagens com segurança.');
    }

    public function decline(Request $request, PatronConversation $patron_conversation): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = $request->user('patron');

        if (! $this->isMember($patron_conversation, $patron) || ! $patron_conversation->recipientMayRespond($patron)) {
            abort(403);
        }

        $peer = $patron_conversation->otherPatron($patron);
        if ($peer !== null) {
            PatronPeerBookShare::query()->forPatronPair($patron->id, $peer->id)->delete();
        }

        $patron_conversation->messages()->delete();
        $patron_conversation->update([
            'status' => PatronConversation::STATUS_DECLINED,
        ]);
        $patron_conversation->touch();

        return redirect()
            ->route('biblioteca.conta.mensagens.index')
            ->with('success', 'Pedido recusado. Não receberá mensagens dessa pessoa até novo pedido.');
    }

    public function cancel(Request $request, PatronConversation $patron_conversation): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = $request->user('patron');

        if (! $this->isMember($patron_conversation, $patron) || ! $patron_conversation->initiatorMayCancel($patron)) {
            abort(403);
        }

        $peer = $patron_conversation->otherPatron($patron);
        if ($peer !== null) {
            PatronPeerBookShare::query()->forPatronPair($patron->id, $peer->id)->delete();
        }

        $patron_conversation->messages()->delete();
        $patron_conversation->update([
            'status' => PatronConversation::STATUS_DECLINED,
        ]);
        $patron_conversation->touch();

        return redirect()
            ->route('biblioteca.conta.mensagens.index')
            ->with('success', 'Pedido de conversa cancelado.');
    }

    private function isMember(PatronConversation $conversation, LibraryPatron $patron): bool
    {
        return $conversation->members()
            ->where('library_patron_id', $patron->id)
            ->exists();
    }

    private function markRead(PatronConversation $conversation, LibraryPatron $patron): void
    {
        PatronConversationMember::query()
            ->where('patron_conversation_id', $conversation->id)
            ->where('library_patron_id', $patron->id)
            ->update(['last_read_at' => now()]);
    }

    /**
     * @return array{id: string, nota: string|null, de_mim: bool, criado_em: string, livro: array{id: string, titulo: string, autor: string, capa: string|null, tem_ebook: bool}}
     */
    private function peerBookSharePayload(PatronPeerBookShare $share, LibraryPatron $viewer): array
    {
        $book = $share->book;
        $book->loadMissing(['authors']);

        return [
            'id' => (string) $share->id,
            'nota' => $share->note,
            'de_mim' => $share->from_library_patron_id === $viewer->id,
            'criado_em' => $share->created_at?->toIso8601String() ?? '',
            'livro' => [
                'id' => (string) $book->id,
                'titulo' => (string) ($book->title ?? ''),
                'autor' => $book->authors?->pluck('name')->filter()->implode(', ') ?: 'Autor desconhecido',
                'capa' => $book->cover_image ? (string) $book->cover_image : null,
                'tem_ebook' => $book->hasEbook() && $book->ebookFormat() !== null,
            ],
        ];
    }

    /**
     * @return array{id: string, outro_label: string, resumo: string|null, ultima_em: string|null, nao_lidas: int, precisa_acao: bool, sou_iniciador: bool, estado: string}
     */
    private function conversationListPayload(PatronConversation $conversation, LibraryPatron $viewer): array
    {
        $memberRow = PatronConversationMember::query()
            ->where('patron_conversation_id', $conversation->id)
            ->where('library_patron_id', $viewer->id)
            ->first();

        $ultima = $conversation->latestMessage;
        $ultimaEm = $ultima?->created_at?->toIso8601String();

        $precisaAcao = $conversation->recipientMayRespond($viewer);

        $naoLidas = 0;
        if ($conversation->canSendMessages()) {
            $naoLidas = $conversation->messages()
                ->where('library_patron_id', '!=', $viewer->id)
                ->when(
                    $memberRow?->last_read_at,
                    static fn ($q, $readAt) => $q->where('created_at', '>', $readAt),
                )
                ->count();
        }

        $resumo = null;
        if ($conversation->status === PatronConversation::STATUS_PENDING) {
            $resumo = $conversation->isInitiator($viewer)
                ? 'À espera que a outra pessoa aceite o pedido.'
                : 'Pediu conversar consigo — aceite ou recuse antes de haver mensagens.';
        } elseif ($ultima !== null) {
            $resumo = $this->truncate($ultima->body, 120);
        } else {
            $resumo = 'Sem mensagens ainda — diga olá.';
        }

        return [
            'id' => (string) $conversation->id,
            'outro_label' => PatronLabel::format($conversation->otherPatron($viewer)),
            'resumo' => $resumo,
            'ultima_em' => $ultimaEm,
            'nao_lidas' => $naoLidas,
            'precisa_acao' => $precisaAcao,
            'sou_iniciador' => $conversation->isInitiator($viewer),
            'estado' => $conversation->status,
        ];
    }

    /**
     * @return array{id: string, body: string, created_at: string, minha: bool, remetente_label: string}
     */
    private function messagePayload(PatronConversationMessage $message, LibraryPatron $viewer): array
    {
        $minha = $message->library_patron_id === $viewer->id;

        return [
            'id' => (string) $message->id,
            'body' => $message->body,
            'created_at' => $message->created_at?->toIso8601String() ?? '',
            'minha' => $minha,
            'remetente_label' => PatronLabel::format($message->sender),
        ];
    }

    private function truncate(string $text, int $max): string
    {
        if (strlen($text) <= $max) {
            return $text;
        }

        return substr($text, 0, $max - 1).'…';
    }
}
