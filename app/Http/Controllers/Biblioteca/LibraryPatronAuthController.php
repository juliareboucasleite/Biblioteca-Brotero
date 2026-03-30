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
    public const SESSION_CANDIDATE_KEY = 'patron_login_candidate_id';

    public const SESSION_PORTAL_MODE_KEY = 'patron_portal_mode';

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

        if ($patron->isLibrarian()) {
            $request->session()->put(self::SESSION_CANDIDATE_KEY, $patron->id);
            $request->session()->put('patron_login_remember', $request->boolean('remember'));

            return redirect()->route('biblioteca.login.portal');
        }

        Auth::guard('patron')->login($patron, $request->boolean('remember'));
        $request->session()->put(self::SESSION_PORTAL_MODE_KEY, 'comunidade');
        $request->session()->regenerate();

        return redirect()->intended(route('biblioteca.conta.pedidos'));
    }

    public function choosePortalMode(Request $request): Response|RedirectResponse
    {
        $rawId = $request->session()->get(self::SESSION_CANDIDATE_KEY);

        if ($rawId === null || (! is_int($rawId) && ! ctype_digit((string) $rawId))) {
            return redirect()->route('biblioteca.login');
        }

        $patron = LibraryPatron::query()->find((int) $rawId);

        if ($patron === null || ! $patron->isLibrarian()) {
            $request->session()->forget(self::SESSION_CANDIDATE_KEY);

            return redirect()->route('biblioteca.login');
        }

        return Inertia::render('biblioteca/login-portal', [
            'greeting_name' => $patron->name,
        ]);
    }

    public function completePortalMode(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'portal_mode' => ['required', 'in:bibliotecaria,comunidade'],
        ]);

        $rawId = $request->session()->get(self::SESSION_CANDIDATE_KEY);

        if ($rawId === null || (! is_int($rawId) && ! ctype_digit((string) $rawId))) {
            return redirect()->route('biblioteca.login');
        }

        $patron = LibraryPatron::query()->find((int) $rawId);

        if ($patron === null || ! $patron->isLibrarian()) {
            $request->session()->forget(self::SESSION_CANDIDATE_KEY);

            return redirect()->route('biblioteca.login');
        }

        $request->session()->forget(self::SESSION_CANDIDATE_KEY);

        $remember = (bool) $request->session()->pull('patron_login_remember', false);

        Auth::guard('patron')->login($patron, $remember);
        $request->session()->put(self::SESSION_PORTAL_MODE_KEY, $data['portal_mode']);
        $request->session()->regenerate();

        return redirect()->intended(route('biblioteca.conta.pedidos'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('patron')->logout();

        $request->session()->forget(self::SESSION_PORTAL_MODE_KEY);
        $request->session()->forget(self::SESSION_CANDIDATE_KEY);
        $request->session()->forget('patron_login_remember');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('biblioteca.login');
    }
}
