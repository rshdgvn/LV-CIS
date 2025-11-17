<?php

namespace App\Services;

use Google\Client;
use Google\Service\Gmail;
use App\Models\GmailToken;
use Carbon\Carbon;

class GmailService
{
    private function getClient()
    {
        $client = new Client();

        $client->setClientId(config('gmail.client_id'));
        $client->setClientSecret(config('gmail.client_secret'));
        $client->setRedirectUri(config('gmail.redirect_uri'));
        $client->addScope(Gmail::GMAIL_SEND);

        // Get token from database or create from env (first time)
        $tokenRecord = GmailToken::where('identifier', 'system')->first();

        if (!$tokenRecord) {
            // First time: seed from .env
            $tokenRecord = GmailToken::create([
                'identifier' => 'system',
                'access_token' => config('gmail.access_token'),
                'refresh_token' => config('gmail.refresh_token'),
                'scope' => config('gmail.scope'),
                'token_type' => config('gmail.token_type'),
                'expires_in' => config('gmail.token_expires_in'),
                'token_created_at' => Carbon::createFromTimestamp(config('gmail.token_created')),
            ]);
        }

        $accessToken = [
            'access_token' => $tokenRecord->access_token,
            'refresh_token' => $tokenRecord->refresh_token,
            'scope' => $tokenRecord->scope,
            'token_type' => $tokenRecord->token_type,
            'created' => $tokenRecord->token_created_at->timestamp,
            'expires_in' => $tokenRecord->expires_in,
        ];

        $client->setAccessToken($accessToken);

        // Refresh token if expired
        if ($client->isAccessTokenExpired()) {
            $newToken = $client->fetchAccessTokenWithRefreshToken($tokenRecord->refresh_token);

            // Save new token to database
            $tokenRecord->update([
                'access_token' => $newToken['access_token'],
                'expires_in' => $newToken['expires_in'],
                'token_created_at' => Carbon::now(),
            ]);
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
