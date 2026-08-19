<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Item
 */
class ItemPedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $precoAplicado = $this->getAttribute('desconto') ? $this->getAttribute('valor_desconto') : $this->getAttribute('preco');

        return [
            'id' => $this->getAttribute('id'),
            'nome' => $this->getAttribute('nome'),
            'preco' => $this->getAttribute('preco'),
            'desconto' => $this->getAttribute('desconto'),
            'valor_desconto' => $this->getAttribute('valor_desconto'),
            'descricao' => $this->getAttribute('descricao'),
            'imagem' => $this->getAttribute('imagem'),
            'tipo' => $this->getAttribute('tipo'),
            'categoria' => $this->whenLoaded('categoria', fn () => $this->getAttribute('categoria')->only(['id', 'nome'])),
            'preco_unitario' => $precoAplicado,
            'quantidade' => 1,
            'observacao' => '',
            'total' => $precoAplicado,
            'grupo_complemento' => GrupoComplementoPedidoResource::collection($this->whenLoaded('grupo_complemento')),
        ];
    }
}
