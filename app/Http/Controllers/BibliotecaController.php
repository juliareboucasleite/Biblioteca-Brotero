<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Services\PatronRankingService;
use App\Support\CategoryLabel;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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

        if ($categoriaId !== '') {
            $query->whereHas('categories', function ($q2) use ($categoriaId) {
                $q2->whereKey($categoriaId);
            });
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
                    ->orWhereHas('authors', function ($q3) use ($q) {
                        $q3->where('name', 'like', '%'.$q.'%');
                    });
            });
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

    public function index(Request $request, PatronRankingService $rankingService): Response
    {
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

            [$livrosRecomendados, $recomendadoAutorNome] = $this->livrosRecomendadosPorAutorEmDestaque(
                $booksFeatured,
                12,
            );
        }

        $livrosMaisPedidos = $this->livrosMaisPedidosPorRequisicao(12);

        $rankingCatalogo = $rankingService->topEntries(10);

        $categorias = Category::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $c) => [
                'id' => (string) $c->id,
                'name' => CategoryLabel::toPortuguese((string) $c->name),
            ])
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->all();

        return Inertia::render('library', [
            'livros' => $livros,
            'livrosRecomendados' => $livrosRecomendados,
            'recomendadoAutorNome' => $recomendadoAutorNome,
            'livrosMaisPedidos' => $livrosMaisPedidos,
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

        $categorias = Category::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $c) => [
                'id' => (string) $c->id,
                'name' => CategoryLabel::toPortuguese((string) $c->name),
            ])
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->all();

        return Inertia::render('library-all', [
            'livros' => $livros,
            'categorias' => $categorias,
            'categoriaSelecionada' => $categoriaId ? (string) $categoriaId : null,
            'q' => $q,
            'lingua' => $lingua,
            'autores' => $this->autoresParaFiltro(),
            'authorSelecionado' => $authorId ? (string) $authorId : null,
            'ano' => $ano ? (string) $ano : null,
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
    public function livroShow(Book $book): Response
    {
        $book->loadMissing(['authors']);

        $livro = $this->mapearLivroParaFrontend($book);

        return Inertia::render('library-book', [
            'livro' => $livro,
        ]);
    }

    private function livrosEmDestaque(): array
    {
        return [
            [
                'id' => '01',
                'titulo' => 'Os livros aparecerão aqui',
                'autor' => 'Pesquise para ver resultados',
                'desc' => 'Quando houver resultados de pesquisa, a descrição do livro será mostrada aqui.',
            ],
        ];
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
}
