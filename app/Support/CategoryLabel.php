<?php

namespace App\Support;

/**
 * Rótulos em português para categorias importadas (metadados Google/inglês no DB).
 */
final class CategoryLabel
{
    /** @var array<string, string> nome exato na BD => etiqueta em PT */
    private const TO_PT = [
        'Architecture' => 'Arquitetura',
        'Comics & Graphic Novels' => 'Banda desenhada e graphic novels',
        'Coimbra (Portugal)' => 'Coimbra (Portugal)',
        'Haunted houses' => 'Casas assombradas',
        'Fiction' => 'Ficção',
        'African literature (Portuguese)' => 'Literatura africana (em português)',
        'Portuguese language' => 'Língua portuguesa',
        'Poesía portuguesa' => 'Poesia portuguesa',
        'Portuguese fiction' => 'Ficção portuguesa',
        'Olympics' => 'Jogos Olímpicos',
        'Abandoned children' => 'Crianças abandonadas',
        'Portuguese poetry' => 'Poesia portuguesa',
        'Biography & Autobiography' => 'Biografias e autobiografias',
        'Detective and mystery stories, Portuguese' => 'Policial e mistério (português)',
        'Self-Help' => 'Autoajuda',
        'Games & Activities' => 'Jogos e atividades',
        'Science' => 'Ciência',
        'Juvenile Fiction' => 'Ficção juvenil',
        'Civilization, Modern' => 'Civilização moderna',
        'Literary Collections' => 'Antologias e coleções literárias',
        'Cooking' => 'Culinária',
        'Psychology' => 'Psicologia',
        'Comic books, strips, etc' => 'Banda desenhada e tiras',
        'Lingua francesa' => 'Língua francesa',
        'Domestic fiction' => 'Ficção doméstica',
        'Automobiles' => 'Automóveis',
        'Literary Criticism' => 'Crítica literária',
        'Antiques & Collectibles' => 'Antiguidades e coleccionismo',
        'Authors' => 'Autores',
        'Mozambican fiction (Portuguese)' => 'Ficção moçambicana (português)',
        'Holocaust, Jewish (1939-1945)' => 'Holocausto judeu (1939–1945)',
        'English fiction' => 'Ficção inglesa',

        // Variantes do mesmo conceito (alinhado com slug `livros-novos`).
        'Livros novas' => 'Livros novos',
        'Livros novos adicionados' => 'Livros novos',
        'Novos livros adicionados' => 'Livros novos',
    ];

    public static function toPortuguese(string $name): string
    {
        $trimmed = trim($name);

        return self::TO_PT[$trimmed] ?? $name;
    }
}
