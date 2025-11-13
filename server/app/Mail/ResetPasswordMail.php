<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;
    public $user;
    public $resetLink;

    public function __construct($token, User $user)
    {
        $this->token = $token;
        $this->user = $user;

        $frontendUrl = config('app.frontend_url', env('APP_FRONTEND_URL', 'http://localhost:5173'));
        $this->resetLink = "{$frontendUrl}/reset-password?token={$this->token}&email={$this->user->email}";
    }

    public function build()
    {
        $this->from(
            env('MAIL_FROM_ADDRESS', 'no-reply@lv-cis.laverdad.edu.ph'),
            env('MAIL_FROM_NAME', 'LV CIS')
        );

        $this->subject('Reset Your Password');

        return $this->view('emails.reset-password')
            ->with([
                'name' => $this->user->name,
                'resetLink' => $this->resetLink,
            ]);
    }
}
