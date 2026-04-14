<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\BookRequest;
use App\Models\LibraryPatron;
use App\Services\BookRequestApprovalService;
use App\Support\AuditLogger;
use App\Support\SchoolLocationNormalizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffPedidosController extends Controller
{
    public function index(Request $request): Response
    {
        $pedidos = BookRequest::query()
            ->with(['book:id,title'])
            ->where('status', 'pending')
            ->latest('id')
            ->limit(200)
            ->get()
            ->map(function (BookRequest $r): array {
                $patronExists = LibraryPatron::query()
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
                    'created_at' => $r->created_at?->toIso8601String(),
                    'patron_registered' => $patronExists,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('staff/pedidos', [
            'pedidos' => $pedidos,
        ]);
    }

    public function approve(Request $request, BookRequest $bookRequest, BookRequestApprovalService $approval): RedirectResponse
    {
        if ($bookRequest->status !== 'pending') {
            return back()->with('error', 'Este pedido já não está pendente.');
        }

        if (! LibraryPatron::query()->where('card_number', $bookRequest->card_number)->exists()) {
            return back()->with('error', 'Cadastre o leitor com este número de cartão antes de aprovar o pedido.');
        }

        try {
            $approval->approve($bookRequest);
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        AuditLogger::log($request, 'staff.approve_request', BookRequest::class, (int) $bookRequest->id);

        return back()->with('success', 'Pedido aprovado. O aluno já pode ver prazos e instruções na área «Os meus pedidos».');
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

        AuditLogger::log($request, 'staff.reject_request', BookRequest::class, (int) $bookRequest->id, [
            'reason' => $data['reason'] ?? null,
        ]);

        return back()->with('success', 'Pedido recusado.');
    }
}
