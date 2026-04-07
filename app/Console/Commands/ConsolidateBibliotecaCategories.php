<?php

namespace App\Console\Commands;

use App\Models\Category;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Cria/atualiza categorias canónicas (slug + nome), reatribui livros e remove duplicados.
 *
 * Executar após `php artisan migrate` e, opcionalmente, `catalog:normalize-entities`
 * (este comando assume nomes já deduplicados por chave normalizada quando possível).
 */
class ConsolidateBibliotecaCategories extends Command
{
    protected $signature = 'biblioteca:consolidate-categories
                            {--dry-run : Mostrar o plano sem alterar a base de dados}';

    protected $description = 'Fundir categorias na taxonomia canónica (slug) e reatribuir livros';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');

        if ($dry) {
            $this->warn('Modo dry-run: cria/atualiza categorias canónicas (slug), mas não funde nem apaga duplicados.');
        }

        /** @var array{order: list<string>, canonical: list<array{slug: string, name: string}>, merge_exact_name_to_slug: array<string, string>} $config */
        $config = config('biblioteca_canonical_categories');
        $canonicalSlugs = array_flip(array_column($config['canonical'], 'slug'));

        DB::transaction(function () use ($config): void {
            $this->upsertCanonicalRows($config['canonical']);
        });

        /** @var array<string, int> $targetsBySlug */
        $targetsBySlug = [];
        foreach ($config['canonical'] as $row) {
            $cat = Category::query()->where('slug', $row['slug'])->first();
            if ($cat !== null) {
                $targetsBySlug[$row['slug']] = (int) $cat->id;
            }
        }

        /** @var list<array{source_id: int, source_name: string, target_slug: string, target_id: int|null}> $plan */
        $plan = [];

        foreach (Category::query()->orderBy('id')->cursor() as $category) {
            $targetSlug = $this->resolveTargetSlug($category, $config, $canonicalSlugs);
            if ($targetSlug === null) {
                continue;
            }

            $targetId = $targetsBySlug[$targetSlug] ?? null;
            $sourceId = (int) $category->id;

            if ($targetId !== null && $sourceId === $targetId) {
                continue;
            }

            $plan[] = [
                'source_id' => $sourceId,
                'source_name' => (string) $category->name,
                'target_slug' => $targetSlug,
                'target_id' => $targetId,
            ];
        }

        if ($dry) {
            $this->table(
                ['ID origem', 'Nome', 'Slug destino', 'ID destino'],
                array_map(static fn (array $r): array => [
                    (string) $r['source_id'],
                    $r['source_name'],
                    $r['target_slug'],
                    $r['target_id'] !== null ? (string) $r['target_id'] : '(em falta — migrar primeiro)',
                ], $plan),
            );
            $this->comment('Execute sem --dry-run para aplicar as fusões (reatribuir livros e remover categorias duplicadas).');

            return self::SUCCESS;
        }

        $merged = 0;

        DB::transaction(function () use ($plan, &$merged): void {
            foreach ($plan as $row) {
                $targetId = $row['target_id'];
                if ($targetId === null) {
                    continue;
                }

                $sourceId = $row['source_id'];
                if ($sourceId === $targetId) {
                    continue;
                }

                $this->movePivotsToTarget($sourceId, $targetId);
                Category::query()->whereKey($sourceId)->delete();
                $merged++;
            }
        });

        $this->info("Fusões aplicadas: {$merged}.");

        return self::SUCCESS;
    }

    /**
     * @param  list<array{slug: string, name: string}>  $canonical
     */
    private function upsertCanonicalRows(array $canonical): void
    {
        foreach ($canonical as $row) {
            $slug = $row['slug'];
            $name = $row['name'];

            $bySlug = Category::query()->where('slug', $slug)->first();
            if ($bySlug !== null) {
                if ($bySlug->name !== $name) {
                    $bySlug->forceFill(['name' => $name])->save();
                }

                continue;
            }

            $byName = Category::query()
                ->whereRaw('LOWER(TRIM(name)) = ?', [mb_strtolower(trim($name))])
                ->first();

            if ($byName !== null) {
                $byName->forceFill(['name' => $name, 'slug' => $slug])->save();
            } else {
                Category::query()->create(['name' => $name, 'slug' => $slug]);
            }
        }
    }

    /**
     * @param  array{merge_exact_name_to_slug: array<string, string>, canonical: list<array{slug: string, name: string}>}  $config
     * @param  array<string, int>  $canonicalSlugs
     */
    private function resolveTargetSlug(Category $category, array $config, array $canonicalSlugs): ?string
    {
        $name = trim((string) $category->name);
        $slug = $category->slug;

        if (is_string($slug) && $slug !== '' && isset($canonicalSlugs[$slug])) {
            return $slug;
        }

        if (isset($config['merge_exact_name_to_slug'][$name])) {
            $s = $config['merge_exact_name_to_slug'][$name];

            return isset($canonicalSlugs[$s]) ? $s : null;
        }

        foreach ($config['merge_exact_name_to_slug'] as $label => $s) {
            if (mb_strtolower($label) === mb_strtolower($name) && isset($canonicalSlugs[$s])) {
                return $s;
            }
        }

        foreach ($config['canonical'] as $row) {
            if (mb_strtolower(trim($row['name'])) === mb_strtolower($name)) {
                return $row['slug'];
            }
        }

        return $this->resolveFuzzySlug($name);
    }

    private function resolveFuzzySlug(string $name): ?string
    {
        $n = mb_strtolower($name);
        $n = (string) preg_replace('/\s+/u', ' ', $n);

        if ($n === '') {
            return null;
        }

        // Ordem: mais específico primeiro.
        if (
            str_contains($n, 'science fiction')
            || str_contains($n, 'sci-fi')
            || str_contains($n, 'sci fi')
            || str_contains($n, 'ficção científica')
            || str_contains($n, 'ficcao cientifica')
        ) {
            return 'ficcao-cientifica';
        }

        if (str_contains($n, 'manga')) {
            return 'manga';
        }

        if (
            str_contains($n, 'graphic novel')
            || str_contains($n, 'comic')
            || str_contains($n, 'banda desenhada')
            || str_contains($n, 'bandas desenhadas')
            || str_contains($n, 'quadrinhos')
            || preg_match('/\bbd\b/u', $n) === 1
        ) {
            return 'hq-banda-desenhada';
        }

        if (str_contains($n, 'terror') || str_contains($n, 'horror')) {
            return 'terror';
        }

        if (
            str_contains($n, 'mistério')
            || str_contains($n, 'misterio')
            || str_contains($n, 'suspense')
            || str_contains($n, 'thriller')
            || str_contains($n, 'detective')
            || str_contains($n, 'crime')
            || str_contains($n, 'policial')
        ) {
            return 'misterio-suspense';
        }

        if (str_contains($n, 'biograph') || str_contains($n, 'autobiograph')) {
            return 'biografia-autobiografia';
        }

        if (str_contains($n, 'poesia') || str_contains($n, 'poetry') || str_contains($n, 'poesía')) {
            return 'poesia';
        }

        if (str_contains($n, 'self-help') || str_contains($n, 'self help') || str_contains($n, 'autoajuda')) {
            return 'autoajuda';
        }

        if (
            str_contains($n, 'juvenile')
            || str_contains($n, 'young adult')
            || str_contains($n, 'infantil')
            || str_contains($n, 'criança')
            || str_contains($n, 'juvenil')
        ) {
            return 'infantil-juvenil';
        }

        if (str_contains($n, 'romance')) {
            return 'romance';
        }

        if (str_contains($n, 'fantasy') || str_contains($n, 'fantasia') || str_contains($n, 'fantástico')) {
            return 'fantasia';
        }

        if (str_contains($n, 'adventure') || str_contains($n, 'aventura')) {
            return 'aventura';
        }

        if (str_contains($n, 'drama') && ! str_contains($n, 'melodrama')) {
            return 'drama';
        }

        if (
            str_contains($n, 'história')
            || str_contains($n, 'historia')
            || (str_contains($n, 'history') && ! str_contains($n, 'science fiction'))
        ) {
            if (! str_contains($n, 'natural history')) {
                return 'historia';
            }
        }

        if (
            str_contains($n, 'science')
            || str_contains($n, 'ciência')
            || str_contains($n, 'ciencia')
            || str_contains($n, 'physics')
            || str_contains($n, 'chemistry')
        ) {
            return 'ciencia';
        }

        if (
            str_contains($n, 'business')
            || str_contains($n, 'finance')
            || str_contains($n, 'economics')
            || str_contains($n, 'negócio')
            || str_contains($n, 'negocio')
        ) {
            return 'negocios-financas';
        }

        if (
            str_contains($n, 'education')
            || str_contains($n, 'textbook')
            || str_contains($n, 'didático')
            || str_contains($n, 'didatico')
        ) {
            return 'educacao-didaticos';
        }

        if (
            str_contains($n, 'fiction')
            || str_contains($n, 'ficção')
            || str_contains($n, 'ficcao')
        ) {
            if (
                ! str_contains($n, 'non-fiction')
                && ! str_contains($n, 'nonfiction')
                && ! str_contains($n, 'não ficção')
                && ! str_contains($n, 'nao ficcao')
            ) {
                return 'fantasia';
            }
        }

        return null;
    }

    private function movePivotsToTarget(int $fromId, int $toId): void
    {
        $links = DB::table('book_category')->where('category_id', $fromId)->get();

        foreach ($links as $link) {
            $bookId = (int) $link->book_id;

            $hasTarget = DB::table('book_category')
                ->where('book_id', $bookId)
                ->where('category_id', $toId)
                ->exists();

            if ($hasTarget) {
                DB::table('book_category')
                    ->where('book_id', $bookId)
                    ->where('category_id', $fromId)
                    ->delete();
            } else {
                DB::table('book_category')
                    ->where('book_id', $bookId)
                    ->where('category_id', $fromId)
                    ->update(['category_id' => $toId]);
            }
        }
    }
}
