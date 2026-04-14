<?php

namespace Database\Factories;

use App\Models\LibraryPatron;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LibraryPatron>
 */
class LibraryPatronFactory extends Factory
{
    protected $model = LibraryPatron::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'card_number' => str_pad((string) random_int(0, 99999), 5, '0', STR_PAD_LEFT),
            'birth_date' => fake()->date(),
            'name' => fake()->name(),
            'role' => LibraryPatron::ROLE_STUDENT,
            'is_librarian' => false,
        ];
    }
}
