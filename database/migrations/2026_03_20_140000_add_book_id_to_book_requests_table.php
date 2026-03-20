<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('book_requests', function (Blueprint $table) {
            $table->foreignId('book_id')->nullable()->after('id')->constrained('books')->nullOnDelete();
        });

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement('
                UPDATE book_requests br
                INNER JOIN books b ON b.isbn = br.isbn AND br.isbn IS NOT NULL AND br.isbn != ""
                SET br.book_id = b.id
                WHERE br.book_id IS NULL
            ');
        } else {
            foreach (DB::table('book_requests')->whereNull('book_id')->whereNotNull('isbn')->cursor() as $row) {
                $isbn = (string) $row->isbn;

                if ($isbn === '') {
                    continue;
                }

                $bookId = DB::table('books')->where('isbn', $isbn)->value('id');

                if ($bookId !== null) {
                    DB::table('book_requests')->where('id', $row->id)->update(['book_id' => $bookId]);
                }
            }
        }
    }

    public function down(): void
    {
        Schema::table('book_requests', function (Blueprint $table) {
            $table->dropForeign(['book_id']);
            $table->dropColumn('book_id');
        });
    }
};
