<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('book_requests', function (Blueprint $table) {
            $table->timestamp('notified_due_soon_at')->nullable()->after('fine_applied_at');
            $table->timestamp('notified_overdue_at')->nullable()->after('notified_due_soon_at');
            $table->timestamp('notified_available_at')->nullable()->after('notified_overdue_at');
        });
    }

    public function down(): void
    {
        Schema::table('book_requests', function (Blueprint $table) {
            $table->dropColumn([
                'notified_due_soon_at',
                'notified_overdue_at',
                'notified_available_at',
            ]);
        });
    }
};
