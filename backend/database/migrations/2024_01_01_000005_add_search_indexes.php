<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('businesses', function (Blueprint $table) {
            // Index pour la recherche textuelle
            $table->index(['name', 'is_active', 'is_verified']);
            $table->index(['city', 'is_active', 'is_verified']);
            $table->index(['province', 'is_active', 'is_verified']);
            $table->index(['is_premium', 'is_active', 'is_verified']);
            $table->index(['created_at', 'is_active', 'is_verified']);

            // Index pour la recherche full-text (si supporté par votre base de données)
            // $table->fullText(['name', 'description', 'address']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->index(['name', 'is_active']);
        });
    }

    public function down()
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropIndex(['name', 'is_active', 'is_verified']);
            $table->dropIndex(['city', 'is_active', 'is_verified']);
            $table->dropIndex(['province', 'is_active', 'is_verified']);
            $table->dropIndex(['is_premium', 'is_active', 'is_verified']);
            $table->dropIndex(['created_at', 'is_active', 'is_verified']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['name', 'is_active']);
        });
    }
};
