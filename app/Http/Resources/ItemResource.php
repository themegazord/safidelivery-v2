<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'external_id' => $this->external_id,
            'categoria_id' => $this->categoria_id,
            'tipo' => $this->tipo,
            'nome' => $this->nome,
            'tipo_preco' => $this->tipo_preco,
            'preco' => $this->preco,
            'precos' => $this->whenLoaded('precosItemPizza', fn () => $this->precosItemPizza->map(fn ($preco) => [
                'tamanho_id' => $preco->tamanho_id,
                'tamanho' => $preco->tamanho?->nome,
                'status' => $preco->status,
                'preco' => $preco->preco,
                'dias_funcionamento' => $preco->dias_funcionamento,
            ])),
            'grupo_complementos' => $this->whenLoaded('grupo_complemento', fn () => $this->grupo_complemento->map(fn ($grupo) => [
                'id' => $grupo->id,
                'item_id' => $grupo->item_id,
                'nome' => $grupo->nome,
                'obrigatoriedade' => $grupo->obrigatoriedade,
                'qtd_minima' => $grupo->qtd_minima,
                'qtd_maxima' => $grupo->qtd_maxima,
                'complementos' => $grupo->complementos->map(fn ($complemento) => [
                    'id' => $complemento->id,
                    'external_id' => $complemento->external_id,
                    'grupo_id' => $complemento->grupo_id,
                    'imagem' => $complemento->imagem,
                    'nome' => $complemento->nome,
                    'descricao' => $complemento->descricao,
                    'preco' => $complemento->preco,
                    'status' => $complemento->status
                ])
            ])),
            'desconto' => $this->desconto,
            'valor_desconto' => $this->valor_desconto,
            'porcentagem_desconto' => $this->porcentagem_desconto,
            'descricao' => $this->descricao,
            'qtde_pessoas' => $this->qtde_pessoas,
            'peso' => $this->peso,
            'gramagem' => $this->gramagem,
            'eh_bebida' => $this->eh_bebida,
            'classificacao' => $this->classificacao,
            'imagem' => $this->imagem,
            'dias_funcionamento' => $this->dias_funcionamento,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
