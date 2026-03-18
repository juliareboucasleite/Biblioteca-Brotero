<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
   protected $fillable = [
        'title',
        'description',
        'isbn',
        'published_year',
        'pages',
        'cover_image',
        'language'
    ];

    public function authors()
    {
        return $this->belongsToMany(Author::class, 'book_author');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'book_category');
    }

    public function details()
    {
        return $this->hasOne(BookDetail::class);
    }
}

