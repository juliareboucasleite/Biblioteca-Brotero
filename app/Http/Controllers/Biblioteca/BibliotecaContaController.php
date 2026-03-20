<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookRequest;
use App\Models\LibraryPatron;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BibliotecaContaController extends Controller
{
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
            'school_location' => $r->school_location,
            'cacifo_code' => $r->cacifo_code,
            'pickup_deadline' => $r->pickup_deadline?->toIso8601String(),
            'return_deadline' => $r->return_deadline?->toIso8601String(),
            'returned_at' => $r->returned_at?->toIso8601String(),
            'created_at' => $r->created_at?->toIso8601String(),
            'fine_amount' => $r->fine_amount !== null ? (string) $r->fine_amount : '0.00',
        ];
    }

    public function pedidos(Request $request): Response
    {
        $patron = $this->patron($request);

        $pedidos = BookRequest::query()
            ->where('card_number', $patron->card_number)
            ->where('status', 'created')
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

        if ($bookRequest->status !== 'created') {
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
            ->whereIn('status', ['expired', 'returned', 'cancelled'])
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

        $livros = $patron->favoriteBooks()
            ->with(['authors'])
            ->orderByPivot('created_at', 'desc')
            ->limit(200)
            ->get()
            ->map(function (Book $book): array {
                return [
                    'id' => (string) $book->id,
                    'titulo' => (string) ($book->title ?? ''),
                    'autor' => $book->authors?->pluck('name')->filter()->implode(', ') ?: 'Autor desconhecido',
                    'desc' => (string) ($book->description ?? ''),
                    'capa' => $book->cover_image ? (string) $book->cover_image : null,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('biblioteca/conta/favoritos', [
            'livros' => $livros,
        ]);
    }
}
