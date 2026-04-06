<?php

namespace App\Models;

use Database\Factories\LibraryPatronFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;

/**
 * Leitor da biblioteca (login estilo quiosque: cartão + data de nascimento).
 *
 * @property int $id
 * @property string $card_number
 * @property Carbon $birth_date
 * @property string|null $name
 * @property string|null $email
 * @property int $points
 */
class LibraryPatron extends Authenticatable
{
    /** @use HasFactory<LibraryPatronFactory> */
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
        'is_librarian',
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
            'is_librarian' => 'boolean',
        ];
    }

    /** Bibliotecária/o no quiosque (cartão dedicado ou lista em config). */
    public function isLibrarian(): bool
    {
        $cards = config('biblioteca.librarian_card_numbers', []);

        if (in_array($this->card_number, $cards, true)) {
            return true;
        }

        if (! Schema::hasColumn($this->getTable(), 'is_librarian')) {
            return false;
        }

        return (bool) $this->is_librarian;
    }

    /**
     * @return BelongsToMany<Book, $this>
     */
    public function favoriteBooks()
    {
        return $this->belongsToMany(Book::class, 'book_favorites', 'library_patron_id', 'book_id')
            ->withTimestamps();
    }

    /**
     * @return HasMany<BookShare, $this>
     */
    public function bookShares(): HasMany
    {
        return $this->hasMany(BookShare::class, 'library_patron_id');
    }

    /** Canal opcional de e-mail: só se o leitor tiver email na base. */
    public function routeNotificationForMail(): ?string
    {
        $email = $this->email;

        return is_string($email) && $email !== '' ? $email : null;
    }
}
