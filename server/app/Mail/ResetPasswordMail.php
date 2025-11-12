<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;
    public $user;

    public function __construct($token, User $user)
    {
        $this->token = $token;
        $this->user = $user;
    }

    public function build()
    {
        $frontendUrl = config('app.frontend_url', env('APP_FRONTEND_URL', 'http://localhost:5173'));
        $resetLink = "{$frontendUrl}/reset-password?token={$this->token}&email={$this->user->email}";

        // Detect if we're on Render (blocked SMTP)
        if (env('RENDER', false)) {
            // Send via Mailtrap API
            $response = Http::withToken(env('MAILTRAP_API_KEY'))
                ->post('https://sandbox.api.mailtrap.io/api/send', [
                    'from' => [
                        'email' => env('MAIL_FROM_ADDRESS', 'no-reply@yourdomain.com'),
                        'name' => env('MAIL_FROM_NAME', 'LV CIS'),
                    ],
                    'to' => [
                        ['email' => $this->user->email],
                    ],
                    'subject' => 'Reset Your Password',
                    'text' => "Hello {$this->user->name}, click here to reset your password: {$resetLink}",
                    'inbox_id' => env('MAILTRAP_INBOX_ID', 4176085),
                    'is_sandbox' => true,
                ]);

            // Log response for debugging
            Log::info('Mailtrap API response', $response->json());

            // Return $this to satisfy Mailable
            return $this;
        }

        // Local / SMTP (Gmail)
        return $this->subject('Reset Your Password')
            ->view('emails.reset-password')
            ->with([
                'name' => $this->user->name,
                'resetLink' => $resetLink,
            ]);
    }
}
