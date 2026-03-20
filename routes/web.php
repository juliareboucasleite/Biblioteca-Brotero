<?php

use App\Http\Controllers\Biblioteca\BibliotecaContaController;
use App\Http\Controllers\Biblioteca\LibraryPatronAuthController;
use App\Http\Controllers\BibliotecaController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BookRequestController;

// Home da aplicação: redireciona sempre para a Biblioteca (React)
Route::redirect('/', '/biblioteca')->name('home');
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);

// Biblioteca Brotero: catálogo e página do livro (React + Inertia)
Route::get('/biblioteca', [BibliotecaController::class, 'index'])->name('biblioteca.index');
Route::get('/biblioteca/livros', [BibliotecaController::class, 'livros'])->name('biblioteca.livros');
Route::get('/biblioteca/livro', [BibliotecaController::class, 'livro'])->name('biblioteca.livro');
Route::post('/books/isbn', [BookController::class, 'storeFromIsbn']);
Route::get('/books/{id}/details', [BookController::class, 'showDetails']);
Route::post('/biblioteca/requisitar', [BookRequestController::class, 'store'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
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
});

Route::post('/biblioteca/sair', [LibraryPatronAuthController::class, 'destroy'])
    ->middleware('auth:patron')
    ->name('biblioteca.logout');

Route::middleware('auth:patron')
    ->prefix('biblioteca/conta')
    ->name('biblioteca.conta.')
    ->group(function (): void {
        Route::redirect('/', '/biblioteca/conta/pedidos')->name('index');
        Route::get('/pedidos', [BibliotecaContaController::class, 'pedidos'])->name('pedidos');
        Route::get('/historico', [BibliotecaContaController::class, 'historico'])->name('historico');
        Route::get('/perfil', [BibliotecaContaController::class, 'perfil'])->name('perfil');
    });
