<?php

namespace Database\Seeders;

use App\Models\LibraryPatron;
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
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        LibraryPatron::query()->firstOrCreate(
            ['card_number' => '12345'],
            [
                'birth_date' => '2010-06-15',
                'name' => 'Leitor exemplo (quiosque)',
            ],
        );
    }
}
