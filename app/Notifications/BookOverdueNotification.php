<?php

namespace App\Notifications;

use App\Models\BookRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookOverdueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public BookRequest $bookRequest,
        public float $fineAmount,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];
        $email = $notifiable->email ?? null;

        if (is_string($email) && $email !== '') {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $fine = number_format($this->fineAmount, 2, ',', ' ');

        return (new MailMessage)
            ->subject('Biblioteca · livro em atraso')
            ->line('O livro «'.$this->bookRequest->book_title.'» ultrapassou o prazo de devolução.')
            ->line('Multa acumulada (estimativa): **'.$fine.' €**.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'overdue',
            'title' => 'Livro em atraso',
            'message' => 'O livro «'.$this->bookRequest->book_title.'» está em atraso. Multa atual: '.number_format($this->fineAmount, 2, ',', ' ').' €.',
            'book_request_id' => $this->bookRequest->id,
            'book_title' => $this->bookRequest->book_title,
            'fine_amount' => $this->fineAmount,
        ];
    }
}
