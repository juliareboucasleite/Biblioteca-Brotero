<?php

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
