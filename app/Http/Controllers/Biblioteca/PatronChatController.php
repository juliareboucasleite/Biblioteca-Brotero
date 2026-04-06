<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\LibraryPatron;
use App\Models\PatronConversation;
use App\Models\PatronConversationMember;
use App\Models\PatronConversationMessage;
use App\Support\PatronLabel;
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

        $conversations = PatronConversation::query()
            ->whereHas('members', static fn ($q) => $q->where('library_patron_id', $patron->id))
            ->withMax('messages', 'created_at')
            ->with(['latestMessage.sender'])
            ->orderByDesc('messages_max_created_at')
            ->orderByDesc('id')
            ->limit(100)
            ->get()
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

        $this->markRead($patron_conversation, $patron);

        $other = $patron_conversation->otherPatron($patron);

        $messages = $patron_conversation->messages()
            ->with('sender')
            ->orderBy('id')
            ->limit(300)
            ->get()
            ->map(fn ($m): array => $this->messagePayload($m, $patron));

        return Inertia::render('biblioteca/conta/mensagens-conversa', [
            'conversa' => [
                'id' => (string) $patron_conversation->id,
                'outro_label' => PatronLabel::format($other),
            ],
            'mensagens' => $messages,
        ]);
    }

    public function store(Request $request, PatronConversation $patron_conversation): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = $request->user('patron');

        if (! $this->isMember($patron_conversation, $patron)) {
            abort(403);
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

        $this->markRead($patron_conversation, $patron);

        return redirect()
            ->back()
            ->with('success', 'Mensagem enviada.');
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
     * @return array{id: string, outro_label: string, ultima_mensagem: string|null, ultima_em: string|null, nao_lidas: int}
     */
    private function conversationListPayload(PatronConversation $conversation, LibraryPatron $viewer): array
    {
        $memberRow = PatronConversationMember::query()
            ->where('patron_conversation_id', $conversation->id)
            ->where('library_patron_id', $viewer->id)
            ->first();

        $ultima = $conversation->latestMessage;
        $ultimaEm = $ultima?->created_at?->toIso8601String();

        $naoLidas = $conversation->messages()
            ->where('library_patron_id', '!=', $viewer->id)
            ->when(
                $memberRow?->last_read_at,
                static fn ($q, $readAt) => $q->where('created_at', '>', $readAt),
            )
            ->count();

        return [
            'id' => (string) $conversation->id,
            'outro_label' => PatronLabel::format($conversation->otherPatron($viewer)),
            'ultima_mensagem' => $ultima ? $this->truncate($ultima->body, 120) : null,
            'ultima_em' => $ultimaEm,
            'nao_lidas' => $naoLidas,
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
