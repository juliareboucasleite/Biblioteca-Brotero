<?php

namespace App\Notifications;

use App\Models\Book;
use App\Models\BookRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookAvailableNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Book $book,
        public BookRequest $returnedRequest,
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
        return (new MailMessage)
            ->subject('Biblioteca — livro disponível')
            ->line('O livro «'.$this->book->title.'» voltou a ficar disponível para requisição.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'available',
            'title' => 'Livro disponível',
            'message' => 'O livro «'.$this->book->title.'» pode voltar a ser requisitado.',
            'book_id' => $this->book->id,
            'book_title' => $this->book->title,
            'book_request_id' => $this->returnedRequest->id,
        ];
    }
}
