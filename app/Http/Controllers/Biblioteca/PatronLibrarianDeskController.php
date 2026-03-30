<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\BookRequest;
use App\Models\LibraryPatron;
use App\Services\BookFineCalculator;
use App\Services\BookRequestApprovalService;
use App\Services\BookReturnService;
use App\Support\SchoolLocationNormalizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatronLibrarianDeskController extends Controller
{
    public function index(Request $request): Response
    {
        $pedidos = BookRequest::query()
            ->with(['book:id,title'])
            ->latest('id')
            ->limit(350)
            ->get()
            ->map(fn (BookRequest $r): array => $this->mapRow($r))
            ->values()
            ->all();

        return Inertia::render('biblioteca/conta/balcao', [
            'pedidos' => $pedidos,
        ]);
    }

    public function approve(Request $request, BookRequest $bookRequest, BookRequestApprovalService $approval): RedirectResponse
    {
        if ($bookRequest->status !== 'pending') {
            return back()->with('error', 'Este pedido já não está pendente.');
        }

        if (! LibraryPatron::query()->where('card_number', $bookRequest->card_number)->exists()) {
            return back()->with('error', 'Cadastre o leitor com este número de cartão antes de aprovar.');
        }

        try {
            $approval->approve($bookRequest);
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Pedido aprovado.');
    }

    public function reject(Request $request, BookRequest $bookRequest, BookRequestApprovalService $approval): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($bookRequest->status !== 'pending') {
            return back()->with('error', 'Este pedido já não está pendente.');
        }

        try {
            $approval->reject($bookRequest, $data['reason'] ?? null);
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Pedido recusado.');
    }

    public function cancel(Request $request, BookRequest $bookRequest): RedirectResponse
    {
        if (! in_array($bookRequest->status, ['pending', 'created'], true)) {
            return back()->with('error', 'Só é possível cancelar pedidos pendentes ou ativos.');
        }

        $bookRequest->forceFill(['status' => 'cancelled'])->save();

        return back()->with('success', 'Pedido cancelado.');
    }

    public function updateNote(Request $request, BookRequest $bookRequest): RedirectResponse
    {
        $data = $request->validate([
            'patron_visible_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $note = $data['patron_visible_note'] ?? null;
        $trimmed = is_string($note) ? trim($note) : '';

        $bookRequest->forceFill([
            'patron_visible_note' => $trimmed === '' ? null : $trimmed,
        ])->save();

        return back()->with('success', 'Nota para o aluno atualizada.');
    }

    public function updateFine(Request $request, BookRequest $bookRequest): RedirectResponse
    {
        $data = $request->validate([
            'fine_amount' => ['required', 'numeric', 'min:0', 'max:999.99'],
        ]);

        if ($bookRequest->status !== 'created') {
            return back()->with('error', 'Só pode ajustar multa em requisições ativas.');
        }

        if ($bookRequest->returned_at !== null) {
            return back()->with('error', 'Pedido já devolvido.');
        }

        $bookRequest->forceFill([
            'fine_amount' => $data['fine_amount'],
            'fine_applied_at' => $bookRequest->fine_applied_at ?? now(),
        ])->save();

        return back()->with('success', 'Multa atualizada.');
    }

    public function recalcFine(Request $request, BookRequest $bookRequest, BookFineCalculator $calculator): RedirectResponse
    {
        if ($bookRequest->status !== 'created') {
            return back()->with('error', 'Só pode recalcular em requisições ativas.');
        }

        if ($bookRequest->returned_at !== null) {
            return back()->with('error', 'Pedido já devolvido.');
        }

        $calculator->persistFine($bookRequest);
        $bookRequest->refresh();

        return back()->with('success', 'Multa recalculada com a regra de 0,50 €/dia (atraso sobre o prazo de devolução).');
    }

    public function markReturned(Request $request, BookRequest $bookRequest, BookReturnService $returns): RedirectResponse
    {
        if ($bookRequest->status !== 'created') {
            return back()->with('error', 'Só pode marcar devolução em requisições ativas.');
        }

        if ($bookRequest->returned_at !== null) {
            return back()->with('error', 'Já consta como devolvido.');
        }

        $returns->markReturned($bookRequest, null);

        return back()->with('success', 'Marcado como devolvido.');
    }

    /**
     * @return array<string, mixed>
     */
    private function mapRow(BookRequest $r): array
    {
        $patronRegistered = LibraryPatron::query()
            ->where('card_number', $r->card_number)
            ->exists();

        return [
            'id' => $r->id,
            'book_id' => $r->book_id,
            'book_title' => $r->book_title,
            'isbn' => $r->isbn,
            'card_number' => $r->card_number,
            'request_type' => $r->request_type,
            'school_location' => SchoolLocationNormalizer::fix($r->school_location),
            'cacifo_code' => $r->cacifo_code,
            'status' => $r->status,
            'pickup_deadline' => $r->pickup_deadline?->toIso8601String(),
            'return_deadline' => $r->return_deadline?->toIso8601String(),
            'returned_at' => $r->returned_at?->toIso8601String(),
            'created_at' => $r->created_at?->toIso8601String(),
            'fine_amount' => $r->fine_amount !== null ? (string) $r->fine_amount : '0.00',
            'staff_rejection_reason' => $r->staff_rejection_reason,
            'patron_visible_note' => $r->patron_visible_note,
            'patron_registered' => $patronRegistered,
        ];
    }
}
