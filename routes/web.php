<?php

use App\Http\Controllers\Biblioteca\BibliotecaContaController;
use App\Http\Controllers\Biblioteca\BookEbookReaderController;
use App\Http\Controllers\Biblioteca\BookShareController;
use App\Http\Controllers\Biblioteca\LibraryPatronAuthController;
use App\Http\Controllers\Biblioteca\PatronChatController;
use App\Http\Controllers\Biblioteca\PatronFavoriteController;
use App\Http\Controllers\Biblioteca\PatronLibrarianBookController;
use App\Http\Controllers\Biblioteca\PatronLibrarianDeskController;
use App\Http\Controllers\Biblioteca\PatronPeerProfileController;
use App\Http\Controllers\Biblioteca\PatronPeerSafetyController;
use App\Http\Controllers\Biblioteca\PatronReadingListController;
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
Route::get('/biblioteca/descobertas', [BookShareController::class, 'index'])->name('biblioteca.descobertas.index');
Route::get('/biblioteca/livro/{book}', [BibliotecaController::class, 'livroShow'])->name('biblioteca.livro.show');
Route::get('/biblioteca/livro', [BibliotecaController::class, 'livro'])->name('biblioteca.livro');
Route::post('/books/isbn', [BookController::class, 'storeFromIsbn']);
Route::get('/books/{id}/details', [BookController::class, 'showDetails']);
Route::post('/biblioteca/requisitar', [BookRequestController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class])
    ->middleware('throttle:20,1')
    ->name('biblioteca.requisitar');

/*
|--------------------------------------------------------------------------
| Leitor (quiosque): cartão + data de nascimento
|--------------------------------------------------------------------------
*/
Route::middleware('guest:patron')->group(function (): void {
    Route::get('/biblioteca/entrar', [LibraryPatronAuthController::class, 'create'])
        ->name('biblioteca.login');
    Route::post('/biblioteca/entrar', [LibraryPatronAuthController::class, 'store'])->middleware('throttle:10,1');
    Route::get('/biblioteca/entrar/modo', [LibraryPatronAuthController::class, 'choosePortalMode'])
        ->name('biblioteca.login.portal');
    Route::post('/biblioteca/entrar/modo', [LibraryPatronAuthController::class, 'completePortalMode'])->middleware('throttle:12,1');
});

Route::post('/biblioteca/sair', [LibraryPatronAuthController::class, 'destroy'])
    ->middleware('auth:patron')
    ->name('biblioteca.logout');
Route::post('/biblioteca/modo', [LibraryPatronAuthController::class, 'switchPortalMode'])
    ->middleware(['auth:patron', 'throttle:20,1'])
    ->name('biblioteca.portal-mode.switch');

Route::middleware('auth:patron')->group(function (): void {
    Route::get('/biblioteca/livro/{book}/ler', [BookEbookReaderController::class, 'show'])->name('biblioteca.livro.ler');
    Route::post('/biblioteca/livro/{book}/ebook/registar-download', [BookEbookReaderController::class, 'registarDownload'])
        ->name('biblioteca.livro.ebook.registar-download');
    Route::get('/biblioteca/livro/{book}/ebook', [BookEbookReaderController::class, 'stream'])->name(
        'biblioteca.livro.ebook',
    );
    Route::post('/biblioteca/descobertas', [BookShareController::class, 'store'])->name('biblioteca.descobertas.store');
    Route::delete('/biblioteca/descobertas/{book_share}', [BookShareController::class, 'destroy'])->name(
        'biblioteca.descobertas.destroy',
    );
});

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
        Route::middleware('patron.community.mode')->group(function (): void {
            Route::middleware('patron.role:student,teacher,staff')->group(function (): void {
                Route::get('/favoritos', [BibliotecaContaController::class, 'favoritos'])->name('favoritos');

                Route::get('/leitores/{library_patron}', [PatronPeerProfileController::class, 'show'])->name('leitor.perfil');
                Route::post('/leitores/{library_patron}/denunciar', [PatronPeerSafetyController::class, 'report'])->name(
                    'leitor.denunciar',
                );
                Route::post('/leitores/{library_patron}/bloquear', [PatronPeerSafetyController::class, 'block'])->name(
                    'leitor.bloquear',
                );

                Route::get('/mensagens', [PatronChatController::class, 'index'])->name('mensagens.index');
                Route::post('/mensagens/abrir', [PatronChatController::class, 'open'])->middleware('throttle:20,1')->name('mensagens.open');
                Route::get('/mensagens/{patron_conversation}/livros-pesquisa', [PatronChatController::class, 'searchBooksForShare'])->name(
                    'mensagens.livros-pesquisa',
                );
                Route::post('/mensagens/{patron_conversation}/partilhar-livro', [PatronChatController::class, 'shareBook'])->name(
                    'mensagens.partilhar-livro',
                );
                Route::get('/mensagens/{patron_conversation}', [PatronChatController::class, 'show'])->name(
                    'mensagens.show',
                );
                Route::post('/mensagens/{patron_conversation}', [PatronChatController::class, 'store'])->middleware('throttle:40,1')->name(
                    'mensagens.store',
                );
                Route::post('/mensagens/{patron_conversation}/aceitar', [PatronChatController::class, 'accept'])->name(
                    'mensagens.accept',
                );
                Route::post('/mensagens/{patron_conversation}/recusar', [PatronChatController::class, 'decline'])->name(
                    'mensagens.decline',
                );
                Route::post('/mensagens/{patron_conversation}/cancelar-pedido', [PatronChatController::class, 'cancel'])->name(
                    'mensagens.cancel',
                );

                Route::post('/favoritos/{book}', [PatronFavoriteController::class, 'store'])->name('favoritos.store');
                Route::delete('/favoritos/{book}', [PatronFavoriteController::class, 'destroy'])->name('favoritos.destroy');
                Route::post('/listas', [PatronReadingListController::class, 'store'])->name('listas.store');
                Route::post('/listas/livros/{book}', [PatronReadingListController::class, 'storeBook'])->name('listas.livros.store');
                Route::patch('/listas/{readingList}/livros/{book}/progresso', [PatronReadingListController::class, 'updateBookProgress'])->name(
                    'listas.livros.progress',
                );
                Route::delete('/listas/{readingList}/livros/{book}', [PatronReadingListController::class, 'destroyBook'])->name(
                    'listas.livros.destroy',
                );
                Route::post('/listas/importar-partilha', [PatronReadingListController::class, 'importShared'])->name(
                    'listas.import.shared',
                );
                Route::middleware('patron.role:teacher')->group(function (): void {
                    Route::post('/listas/{readingList}/partilhar', [PatronReadingListController::class, 'share'])->name(
                        'listas.share',
                    );
                    Route::post('/listas/{readingList}/reservar', [PatronReadingListController::class, 'reserve'])->name(
                        'listas.reserve',
                    );
                });
            });
        });
    });

Route::middleware(['auth:patron', 'patron.role:staff', 'patron.librarian.desk'])
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
        Route::post('/scan', [PatronLibrarianDeskController::class, 'quickScan'])->middleware('throttle:80,1')->name('scan');
        Route::get('/exportar', [PatronLibrarianDeskController::class, 'exportCsv'])->name('export');
        Route::get('/livros/novo', [PatronLibrarianBookController::class, 'create'])->name('livros.create');
        Route::post('/livros', [PatronLibrarianBookController::class, 'store'])->name('livros.store');
        Route::get('/livros/importar', [PatronLibrarianBookController::class, 'importPage'])->name('livros.import.page');
        Route::post('/livros/importar', [PatronLibrarianBookController::class, 'importBatch'])->name('livros.import.store');
        Route::get('/livros/{book}/editar', [PatronLibrarianBookController::class, 'edit'])->name('livros.edit');
        Route::put('/livros/{book}', [PatronLibrarianBookController::class, 'update'])->name('livros.update');
    });
