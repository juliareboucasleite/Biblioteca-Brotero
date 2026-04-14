<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookRequest;
use App\Models\LibraryPatron;
use App\Models\PatronReadingList;
use App\Support\SchoolLocationNormalizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BibliotecaContaController extends Controller
{
    private function ensureDefaultStudentLists(LibraryPatron $patron): void
    {
        if ($patron->role() !== LibraryPatron::ROLE_STUDENT) {
            return;
        }

        $patron->readingLists()->firstOrCreate(
            ['type' => PatronReadingList::TYPE_READ_LATER],
            ['name' => 'Ler depois', 'visibility' => 'private'],
        );
        $patron->readingLists()->firstOrCreate(
            ['type' => PatronReadingList::TYPE_READING_NOW],
            ['name' => 'Em leitura', 'visibility' => 'private'],
        );
    }

    private function patron(Request $request): LibraryPatron
    {
        /** @var LibraryPatron $patron */
        $patron = Auth::guard('patron')->user();

        return $patron;
    }

    /**
     * @return array<string, mixed>
     */
    private function mapearPedido(BookRequest $r): array
    {
        return [
            'id' => $r->id,
            'book_title' => $r->book_title,
            'request_type' => $r->request_type,
            'status' => $r->status,
            'isbn' => $r->isbn,
            'school_location' => SchoolLocationNormalizer::fix($r->school_location),
            'cacifo_code' => $r->cacifo_code,
            'pickup_deadline' => $r->pickup_deadline?->toIso8601String(),
            'return_deadline' => $r->return_deadline?->toIso8601String(),
            'returned_at' => $r->returned_at?->toIso8601String(),
            'created_at' => $r->created_at?->toIso8601String(),
            'fine_amount' => $r->fine_amount !== null ? (string) $r->fine_amount : '0.00',
            'staff_rejection_reason' => $r->staff_rejection_reason,
            'patron_visible_note' => $r->patron_visible_note,
        ];
    }

    public function pedidos(Request $request): Response
    {
        $patron = $this->patron($request);

        $pedidos = BookRequest::query()
            ->where('card_number', $patron->card_number)
            ->whereIn('status', ['pending', 'created'])
            ->latest('id')
            ->limit(100)
            ->get()
            ->map(fn (BookRequest $r): array => $this->mapearPedido($r))
            ->values()
            ->all();

        return Inertia::render('biblioteca/conta/pedidos', [
            'pedidos' => $pedidos,
        ]);
    }

    /**
     * O leitor cancela um pedido ainda ativo (status created). O livro volta a ficar disponível.
     */
    public function cancelPedido(Request $request, BookRequest $bookRequest): RedirectResponse
    {
        $patron = $this->patron($request);

        if ($bookRequest->card_number !== $patron->card_number) {
            abort(403);
        }

        if (! in_array($bookRequest->status, ['created', 'pending'], true)) {
            return back()->with('error', 'Este pedido já não pode ser cancelado.');
        }

        $bookRequest->forceFill(['status' => 'cancelled'])->save();

        return back()->with('success', 'Pedido cancelado.');
    }

    public function historico(Request $request): Response
    {
        $patron = $this->patron($request);

        $historico = BookRequest::query()
            ->where('card_number', $patron->card_number)
            ->whereIn('status', ['expired', 'returned', 'cancelled', 'rejected'])
            ->latest('id')
            ->limit(100)
            ->get()
            ->map(fn (BookRequest $r): array => $this->mapearPedido($r))
            ->values()
            ->all();

        return Inertia::render('biblioteca/conta/historico', [
            'historico' => $historico,
        ]);
    }

    public function perfil(Request $request): Response
    {
        $patron = $this->patron($request);

        return Inertia::render('biblioteca/conta/perfil', [
            'perfil' => [
                'name' => $patron->name,
                'card_number' => $patron->card_number,
                'data_nascimento' => $patron->birth_date->format('d/m/Y'),
                'pontos' => (int) ($patron->points ?? 0),
            ],
        ]);
    }

    public function favoritos(Request $request): Response
    {
        $patron = $this->patron($request);
        $this->ensureDefaultStudentLists($patron);

        $listas = $patron->readingLists()
            ->with([
                'books' => fn ($q) => $q->with('authors')->orderBy('patron_reading_list_books.created_at', 'desc'),
            ])
            ->orderBy('name')
            ->get()
            ->map(function (PatronReadingList $list): array {
                return [
                    'id' => $list->id,
                    'name' => $list->name,
                    'type' => $list->type ?? PatronReadingList::TYPE_CUSTOM,
                    'classroom' => $list->classroom,
                    'theme' => $list->theme,
                    'share_code' => $list->share_code,
                    'share_token' => $list->share_token,
                    'books' => $list->books->map(function (Book $book): array {
                        return [
                            'id' => (string) $book->id,
                            'titulo' => (string) ($book->title ?? ''),
                            'autor' => $book->authors?->pluck('name')->filter()->implode(', ') ?: 'Autor desconhecido',
                            'desc' => (string) ($book->description ?? ''),
                            'capa' => $book->cover_image ? (string) $book->cover_image : null,
                            'progress_percent' => (int) ($book->pivot?->progress_percent ?? 0),
                            'current_page' => $book->pivot?->current_page !== null ? (int) $book->pivot->current_page : null,
                            'reading_status' => (string) ($book->pivot?->reading_status ?? 'not_started'),
                        ];
                    })->values()->all(),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('biblioteca/conta/favoritos', [
            'listas' => $listas,
            'patronRole' => $patron->role(),
        ]);
    }
}
