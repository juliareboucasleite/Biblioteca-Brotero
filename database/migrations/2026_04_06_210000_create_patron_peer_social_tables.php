<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patron_blocks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('blocker_library_patron_id')->constrained('library_patrons')->cascadeOnDelete();
            $table->foreignId('blocked_library_patron_id')->constrained('library_patrons')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['blocker_library_patron_id', 'blocked_library_patron_id'], 'patron_block_unique');
        });

        Schema::create('patron_peer_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('reporter_library_patron_id')->constrained('library_patrons')->cascadeOnDelete();
            $table->foreignId('reported_library_patron_id')->constrained('library_patrons')->cascadeOnDelete();
            $table->foreignId('patron_conversation_id')->nullable()->constrained('patron_conversations')->nullOnDelete();
            $table->string('category', 64);
            $table->text('details')->nullable();
            $table->timestamps();
        });

        Schema::create('patron_peer_book_shares', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('from_library_patron_id')->constrained('library_patrons')->cascadeOnDelete();
            $table->foreignId('to_library_patron_id')->constrained('library_patrons')->cascadeOnDelete();
            $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
            $table->string('note', 500)->nullable();
            $table->timestamps();

            $table->unique(
                ['from_library_patron_id', 'to_library_patron_id', 'book_id'],
                'patron_peer_book_share_unique',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patron_peer_book_shares');
        Schema::dropIfExists('patron_peer_reports');
        Schema::dropIfExists('patron_blocks');
    }
};
