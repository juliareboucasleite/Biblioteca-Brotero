<?php

use App\Http\Controllers\Biblioteca\BibliotecaContaController;
use App\Http\Controllers\Biblioteca\LibraryPatronAuthController;
use App\Http\Controllers\Biblioteca\PatronFavoriteController;
use App\Http\Controllers\Biblioteca\PatronLibrarianBookController;
use App\Http\Controllers\Biblioteca\PatronLibrarianDeskController;
use App\Http\Controllers\Biblioteca\PatronRankingController;
use App\Http\Controllers\BibliotecaController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BookRequestController;
use App\Http\Controllers\Staff\StaffPatronController;
use App\Http\Controllers\Staff\StaffPedidosController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

// Home da aplicação: redireciona sempre para a Biblioteca (React)
Route::redirect('/', '/biblioteca')->name('home');

// Destino pós-login Fortify (`config/fortify.php` → /dashboard): catálogo público
Route::get('/dashboard', function () {
    return redirect()->route('biblioteca.index');
})
    ->middleware(['auth'])
    ->name('dashboard');

Route::get('/books', [BookController::class, 'index']);
Route::get('/books/search', [BookController::class, 'search']);
Route::get('/ranking', [PatronRankingController::class, 'index'])->name('ranking');
Route::get('/books/{id}', [BookController::class, 'show']);

// Biblioteca Brotero: catálogo e página do livro (React + Inertia)
Route::get('/biblioteca', [BibliotecaController::class, 'index'])->name('biblioteca.index');
Route::get('/biblioteca/livros', [BibliotecaController::class, 'livros'])->name('biblioteca.livros');
Route::get('/biblioteca/livro/{book}', [BibliotecaController::class, 'livroShow'])->name('biblioteca.livro.show');
Route::get('/biblioteca/livro', [BibliotecaController::class, 'livro'])->name('biblioteca.livro');
Route::post('/books/isbn', [BookController::class, 'storeFromIsbn']);
Route::get('/books/{id}/details', [BookController::class, 'showDetails']);
Route::post('/biblioteca/requisitar', [BookRequestController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class])
    ->name('biblioteca.requisitar');

/*
|--------------------------------------------------------------------------
| Leitor (quiosque): cartão + data de nascimento
|--------------------------------------------------------------------------
*/
Route::middleware('guest:patron')->group(function (): void {
    Route::get('/biblioteca/entrar', [LibraryPatronAuthController::class, 'create'])
        ->name('biblioteca.login');
    Route::post('/biblioteca/entrar', [LibraryPatronAuthController::class, 'store']);
    Route::get('/biblioteca/entrar/modo', [LibraryPatronAuthController::class, 'choosePortalMode'])
        ->name('biblioteca.login.portal');
    Route::post('/biblioteca/entrar/modo', [LibraryPatronAuthController::class, 'completePortalMode']);
});

Route::post('/biblioteca/sair', [LibraryPatronAuthController::class, 'destroy'])
    ->middleware('auth:patron')
    ->name('biblioteca.logout');

Route::middleware(['auth', 'staff.biblioteca'])
    ->prefix('staff')
    ->name('staff.')
    ->group(function (): void {
        Route::get('/pedidos', [StaffPedidosController::class, 'index'])->name('pedidos.index');
        Route::post('/pedidos/{bookRequest}/aprovar', [StaffPedidosController::class, 'approve'])->name(
            'pedidos.approve',
        );
        Route::post('/pedidos/{bookRequest}/recusar', [StaffPedidosController::class, 'reject'])->name(
            'pedidos.reject',
        );
        Route::post('/leitores', [StaffPatronController::class, 'store'])->name('patrons.store');
    });

Route::middleware('auth:patron')
    ->prefix('biblioteca/conta')
    ->name('biblioteca.conta.')
    ->group(function (): void {
        Route::redirect('/', '/biblioteca/conta/pedidos')->name('index');
        Route::get('/pedidos', [BibliotecaContaController::class, 'pedidos'])->name('pedidos');
        Route::delete('/pedidos/{bookRequest}', [BibliotecaContaController::class, 'cancelPedido'])->name(
            'pedidos.cancel',
        );
        Route::get('/historico', [BibliotecaContaController::class, 'historico'])->name('historico');
        Route::get('/perfil', [BibliotecaContaController::class, 'perfil'])->name('perfil');
        Route::get('/favoritos', [BibliotecaContaController::class, 'favoritos'])->name('favoritos');

        Route::post('/favoritos/{book}', [PatronFavoriteController::class, 'store'])->name('favoritos.store');
        Route::delete('/favoritos/{book}', [PatronFavoriteController::class, 'destroy'])->name('favoritos.destroy');
    });

Route::middleware(['auth:patron', 'patron.librarian.desk'])
    ->prefix('biblioteca/conta/balcao')
    ->name('biblioteca.conta.balcao.')
    ->group(function (): void {
        Route::get('/', [PatronLibrarianDeskController::class, 'index'])->name('index');
        Route::post('/pedidos/{bookRequest}/aprovar', [PatronLibrarianDeskController::class, 'approve'])->name(
            'approve',
        );
        Route::post('/pedidos/{bookRequest}/recusar', [PatronLibrarianDeskController::class, 'reject'])->name(
            'reject',
        );
        Route::post('/pedidos/{bookRequest}/cancelar', [PatronLibrarianDeskController::class, 'cancel'])->name(
            'cancel',
        );
        Route::post('/pedidos/{bookRequest}/nota', [PatronLibrarianDeskController::class, 'updateNote'])->name(
            'note',
        );
        Route::post('/pedidos/{bookRequest}/multa', [PatronLibrarianDeskController::class, 'updateFine'])->name(
            'fine',
        );
        Route::post(
            '/pedidos/{bookRequest}/recalcular-multa',
            [PatronLibrarianDeskController::class, 'recalcFine'],
        )->name('recalc-fine');
        Route::post('/pedidos/{bookRequest}/devolver', [PatronLibrarianDeskController::class, 'markReturned'])->name(
            'return',
        );
        Route::post('/pedidos/{bookRequest}/ocultar', [PatronLibrarianDeskController::class, 'hideFromDesk'])->name(
            'hide',
        );
        Route::get('/livros/novo', [PatronLibrarianBookController::class, 'create'])->name('livros.create');
        Route::post('/livros', [PatronLibrarianBookController::class, 'store'])->name('livros.store');
        Route::get('/livros/{book}/editar', [PatronLibrarianBookController::class, 'edit'])->name('livros.edit');
        Route::put('/livros/{book}', [PatronLibrarianBookController::class, 'update'])->name('livros.update');
    });
