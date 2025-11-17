<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Google\Client;

class GmailOAuth extends Command
{
    protected $signature = 'gmail:authorize';
    protected $description = 'Run Gmail OAuth flow to generate token.json with refresh token';

    public function handle()
    {
        $client = new Client();
        $client->setAuthConfig(storage_path('app/google/credentials.json'));

        // Request Gmail send + user info scopes
        $client->setScopes([
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ]);

        $client->setAccessType('offline');
        $client->setPrompt('consent');

        $authUrl = $client->createAuthUrl();
        $this->info("Open this URL in your browser:\n$authUrl\n");

        $code = $this->ask("Enter the authorization code from Google: ");

        $token = $client->fetchAccessTokenWithAuthCode($code);

        if (isset($token['error'])) {
            $this->error("Error fetching token: " . $token['error_description']);
            return 1;
        }

        file_put_contents(storage_path('app/google/token.json'), json_encode($token));
        $this->info("Token saved successfully at storage/app/google/token.json");
        $this->info("You can now send emails and fetch user info using Gmail API.");
        return 0;
    }
}
