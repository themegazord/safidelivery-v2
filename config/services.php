<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'pagarme' => [
        'urlBase' => env('PAGARME_URL_API', 'https://api.pagar.me/core/v5'),
    ],

    'github' => [
        'token' => env('GITHUB_API_TOKEN'),
        'repo' => env('GITHUB_REPO', 'themegazord/safidelivery-v2'),
    ],

    'mgc' => [
        'region' => env('MGC_REGION'),
        'id' => env('MGC_ID'),
        'secret_access_key' => env('MGC_SECRET_ACCESS_KEY'),
        'endpoint' => env('MGC_ENDPOINT'),
        'use_path_style_endpoint' => env('MGC_USE_PATH_STYLE_ENDPOINT', false),
        'bucket' => env('MGC_BUCKET'),
    ],

    'google' => [
        'geocoding_api' => env('GOOGLE_GEOCODING_API'),
        'distance_matrix_api' => env('GOOGLE_DISTANCE_MATRIX_API'),
        'api_token' => env('GOOGLE_API_TOKEN'),
        'maps_map_id' => env('GOOGLE_MAPS_MAP_ID', 'DEMO_MAP_ID'),
    ],

];
