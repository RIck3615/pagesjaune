<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@pagesjaunes.cd',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'phone' => '+243 123 456 789',
        ]);

        // Create test business user
        User::create([
            'name' => 'Test Business',
            'email' => 'business@pagesjaunes.cd',
            'password' => bcrypt('password'),
            'role' => 'business',
            'phone' => '+243 987 654 321',
        ]);

        // Create test regular user
        User::create([
            'name' => 'Test User',
            'email' => 'user@pagesjaunes.cd',
            'password' => bcrypt('password'),
            'role' => 'user',
            'phone' => '+243 555 123 456',
        ]);

        // Seed categories
        $this->call(CategorySeeder::class);
    }
}
