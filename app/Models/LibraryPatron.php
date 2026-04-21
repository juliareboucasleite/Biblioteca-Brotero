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

    public const ROLE_STUDENT = 'student';

    public const ROLE_TEACHER = 'teacher';

    public const ROLE_STAFF = 'staff';

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
        'role',
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

    /**
     * @return list<string>
     */
    public static function validRoles(): array
    {
        return [
            self::ROLE_STUDENT,
            self::ROLE_TEACHER,
            self::ROLE_STAFF,
        ];
    }

    public function role(): string
    {
        $role = is_string($this->role) ? strtolower(trim($this->role)) : '';

        if (in_array($role, self::validRoles(), true)) {
            return $role;
        }

        $cards = config('biblioteca.librarian_card_numbers', []);
        if (in_array($this->card_number, $cards, true)) {
            return self::ROLE_STAFF;
        }

        if (Schema::hasColumn($this->getTable(), 'is_librarian') && (bool) $this->is_librarian) {
            return self::ROLE_STAFF;
        }

        return self::ROLE_STUDENT;
    }

    public function isStaff(): bool
    {
        return $this->role() === self::ROLE_STAFF;
    }

    /** Bibliotecária/o no quiosque (cartão dedicado ou lista em config). */
    public function isLibrarian(): bool
    {
        $cards = config('biblioteca.librarian_card_numbers', []);

        if (in_array($this->card_number, $cards, true)) {
            return true;
        }

        if ($this->isStaff()) {
            return true;
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
     * @return HasMany<PatronReadingList, $this>
     */
    public function readingLists(): HasMany
    {
        return $this->hasMany(PatronReadingList::class, 'library_patron_id');
    }

    /**
     * @return HasMany<TeacherBookReservation, $this>
     */
    public function teacherReservations(): HasMany
    {
        return $this->hasMany(TeacherBookReservation::class, 'library_patron_id');
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
