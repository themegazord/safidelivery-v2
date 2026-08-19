<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ItemPreco
 */
class SaborPizzaResource extends JsonResource
{
    public function __construct($resource, private readonly int $qtdeSabor)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'item_id' => $this->getAttribute('item')->getAttribute('id'),
            'nome' => match ($this->qtdeSabor) {
                1 => $this->getAttribute('item')->getAttribute('nome'),
                2 => '1/2 ' . $this->getAttribute('item')->getAttribute('nome'),
                3 => '1/3 ' . $this->getAttribute('item')->getAttribute('nome'),
                4 => '1/4 ' . $this->getAttribute('item')->getAttribute('nome'),
            },
            'preco' => match ($this->qtdeSabor) {
                1 => $this->getAttribute('preco'),
                2 => $this->getAttribute('preco') / 2,
                3 => $this->getAttribute('preco') / 3,
                4 => $this->getAttribute('preco') / 4,
            },
            'imagem' => $this->getAttribute('item')->getAttribute('imagem'),
            'descricao' => $this->getAttribute('item')->getAttribute('descricao'),
            'classificacao' => $this->getAttribute('item')->getAttribute('classificacao'),
            'quantidade' => 0,
        ];
    }
}
