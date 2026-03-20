<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\BookRequest;
use App\Services\BookReturnService;
use App\Services\BookFineCalculator;
use App\Services\GoogleBooksService;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('books:enrich-google {--limit=50 : Máximo de livros a atualizar} {--force : Sobrescrever campos já preenchidos} {--use-title : Tentar enriquecer também por título quando não há ISBN}', function (GoogleBooksService $googleBooks) {
    $limit = (int) $this->option('limit');
    $force = (bool) $this->option('force');
    $useTitle = (bool) $this->option('use-title');

    $query = Book::query();

    if (!$useTitle) {
        $query->whereNotNull('isbn')
            ->where('isbn', '!=', '');
    }

    if (!$force) {
        $query->where(function ($q) {
            $q->whereNull('cover_image')
                ->orWhereNull('description')
                ->orWhereNull('language')
                ->orWhereNull('pages')
                ->orWhereNull('published_year');
        });
    }

    $books = $query->orderByDesc('id')->limit($limit)->get();

    $updated = 0;
    $skipped = 0;
    $failed = 0;

    foreach ($books as $book) {
        $isbn = (string) ($book->isbn ?? '');

        if ($isbn !== '') {
            $data = $googleBooks->getByIsbn($isbn);
        } elseif ($useTitle && !empty($book->title)) {
            // Best-effort: procura por título.
            $q = 'intitle:' . $book->title;
            $data = $googleBooks->getByQuery($q);
        } else {
            $skipped++;
            continue;
        }

        if (!$data) {
            $failed++;
            $label = $isbn !== '' ? "ISBN {$isbn}" : "Título \"{$book->title}\"";
            $this->warn("{$label}: não encontrado na Google Books");
            continue;
        }

        $updates = [];
        $setIf = function (string $field, string $key) use (&$updates, $book, $data, $force) {
            $newValue = $data[$key] ?? null;
            if ($newValue === null || $newValue === '') {
                return;
            }
            $current = $book->{$field};
            if ($force || $current === null || $current === '') {
                $updates[$field] = $newValue;
            }
        };

        $setIf('title', 'title');
        $setIf('description', 'description');
        $setIf('published_year', 'published_year');
        $setIf('pages', 'pages');
        $setIf('cover_image', 'cover');
        $setIf('language', 'language');

        if (!empty($updates)) {
            $book->fill($updates)->save();
        }

        if (!empty($data['authors'])) {
            foreach ($data['authors'] as $authorName) {
                if (!is_string($authorName) || trim($authorName) === '') {
                    continue;
                }
                $author = Author::firstOrCreate(['name' => trim($authorName)]);
                $book->authors()->syncWithoutDetaching([$author->id]);
            }
        }

        if (!empty($data['categories'])) {
            foreach ($data['categories'] as $categoryName) {
                if (!is_string($categoryName) || trim($categoryName) === '') {
                    continue;
                }
                $category = Category::firstOrCreate(['name' => trim($categoryName)]);
                $book->categories()->syncWithoutDetaching([$category->id]);
            }
        }

        if (!empty($data['publisher']) && (is_string($data['publisher']))) {
            $publisher = trim($data['publisher']);
            if ($publisher !== '') {
                $book->details()->updateOrCreate(
                    ['book_id' => $book->id],
                    ['publisher' => $publisher]
                );
            }
        }

        if (!empty($updates) || !empty($data['authors']) || !empty($data['categories']) || !empty($data['publisher'])) {
            $updated++;
        } else {
            $skipped++;
        }
    }

    $this->info("Concluído. Atualizados: {$updated}, sem alterações: {$skipped}, falhas: {$failed}.");
})->purpose('Enriquecer livros com dados da Google Books (por ISBN)');

Artisan::command('book-requests:expire', function () {
    $now = now();
    $expired = BookRequest::query()
        ->where('status', 'created')
        ->where('pickup_deadline', '<', $now)
        ->update([
            'status' => 'expired',
        ]);

    $this->info("Pedidos expirados (prazo de levantamento): {$expired}.");
})->purpose('Marcar pedidos com prazo de levantamento vencido como expirados');

Artisan::command('book-requests:apply-fines', function (BookFineCalculator $calculator) {
    $requests = BookRequest::query()
        ->where('status', 'created')
        ->whereNull('returned_at')
        ->whereNotNull('return_deadline')
        ->where('return_deadline', '<', now())
        ->cursor();

    $updated = 0;

    foreach ($requests as $request) {
        $before = (float) $request->fine_amount;
        $calculator->persistFine($request);
        $request->refresh();

        if ((float) $request->fine_amount !== $before || (float) $request->fine_amount > 0) {
            $updated++;
        }
    }

    $this->info("Multas atualizadas (0,50 €/dia após o prazo): {$updated} pedidos processados.");
})->purpose('Recalcular multas (0,50 € por dia completo em atraso) em pedidos ativos');

Artisan::command('books:mark-returned {book_request : ID do pedido em book_requests}', function (BookReturnService $returns) {
    $id = (int) $this->argument('book_request');
    $req = BookRequest::query()->findOrFail($id);
    $returns->markReturned($req);
    $this->info("Pedido #{$req->id} marcado como devolvido.");
})->purpose('Marcar requisição como devolvida (staff) e notificar favoritos');
