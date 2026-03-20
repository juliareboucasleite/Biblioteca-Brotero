<?php

namespace App\Http\Middleware;

use App\Models\LibraryPatron;
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
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user('web'),
                'patron' => $this->patronForFrontend($request->user('patron')),
            ],
            'favoriteBookIds' => $this->favoriteBookIds($request),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * @return array{id: int, name: string|null, card_number: string, points: int}|null
     */
    private function patronForFrontend(?LibraryPatron $patron): ?array
    {
        if ($patron === null) {
            return null;
        }

        return [
            'id' => (int) $patron->id,
            'name' => $patron->name,
            'card_number' => $patron->card_number,
            'points' => (int) ($patron->points ?? 0),
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
}
