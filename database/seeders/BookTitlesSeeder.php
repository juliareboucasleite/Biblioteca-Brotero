<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookTitlesSeeder extends Seeder
{
    public function run(): void
    {
        $items = $this->titles();

        DB::transaction(function () use ($items) {
            foreach ($items as $raw) {
                [$title, $author] = $this->parseTitleAndAuthor($raw);

                if ($title === '') {
                    continue;
                }

                /** @var \App\Models\Book $book */
                $book = Book::query()->firstOrCreate(
                    ['title' => $title],
                    [
                        'description' => null,
                        'isbn' => null,
                        'published_year' => null,
                        'pages' => null,
                        'cover_image' => null,
                        'language' => null,
                    ],
                );

                if ($author !== null && $author !== '') {
                    $authorModel = Author::query()->firstOrCreate(['name' => $author]);
                    $book->authors()->syncWithoutDetaching([$authorModel->id]);
                }
            }
        });
    }

    /**
     * @return list<string>
     */
    private function titles(): array
    {
        return [
            'Os loucos da rua mazur (João pinto coelho)',
            'O crocodilo (fiodor dostoivski)',
            'Os olhos de mona (thomas shlesser)',
            'Um quarto so seu (Virginia Woolf)',
            'A room of one’s own and three guineas (Virginia woolf)',
            'Um sonho de Beleza (Laura Baldini)',
            'Capitaes da areia (Jorge amado)',
            'Principios de psicologia geral (S.L. Rubinstein)',
            'Manual “Novo tu ca tu la” (Portugues língua não materna)',
            'Palavras de caramelo',
            'Sermao de santo antonio aos peixes (padre antonio vieira)',
            'O retorno (Dulce Maria cardoso)',
            'O lago dos sonhos (Kim Edwards)',
            'O tempo entre costuras (livro da cristina)',
            'Mil vezes adeus (John green)',
            'Escola Brotero “Memorias de sempre”',
            'Gramatica francês',
            'Confia na mudança (Margarida fonseca)',
            'A colher (Sandra siemens; bea lozano)',
            'O que nos torna humanos (Victor D.O Santos)',
            'Deus na escuridão (Valter hugo mae)',
            'Memorias postmas de bras cubas',
            'Historia comtemporanea das artes visuais',
            'O regresso de Sherlock holmes (Arthur conan doyle)',
            'A Metarmofose (Franz Kaffka)',
            'Livro de desenho técnico',
            'A memoria da arvore',
            'O espião que veio do frio',
            'Viagens ao pais da manha (hermann hesse)',
            'O deus das moscas',
            'Capitaes da areia (Jorge amado)',
            'Manual F.Q (Q1 a Q3)',
            'Falar piano e tocar francês (Martim sousa tavares)',
            'A quinta dos animais (george Orwell)',
            'A academia Briosa XXX',
            'A academia briosa XXI',
            'O homem que plantava arvores (Jean Giono)',
            'Almoço de domingo (Jose luis Peixoto)',
            'Tragedia em três actos (Agatha christie)',
            'Retalhos da vida de um medico (fernando namora)',
            'Fundamentos da física',
            'Contos escolhidos (fraz kafka)',
            'Anjos e demónios',
            'Uma luz na noite escura',
            'A peste',
            'O cemitério de praga',
            'A volta ao mundo em 80 dias',
            'O livro branco',
            'Um dia na vida de ivan denisovich',
            'Relatório minotario',
            'Física: um curso universitário',
            'Moderna introdução as equações diferenciais',
            'Um lugar dentro de nos',
            'Noite sobre as aguas (ken follet)',
            'Fahrenheit 451 (ray bradbury)',
            'Uma historia de xadrez (stefan zweig)',
            'Klara e o sol (Kazuo ishiguro)',
            'Primo levi _ Os que sucubem e os que se salvam',
            'Meditacoes (marco aurelio)',
            'Siddhartha (hermann hesse)',
            'Quem mexeu no meu queijo (Dr. Spencer Johnson)',
            'Contos policiais (Edgar A. Poe)',
            '1984 _ Novela gráfica (George Orwell)',
            'Assim foi aushwitz (Primo levi)',
            'Poemas abril (Carlos louro e Manuel simoes)',
            '31 sonetos de wiliam shaskepeare (ana luisa amaral)',
            'Oscar e a senhora cor de rosa (eric- emmanuel Schmitt)',
            'Branca como a neve vermelha como o sangue',
            'Amor de perdicao',
            'Uma cana de pesca para o meu avo (gao xingjian)',
            'Cem anos de solidão (gabril garcia marques)',
            'Viagens no scriptorium (paul auster)',
            'O meu nome é emilia del valle',
            'Jogos olímpicos (verbo)',
            'Paz traz paz (afonso cruz)',
            'As velas ardem ate o fim (sandor marai)',
            'A arvore das palavras (Teolinda gersao)',
            'As mil e uma noites',
            'Mensagem',
            'A colher (sandra siemens; bea lozano)',
            'Os três mosqueteiros',
            '1984 (george Orwell)',
            'Felizmente há luar!',
            'Balada da praia dos caes',
            'Maria montessori e a escola da vida (laura Baldini)',
            'o vendedor de passados (jose Eduardo Agualusa)',
            'O tempo envelhece depressa (antonio tabucchi)',
            'Cada homem é uma raça (mia couto)',
            'Poemas de deus e o diabo',
            'O mel sem avelhas',
            'Nos matamos o cao tinhoso',
            'A casa assombrada (virginia woolf)',
            'Ruas de coimbra',
            'A novela gráfica 1984',
            'Bauhaus 1919-1933',
        ];
    }

    /**
     * @return array{0:string,1:?string}
     */
    private function parseTitleAndAuthor(string $raw): array
    {
        $s = trim(preg_replace('/\s+/', ' ', $raw) ?? '');
        if ($s === '') {
            return ['', null];
        }

        // Captura "(autor)" apenas no final do texto.
        if (preg_match('/^(.*)\s+\(([^()]*)\)\s*$/u', $s, $m) === 1) {
            $title = trim($m[1]);
            $author = trim($m[2]);

            return [$title, $author !== '' ? $author : null];
        }

        return [$s, null];
    }
}

