<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookDetail extends Model
{
    protected $fillable = [
        'book_id',
        'publisher',
        'location',
        'format',
        'dimensions'
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}
