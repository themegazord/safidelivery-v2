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

    // Credencial própria, diferente da API key do Maps acima — gerada em
    // https://www.google.com/recaptcha/admin.
    'recaptcha' => [
        'site_key' => env('RECAPTCHA_SITE_KEY'),
        'secret_key' => env('RECAPTCHA_SECRET_KEY'),
        'min_score' => (float) env('RECAPTCHA_MIN_SCORE', 0.5),
    ],

    // Conta Twilio própria da SAFI (não por empresa) usada para notificar clientes
    // por WhatsApp a cada mudança de status de pedido.
    'twilio' => [
        'sid' => env('TWILIO_ACCOUNT_SID'),
        'token' => env('TWILIO_AUTH_TOKEN'),
        'whatsapp_from' => env('TWILIO_WHATSAPP_FROM'),
        // Um Content Template (WhatsApp) por status de pedido, aprovado pela Meta.
        // Enquanto o SID de um status estiver vazio (ou o template ainda não tiver
        // sido aprovado), o envio cai para texto livre (Body) nesse status — só
        // funciona dentro da janela de 24h de conversa iniciada pelo cliente, ou no
        // Sandbox após o número de destino enviar "join <código>".
        'whatsapp_content_sids' => [
            'aceito' => env('TWILIO_CONTENT_SID_ACEITO'),
            'sendo preparado' => env('TWILIO_CONTENT_SID_PREPARO'),
            'pronto para entrega' => env('TWILIO_CONTENT_SID_PRONTO_ENTREGA'),
            'pronto para retirada' => env('TWILIO_CONTENT_SID_PRONTO_RETIRADA'),
            'sendo entregue' => env('TWILIO_CONTENT_SID_A_CAMINHO'),
            'entregue' => env('TWILIO_CONTENT_SID_ENTREGUE'),
            'cancelado' => env('TWILIO_CONTENT_SID_CANCELADO'),
        ],
    ],

];
