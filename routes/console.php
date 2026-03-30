<?php

use App\Models\Author;
use App\Models\Book;
use App\Models\BookRequest;
use App\Models\Category;
use App\Services\BookFineCalculator;
use App\Services\BookReturnService;
use App\Services\GoogleBooksService;
use App\Support\BookCatalogLanguage;
use App\Support\BookSynopsisPatches;
use App\Support\CatalogTaxonomyNormalizer;
use App\Support\SchoolLocationNormalizer;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('books:enrich-google {--limit=50 : Máximo de livros a atualizar} {--force : Sobrescrever campos já preenchidos} {--use-title : Tentar enriquecer também por título quando não há ISBN} {--only-corrupted : Só livros com "?" em título, descrição ou língua (importação UTF-8 falhada)} {--ids= : Apenas estes IDs de livros (separados por vírgula)}', function (GoogleBooksService $googleBooks) {
    $limit = (int) $this->option('limit');
    $force = (bool) $this->option('force');
    $useTitle = (bool) $this->option('use-title');
    $onlyCorrupted = (bool) $this->option('only-corrupted');
    $idList = array_values(array_filter(array_map(static function (string $v): int {
        return (int) trim($v);
    }, explode(',', (string) $this->option('ids'))), static fn (int $v): bool => $v > 0));

    $query = Book::query();

    if ($idList !== []) {
        $query->whereIn('id', $idList);
    } else {
        if ($onlyCorrupted) {
            $query->where(function ($q) {
                $q->where('title', 'like', '%?%')
                    ->orWhere('description', 'like', '%?%')
                    ->orWhere('language', 'like', '%?%');
            });
        }

        if (! $useTitle) {
            $query->whereNotNull('isbn')
                ->where('isbn', '!=', '');
        }

        if (! $force && ! $onlyCorrupted) {
            $query->where(function ($q) {
                $q->whereNull('cover_image')
                    ->orWhereNull('description')
                    ->orWhereNull('language')
                    ->orWhereNull('pages')
                    ->orWhereNull('published_year');
            });
        }
    }

    $books = $query->orderByDesc('id')->limit($limit)->get();

    $updated = 0;
    $skipped = 0;
    $failed = 0;

    foreach ($books as $book) {
        $isbn = (string) ($book->isbn ?? '');

        if ($isbn !== '') {
            $data = $googleBooks->getByIsbn($isbn);
        } elseif ($useTitle && ! empty($book->title)) {
            // Best-effort: procura por título.
            $q = 'intitle:'.$book->title;
            $data = $googleBooks->getByQuery($q);
        } else {
            $skipped++;

            continue;
        }

        if ($data !== null && is_string($book->title) && trim($book->title) !== '') {
            $data = $googleBooks->fillMissingDescription($data, $book->title, $isbn !== '' ? $isbn : null);
        }

        if (! $data) {
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

        $setTextHealing = function (string $field, string $key) use (&$updates, $book, $data): void {
            $newValue = $data[$key] ?? null;
            if (! is_string($newValue) || $newValue === '') {
                return;
            }
            if (str_contains($newValue, '?')) {
                return;
            }
            $current = (string) ($book->{$field} ?? '');
            if ($current === '' || str_contains($current, '?')) {
                $updates[$field] = $newValue;
            }
        };

        if ($onlyCorrupted) {
            $setTextHealing('title', 'title');
            $setTextHealing('description', 'description');
            $rawLang = $data['language'] ?? null;
            $mappedLang = BookCatalogLanguage::fromGoogleCode(is_string($rawLang) ? $rawLang : null)
                ?? (is_string($rawLang) ? $rawLang : null);
            if (is_string($mappedLang) && $mappedLang !== '') {
                $currentLang = (string) ($book->language ?? '');
                if ($currentLang === '' || str_contains($currentLang, '?')) {
                    $updates['language'] = $mappedLang;
                }
            }
            if ($force) {
                $setIf('published_year', 'published_year');
                $setIf('pages', 'pages');
                $setIf('cover_image', 'cover');
            }
        } else {
            $setIf('title', 'title');
            $setIf('description', 'description');
            $setIf('published_year', 'published_year');
            $setIf('pages', 'pages');
            $setIf('cover_image', 'cover');
            $rawLang = $data['language'] ?? null;
            $mappedLang = BookCatalogLanguage::fromGoogleCode(is_string($rawLang) ? $rawLang : null)
                ?? (is_string($rawLang) ? $rawLang : null);
            if ($mappedLang !== null && $mappedLang !== '') {
                $data = array_merge($data, ['language' => $mappedLang]);
            }
            $setIf('language', 'language');
        }

        if (! empty($updates)) {
            $book->fill($updates)->save();
        }

        if (! empty($data['authors'])) {
            foreach ($data['authors'] as $authorName) {
                if (! is_string($authorName) || trim($authorName) === '') {
                    continue;
                }
                $author = Author::firstOrCreate(['name' => trim($authorName)]);
                $book->authors()->syncWithoutDetaching([$author->id]);
            }
        }

        if (! empty($data['categories'])) {
            foreach ($data['categories'] as $categoryName) {
                if (! is_string($categoryName) || trim($categoryName) === '') {
                    continue;
                }
                $category = Category::firstOrCreate(['name' => trim($categoryName)]);
                $book->categories()->syncWithoutDetaching([$category->id]);
            }
        }

        if (! empty($data['publisher']) && (is_string($data['publisher']))) {
            $publisher = trim($data['publisher']);
            if ($publisher !== '') {
                $book->details()->updateOrCreate(
                    ['book_id' => $book->id],
                    ['publisher' => $publisher]
                );
            }
        }

        if (! empty($updates) || ! empty($data['authors']) || ! empty($data['categories']) || ! empty($data['publisher'])) {
            $updated++;
        } else {
            $skipped++;
        }
    }

    $this->info("Concluído. Atualizados: {$updated}, sem alterações: {$skipped}, falhas: {$failed}.");
})->purpose('Enriquecer livros com dados da Google Books (por ISBN)');

Artisan::command('books:apply-synopsis-patches', function () {
    $patches = BookSynopsisPatches::all();
    $n = 0;
    foreach ($patches as $id => $text) {
        $updated = Book::query()->whereKey($id)->update(['description' => $text]);
        if ($updated > 0) {
            $n++;
        }
    }
    $this->info("Sinopses aplicadas: {$n} livro(s).");
})->purpose('Aplicar sinopses UTF-8 manuais (quando a Google Books não tem texto fiável)');

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

Artisan::command('catalog:normalize-entities {--dry-run : Mostrar estatísticas sem alterar a base de dados}', function () {
    $dry = (bool) $this->option('dry-run');

    if ($dry) {
        $this->warn('Modo dry-run: nenhuma alteração será gravada.');
    }

    $a = CatalogTaxonomyNormalizer::mergeAuthors($dry);
    $this->info('Autores:');
    $this->table(
        ['Métrica', 'Valor'],
        [
            ['Registos duplicados removidos', (string) $a['duplicate_records_removed']],
            ['Ligações livro↔autor ajustadas', (string) $a['pivot_links_touched']],
            ['Nomes normalizados', (string) $a['display_names_updated']],
        ],
    );

    $c = CatalogTaxonomyNormalizer::mergeCategories($dry);
    $this->info('Categorias:');
    $this->table(
        ['Métrica', 'Valor'],
        [
            ['Registos duplicados removidos', (string) $c['duplicate_records_removed']],
            ['Ligações livro↔categoria ajustadas', (string) $c['pivot_links_touched']],
            ['Nomes normalizados', (string) $c['display_names_updated']],
        ],
    );

    if ($dry) {
        $this->comment('Execute sem --dry-run para aplicar.');
    }
})->purpose('Fundir autores/categorias duplicados e corrigir maiúsculas (autores: chave canónica + erros próximos Levenshtein≤1 em chaves ≥8 caracteres)');

Artisan::command('book-requests:normalize-school-locations', function () {
    $n = 0;

    foreach (BookRequest::query()->whereNotNull('school_location')->cursor() as $req) {
        $before = (string) $req->school_location;
        $after = SchoolLocationNormalizer::fix($before);

        if ($after !== null && $after !== $before) {
            $req->forceFill(['school_location' => $after])->save();
            $n++;
        }
    }

    $this->info("Registos de pedidos atualizados (campo escola): {$n}.");
})->purpose('Corrigir caracteres incorrectos em book_requests.school_location (ex.: ? em vez de acentos)');
