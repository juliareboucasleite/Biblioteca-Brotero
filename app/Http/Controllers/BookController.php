<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use App\Services\GoogleBooksService;
use App\Models\Author;
use App\Models\Category;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $limit = (int) $request->query('limit', 0);
        $categoriaId = $request->query('categoria');

        $query = Book::query()
            ->with(['authors', 'categories', 'details'])
            ->latest('id');

        if (!empty($categoriaId)) {
            $query->whereHas('categories', function ($q) use ($categoriaId) {
                $q->whereKey($categoriaId);
            });
        }

        if ($limit > 0) {
            $query->limit(min($limit, 200));
        }

        return $query->get();
    }

    public function show(int $id)
    {
        return Book::with(['authors', 'categories', 'details'])->findOrFail($id);
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
            'language'
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
            'isbn' => 'required'
        ]);

        $data = $googleBooks->getByIsbn($request->isbn);

        if (!$data) {
            return response()->json(['error' => 'Livro não encontrado'], 404);
        }

        $book = Book::where('isbn', $request->isbn)->first();

        if ($book) {
            // Enriquecimento "não destrutivo": só completa campos vazios.
            $updates = [];
            if (empty($book->title) && !empty($data['title'])) {
                $updates['title'] = $data['title'];
            }
            if (empty($book->description) && !empty($data['description'])) {
                $updates['description'] = $data['description'];
            }
            if (empty($book->published_year) && !empty($data['published_year'])) {
                $updates['published_year'] = $data['published_year'];
            }
            if (empty($book->pages) && !empty($data['pages'])) {
                $updates['pages'] = $data['pages'];
            }
            if (empty($book->cover_image) && !empty($data['cover'])) {
                $updates['cover_image'] = $data['cover'];
            }
            if (empty($book->language) && !empty($data['language'])) {
                $updates['language'] = $data['language'];
            }

            if (!empty($updates)) {
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

        if (!empty($data['authors'])) {
            foreach ($data['authors'] as $authorName) {
                $author = Author::firstOrCreate(['name' => $authorName]);
                $book->authors()->syncWithoutDetaching([$author->id]);
            }
        }

        if (!empty($data['categories'])) {
            foreach ($data['categories'] as $categoryName) {
                $category = Category::firstOrCreate(['name' => $categoryName]);
                $book->categories()->syncWithoutDetaching([$category->id]);
            }
        }

        if (!empty($data['publisher'])) {
            $book->details()->updateOrCreate(
                ['book_id' => $book->id],
                ['publisher' => $data['publisher']]
            );
        }

        return $book->load(['authors', 'categories', 'details']);
    }
}