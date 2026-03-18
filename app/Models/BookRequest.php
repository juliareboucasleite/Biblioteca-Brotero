<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookRequest extends Model
{
    protected $fillable = [
        'request_type',
        'book_title',
        'isbn',
        'card_number',
        'school_location',
        'cacifo_code',
        'pickup_deadline',
        'return_deadline',
        'status',
        'returned_at',
        'fine_amount',
        'fine_applied_at',
    ];
}

