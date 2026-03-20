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
 * @property string|null $email
 * @property int $points
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
        'email',
        'points',
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
            'points' => 'integer',
        ];
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Book, $this>
     */
    public function favoriteBooks()
    {
        return $this->belongsToMany(Book::class, 'book_favorites', 'library_patron_id', 'book_id')
            ->withTimestamps();
    }

    /** Canal opcional de e-mail: só se o leitor tiver email na base. */
    public function routeNotificationForMail(): ?string
    {
        $email = $this->email;

        return is_string($email) && $email !== '' ? $email : null;
    }
}
