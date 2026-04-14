<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Services\GoogleBooksService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $limit = (int) $request->query('limit', 0);
        $categoriaId = $request->query('categoria');
        $authorId = trim((string) $request->query('author_id', ''));
        $ano = trim((string) $request->query('ano', ''));
        $q = trim((string) $request->query('q', ''));
        $lingua = trim((string) $request->query('lingua', ''));
        $isbn = trim((string) $request->query('isbn', ''));
        $disciplina = trim((string) $request->query('disciplina', ''));
        $anoEscolar = trim((string) $request->query('ano_escolar', ''));

        $query = Book::query()
            ->with(['authors', 'categories', 'details'])
            ->latest('id');

        if (! empty($categoriaId)) {
            $cid = (string) $categoriaId;
            $query->forCatalogCategory($cid);
            if (Book::categoryIdIsRecentBooksListing($cid)) {
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

        if ($limit > 0) {
            $query->limit(min($limit, 200));
        }

        return $query->get();
    }

    /**
     * Pesquisa avançada (filtros composáveis): devolve o mesmo formato JSON que `index`.
     */
    public function search(Request $request)
    {
        $authorId = $request->query('author_id');
        $categoryId = $request->query('category_id', $request->query('categoria'));
        $year = $request->query('year', $request->query('ano'));
        $language = trim((string) $request->query('language', $request->query('lingua', '')));
        $isbn = trim((string) $request->query('isbn', ''));
        $disciplina = trim((string) $request->query('disciplina', ''));
        $anoEscolar = trim((string) $request->query('ano_escolar', ''));
        $q = trim((string) $request->query('q', ''));
        $limit = min(max((int) $request->query('limit', 50), 1), 200);

        $query = Book::query()
            ->with(['authors', 'categories', 'details'])
            ->latest('id')
            ->when($authorId, function ($qBook) use ($authorId): void {
                $qBook->whereHas('authors', function ($qAuthor) use ($authorId): void {
                    $qAuthor->whereKey($authorId);
                });
            })
            ->when($categoryId, function ($qBook) use ($categoryId): void {
                $cid = (string) $categoryId;
                $qBook->forCatalogCategory($cid);
                if (Book::categoryIdIsRecentBooksListing($cid)) {
                    $qBook->reorder()->orderByDesc('created_at')->orderByDesc('id');
                }
            })
            ->when($year !== null && $year !== '' && is_numeric($year), function ($qBook) use ($year): void {
                $qBook->where('published_year', (int) $year);
            })
            ->when($language !== '', function ($qBook) use ($language): void {
                $qBook->where('language', 'like', $language.'%');
            })
            ->when($q !== '', function ($qBook) use ($q): void {
                $qBook->where(function ($inner) use ($q): void {
                    $inner->where('title', 'like', '%'.$q.'%')
                        ->orWhere('description', 'like', '%'.$q.'%')
                        ->orWhere('isbn', 'like', '%'.$q.'%')
                        ->orWhereHas('authors', function ($qAuthor) use ($q): void {
                            $qAuthor->where('name', 'like', '%'.$q.'%');
                        });
                });
            })
            ->when($isbn !== '', function ($qBook) use ($isbn): void {
                $qBook->where('isbn', 'like', '%'.$isbn.'%');
            })
            ->when($disciplina !== '', function ($qBook) use ($disciplina): void {
                $qBook->where('school_subject', 'like', '%'.$disciplina.'%');
            })
            ->when($anoEscolar !== '', function ($qBook) use ($anoEscolar): void {
                $qBook->where('school_year', 'like', '%'.$anoEscolar.'%');
            });

        return $query->limit($limit)->get();
    }

    public function show(int $id)
    {
        $book = Book::with(['authors', 'categories', 'details'])->findOrFail($id);
        $recommendedByAuthor = $this->recommendationsBySharedAuthors($book, 12);
        $excludeForCategory = $recommendedByAuthor->pluck('id')->all();
        $recommendedByCategory = $this->recommendationsBySharedCategories($book, $excludeForCategory, 12);

        $excludeForFallback = array_merge(
            $recommendedByAuthor->pluck('id')->all(),
            $recommendedByCategory->pluck('id')->all(),
        );
        $recommendedFallback = $this->recommendationsLatestExcluding($book, $excludeForFallback, 12);
        $recommendedSchool = $this->recommendationsBySchoolContext($request, $book, 12);

        $mapBook = function (Book $b): array {
            return [
                'id' => $b->id,
                'title' => $b->title,
                'description' => $b->description,
                'cover_image' => $b->cover_image,
                'authors' => $b->authors->map(static fn (Author $a): array => [
                    'id' => $a->id,
                    'name' => $a->name,
                ])->values()->all(),
            ];
        };

        $payload = $book->toArray();
        $payload['available'] = $book->isAvailableForRequest();
        $payload['has_ebook'] = $book->hasEbook() && $book->ebookFormat() !== null;
        $payload['ebook_format'] = $book->ebookFormat();
        $payload['ebook_downloads_count'] = (int) ($book->ebook_downloads_count ?? 0);
        $payload['recommendations'] = $recommendedByAuthor->map($mapBook)->values()->all();
        $payload['category_recommendations'] = $recommendedByCategory->map($mapBook)->values()->all();
        $payload['fallback_recommendations'] = $recommendedFallback->map($mapBook)->values()->all();
        $payload['school_recommendations'] = $recommendedSchool->map($mapBook)->values()->all();

        return $payload;
    }

    /**
     * Livros que partilham pelo menos um autor com o livro dado (exclui o próprio).
     *
     * @return Collection<int, Book>
     */
    private function recommendationsBySharedAuthors(Book $book, int $limit = 12)
    {
        $authorIds = $book->authors->pluck('id');

        if ($authorIds->isEmpty()) {
            return collect();
        }

        return Book::query()
            ->with(['authors:id,name'])
            ->whereKeyNot($book->getKey())
            ->whereHas('authors', function ($q) use ($authorIds): void {
                $q->whereIn('authors.id', $authorIds);
            })
            ->latest('id')
            ->limit(min($limit, 50))
            ->get();
    }

    /**
     * Livros que partilham pelo menos uma categoria com o livro dado (exclui o próprio e os já listados).
     *
     * @param  list<int|string>  $excludeIds
     * @return Collection<int, Book>
     */
    private function recommendationsBySharedCategories(Book $book, array $excludeIds, int $limit = 12)
    {
        $categoryIds = $book->categories->pluck('id');

        if ($categoryIds->isEmpty()) {
            return collect();
        }

        $excludeIds = array_values(array_unique(array_merge([$book->getKey()], $excludeIds)));

        return Book::query()
            ->with(['authors:id,name'])
            ->whereKeyNot($book->getKey())
            ->whereNotIn('id', $excludeIds)
            ->whereHas('categories', function ($q) use ($categoryIds): void {
                $q->whereIn('categories.id', $categoryIds);
            })
            ->latest('id')
            ->limit(min($limit, 50))
            ->get();
    }

    /**
     * Últimos livros no catálogo (exclui o atual e IDs adicionais), para quando não há autor/categoria.
     *
     * @param  list<int|string>  $excludeIds
     * @return Collection<int, Book>
     */
    private function recommendationsLatestExcluding(Book $book, array $excludeIds, int $limit = 12)
    {
        $excludeIds = array_values(array_unique(array_merge([$book->getKey()], $excludeIds)));

        return Book::query()
            ->with(['authors:id,name'])
            ->whereNotIn('id', $excludeIds)
            ->latest('id')
            ->limit(min($limit, 50))
            ->get();
    }

    /**
     * Recomendações escolares por faixa etária + ano + disciplina.
     *
     * @return Collection<int, Book>
     */
    private function recommendationsBySchoolContext(Request $request, Book $book, int $limit = 12)
    {
        $patron = $request->user('patron');
        $age = null;
        if ($patron !== null && isset($patron->birth_date)) {
            $age = now()->diffInYears($patron->birth_date);
        }

        return Book::query()
            ->with(['authors:id,name'])
            ->whereKeyNot($book->getKey())
            ->when($book->school_subject, function ($q) use ($book): void {
                $q->where('school_subject', $book->school_subject);
            })
            ->when($book->school_year, function ($q) use ($book): void {
                $q->where('school_year', $book->school_year);
            })
            ->when(is_int($age), function ($q) use ($age): void {
                $q->where(function ($inner) use ($age): void {
                    $inner->whereNull('target_age_min')
                        ->orWhere('target_age_min', '<=', $age);
                })->where(function ($inner) use ($age): void {
                    $inner->whereNull('target_age_max')
                        ->orWhere('target_age_max', '>=', $age);
                });
            })
            ->withCount('bookRequests as requisicoes_count')
            ->orderByDesc('requisicoes_count')
            ->orderByDesc('id')
            ->limit(min($limit, 50))
            ->get();
    }

    public function showDetails(int $id)
    {
        $book = Book::with(['details'])->findOrFail($id);

        return $book->details;
    }

    public function store(Request $request)
    {
        $book = Book::create($request->only([
            'title',
            'description',
            'isbn',
            'published_year',
            'pages',
            'cover_image',
            'language',
        ]));

        // autores
        if ($request->authors) {
            $book->authors()->sync($request->authors);
        }

        // categorias
        if ($request->categories) {
            $book->categories()->sync($request->categories);
        }

        // detalhes
        if ($request->details) {
            $book->details()->create($request->details);
        }

        return $book->load(['authors', 'categories', 'details']);
    }

    public function storeFromIsbn(Request $request, GoogleBooksService $googleBooks)
    {
        $request->validate([
            'isbn' => 'required',
        ]);

        $data = $googleBooks->getByIsbn($request->isbn);

        if (! $data) {
            return response()->json(['error' => 'Livro não encontrado'], 404);
        }

        $book = Book::where('isbn', $request->isbn)->first();

        if ($book) {
            // Enriquecimento "não destrutivo": só completa campos vazios.
            $updates = [];
            if (empty($book->title) && ! empty($data['title'])) {
                $updates['title'] = $data['title'];
            }
            if (empty($book->description) && ! empty($data['description'])) {
                $updates['description'] = $data['description'];
            }
            if (empty($book->published_year) && ! empty($data['published_year'])) {
                $updates['published_year'] = $data['published_year'];
            }
            if (empty($book->pages) && ! empty($data['pages'])) {
                $updates['pages'] = $data['pages'];
            }
            if (empty($book->cover_image) && ! empty($data['cover'])) {
                $updates['cover_image'] = $data['cover'];
            }
            if (empty($book->language) && ! empty($data['language'])) {
                $updates['language'] = $data['language'];
            }

            if (! empty($updates)) {
                $book->fill($updates)->save();
            }
        } else {
            $book = Book::create([
                'title' => $data['title'],
                'description' => $data['description'],
                'isbn' => $request->isbn,
                'published_year' => $data['published_year'],
                'pages' => $data['pages'],
                'cover_image' => $data['cover'],
                'language' => $data['language'],
            ]);
        }

        if (! empty($data['authors'])) {
            foreach ($data['authors'] as $authorName) {
                $author = Author::firstOrCreate(['name' => $authorName]);
                $book->authors()->syncWithoutDetaching([$author->id]);
            }
        }

        if (! empty($data['categories'])) {
            foreach ($data['categories'] as $categoryName) {
                $category = Category::firstOrCreate(['name' => $categoryName]);
                $book->categories()->syncWithoutDetaching([$category->id]);
            }
        }

        if (! empty($data['publisher'])) {
            $book->details()->updateOrCreate(
                ['book_id' => $book->id],
                ['publisher' => $data['publisher']]
            );
        }

        return $book->load(['authors', 'categories', 'details']);
    }
}
