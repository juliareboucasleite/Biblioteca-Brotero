<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Biblioteca\LibraryPatronAuthController;
use App\Models\LibraryPatron;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe área "comunidade" (listas, conversas, perfis de leitores) ao modo apropriado.
 */
class EnsurePatronCommunityMode
{
    public function handle(Request $request, Closure $next): Response|RedirectResponse
    {
        $patron = $request->user('patron');

        if (! $patron instanceof LibraryPatron) {
            abort(403);
        }

        $mode = (string) $request->session()->get(
            LibraryPatronAuthController::SESSION_PORTAL_MODE_KEY,
            'comunidade',
        );

        if ($patron->isStaff() && $mode !== 'comunidade') {
            return redirect()
                ->route('biblioteca.conta.balcao.index')
                ->with('error', 'Esta área está disponível no modo comunidade.');
        }

        return $next($request);
    }
}
