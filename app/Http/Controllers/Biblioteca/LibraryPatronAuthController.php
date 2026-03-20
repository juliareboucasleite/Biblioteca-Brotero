<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\LibraryPatron;
use App\Support\BirthDateParser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LibraryPatronAuthController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('biblioteca/login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'card_number' => ['required', 'regex:/^[0-9]{5}$/'],
            'password' => ['required', 'string', 'max:32'],
        ]);

        /** @var LibraryPatron|null $patron */
        $patron = LibraryPatron::query()
            ->where('card_number', $validated['card_number'])
            ->first();

        if ($patron === null) {
            throw ValidationException::withMessages([
                'card_number' => 'Número de cartão não encontrado.',
            ]);
        }

        $parsed = BirthDateParser::parse($validated['password']);

        if ($parsed === null || ! $patron->birth_date->isSameDay($parsed)) {
            throw ValidationException::withMessages([
                'password' => 'Senha incorreta.',
            ]);
        }

        Auth::guard('patron')->login($patron, $request->boolean('remember'));

        $request->session()->regenerate();

        return redirect()->intended(route('biblioteca.conta.pedidos'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('patron')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('biblioteca.login');
    }
}
