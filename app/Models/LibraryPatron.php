<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Leitor da biblioteca (login estilo quiosque: cartão + data de nascimento).
 *
 * @property int $id
 * @property string $card_number
 * @property \Illuminate\Support\Carbon $birth_date
 * @property string|null $name
 */
class LibraryPatron extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\LibraryPatronFactory> */
    use HasFactory, Notifiable;

    protected $table = 'library_patrons';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'card_number',
        'birth_date',
        'name',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'remember_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }
}
