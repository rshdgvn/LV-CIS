<?php

namespace App\Services;

use Google\Client;
use Google\Service\Gmail;

class GmailService
{
    private function getClient()
    {
        $client = new Client();

        $client->setClientId(config('gmail.client_id'));
        $client->setClientSecret(config('gmail.client_secret'));
        $client->setRedirectUri(config('gmail.redirect_uri'));

        $client->addScope(Gmail::GMAIL_SEND);

        $accessToken = [
            'access_token' => config('gmail.access_token'),
            'refresh_token' => config('gmail.refresh_token'),
            'scope' => config('gmail.scope'),
            'token_type' => config('gmail.token_type'),
            'created' => config('gmail.token_created'),
            'expires_in' => config('gmail.token_expires_in'),
        ];

        $client->setAccessToken($accessToken);

        if ($client->isAccessTokenExpired()) {
            $newToken = $client->fetchAccessTokenWithRefreshToken($accessToken['refresh_token']);
            // optionally update .env or config cache here
        }

        return $client;
    }

    public function send($to, $subject, $htmlBody)
    {
        $client = $this->getClient();
        $gmail = new Gmail($client);

        $rawMessage = "From: " . config('gmail.from_email') . "\r\n";
        $rawMessage .= "To: $to\r\n";
        $rawMessage .= "Subject: $subject\r\n";
        $rawMessage .= "MIME-Version: 1.0\r\n";
        $rawMessage .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
        $rawMessage .= $htmlBody;

        $rawMessage = rtrim(strtr(base64_encode($rawMessage), '+/', '-_'), '=');

        $message = new Gmail\Message();
        $message->setRaw($rawMessage);

        return $gmail->users_messages->send('me', $message);
    }
}
