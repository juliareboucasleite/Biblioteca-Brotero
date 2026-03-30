<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\LibraryPatron;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StaffPatronController extends Controller
{
    /**
     * Cadastro de leitor (cartão) pelo pessoal da biblioteca.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'card_number' => ['required', 'regex:/^[0-9]{5}$/', Rule::unique(LibraryPatron::class, 'card_number')],
            'birth_date' => ['required', 'date'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_librarian' => ['sometimes', 'boolean'],
        ]);

        LibraryPatron::query()->create([
            'card_number' => $data['card_number'],
            'birth_date' => $data['birth_date'],
            'name' => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
            'points' => 0,
            'is_librarian' => (bool) ($data['is_librarian'] ?? false),
        ]);

        return back()->with('success', 'Leitor cadastrado. Pode aprovar o pedido associado a este cartão.');
    }
}
