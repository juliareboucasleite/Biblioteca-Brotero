<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Services\PatronRankingService;
use Inertia\Inertia;
use Inertia\Response;

class PatronRankingController extends Controller
{
    public function index(PatronRankingService $rankingService): Response
    {
        return Inertia::render('biblioteca/ranking', [
            'ranking' => $rankingService->topEntries(50),
        ]);
    }
}
