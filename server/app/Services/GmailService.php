<?php

namespace App\Services;

use Google\Client;
use Google\Service\Gmail;

class GmailService
{
    private function getClient()
    {
        $client = new Client();

        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));

        $client->setRedirectUri(config('app.url') . '/api/auth/google/callback');

        $client->addScope(Gmail::GMAIL_SEND);

        $accessToken = [
            'access_token' => env('GOOGLE_ACCESS_TOKEN'),
            'refresh_token' => env('GOOGLE_REFRESH_TOKEN'),
            'scope' => env('GOOGLE_TOKEN_SCOPE'),
            'token_type' => env('GOOGLE_TOKEN_TYPE'),
            'created' => env('GOOGLE_TOKEN_CREATED'),
            'expires_in' => env('GOOGLE_TOKEN_EXPIRES_IN'),
        ];

        $client->setAccessToken($accessToken);

        if ($client->isAccessTokenExpired()) {
            $client->fetchAccessTokenWithRefreshToken($accessToken['refresh_token']);
        }

        return $client;
    }

    public function send($to, $subject, $htmlBody)
    {
        $client = $this->getClient();
        $gmail = new Gmail($client);

        $rawMessage = "From: " . env('GMAIL_FROM') . "\r\n";
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
