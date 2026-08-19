<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Item
 */
class ItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'external_id' => $this->getAttribute('external_id'),
            'categoria_id' => $this->getAttribute('categoria_id'),
            'tipo' => $this->getAttribute('tipo'),
            'nome' => $this->getAttribute('nome'),
            'tipo_preco' => $this->getAttribute('tipo_preco'),
            'preco' => $this->getAttribute('preco'),
            'precos' => $this->whenLoaded('precosItemPizza', fn () => $this->getAttribute('precosItemPizza')->map(fn ($preco) => [
                'tamanho_id' => $preco->getAttribute('tamanho_id'),
                'tamanho' => $preco->getAttribute('tamanho')?->getAttribute('nome'),
                'status' => $preco->getAttribute('status'),
                'preco' => $preco->getAttribute('preco'),
                'dias_funcionamento' => $preco->getAttribute('dias_funcionamento'),
            ])),
            'grupo_complementos' => $this->whenLoaded('grupo_complemento', fn () => $this->getAttribute('grupo_complemento')->map(fn ($grupo) => [
                'id' => $grupo->getAttribute('id'),
                'item_id' => $grupo->getAttribute('item_id'),
                'nome' => $grupo->getAttribute('nome'),
                'obrigatoriedade' => $grupo->getAttribute('obrigatoriedade'),
                'qtd_minima' => $grupo->getAttribute('qtd_minima'),
                'qtd_maxima' => $grupo->getAttribute('qtd_maxima'),
                'complementos' => $grupo->getAttribute('complementos')->map(fn ($complemento) => [
                    'id' => $complemento->getAttribute('id'),
                    'external_id' => $complemento->getAttribute('external_id'),
                    'grupo_id' => $complemento->getAttribute('grupo_id'),
                    'imagem' => $complemento->getAttribute('imagem'),
                    'nome' => $complemento->getAttribute('nome'),
                    'descricao' => $complemento->getAttribute('descricao'),
                    'preco' => $complemento->getAttribute('preco'),
                    'status' => $complemento->getAttribute('status')
                ])
            ])),
            'desconto' => $this->getAttribute('desconto'),
            'valor_desconto' => $this->getAttribute('valor_desconto'),
            'porcentagem_desconto' => $this->getAttribute('porcentagem_desconto'),
            'descricao' => $this->getAttribute('descricao'),
            'qtde_pessoas' => $this->getAttribute('qtde_pessoas'),
            'peso' => $this->getAttribute('peso'),
            'gramagem' => $this->getAttribute('gramagem'),
            'eh_bebida' => $this->getAttribute('eh_bebida'),
            'classificacao' => $this->getAttribute('classificacao'),
            'imagem' => $this->getAttribute('imagem'),
            'dias_funcionamento' => $this->getAttribute('dias_funcionamento'),
            'created_at' => $this->getAttribute('created_at'),
            'updated_at' => $this->getAttribute('updated_at'),
        ];
    }
}
