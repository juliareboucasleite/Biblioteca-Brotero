<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookRequest;
use App\Models\LibraryPatron;
use App\Services\BookFineCalculator;
use App\Services\BookRequestApprovalService;
use App\Services\BookReturnService;
use App\Support\AuditLogger;
use App\Support\SchoolLocationNormalizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class PatronLibrarianDeskController extends Controller
{
    /** Devoluções com `returned_at` mais antigo que isto deixam de aparecer no balcão (automaticamente). */
    private const DESK_RETURNED_VISIBLE_DAYS = 30;

    public function index(Request $request): Response
    {
        $cutoff = now()->subDays(self::DESK_RETURNED_VISIBLE_DAYS);

        $pedidos = BookRequest::query()
            ->with(['book:id,title'])
            ->whereNull('hidden_from_librarian_desk_at')
            ->where(function ($q) use ($cutoff): void {
                $q->where('status', '!=', 'returned')
                    ->orWhereNull('returned_at')
                    ->orWhere('returned_at', '>=', $cutoff);
            })
            ->latest('id')
            ->limit(350)
            ->get()
            ->map(fn (BookRequest $r): array => $this->mapRow($r))
            ->values()
            ->all();

        $metrics = [
            'pendentes' => BookRequest::query()->where('status', 'pending')->count(),
            'ativos' => BookRequest::query()->where('status', 'created')->whereNull('returned_at')->count(),
            'atrasados' => BookRequest::query()
                ->where('status', 'created')
                ->whereDate('return_deadline', '<', now()->toDateString())
                ->whereNull('returned_at')
                ->count(),
            'vencem_hoje' => BookRequest::query()
                ->where('status', 'created')
                ->whereDate('return_deadline', now()->toDateString())
                ->whereNull('returned_at')
                ->count(),
            'mais_procurados' => Book::query()
                ->withCount('bookRequests as requisicoes_count')
                ->having('requisicoes_count', '>', 0)
                ->orderByDesc('requisicoes_count')
                ->limit(3)
                ->get(['id', 'title'])
                ->map(static fn (Book $book): array => [
                    'id' => (int) $book->id,
                    'title' => (string) ($book->title ?? 'Sem título'),
                    'requests' => (int) ($book->requisicoes_count ?? 0),
                ])
                ->values()
                ->all(),
        ];

        return Inertia::render('biblioteca/conta/balcao', [
            'pedidos' => $pedidos,
            'metrics' => $metrics,
        ]);
    }

    public function quickScan(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'scan_value' => ['required', 'string', 'max:128'],
        ]);

        $raw = trim((string) $data['scan_value']);
        if ($raw === '') {
            return back()->with('error', 'Leitura vazia.');
        }

        // Permite cartão "12345" ou com ruído visual ("cartão 12345").
        $digitsOnly = preg_replace('/\D+/', '', $raw) ?? '';
        if (preg_match('/^[0-9]{5}$/', $digitsOnly) === 1) {
            $count = BookRequest::query()
                ->where('card_number', $digitsOnly)
                ->whereIn('status', ['pending', 'created'])
                ->count();

            if ($count === 0) {
                return back()->with('error', "Cartão {$digitsOnly} lido, sem pedidos ativos/pendentes.");
            }

            return back()->with('success', "Cartão {$digitsOnly} lido. Pedidos ativos/pendentes: {$count}.");
        }

        // ISBN pode vir com hífens/espaços e ISBN-10 pode terminar em X.
        $isbnNormalized = strtoupper(preg_replace('/[^0-9Xx]+/', '', $raw) ?? '');
        if (preg_match('/^(?:[0-9]{13}|[0-9]{9}[0-9X])$/', $isbnNormalized) === 1) {
            $count = BookRequest::query()
                ->whereRaw('REPLACE(REPLACE(UPPER(isbn), "-", ""), " ", "") = ?', [$isbnNormalized])
                ->whereIn('status', ['pending', 'created'])
                ->count();

            if ($count === 0) {
                return back()->with('error', "ISBN {$isbnNormalized} lido, sem pedidos ativos/pendentes.");
            }

            return back()->with('success', "ISBN {$isbnNormalized} lido. Pedidos ativos/pendentes: {$count}.");
        }

        $pedidoDigits = preg_replace('/\D+/', '', $raw) ?? '';
        $rawLower = Str::lower($raw);
        $hasPedidoHint = str_contains($raw, '#') || str_contains($rawLower, 'pedido');
        if (
            ($hasPedidoHint && preg_match('/^[0-9]{1,8}$/', $pedidoDigits) === 1)
            || preg_match('/^#?([0-9]{1,8})$/', $raw, $m) === 1
        ) {
            $id = isset($m[1]) ? (int) $m[1] : (int) $pedidoDigits;
            $pedido = BookRequest::query()->find($id);
            if ($pedido === null) {
                return back()->with('error', "Pedido #{$id} não encontrado.");
            }

            return back()->with('success', "Pedido #{$id} encontrado com estado: {$pedido->status}.");
        }

        return back()->with('error', 'Formato de scan não reconhecido (cartão, ISBN ou #pedido).');
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $scope = (string) $request->query('scope', 'all');
        $today = now()->toDateString();

        $query = BookRequest::query()
            ->latest('id');

        if ($scope === 'overdue') {
            $query
                ->where('status', 'created')
                ->whereNull('returned_at')
                ->whereDate('return_deadline', '<', $today);
        } elseif ($scope === 'active') {
            $query
                ->where('status', 'created')
                ->whereNull('returned_at');
        }

        $filename = 'emprestimos_'.now()->format('Ymd_His').'_'.($scope === 'overdue' ? 'atrasados' : $scope).'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        return response()->streamDownload(function () use ($query): void {
            $out = fopen('php://output', 'wb');
            if (! is_resource($out)) {
                return;
            }

            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, [
                'ID',
                'Livro',
                'ISBN',
                'Cartao',
                'Estado',
                'Tipo_pedido',
                'Escola',
                'Cacifo',
                'Criado_em',
                'Prazo_levantamento',
                'Prazo_devolucao',
                'Devolvido_em',
                'Multa',
            ], ';');

            $query->chunkById(500, function ($rows) use ($out): void {
                foreach ($rows as $row) {
                    fputcsv($out, [
                        $row->id,
                        $row->book_title,
                        $row->isbn,
                        $row->card_number,
                        $row->status,
                        $row->request_type,
                        SchoolLocationNormalizer::fix($row->school_location),
                        $row->cacifo_code,
                        $row->created_at?->format('Y-m-d H:i:s'),
                        $row->pickup_deadline?->format('Y-m-d H:i:s'),
                        $row->return_deadline?->format('Y-m-d H:i:s'),
                        $row->returned_at?->format('Y-m-d H:i:s'),
                        $row->fine_amount !== null ? (string) $row->fine_amount : '0.00',
                    ], ';');
                }
            }, 'id');

            fclose($out);
        }, $filename, $headers);
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

        AuditLogger::log($request, 'desk.approve_request', BookRequest::class, (int) $bookRequest->id, [
            'status' => $bookRequest->status,
        ]);

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

        AuditLogger::log($request, 'desk.reject_request', BookRequest::class, (int) $bookRequest->id, [
            'reason' => $data['reason'] ?? null,
        ]);

        return back()->with('success', 'Pedido recusado.');
    }

    public function cancel(Request $request, BookRequest $bookRequest): RedirectResponse
    {
        if (! in_array($bookRequest->status, ['pending', 'created'], true)) {
            return back()->with('error', 'Só é possível cancelar pedidos pendentes ou ativos.');
        }

        $bookRequest->forceFill(['status' => 'cancelled'])->save();
        AuditLogger::log($request, 'desk.cancel_request', BookRequest::class, (int) $bookRequest->id);

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
        AuditLogger::log($request, 'desk.mark_returned', BookRequest::class, (int) $bookRequest->id);

        return back()->with('success', 'Marcado como devolvido.');
    }

    public function hideFromDesk(Request $request, BookRequest $bookRequest): RedirectResponse
    {
        if (in_array($bookRequest->status, ['pending', 'created'], true)) {
            return back()->with('error', 'Só pode ocultar pedidos já concluídos (não pendentes nem activos).');
        }

        if ($bookRequest->hidden_from_librarian_desk_at !== null) {
            return back()->with('error', 'Este pedido já está oculto do balcão.');
        }

        $bookRequest->forceFill(['hidden_from_librarian_desk_at' => now()])->save();
        AuditLogger::log($request, 'desk.hide_request', BookRequest::class, (int) $bookRequest->id);

        return back()->with('success', 'Pedido ocultado do balcão.');
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
