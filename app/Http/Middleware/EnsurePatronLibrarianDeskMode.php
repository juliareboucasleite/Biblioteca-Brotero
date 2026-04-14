<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Biblioteca\LibraryPatronAuthController;
use App\Models\LibraryPatron;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Só bibliotecárias/os com sessão em modo «bibliotecaria» (quiosque).
 */
class EnsurePatronLibrarianDeskMode
{
    public function handle(Request $request, Closure $next): Response|RedirectResponse
    {
        $patron = $request->user('patron');

        if (! $patron instanceof LibraryPatron) {
            abort(403);
        }

        if (! $patron->isStaff()) {
            return redirect()
                ->route('biblioteca.conta.pedidos')
                ->with('error', 'Acesso reservado a funcionárias/os da biblioteca.');
        }

        if ($request->session()->get(LibraryPatronAuthController::SESSION_PORTAL_MODE_KEY) !== 'bibliotecaria') {
            return redirect()
                ->route('biblioteca.conta.pedidos')
                ->with('error', 'Para aceder ao balcão, entre no modo bibliotecária/o.');
        }

        return $next($request);
    }
}
