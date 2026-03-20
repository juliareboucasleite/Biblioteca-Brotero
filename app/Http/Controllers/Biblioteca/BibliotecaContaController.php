<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\BookRequest;
use App\Models\LibraryPatron;
use Illuminate\Http\Request;
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

    public function historico(Request $request): Response
    {
        $patron = $this->patron($request);

        $historico = BookRequest::query()
            ->where('card_number', $patron->card_number)
            ->whereIn('status', ['expired', 'returned'])
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
            ],
        ]);
    }
}
