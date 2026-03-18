<h1>Livros</h1>

@foreach($books as $book)
    <div>
        <h3>{{ $book->titulo }}</h3>

        <a href="/books/{{ $book->id }}">
            Ver detalhes
        </a>
    </div>
@endforeach