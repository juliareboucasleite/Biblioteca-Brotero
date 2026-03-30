<?php

namespace App\Support;

use App\Models\Author;
use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Funde autores/categorias duplicados (chave: nome em minúsculas após trim)
 * e normaliza capitalização (primeira letra UTF-8 de cada palavra).
 */
final class CatalogTaxonomyNormalizer
{
    public static function normalizeKey(string $name): string
    {
        $t = trim($name);

        return $t === '' ? '' : mb_strtolower($t, 'UTF-8');
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

                $best = self::longestLabelAmong($models);
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

                $display = self::normalizeDisplayName(self::longestLabelAmong($models));
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
     * @param  list<Model>  $models
     */
    private static function longestLabelAmong(array $models): string
    {
        $best = '';

        foreach ($models as $m) {
            $n = trim((string) $m->getAttribute('name'));
            if (mb_strlen($n, 'UTF-8') > mb_strlen($best, 'UTF-8')) {
                $best = $n;
            }
        }

        return $best;
    }
}
