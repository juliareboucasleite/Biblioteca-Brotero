<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patron_reading_lists', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('library_patron_id')->constrained('library_patrons')->cascadeOnDelete();
            $table->string('name', 120);
            $table->timestamps();

            $table->unique(['library_patron_id', 'name'], 'patron_reading_lists_owner_name_unique');
        });

        Schema::create('patron_reading_list_books', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('patron_reading_list_id')->constrained('patron_reading_lists')->cascadeOnDelete();
            $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['patron_reading_list_id', 'book_id'], 'patron_reading_list_books_unique');
        });

        if (! Schema::hasTable('book_favorites')) {
            return;
        }

        $favoritesByPatron = DB::table('book_favorites')
            ->select(['library_patron_id', 'book_id'])
            ->orderBy('library_patron_id')
            ->orderBy('id')
            ->get()
            ->groupBy('library_patron_id');

        foreach ($favoritesByPatron as $patronId => $favorites) {
            $now = now();

            $listId = DB::table('patron_reading_lists')->insertGetId([
                'library_patron_id' => (int) $patronId,
                'name' => 'Ler mais tarde',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $rows = [];
            foreach ($favorites as $favorite) {
                $rows[] = [
                    'patron_reading_list_id' => $listId,
                    'book_id' => (int) $favorite->book_id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if ($rows !== []) {
                DB::table('patron_reading_list_books')->insert($rows);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('patron_reading_list_books');
        Schema::dropIfExists('patron_reading_lists');
    }
};
