<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Vérifier si les colonnes n'existent pas déjà
            if (!Schema::hasColumn('reviews', 'admin_comment')) {
                $table->text('admin_comment')->nullable();
            }
            if (!Schema::hasColumn('reviews', 'moderated_at')) {
                $table->timestamp('moderated_at')->nullable();
            }
            if (!Schema::hasColumn('reviews', 'moderated_by')) {
                $table->unsignedBigInteger('moderated_by')->nullable();
                $table->foreign('moderated_by')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (Schema::hasColumn('reviews', 'moderated_by')) {
                $table->dropForeign(['moderated_by']);
                $table->dropColumn('moderated_by');
            }
            if (Schema::hasColumn('reviews', 'admin_comment')) {
                $table->dropColumn('admin_comment');
            }
            if (Schema::hasColumn('reviews', 'moderated_at')) {
                $table->dropColumn('moderated_at');
            }
        });
    }
};
