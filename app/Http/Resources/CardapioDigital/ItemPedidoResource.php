<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemPedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $precoAplicado = $this->desconto ? $this->valor_desconto : $this->preco;

        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'preco' => $this->preco,
            'desconto' => $this->desconto,
            'valor_desconto' => $this->valor_desconto,
            'descricao' => $this->descricao,
            'imagem' => $this->imagem,
            'tipo' => $this->tipo,
            'categoria' => $this->whenLoaded('categoria', fn () => $this->categoria->only(['id', 'nome'])),
            'preco_unitario' => $precoAplicado,
            'quantidade' => 1,
            'observacao' => '',
            'total' => $precoAplicado,
            'grupo_complemento' => GrupoComplementoPedidoResource::collection($this->whenLoaded('grupo_complemento')),
        ];
    }
}
