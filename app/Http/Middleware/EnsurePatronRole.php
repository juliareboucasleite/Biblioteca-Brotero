<?php

namespace App\Http\Middleware;

use App\Models\LibraryPatron;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePatronRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response|RedirectResponse
    {
        $patron = $request->user('patron');

        if (! $patron instanceof LibraryPatron) {
            abort(403);
        }

        $allowedRoles = array_values(array_filter(array_map(
            static fn (string $role): string => strtolower(trim($role)),
            $roles,
        )));

        if ($allowedRoles === []) {
            return $next($request);
        }

        $currentRole = $patron->role();

        if (in_array($currentRole, $allowedRoles, true)) {
            return $next($request);
        }

        return redirect()
            ->route('biblioteca.conta.pedidos')
            ->with('error', 'Este perfil não tem permissão para aceder a esta área.');
    }
}
