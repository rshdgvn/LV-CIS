<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Google API Credentials
    |--------------------------------------------------------------------------
    |
    | Client ID, Client Secret, Redirect URI, and Gmail From address
    | for sending emails via Gmail API.
    |
    */

    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect_uri' => env('GOOGLE_REDIRECT_URI'),

    'from_email' => env('GMAIL_FROM'),

    /*
    |--------------------------------------------------------------------------
    | Gmail API Token
    |--------------------------------------------------------------------------
    |
    | You can store a long-lived access token and refresh token here.
    | This allows the service to send emails without interactive OAuth flow.
    |
    */

    'access_token' => env('GOOGLE_ACCESS_TOKEN'),
    'refresh_token' => env('GOOGLE_REFRESH_TOKEN'),
    'scope' => env('GOOGLE_TOKEN_SCOPE'),
    'token_type' => env('GOOGLE_TOKEN_TYPE'),
    'token_created' => env('GOOGLE_TOKEN_CREATED'),
    'token_expires_in' => env('GOOGLE_TOKEN_EXPIRES_IN'),
];
