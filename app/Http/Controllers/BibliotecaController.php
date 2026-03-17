<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Catálogo e página de detalhe do livro (Biblioteca Brotero)
 * Quando a base de dados estiver disponível, substituir $livros e $livro
 * por dados do Eloquent (ex.: Livro::all(), Livro::find($id)).
 */
class BibliotecaController extends Controller
{
    /**
     * Listagem do catálogo (index da biblioteca)
     * Futuro: Livro::query()->when($filtros)->paginate().
     */
    public function index(): Response
    {
        $livros = $this->livrosEmDestaque();

        return Inertia::render('library', [
            'livros' => $livros,
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
        ];

        return Inertia::render('library-book', [
            'livro' => $livro,
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
}
