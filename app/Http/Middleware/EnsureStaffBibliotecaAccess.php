<?php

namespace App\Http\Middleware;

use App\Support\StaffBibliotecaAccess;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStaffBibliotecaAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user('web');

        if (! StaffBibliotecaAccess::canAccessStaffPanel($user)) {
            abort(403, 'Acesso reservado ao pessoal da biblioteca.');
        }

        return $next($request);
    }
}
