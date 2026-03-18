<h1>{{ $book->titulo }}</h1>

@if($apiData)
    @if($apiData['capa'])
        <img src="{{ $apiData['capa'] }}" alt="capa">
    @endif

    <p><strong>Autor:</strong> {{ $apiData['autor'] }}</p>
    <p><strong>Género:</strong> {{ $apiData['genero'] }}</p>
    <p><strong>Páginas:</strong> {{ $apiData['paginas'] }}</p>
    <p><strong>Ano:</strong> {{ $apiData['ano'] }}</p>

    <p>{{ $apiData['descricao'] }}</p>
@else
    <p>Sem dados adicionais.</p>
@endif