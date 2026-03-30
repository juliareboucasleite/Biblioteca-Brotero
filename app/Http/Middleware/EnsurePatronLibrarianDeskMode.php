<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Biblioteca\LibraryPatronAuthController;
use App\Models\LibraryPatron;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Só bibliotecárias/os com sessão em modo «bibliotecaria» (quiosque).
 */
class EnsurePatronLibrarianDeskMode
{
    public function handle(Request $request, Closure $next): Response
    {
        $patron = $request->user('patron');

        if (! $patron instanceof LibraryPatron || ! $patron->isLibrarian()) {
            abort(403);
        }

        if ($request->session()->get(LibraryPatronAuthController::SESSION_PORTAL_MODE_KEY) !== 'bibliotecaria') {
            abort(403);
        }

        return $next($request);
    }
}
