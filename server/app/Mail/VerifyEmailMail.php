<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public $name;
    public $verificationLink;

    public function __construct($name, $verificationLink)
    {
        $this->name = $name;
        $this->verificationLink = $verificationLink;
    }

    public function build()
    {
        return $this->subject('Verify Your Email - LVCIS')
            ->view('emails.verify-email')
            ->with([
                'name' => $this->name,
                'verificationLink' => $this->verificationLink,
            ]);
    }
}
