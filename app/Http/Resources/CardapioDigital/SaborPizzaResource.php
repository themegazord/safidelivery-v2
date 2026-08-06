<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaborPizzaResource extends JsonResource
{
    public function __construct($resource, private readonly int $qtdeSabor)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_id' => $this->item->id,
            'nome' => match ($this->qtdeSabor) {
                1 => $this->item->nome,
                2 => '1/2 ' . $this->item->nome,
                3 => '1/3 ' . $this->item->nome,
                4 => '1/4 ' . $this->item->nome,
            },
            'preco' => match ($this->qtdeSabor) {
                1 => $this->preco,
                2 => $this->preco / 2,
                3 => $this->preco / 3,
                4 => $this->preco / 4,
            },
            'imagem' => $this->item->imagem,
            'descricao' => $this->item->descricao,
            'classificacao' => $this->item->classificacao,
            'quantidade' => 0,
        ];
    }
}
