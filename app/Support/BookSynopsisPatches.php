<?php

namespace App\Support;

/**
 * Sinopses em UTF-8 para livros em que a Google Books não devolve texto fiável (só metadados ou excertos errados).
 *
 * @see artisan books:apply-synopsis-patches
 */
final class BookSynopsisPatches
{
    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [
            90 => <<<'TXT'
O Mel sem Abelhas, o mais recente romance de Judite Canha Fernandes, vencedora do Prémio Literário Revelação Agustina Bessa-Luís 2018 com Um Passo para Sul, é uma ficção histórica centrada na cultura da cana do açúcar na ilha da Madeira. O seu título nasceu da expressão «Juncos que produzem mel sem abelhas», utilizada para designar a cana-de-açúcar quando a encontraram pela primeira vez na Índia, cerca do século V a.C.

A novela descreve a história de Marta, que chega à cidade do Funchal vinda de Angola no decorrer do século XVI para trabalhar como escrava na cultura da cana. Com o olhar do medo, acompanhado pelo fascínio do novo que se lhe apresenta na ilha, vê-se na necessidade de encontrar na cidade do Funchal alguma forma de abrigo e, simultaneamente, inventar um modo de voltar a casa.

Fruto de uma exaustiva investigação histórica e da afirmação de um talento literário singular já anunciado no seu primeiro romance, a autora traça a história da escravatura portuguesa e da sociedade colonial madeirense do século XVI açucareiro através da voz de uma mulher escravizada, num romance profundamente original que é também um fresco de uma época e de uma condição social.
TXT,
        ];
    }
}
