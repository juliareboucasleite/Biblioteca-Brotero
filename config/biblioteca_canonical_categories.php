<?php

/**
 * Taxonomia canónica da biblioteca (géneros + categorias operacionais).
 * O comando `biblioteca:consolidate-categories` cria/atualiza estes registos e funde nomes antigos.
 *
 * @see \App\Console\Commands\ConsolidateBibliotecaCategories
 */
return [

    /**
     * ID da categoria «E-books» na BD. Ao filtrar por esta categoria, listam-se livros com
     * ficheiro PDF/EPUB no armazenamento (não só os que têm a etiqueta na pivot).
     */
    'ebooks_category_id' => 64,

    'order' => [
        'e-books',
        'livros-novos',
        'bestsellers',
        'audiobooks',
        'romance',
        'fantasia',
        'ficcao-cientifica',
        'terror',
        'misterio-suspense',
        'aventura',
        'drama',
        'biografia-autobiografia',
        'historia',
        'ciencia',
        'autoajuda',
        'educacao-didaticos',
        'negocios-financas',
        'poesia',
        'hq-banda-desenhada',
        'manga',
        'infantil-juvenil',
    ],

    /**
     * Categorias canónicas: slug estável (URL/UI) + nome apresentado na BD.
     */
    'canonical' => [
        ['slug' => 'romance', 'name' => 'Romance'],
        ['slug' => 'fantasia', 'name' => 'Fantasia'],
        ['slug' => 'ficcao-cientifica', 'name' => 'Ficção científica'],
        ['slug' => 'terror', 'name' => 'Terror'],
        ['slug' => 'misterio-suspense', 'name' => 'Mistério / Suspense'],
        ['slug' => 'aventura', 'name' => 'Aventura'],
        ['slug' => 'drama', 'name' => 'Drama'],
        ['slug' => 'biografia-autobiografia', 'name' => 'Biografia / Autobiografia'],
        ['slug' => 'historia', 'name' => 'História'],
        ['slug' => 'ciencia', 'name' => 'Ciência'],
        ['slug' => 'autoajuda', 'name' => 'Autoajuda'],
        ['slug' => 'educacao-didaticos', 'name' => 'Educação / Didáticos'],
        ['slug' => 'negocios-financas', 'name' => 'Negócios / Finanças'],
        ['slug' => 'poesia', 'name' => 'Poesia'],
        ['slug' => 'hq-banda-desenhada', 'name' => 'HQ / Banda desenhada'],
        ['slug' => 'infantil-juvenil', 'name' => 'Infantil / Juvenil'],
        ['slug' => 'e-books', 'name' => 'E-books'],
        ['slug' => 'audiobooks', 'name' => 'Audiobooks'],
        ['slug' => 'livros-novos', 'name' => 'Livros novos'],
        ['slug' => 'bestsellers', 'name' => 'Bestsellers'],
        ['slug' => 'manga', 'name' => 'Manga'],
    ],

    /**
     * Nome exacto na BD (como está hoje) → slug canónico.
     * Complementa com regras no comando para nomes parecidos.
     */
    'merge_exact_name_to_slug' => [
        'Fiction' => 'fantasia',
        'Ficção' => 'fantasia',
        'Portuguese fiction' => 'romance',
        'Historical Fiction' => 'drama',
        'Ficção histórica' => 'drama',
        'Juvenile Fiction' => 'infantil-juvenil',
        'Self-Help' => 'autoajuda',
        'Science' => 'ciencia',
        'Biography & Autobiography' => 'biografia-autobiografia',
        'Comics & Graphic Novels' => 'hq-banda-desenhada',
        'Comic books, strips, etc' => 'hq-banda-desenhada',
        'Detective and mystery stories, Portuguese' => 'misterio-suspense',
        'English fiction' => 'fantasia',
        'Mozambican fiction (Portuguese)' => 'romance',
        'Domestic fiction' => 'drama',
        'Portuguese poetry' => 'poesia',
        'Poesía portuguesa' => 'poesia',
        'Architecture' => 'educacao-didaticos',
        'African literature (Portuguese)' => 'fantasia',
        'Portuguese language' => 'educacao-didaticos',
        'Haunted houses' => 'terror',
        'Olympics' => 'historia',
        'Abandoned children' => 'drama',
        'Games & Activities' => 'infantil-juvenil',
        'Civilization, Modern' => 'historia',
        'Literary Collections' => 'poesia',
        'Cooking' => 'educacao-didaticos',
        'Psychology' => 'autoajuda',
        'Lingua francesa' => 'educacao-didaticos',
        'Automobiles' => 'ciencia',
        'Literary Criticism' => 'educacao-didaticos',
        'Antiques & Collectibles' => 'historia',
        'Authors' => 'biografia-autobiografia',
        'Holocaust, Jewish (1939-1945)' => 'historia',
    ],
];
