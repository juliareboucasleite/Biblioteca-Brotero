<?php

namespace App\Models;

use App\Support\CategoryLabel;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug'];

    public function books()
    {
        return $this->belongsToMany(Book::class, 'book_category');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $array = parent::toArray();

        if (array_key_exists('name', $array) && is_string($array['name'])) {
            $array['name'] = CategoryLabel::toPortuguese($array['name']);
        }

        return $array;
    }
}
