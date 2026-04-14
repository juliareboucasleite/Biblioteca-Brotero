<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patron_reading_lists', function (Blueprint $table): void {
            if (! Schema::hasColumn('patron_reading_lists', 'type')) {
                $table->string('type', 30)->default('custom')->after('name');
            }
            if (! Schema::hasColumn('patron_reading_lists', 'visibility')) {
                $table->string('visibility', 20)->default('private')->after('type');
            }
            if (! Schema::hasColumn('patron_reading_lists', 'classroom')) {
                $table->string('classroom', 120)->nullable()->after('visibility');
            }
            if (! Schema::hasColumn('patron_reading_lists', 'theme')) {
                $table->string('theme', 160)->nullable()->after('classroom');
            }
            if (! Schema::hasColumn('patron_reading_lists', 'share_code')) {
                $table->string('share_code', 12)->nullable()->after('theme');
            }
            if (! Schema::hasColumn('patron_reading_lists', 'share_token')) {
                $table->string('share_token', 64)->nullable()->after('share_code');
            }
            if (! Schema::hasColumn('patron_reading_lists', 'reserved_copies')) {
                $table->unsignedInteger('reserved_copies')->nullable()->after('share_token');
            }
            if (! Schema::hasColumn('patron_reading_lists', 'reserved_for_date')) {
                $table->date('reserved_for_date')->nullable()->after('reserved_copies');
            }
        });

        Schema::table('patron_reading_list_books', function (Blueprint $table): void {
            if (! Schema::hasColumn('patron_reading_list_books', 'progress_percent')) {
                $table->unsignedTinyInteger('progress_percent')->default(0)->after('book_id');
            }
            if (! Schema::hasColumn('patron_reading_list_books', 'current_page')) {
                $table->unsignedInteger('current_page')->nullable()->after('progress_percent');
            }
            if (! Schema::hasColumn('patron_reading_list_books', 'reading_status')) {
                $table->string('reading_status', 20)->default('not_started')->after('current_page');
            }
            if (! Schema::hasColumn('patron_reading_list_books', 'started_at')) {
                $table->timestamp('started_at')->nullable()->after('reading_status');
            }
            if (! Schema::hasColumn('patron_reading_list_books', 'finished_at')) {
                $table->timestamp('finished_at')->nullable()->after('started_at');
            }
        });

        Schema::table('books', function (Blueprint $table): void {
            if (! Schema::hasColumn('books', 'school_subject')) {
                $table->string('school_subject', 120)->nullable()->after('language');
            }
            if (! Schema::hasColumn('books', 'school_year')) {
                $table->string('school_year', 40)->nullable()->after('school_subject');
            }
            if (! Schema::hasColumn('books', 'target_age_min')) {
                $table->unsignedTinyInteger('target_age_min')->nullable()->after('school_year');
            }
            if (! Schema::hasColumn('books', 'target_age_max')) {
                $table->unsignedTinyInteger('target_age_max')->nullable()->after('target_age_min');
            }
        });

        if (! Schema::hasTable('teacher_book_reservations')) {
            Schema::create('teacher_book_reservations', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('library_patron_id')->constrained('library_patrons')->cascadeOnDelete();
                $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
                $table->string('classroom', 120);
                $table->string('theme', 160)->nullable();
                $table->unsignedInteger('copies');
                $table->date('reserved_for_date')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_book_reservations');

        Schema::table('books', function (Blueprint $table): void {
            $drop = [];
            foreach (['school_subject', 'school_year', 'target_age_min', 'target_age_max'] as $col) {
                if (Schema::hasColumn('books', $col)) {
                    $drop[] = $col;
                }
            }
            if ($drop !== []) {
                $table->dropColumn($drop);
            }
        });

        Schema::table('patron_reading_list_books', function (Blueprint $table): void {
            $drop = [];
            foreach (['progress_percent', 'current_page', 'reading_status', 'started_at', 'finished_at'] as $col) {
                if (Schema::hasColumn('patron_reading_list_books', $col)) {
                    $drop[] = $col;
                }
            }
            if ($drop !== []) {
                $table->dropColumn($drop);
            }
        });

        Schema::table('patron_reading_lists', function (Blueprint $table): void {
            $drop = [];
            foreach ([
                'type',
                'visibility',
                'classroom',
                'theme',
                'share_code',
                'share_token',
                'reserved_copies',
                'reserved_for_date',
            ] as $col) {
                if (Schema::hasColumn('patron_reading_lists', $col)) {
                    $drop[] = $col;
                }
            }
            if ($drop !== []) {
                $table->dropColumn($drop);
            }
        });
    }
};
