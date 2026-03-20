<?php

namespace App\Services;

use App\Models\LibraryPatron;
use Illuminate\Support\Facades\Schema;

final class PatronRankingService
{
    /**
     * @return list<array{posicao: int, nome: string, pontos: int, cartao_mascarado: string}>
     */
    public function topEntries(int $limit = 50): array
    {
        if (! Schema::hasColumn((new LibraryPatron)->getTable(), 'points')) {
            return [];
        }

        $cap = max(1, min($limit, 100));

        return LibraryPatron::query()
            ->where('points', '>', 0)
            ->orderByDesc('points')
            ->orderBy('id')
            ->limit($cap)
            ->get(['name', 'card_number', 'points'])
            ->values()
            ->map(function (LibraryPatron $patron, int $index): array {
                return [
                    'posicao' => $index + 1,
                    'nome' => $patron->name !== null && trim($patron->name) !== '' ? $patron->name : 'Leitor',
                    'pontos' => (int) $patron->points,
                    'cartao_mascarado' => $this->maskCard($patron->card_number),
                ];
            })
            ->all();
    }

    private function maskCard(string $cardNumber): string
    {
        $len = strlen($cardNumber);

        if ($len <= 2) {
            return '••••';
        }

        return str_repeat('•', max(0, $len - 2)).substr($cardNumber, -2);
    }
}
