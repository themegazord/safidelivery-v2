<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnderecoForaAreaEntregaException extends Exception
{
    public function __construct(string $message = 'Seu endereço está fora da área de entrega deste estabelecimento.')
    {
        parent::__construct($message);
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'endereco_erro' => $this->getMessage(),
        ], 422);
    }
}
