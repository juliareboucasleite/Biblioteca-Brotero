<?php

use App\Http\Middleware\EnsurePatronLibrarianDeskMode;
use App\Http\Middleware\EnsurePatronRole;
use App\Http\Middleware\EnsurePatronCommunityMode;
use App\Http\Middleware\EnsureStaffBibliotecaAccess;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('books:check-deadlines')->hourly();
        $schedule->command('book-requests:expire')->daily();
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(function (Request $request): string {
            $path = ltrim($request->path(), '/');
            $routeName = $request->route()?->getName();

            if (str_starts_with($path, 'biblioteca/conta')) {
                return route('biblioteca.login');
            }

            if (in_array($routeName, ['biblioteca.livro.ler', 'biblioteca.livro.ebook'], true)) {
                return route('biblioteca.login');
            }

            if (
                str_starts_with($path, 'biblioteca/descobertas')
                && in_array($request->method(), ['POST', 'DELETE'], true)
            ) {
                return route('biblioteca.login');
            }

            if (Route::has('login')) {
                return route('login');
            }

            return '/login';
        });

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'staff.biblioteca' => EnsureStaffBibliotecaAccess::class,
            'patron.librarian.desk' => EnsurePatronLibrarianDeskMode::class,
            'patron.community.mode' => EnsurePatronCommunityMode::class,
            'patron.role' => EnsurePatronRole::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
