<?php

namespace App\Support;

use App\Models\Author;
use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Funde autores/categorias duplicados.
 *
 * Chave canónica (só para agrupar): minúsculas, transliteração ASCII (ex.: è→e),
 * remoção de espaços e pontuação — assim "S. L. X" e "S.L. X" ou "Vallès" e "Valles"
 * caem no mesmo grupo. O nome guardado usa {@see normalizeDisplayName} e a melhor
 * variante entre duplicados via {@see bestLabelAmong}.
 *
 * Autores: após agrupar por chave, funde também chaves com Levenshtein ≤ 1 (comprimento ≥ 8)
 * para apanhar erros de escrita (ex.: Franz Kafka / Franz Kaffka / Fraz Kafka).
 */
final class CatalogTaxonomyNormalizer
{
    public static function normalizeKey(string $name): string
    {
        $t = trim((string) preg_replace('/\s+/u', ' ', $name));

        if ($t === '') {
            return '';
        }

        $t = mb_strtolower($t, 'UTF-8');
        $t = Str::ascii($t);
        $t = (string) preg_replace('/[^\p{L}\p{N}]+/u', '', $t);

        return $t;
    }

    public static function normalizeDisplayName(string $name): string
    {
        $collapsed = (string) preg_replace('/\s+/u', ' ', trim($name));

        if ($collapsed === '') {
            return '';
        }

        $lower = mb_strtolower($collapsed, 'UTF-8');

        return (string) preg_replace_callback(
            '/\b\p{L}/u',
            static fn (array $m): string => mb_strtoupper($m[0], 'UTF-8'),
            $lower,
        );
    }

    /**
     * @return array{duplicate_records_removed: int, pivot_links_touched: int, display_names_updated: int}
     */
    public static function mergeAuthors(bool $dryRun): array
    {
        return self::mergeTaxonomy(
            Author::query()->orderBy('id'),
            'book_author',
            'authors',
            'author_id',
            $dryRun,
            true,
        );
    }

    /**
     * @return array{duplicate_records_removed: int, pivot_links_touched: int, display_names_updated: int}
     */
    public static function mergeCategories(bool $dryRun): array
    {
        return self::mergeTaxonomy(
            Category::query()->orderBy('id'),
            'book_category',
            'categories',
            'category_id',
            $dryRun,
            false,
        );
    }

    /**
     * @param  Builder<Model>  $query
     * @return array{duplicate_records_removed: int, pivot_links_touched: int, display_names_updated: int}
     */
    private static function mergeTaxonomy(
        $query,
        string $pivotTable,
        string $entityTable,
        string $fkColumn,
        bool $dryRun,
        bool $fuzzyMergeNearbyAuthorKeys = false,
    ): array {
        /** @var array<string, list<Model>> $buckets */
        $buckets = [];

        foreach ($query->cursor() as $model) {
            $key = self::normalizeKey((string) $model->getAttribute('name'));
            if ($key === '') {
                continue;
            }
            $buckets[$key] ??= [];
            $buckets[$key][] = $model;
        }

        if ($fuzzyMergeNearbyAuthorKeys) {
            $buckets = self::mergeNearbyAuthorKeys($buckets);
        }

        if ($dryRun) {
            $duplicateRecordsRemoved = 0;
            $pivotLinksTouched = 0;
            $displayNamesUpdated = 0;
            foreach ($buckets as $models) {
                if (count($models) === 0) {
                    continue;
                }

                if (count($models) === 1) {
                    $only = $models[0];
                    $d = self::normalizeDisplayName((string) $only->getAttribute('name'));
                    if ($d !== '' && $d !== (string) $only->getAttribute('name')) {
                        $displayNamesUpdated++;
                    }

                    continue;
                }

                usort(
                    $models,
                    static fn (Model $a, Model $b): int => (int) $a->getKey() <=> (int) $b->getKey(),
                );

                foreach (array_slice($models, 1) as $dup) {
                    $duplicateRecordsRemoved++;
                    $dupId = (int) $dup->getKey();

                    foreach (DB::table($pivotTable)->where($fkColumn, $dupId)->cursor() as $link) {
                        $pivotLinksTouched++;
                    }
                }

                $best = self::bestLabelAmong($models);
                $display = self::normalizeDisplayName($best);
                $cur = (string) $models[0]->getAttribute('name');
                if ($display !== '' && $cur !== $display) {
                    $displayNamesUpdated++;
                }
            }

            return [
                'duplicate_records_removed' => $duplicateRecordsRemoved,
                'pivot_links_touched' => $pivotLinksTouched,
                'display_names_updated' => $displayNamesUpdated,
            ];
        }

        return DB::transaction(function () use (
            $buckets,
            $pivotTable,
            $entityTable,
            $fkColumn,
        ): array {
            $duplicateRecordsRemoved = 0;
            $pivotLinksTouched = 0;
            $displayNamesUpdated = 0;

            foreach ($buckets as $models) {
                if (count($models) === 0) {
                    continue;
                }

                if (count($models) === 1) {
                    $only = $models[0];
                    $d = self::normalizeDisplayName((string) $only->getAttribute('name'));
                    if ($d !== '' && $d !== (string) $only->getAttribute('name')) {
                        $only->forceFill(['name' => $d])->save();
                        $displayNamesUpdated++;
                    }

                    continue;
                }

                usort(
                    $models,
                    static fn (Model $a, Model $b): int => (int) $a->getKey() <=> (int) $b->getKey(),
                );

                $keeper = $models[0];
                $keeperId = (int) $keeper->getKey();

                foreach (array_slice($models, 1) as $dup) {
                    $dupId = (int) $dup->getKey();

                    foreach (DB::table($pivotTable)->where($fkColumn, $dupId)->cursor() as $link) {
                        $pivotLinksTouched++;
                        $bookId = (int) $link->book_id;

                        $hasKeeper = DB::table($pivotTable)
                            ->where('book_id', $bookId)
                            ->where($fkColumn, $keeperId)
                            ->exists();

                        if ($hasKeeper) {
                            DB::table($pivotTable)
                                ->where('book_id', $bookId)
                                ->where($fkColumn, $dupId)
                                ->delete();
                        } else {
                            DB::table($pivotTable)
                                ->where('book_id', $bookId)
                                ->where($fkColumn, $dupId)
                                ->update([$fkColumn => $keeperId]);
                        }
                    }

                    DB::table($entityTable)->where('id', $dupId)->delete();
                    $duplicateRecordsRemoved++;
                }

                $display = self::normalizeDisplayName(self::bestLabelAmong($models));
                $cur = (string) $keeper->getAttribute('name');
                if ($display !== '' && $cur !== $display) {
                    $keeper->forceFill(['name' => $display])->save();
                    $displayNamesUpdated++;
                }
            }

            return [
                'duplicate_records_removed' => $duplicateRecordsRemoved,
                'pivot_links_touched' => $pivotLinksTouched,
                'display_names_updated' => $displayNamesUpdated,
            ];
        });
    }

    /**
     * Une baldes cuja chave canónica difere por um único erro tipográfico (Levenshtein ≤ 1),
     * desde que ambas as chaves tenham comprimento ≥ 8 (evita fundir nomes muito curtos).
     *
     * @param  array<string, list<Model>>  $buckets
     * @return array<string, list<Model>>
     */
    private static function mergeNearbyAuthorKeys(array $buckets): array
    {
        $keys = array_keys($buckets);
        $n = count($keys);
        if ($n <= 1) {
            return $buckets;
        }

        $minKeyLen = 8;
        $maxDistance = 1;

        $parent = range(0, $n - 1);
        $find = function (int $i) use (&$find, &$parent): int {
            if ($parent[$i] !== $i) {
                $parent[$i] = $find($parent[$i]);
            }

            return $parent[$i];
        };
        $union = function (int $i, int $j) use (&$parent, $find): void {
            $ri = $find($i);
            $rj = $find($j);
            if ($ri !== $rj) {
                $parent[$ri] = $rj;
            }
        };

        for ($i = 0; $i < $n; $i++) {
            $lenI = strlen($keys[$i]);
            if ($lenI < $minKeyLen) {
                continue;
            }
            for ($j = $i + 1; $j < $n; $j++) {
                $lenJ = strlen($keys[$j]);
                if ($lenJ < $minKeyLen) {
                    continue;
                }
                if (levenshtein($keys[$i], $keys[$j]) <= $maxDistance) {
                    $union($i, $j);
                }
            }
        }

        /** @var array<int, list<int>> $groups */
        $groups = [];
        for ($i = 0; $i < $n; $i++) {
            $groups[$find($i)][] = $i;
        }

        /** @var array<string, list<Model>> $out */
        $out = [];
        foreach ($groups as $indices) {
            /** @var list<Model> $merged */
            $merged = [];
            $repKey = null;

            foreach ($indices as $idx) {
                $k = $keys[$idx];
                if ($repKey === null || strcmp($k, $repKey) < 0) {
                    $repKey = $k;
                }
                foreach ($buckets[$k] as $model) {
                    $merged[] = $model;
                }
            }

            /** @var array<int, Model> $byId */
            $byId = [];
            foreach ($merged as $m) {
                $byId[(int) $m->getKey()] = $m;
            }

            $out[(string) $repKey] = array_values($byId);
        }

        return $out;
    }

    /**
     * @param  list<Model>  $models
     */
    private static function bestLabelAmong(array $models): string
    {
        $best = '';
        $bestScore = PHP_INT_MIN;

        foreach ($models as $m) {
            $n = trim((string) $m->getAttribute('name'));
            if ($n === '') {
                continue;
            }

            $score = self::labelQualityScore($n);
            $score -= self::medoidKeyDistanceSum($n, $models) * 6;
            $lenCmp = mb_strlen($n, 'UTF-8') <=> mb_strlen($best, 'UTF-8');

            if ($score > $bestScore || ($score === $bestScore && $lenCmp > 0)) {
                $bestScore = $score;
                $best = $n;
            }
        }

        return $best;
    }

    private static function labelQualityScore(string $name): int
    {
        $len = mb_strlen($name, 'UTF-8');
        $score = $len * 2;

        // "Primeiro. Resto" costuma ser erro (ex.: "Tina. Valles").
        if (preg_match('/^\p{L}+\.\s+\p{L}/u', $name) === 1) {
            $score -= 30;
        }

        // Preferir grafia com diacríticos quando existir variante sem.
        if (preg_match('/[^\x00-\x7F]/u', $name) === 1) {
            $score += 15;
        }

        // Penalizar uma linha com vários autores (devia estar partida na BD).
        if (preg_match('/[;|]/u', $name) === 1) {
            $score -= 25;
        }

        return $score;
    }

    /**
     * Soma das distâncias Levenshtein entre a chave canónica de $candidateName e as chaves
     * dos outros modelos (menor ≈ grafia mais provável, ex.: "Franz Kafka" vs erros).
     *
     * @param  list<Model>  $models
     */
    private static function medoidKeyDistanceSum(string $candidateName, array $models): int
    {
        $k = self::normalizeKey($candidateName);
        if ($k === '') {
            return 0;
        }

        $sum = 0;

        foreach ($models as $m) {
            $other = self::normalizeKey((string) $m->getAttribute('name'));
            if ($other === '' || $other === $k) {
                continue;
            }

            $sum += levenshtein($k, $other);
        }

        return $sum;
    }
}
