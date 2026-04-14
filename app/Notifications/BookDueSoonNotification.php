<?php

namespace App\Notifications;

use App\Models\BookRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookDueSoonNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public BookRequest $bookRequest) {}

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
        $deadline = $this->bookRequest->return_deadline?->format('d/m/Y') ?? '-';

        return (new MailMessage)
            ->subject('Biblioteca · devolução amanhã')
            ->line('O prazo de devolução do livro «'.$this->bookRequest->book_title.'» termina em breve (até **'.$deadline.'**).')
            ->line('Evite multas por atraso.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'due_soon',
            'title' => 'Devolução amanhã',
            'message' => 'O livro «'.$this->bookRequest->book_title.'» deve ser devolvido até '.$this->bookRequest->return_deadline?->format('d/m/Y'),
            'book_request_id' => $this->bookRequest->id,
            'book_title' => $this->bookRequest->book_title,
        ];
    }
}
