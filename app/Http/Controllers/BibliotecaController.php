<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Book;
use App\Models\Category;

/**
 * Catálogo e página de detalhe do livro (Biblioteca Brotero)
 * Quando a base de dados estiver disponível, substituir $livros e $livro
 * por dados do Eloquent (ex.: Livro::all(), Livro::find($id)).
 */
class BibliotecaController extends Controller
{
    private function applyFilters(Request $request, $query)
    {
        $categoriaId = trim((string) $request->query('categoria', ''));
        $q = trim((string) $request->query('q', ''));
        $lingua = trim((string) $request->query('lingua', ''));

        if ($categoriaId !== '') {
            $query->whereHas('categories', function ($q2) use ($categoriaId) {
                $q2->whereKey($categoriaId);
            });
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

        return [$categoriaId !== '' ? $categoriaId : null, $q !== '' ? $q : null, $lingua !== '' ? $lingua : null];
    }
    /**
     * Listagem do catálogo (index da biblioteca)
     * Futuro: Livro::query()->when($filtros)->paginate().
     */
    public function index(Request $request): Response
    {
        $livrosQuery = Book::query()
            ->with(['authors'])
            ->latest('id');

        [$categoriaId, $q, $lingua] = $this->applyFilters($request, $livrosQuery);

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

        $categorias = Category::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $c) => ['id' => (string) $c->id, 'name' => (string) $c->name])
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
        ]);
    }

    public function livros(Request $request): Response
    {
        $livrosQuery = Book::query()
            ->with(['authors'])
            ->latest('id');

        [$categoriaId, $q, $lingua] = $this->applyFilters($request, $livrosQuery);

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
            ->map(fn (Category $c) => ['id' => (string) $c->id, 'name' => (string) $c->name])
            ->values()
            ->all();

        return Inertia::render('library-all', [
            'livros' => $livros,
            'categorias' => $categorias,
            'categoriaSelecionada' => $categoriaId ? (string) $categoriaId : null,
            'q' => $q,
            'lingua' => $lingua,
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

        $categorias = Category::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $c) => ['id' => (string) $c->id, 'name' => (string) $c->name])
            ->values()
            ->all();

        return Inertia::render('library-book', [
            'livro' => $livro,
            'categorias' => $categorias,
        ]);
    }

    /**
     * Dados estáticos até existir base de dados
     * Depois: return Livro::novos()->limit(12)->get(); entre outros
     */
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
