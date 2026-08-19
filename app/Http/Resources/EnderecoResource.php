<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Endereco
 */
class EnderecoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'logradouro' => $this->getAttribute('logradouro'),
            'bairro' => $this->getAttribute('bairro'),
            'cidade' => $this->getAttribute('cidade'),
            'uf' => $this->getAttribute('uf'),
            'cep' => $this->getAttribute('cep'),
            'numero' => $this->getAttribute('numero'),
            'complemento' => $this->getAttribute('complemento'),
            'created_at' => $this->getAttribute('created_at'),
            'updated_at' => $this->getAttribute('updated_at'),
        ];
    }
}
