<?php

namespace App\Console\Commands;

use App\Models\BookRequest;
use App\Models\LibraryPatron;
use App\Notifications\BookDueSoonNotification;
use App\Notifications\BookOverdueNotification;
use App\Services\BookFineCalculator;
use Illuminate\Console\Command;

/**
 * Atualiza multas e envia lembretes (véspera / em atraso) para requisições ativas.
 */
class CheckBookDeadlines extends Command
{
    protected $signature = 'books:check-deadlines';

    protected $description = 'Atualiza multas e notifica leitores sobre prazos de devolução (véspera / em atraso)';

    public function handle(BookFineCalculator $fineCalculator): int
    {
        $today = now()->startOfDay();
        $onNextDay = $today->copy()->addDay();

        $updatedFines = 0;
        $dueSoon = 0;
        $overdue = 0;

        BookRequest::query()
            ->where('status', 'created')
            ->whereNull('returned_at')
            ->whereNotNull('return_deadline')
            ->chunkById(100, function ($requests) use ($fineCalculator, $today, $onNextDay, &$updatedFines, &$dueSoon, &$overdue): void {
                foreach ($requests as $request) {
                    $fineBefore = (float) $request->fine_amount;
                    $fineCalculator->persistFine($request);
                    $request->refresh();

                    if ((float) $request->fine_amount !== $fineBefore) {
                        $updatedFines++;
                    }

                    $deadlineDay = $request->return_deadline->copy()->startOfDay();

                    $patron = LibraryPatron::query()
                        ->where('card_number', $request->card_number)
                        ->first();

                    if ($patron === null) {
                        continue;
                    }

                    if (
                        $deadlineDay->greaterThan($today)
                        && $deadlineDay->equalTo($onNextDay)
                        && $request->notified_due_soon_at === null
                    ) {
                        $patron->notify(new BookDueSoonNotification($request));
                        $request->forceFill(['notified_due_soon_at' => now()])->save();
                        $dueSoon++;
                    }

                    if (
                        $today->greaterThan($deadlineDay)
                        && $request->notified_overdue_at === null
                    ) {
                        $fine = $fineCalculator->calculateForRequest($request);
                        $patron->notify(new BookOverdueNotification($request, $fine));
                        $request->forceFill(['notified_overdue_at' => now()])->save();
                        $overdue++;
                    }
                }
            });

        $this->info("Linhas com multa alterada: {$updatedFines}. Avisos «vence amanhã»: {$dueSoon}. Avisos atraso: {$overdue}.");

        return self::SUCCESS;
    }
}
