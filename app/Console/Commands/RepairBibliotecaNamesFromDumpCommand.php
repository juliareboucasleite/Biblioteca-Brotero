<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

/**
 * Repõe nomes de autores e categorias quando a importação MySQL substituiu caracteres UTF-8 por "?".
 *
 * Requer um ficheiro SQL UTF-8 com os INSERT de `authors` e `categories` (ex.: exportação phpMyAdmin).
 */
class RepairBibliotecaNamesFromDumpCommand extends Command
{
    protected $signature = 'biblioteca:repair-names-from-dump
                            {--path= : Caminho relativo ao diretório base do projeto (ficheiro SQL UTF-8)}
                            {--dry-run : Apenas mostrar contagens e diferenças, sem gravar}';

    protected $description = 'Repor nomes de autores e categorias a partir de dump SQL UTF-8 (corrige "?" de importação)';

    public function handle(): int
    {
        $relative = trim((string) $this->option('path'));
        if ($relative === '') {
            $this->error('Indique o ficheiro com --path= (ex.: --path=database/meu_dump.sql).');

            return self::FAILURE;
        }

        $fullPath = base_path($relative);

        if (! File::isFile($fullPath)) {
            $this->error("Ficheiro não encontrado: {$fullPath}");

            return self::FAILURE;
        }

        $sql = File::get($fullPath);
        if ($sql === false || $sql === '') {
            $this->error('Não foi possível ler o ficheiro SQL.');

            return self::FAILURE;
        }

        $authors = $this->parseNameRowsFromInsert($sql, 'authors');
        $categories = $this->parseNameRowsFromInsert($sql, 'categories');

        if ($authors === [] || $categories === []) {
            $this->error('Não foi possível extrair INSERT de autores ou categorias do ficheiro.');

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');

        $this->info('Referência: '.count($authors).' autores, '.count($categories).' categorias.');

        $authorDiff = $this->previewUpdates('authors', $authors);
        $categoryDiff = $this->previewUpdates('categories', $categories);

        if ($dryRun) {
            $this->warn('Dry-run: nada foi gravado.');
            $this->line("Autores a atualizar: {$authorDiff}");
            $this->line("Categorias a atualizar: {$categoryDiff}");

            return self::SUCCESS;
        }

        DB::transaction(function () use ($authors, $categories, &$authorDiff, &$categoryDiff): void {
            foreach ($authors as $id => $name) {
                DB::table('authors')->where('id', $id)->update(['name' => $name]);
            }
            foreach ($categories as $id => $name) {
                DB::table('categories')->where('id', $id)->update(['name' => $name]);
            }
        });

        $this->info('Nomes repostos com sucesso.');
        $this->line("Autores atualizados: {$authorDiff}");
        $this->line("Categorias atualizadas: {$categoryDiff}");

        return self::SUCCESS;
    }

    /**
     * @return array<int, string>
     */
    private function parseNameRowsFromInsert(string $sql, string $table): array
    {
        $block = $this->extractInsertValuesBlock($sql, $table);
        if ($block === null) {
            return [];
        }

        if (! preg_match_all("/\((\d+),\s*'((?:\\\\'|[^'])*)'\s*,/u", $block, $rows, PREG_SET_ORDER)) {
            return [];
        }

        $out = [];
        foreach ($rows as $row) {
            $id = (int) $row[1];
            $name = str_replace("\\'", "'", $row[2]);
            $out[$id] = $name;
        }

        return $out;
    }

    /**
     * Obtém o INSERT completo até à linha que termina com ");" (evita cortar em ";" dentro de strings).
     */
    private function extractInsertValuesBlock(string $sql, string $table): ?string
    {
        $needle = 'INSERT INTO `'.$table.'`';
        $start = strpos($sql, $needle);
        if ($start === false) {
            return null;
        }

        $lines = preg_split('/\r\n|\n|\r/', substr($sql, $start)) ?: [];
        $buf = [];
        foreach ($lines as $line) {
            $buf[] = $line;
            if (preg_match('/\)\s*;\s*$/', $line)) {
                return implode("\n", $buf);
            }
        }

        return null;
    }

    /**
     * @param  array<int, string>  $canonical
     */
    private function previewUpdates(string $table, array $canonical): int
    {
        $changed = 0;

        foreach ($canonical as $id => $name) {
            $current = DB::table($table)->where('id', $id)->value('name');
            if ($current === null) {
                continue;
            }
            if ((string) $current !== $name) {
                $changed++;
            }
        }

        return $changed;
    }
}
