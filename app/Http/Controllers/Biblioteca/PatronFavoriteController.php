<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\LibraryPatron;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class PatronFavoriteController extends Controller
{
    public function store(Book $book): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = Auth::guard('patron')->user();
        $patron->favoriteBooks()->syncWithoutDetaching([$book->id]);

        return back();
    }

    public function destroy(Book $book): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = Auth::guard('patron')->user();
        $patron->favoriteBooks()->detach($book->id);

        return back();
    }
}
