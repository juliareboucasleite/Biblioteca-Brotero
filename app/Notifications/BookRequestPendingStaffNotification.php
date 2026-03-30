<?php

namespace App\Notifications;

use App\Models\BookRequest;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Enviado on-demand para os e-mails configurados em biblioteca.librarian_notify_emails.
 */
class BookRequestPendingStaffNotification extends Notification
{
    public function __construct(public BookRequest $bookRequest) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = route('staff.pedidos.index');

        $lines = [
            'Novo pedido de requisição pendente de aprovação.',
            'Livro: «'.$this->bookRequest->book_title.'»',
            'Cartão (5 dígitos): '.$this->bookRequest->card_number,
            'Tipo: '.($this->bookRequest->request_type === 'escola' ? 'Retirada na escola' : 'Cacifo'),
        ];

        if ($this->bookRequest->request_type === 'escola' && $this->bookRequest->school_location) {
            $lines[] = 'Local: '.$this->bookRequest->school_location;
        }

        $message = (new MailMessage)
            ->subject('Biblioteca — novo pedido pendente ('.$this->bookRequest->book_title.')')
            ->line(implode(' · ', array_slice($lines, 0, 4)));

        foreach (array_slice($lines, 4) as $line) {
            $message->line($line);
        }

        return $message
            ->action('Abrir painel de pedidos', $url)
            ->line('Valide o cartão do aluno e aprove ou recuse o pedido.');
    }
}
