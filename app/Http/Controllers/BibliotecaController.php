<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Models\Book;
use App\Models\BookShare;
use App\Models\Category;
use App\Models\LibraryPatron;
use App\Services\PatronRankingService;
use App\Support\CategoryLabel;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BibliotecaController extends Controller
{
    /**
     * @return array{0: string|null, 1: string|null, 2: string|null, 3: string|null, 4: string|null}
     */
    private function applyFilters(Request $request, $query): array
    {
        $categoriaId = trim((string) $request->query('categoria', ''));
        $authorId = trim((string) $request->query('author_id', ''));
        $ano = trim((string) $request->query('ano', ''));
        $q = trim((string) $request->query('q', ''));
        $lingua = trim((string) $request->query('lingua', ''));
        $isbn = trim((string) $request->query('isbn', ''));
        $disciplina = trim((string) $request->query('disciplina', ''));
        $anoEscolar = trim((string) $request->query('ano_escolar', ''));

        if ($categoriaId !== '') {
            if ($this->categoryIdIsBestsellersListing($categoriaId)) {
                $query->withCount('bookRequests as requisicoes_count')
                    ->having('requisicoes_count', '>', 0)
                    ->reorder()
                    ->orderByDesc('requisicoes_count')
                    ->orderByDesc('id');
            } else {
                $query->forCatalogCategory($categoriaId);
            }
            if (Book::categoryIdIsRecentBooksListing($categoriaId)) {
                $query->reorder()->orderByDesc('created_at')->orderByDesc('id');
            }
        }

        if ($authorId !== '') {
            $query->whereHas('authors', function ($q2) use ($authorId) {
                $q2->whereKey($authorId);
            });
        }

        if ($ano !== '' && ctype_digit($ano)) {
            $query->where('published_year', (int) $ano);
        }

        if ($lingua !== '') {
            // Guarda no DB como "pt", "pt-BR", "en" etc.
            $query->where('language', 'like', $lingua.'%');
        }

        if ($q !== '') {
            $query->where(function ($q2) use ($q) {
                $q2->where('title', 'like', '%'.$q.'%')
                    ->orWhere('description', 'like', '%'.$q.'%')
                    ->orWhere('isbn', 'like', '%'.$q.'%')
                    ->orWhereHas('authors', function ($q3) use ($q) {
                        $q3->where('name', 'like', '%'.$q.'%');
                    });
            });
        }

        if ($isbn !== '') {
            $query->where('isbn', 'like', '%'.$isbn.'%');
        }

        if ($disciplina !== '') {
            $query->where('school_subject', 'like', '%'.$disciplina.'%');
        }

        if ($anoEscolar !== '') {
            $query->where('school_year', 'like', '%'.$anoEscolar.'%');
        }

        return [
            $categoriaId !== '' ? $categoriaId : null,
            $q !== '' ? $q : null,
            $lingua !== '' ? $lingua : null,
            $authorId !== '' ? $authorId : null,
            $ano !== '' && ctype_digit($ano) ? $ano : null,
        ];
    }

    /**
     * @return list<array{id: string, name: string}>
     */
    private function autoresParaFiltro(): array
    {
        return Author::query()
            ->orderBy('name')
            ->limit(400)
            ->get(['id', 'name'])
            ->map(fn (Author $a) => [
                'id' => (string) $a->id,
                'name' => (string) $a->name,
            ])
            ->values()
            ->all();
    }

    /**
     * Categorias do catálogo: nomes em português, ordem pela taxonomia canónica quando há `slug`.
     *
     * @return list<array{id: string, name: string, slug: string|null}>
     */
    private function categoriasParaCatalogo(?LibraryPatron $patron = null): array
    {
        /** @var list<string> $order */
        $order = config('biblioteca_canonical_categories.order', []);

        $categorias = Category::query()
            ->get(['id', 'name', 'slug'])
            ->map(fn (Category $c): array => [
                'id' => (string) $c->id,
                'name' => CategoryLabel::toPortuguese((string) $c->name),
                'slug' => $c->slug,
            ])
            ->sortBy(function (array $row) use ($order): string {
                $slug = $row['slug'] ?? null;
                $pos = 999;
                if (is_string($slug) && $slug !== '') {
                    $i = array_search($slug, $order, true);
                    if ($i !== false) {
                        $pos = $i;
                    }
                }

                return sprintf('%04d|%s', $pos, (string) $row['name']);
            }, SORT_NATURAL)
            ->values()
            ->all();

        if (! $patron instanceof LibraryPatron) {
            return $categorias;
        }

        $preferidas = $this->categoriaIdsPreferidasDoPatron($patron);
        if ($preferidas === []) {
            return $categorias;
        }

        $preferidasPos = array_flip($preferidas);
        usort($categorias, static function (array $a, array $b) use ($preferidasPos): int {
            $pa = $preferidasPos[$a['id']] ?? null;
            $pb = $preferidasPos[$b['id']] ?? null;

            if ($pa !== null && $pb !== null) {
                return $pa <=> $pb;
            }

            if ($pa !== null) {
                return -1;
            }

            if ($pb !== null) {
                return 1;
            }

            return strcmp((string) $a['name'], (string) $b['name']);
        });

        return array_values($categorias);
    }

    private function categoryIdIsBestsellersListing(string $categoryId): bool
    {
        if (ctype_digit($categoryId) && (int) $categoryId === 67) {
            return true;
        }

        $category = Category::query()->find($categoryId);

        return $category !== null && $category->slug === 'bestsellers';
    }

    public function index(Request $request, PatronRankingService $rankingService): Response
    {
        /** @var LibraryPatron|null $patron */
        $patron = $request->user('patron');
        $livrosQuery = Book::query()
            ->with(['authors'])
            ->latest('id');

        [$categoriaId, $q, $lingua, $authorId, $ano] = $this->applyFilters($request, $livrosQuery);

        $booksFeatured = (clone $livrosQuery)->take(10)->get();

        $livrosRecomendados = [];
        $recomendadoAutorNome = null;

        if ($booksFeatured->isEmpty()) {
            $livros = $this->livrosEmDestaque();
        } else {
            $livros = $booksFeatured
                ->map($this->mapearLivroParaFrontend(...))
                ->values()
                ->all();

            if ($patron instanceof LibraryPatron) {
                $excludeIds = $booksFeatured->pluck('id')->filter()->map(static fn ($id): int => (int) $id)->all();
                $livrosRecomendados = $this->livrosRecomendadosParaPatron($patron, $excludeIds, 12);
                $recomendadoAutorNome = $livrosRecomendados !== [] ? 'Com base nos seus guardados' : null;
            }

            if ($livrosRecomendados === []) {
                [$livrosRecomendados, $recomendadoAutorNome] = $this->livrosRecomendadosPorAutorEmDestaque(
                    $booksFeatured,
                    12,
                );
            }
        }

        $livrosMaisPedidos = $this->livrosMaisPedidosPorRequisicao(12);
        $livrosEmLeitura = $patron instanceof LibraryPatron
            ? $this->livrosEmLeituraParaPatron($patron, 12)
            : [];

        $rankingCatalogo = $rankingService->topEntries(10);

        $categorias = $this->categoriasParaCatalogo($patron);

        return Inertia::render('library', [
            'livros' => $livros,
            'livrosRecomendados' => $livrosRecomendados,
            'recomendadoAutorNome' => $recomendadoAutorNome,
            'livrosMaisPedidos' => $livrosMaisPedidos,
            'livrosEmLeitura' => $livrosEmLeitura,
            'categorias' => $categorias,
            'categoriaSelecionada' => $categoriaId ? (string) $categoriaId : null,
            'q' => $q,
            'lingua' => $lingua,
            'autores' => $this->autoresParaFiltro(),
            'authorSelecionado' => $authorId ? (string) $authorId : null,
            'ano' => $ano ? (string) $ano : null,
            'rankingCatalogo' => $rankingCatalogo,
        ]);
    }

    public function livros(Request $request): Response
    {
        /** @var LibraryPatron|null $patron */
        $patron = $request->user('patron');
        $livrosQuery = Book::query()
            ->with(['authors'])
            ->latest('id');

        [$categoriaId, $q, $lingua, $authorId, $ano] = $this->applyFilters($request, $livrosQuery);

        $livros = $livrosQuery
            ->get()
            ->map($this->mapearLivroParaFrontend(...))
            ->values()
            ->all();

        if (empty($livros)) {
            $livros = $this->livrosEmDestaque();
        }

        $categorias = $this->categoriasParaCatalogo($patron);

        $livrosRecentesCategoria = [];
        $livrosMaisPedidosCategoria = [];
        $livrosRecomendadosCategoria = [];

        if ($categoriaId !== null) {
            $cid = (string) $categoriaId;

            $livrosRecentesCategoria = Book::query()
                ->with(['authors'])
                ->forCatalogCategory($cid)
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->limit(12)
                ->get()
                ->map($this->mapearLivroParaFrontend(...))
                ->values()
                ->all();

            $livrosMaisPedidosCategoria = $this->categoryIdIsBestsellersListing($cid)
                ? $this->livrosMaisPedidosPorRequisicao(12)
                : Book::query()
                    ->with(['authors'])
                    ->withCount('bookRequests as requisicoes_count')
                    ->forCatalogCategory($cid)
                    ->having('requisicoes_count', '>', 0)
                    ->orderByDesc('requisicoes_count')
                    ->orderByDesc('id')
                    ->limit(12)
                    ->get()
                    ->map(function (Book $book): array {
                        $row = $this->mapearLivroParaFrontend($book);
                        $row['requisicoes_count'] = (int) ($book->requisicoes_count ?? 0);

                        return $row;
                    })
                    ->values()
                    ->all();

            $excludeIdsCategoria = array_map(static fn (array $row): int => (int) ($row['id'] ?? 0), $livrosRecentesCategoria);
            $livrosRecomendadosCategoria = $patron instanceof LibraryPatron
                ? $this->livrosRecomendadosCategoriaParaPatron($patron, $cid, $excludeIdsCategoria, 12)
                : [];

            if ($livrosRecomendadosCategoria === []) {
                $livrosRecomendadosCategoria = Book::query()
                    ->with(['authors'])
                    ->forCatalogCategory($cid)
                    ->whereNotIn('id', $excludeIdsCategoria)
                    ->inRandomOrder()
                    ->limit(12)
                    ->get()
                    ->map($this->mapearLivroParaFrontend(...))
                    ->values()
                    ->all();
            }
        }

        return Inertia::render('library-all', [
            'livros' => $livros,
            'categorias' => $categorias,
            'categoriaSelecionada' => $categoriaId ? (string) $categoriaId : null,
            'q' => $q,
            'lingua' => $lingua,
            'autores' => $this->autoresParaFiltro(),
            'authorSelecionado' => $authorId ? (string) $authorId : null,
            'ano' => $ano ? (string) $ano : null,
            'livrosRecentesCategoria' => $livrosRecentesCategoria,
            'livrosMaisPedidosCategoria' => $livrosMaisPedidosCategoria,
            'livrosRecomendadosCategoria' => $livrosRecomendadosCategoria,
        ]);
    }

    /**
     * Página de detalhe e requisição de um livro
     * Futuro: $livro = Livro::findOrFail($id)
     */
    public function livro(Request $request): Response
    {
        $livro = [
            'id' => $request->query('id', '01'),
            'titulo' => $request->query('titulo', 'Título do livro'),
            'autor' => $request->query('autor', 'Autor'),
            'desc' => $request->query('desc', 'Descrição do livro aparecerá aqui.'),
            'capa' => $request->query('capa'),
        ];

        return Inertia::render('library-book', [
            'livro' => $livro,
        ]);
    }

    /**
     * Ficha completa do livro por ID (slug de rota).
     */
    public function livroShow(Request $request, Book $book): Response
    {
        $book->loadMissing(['authors']);

        $livro = $this->mapearLivroParaFrontend($book);

        $patronShare = null;
        $patron = $request->user('patron');

        if ($patron instanceof LibraryPatron) {
            $row = BookShare::query()
                ->where('library_patron_id', $patron->id)
                ->where('book_id', $book->id)
                ->first();

            if ($row !== null) {
                $patronShare = [
                    'id' => $row->id,
                    'message' => $row->message,
                ];
            }
        }

        return Inertia::render('library-book', [
            'livro' => $livro,
            'patron_share' => $patronShare,
        ]);
    }

    private function livrosEmDestaque(): array
    {
        return [];
    }

    /**
     * @param  Collection<int, Book>  $booksFeatured
     * @return array{0: array<int, array<string, mixed>>, 1: string|null}
     */
    private function livrosRecomendadosPorAutorEmDestaque(Collection $booksFeatured, int $limit = 12): array
    {
        $authorCounts = [];

        foreach ($booksFeatured as $book) {
            foreach ($book->authors ?? [] as $author) {
                $authorId = $author->id;

                if (! isset($authorCounts[$authorId])) {
                    $authorCounts[$authorId] = [
                        'count' => 0,
                        'name' => (string) ($author->name ?? ''),
                    ];
                }

                $authorCounts[$authorId]['count']++;
            }
        }

        if ($authorCounts === []) {
            return [[], null];
        }

        $topAuthorId = null;
        $topCount = -1;

        foreach ($authorCounts as $authorId => $meta) {
            $count = $meta['count'];

            if ($count > $topCount || ($count === $topCount && ($topAuthorId === null || $authorId < $topAuthorId))) {
                $topCount = $count;
                $topAuthorId = $authorId;
            }
        }

        $topName = trim((string) ($authorCounts[$topAuthorId]['name'] ?? ''));
        $topName = $topName !== '' ? $topName : null;

        $excludeIds = $booksFeatured->pluck('id')->filter()->all();

        $more = Book::query()
            ->with(['authors'])
            ->when($excludeIds !== [], fn ($q) => $q->whereKeyNot($excludeIds))
            ->whereHas('authors', function ($q) use ($topAuthorId): void {
                $q->whereKey($topAuthorId);
            })
            ->latest('id')
            ->limit(min($limit, 50))
            ->get()
            ->map($this->mapearLivroParaFrontend(...))
            ->values()
            ->all();

        return [$more, $topName];
    }

    /**
     * @return array{id: string, titulo: string, autor: string, desc: string, capa: string|null}
     */
    private function mapearLivroParaFrontend(Book $book): array
    {
        return [
            'id' => (string) $book->id,
            'titulo' => (string) ($book->title ?? ''),
            'autor' => $book->authors?->pluck('name')->filter()->implode(', ') ?: 'Autor desconhecido',
            'desc' => (string) ($book->description ?? ''),
            'capa' => $book->cover_image ? (string) $book->cover_image : null,
            'tem_ebook' => $book->hasEbook() && $book->ebookFormat() !== null,
        ];
    }

    /**
     * Livros ordenados pelo número de requisições (todos os pedidos em book_requests com book_id).
     *
     * @return array<int, array<string, mixed>>
     */
    private function livrosMaisPedidosPorRequisicao(int $limit = 12): array
    {
        $cap = min(max($limit, 1), 50);

        $books = Book::query()
            ->with(['authors'])
            ->withCount('bookRequests as requisicoes_count')
            ->having('requisicoes_count', '>', 0)
            ->orderByDesc('requisicoes_count')
            ->orderByDesc('id')
            ->limit($cap)
            ->get();

        return $books
            ->map(function (Book $book): array {
                $row = $this->mapearLivroParaFrontend($book);

                $row['requisicoes_count'] = (int) ($book->requisicoes_count ?? 0);

                return $row;
            })
            ->values()
            ->all();
    }

    /**
     * Livros com progresso de leitura para mostrar "retomar".
     *
     * @return array<int, array<string, mixed>>
     */
    private function livrosEmLeituraParaPatron(LibraryPatron $patron, int $limit = 12): array
    {
        $cap = min(max($limit, 1), 50);

        $bookIds = DB::table('patron_reading_list_books as prlb')
            ->join('patron_reading_lists as prl', 'prl.id', '=', 'prlb.patron_reading_list_id')
            ->where('prl.library_patron_id', $patron->id)
            ->where('prlb.progress_percent', '>', 0)
            ->where('prlb.progress_percent', '<', 100)
            ->orderByDesc('prlb.updated_at')
            ->orderByDesc('prlb.id')
            ->limit($cap * 2)
            ->pluck('prlb.book_id')
            ->map(static fn ($id): int => (int) $id)
            ->values()
            ->all();

        if ($bookIds === []) {
            return [];
        }

        $bookIds = array_values(array_unique($bookIds));

        $books = Book::query()
            ->with(['authors'])
            ->whereIn('id', $bookIds)
            ->get()
            ->keyBy('id');

        $rows = [];
        foreach ($bookIds as $bookId) {
            $book = $books->get($bookId);
            if (! $book instanceof Book) {
                continue;
            }

            $rows[] = $this->mapearLivroParaFrontend($book);
            if (count($rows) >= $cap) {
                break;
            }
        }

        return $rows;
    }

    /**
     * IDs de categorias mais presentes em livros guardados/progresso do leitor.
     *
     * @return list<string>
     */
    private function categoriaIdsPreferidasDoPatron(LibraryPatron $patron, int $limit = 8): array
    {
        $bookIds = $this->bookIdsSinalDoPatron($patron, 120);
        if ($bookIds === []) {
            return [];
        }

        return Category::query()
            ->select('categories.id')
            ->join('book_category', 'book_category.category_id', '=', 'categories.id')
            ->whereIn('book_category.book_id', $bookIds)
            ->groupBy('categories.id')
            ->orderByRaw('COUNT(*) DESC')
            ->orderBy('categories.id')
            ->limit(min(max($limit, 1), 20))
            ->pluck('categories.id')
            ->map(static fn ($id): string => (string) $id)
            ->values()
            ->all();
    }

    /**
     * Recomendações gerais para home por preferência de categorias do leitor.
     *
     * @param  list<int>  $excludeBookIds
     * @return array<int, array<string, mixed>>
     */
    private function livrosRecomendadosParaPatron(LibraryPatron $patron, array $excludeBookIds = [], int $limit = 12): array
    {
        $categoryIds = $this->categoriaIdsPreferidasDoPatron($patron, 5);
        if ($categoryIds === []) {
            return [];
        }

        $bookIdsSinal = $this->bookIdsSinalDoPatron($patron, 120);
        $excludeIds = array_values(array_unique(array_filter(array_merge($excludeBookIds, $bookIdsSinal))));

        return Book::query()
            ->with(['authors'])
            ->whereHas('categories', function ($q) use ($categoryIds): void {
                $q->whereIn('categories.id', $categoryIds);
            })
            ->when($excludeIds !== [], static function ($q) use ($excludeIds): void {
                $q->whereNotIn('books.id', $excludeIds);
            })
            ->latest('id')
            ->limit(min(max($limit, 1), 50))
            ->get()
            ->map($this->mapearLivroParaFrontend(...))
            ->values()
            ->all();
    }

    /**
     * Recomendações dentro da categoria atual usando guardados/progresso do leitor.
     *
     * @param  list<int>  $excludeBookIds
     * @return array<int, array<string, mixed>>
     */
    private function livrosRecomendadosCategoriaParaPatron(LibraryPatron $patron, string $categoriaId, array $excludeBookIds = [], int $limit = 12): array
    {
        $bookIdsSinal = $this->bookIdsSinalDoPatron($patron, 180);
        if ($bookIdsSinal === []) {
            return [];
        }

        $authorIds = Author::query()
            ->select('authors.id')
            ->join('book_author', 'book_author.author_id', '=', 'authors.id')
            ->whereIn('book_author.book_id', $bookIdsSinal)
            ->groupBy('authors.id')
            ->orderByRaw('COUNT(*) DESC')
            ->limit(20)
            ->pluck('authors.id')
            ->all();

        return Book::query()
            ->with(['authors'])
            ->forCatalogCategory($categoriaId)
            ->when($excludeBookIds !== [], static function ($q) use ($excludeBookIds): void {
                $q->whereNotIn('books.id', $excludeBookIds);
            })
            ->when($bookIdsSinal !== [], static function ($q) use ($bookIdsSinal): void {
                $q->whereNotIn('books.id', $bookIdsSinal);
            })
            ->when($authorIds !== [], function ($q) use ($authorIds): void {
                $q->whereHas('authors', function ($q2) use ($authorIds): void {
                    $q2->whereIn('authors.id', $authorIds);
                });
            })
            ->latest('id')
            ->limit(min(max($limit, 1), 50))
            ->get()
            ->map($this->mapearLivroParaFrontend(...))
            ->values()
            ->all();
    }

    /**
     * Livros guardados e com interação recente (favoritos + listas com progresso).
     *
     * @return list<int>
     */
    private function bookIdsSinalDoPatron(LibraryPatron $patron, int $limit = 150): array
    {
        $cap = min(max($limit, 1), 400);

        $favoritos = DB::table('book_favorites')
            ->where('library_patron_id', $patron->id)
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->limit($cap)
            ->pluck('book_id')
            ->map(static fn ($id): int => (int) $id)
            ->all();

        $listas = DB::table('patron_reading_list_books as prlb')
            ->join('patron_reading_lists as prl', 'prl.id', '=', 'prlb.patron_reading_list_id')
            ->where('prl.library_patron_id', $patron->id)
            ->orderByRaw('CASE WHEN prlb.progress_percent > 0 THEN 0 ELSE 1 END')
            ->orderByDesc('prlb.updated_at')
            ->orderByDesc('prlb.id')
            ->limit($cap)
            ->pluck('prlb.book_id')
            ->map(static fn ($id): int => (int) $id)
            ->all();

        return array_values(array_unique(array_merge($favoritos, $listas)));
    }
}
