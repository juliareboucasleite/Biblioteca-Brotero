<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Biblioteca\LibraryPatronAuthController;
use App\Models\LibraryPatron;
use App\Support\StaffBibliotecaAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $staffUser = $request->user('web');
        $canStaffPedidos = StaffBibliotecaAccess::canAccessStaffPanel($staffUser);

        return [
            ...parent::share($request),
            'csrf_token' => csrf_token(),
            'name' => config('app.name'),
            'auth' => [
                'user' => $staffUser,
                'patron' => $this->patronForFrontend($request, $request->user('patron')),
            ],
            'staffBiblioteca' => [
                'canAccessPedidos' => $canStaffPedidos,
                'pedidosUrl' => $canStaffPedidos ? route('staff.pedidos.index') : null,
            ],
            'favoriteBookIds' => $this->favoriteBookIds($request),
            'patronReadingLists' => $this->patronReadingLists($request),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * @return array{id: int, name: string|null, card_number: string, points: int, portal_mode: string, is_librarian: bool, role: string}|null
     */
    private function patronForFrontend(Request $request, ?LibraryPatron $patron): ?array
    {
        if ($patron === null) {
            return null;
        }

        $mode = (string) $request->session()->get(
            LibraryPatronAuthController::SESSION_PORTAL_MODE_KEY,
            'comunidade',
        );

        if ($mode !== 'bibliotecaria' && $mode !== 'comunidade') {
            $mode = 'comunidade';
        }

        return [
            'id' => (int) $patron->id,
            'name' => $patron->name,
            'card_number' => $patron->card_number,
            'points' => (int) ($patron->points ?? 0),
            'portal_mode' => $mode,
            'is_librarian' => $patron->isLibrarian(),
            'role' => $patron->role(),
        ];
    }

    /**
     * @return list<string>
     */
    private function favoriteBookIds(Request $request): array
    {
        $patron = $request->user('patron');

        if (! $patron instanceof LibraryPatron) {
            return [];
        }

        if (Schema::hasTable('patron_reading_list_books') && Schema::hasTable('patron_reading_lists')) {
            return DB::table('patron_reading_list_books as rb')
                ->join('patron_reading_lists as rl', 'rl.id', '=', 'rb.patron_reading_list_id')
                ->where('rl.library_patron_id', $patron->id)
                ->pluck('rb.book_id')
                ->map(static fn ($id): string => (string) $id)
                ->unique()
                ->values()
                ->all();
        }

        if (! Schema::hasTable('book_favorites')) {
            return [];
        }

        return DB::table('book_favorites')
            ->where('library_patron_id', $patron->id)
            ->pluck('book_id')
            ->map(static fn ($id): string => (string) $id)
            ->values()
            ->all();
    }

    /**
     * @return list<array{id: int, name: string, type: string}>
     */
    private function patronReadingLists(Request $request): array
    {
        $patron = $request->user('patron');

        if (! $patron instanceof LibraryPatron) {
            return [];
        }

        if (! Schema::hasTable('patron_reading_lists')) {
            return [];
        }

        return DB::table('patron_reading_lists')
            ->where('library_patron_id', $patron->id)
            ->orderBy('name')
            ->get(['id', 'name', 'type'])
            ->map(static fn ($row): array => [
                'id' => (int) $row->id,
                'name' => (string) $row->name,
                'type' => (string) ($row->type ?? 'custom'),
            ])
            ->values()
            ->all();
    }
}
