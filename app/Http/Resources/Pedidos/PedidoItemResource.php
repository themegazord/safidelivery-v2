<?php

namespace App\Http\Resources\Pedidos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\PedidoItem
 */
class PedidoItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'tipo' => $this->getAttribute('tipo'),
            'tipo_preco' => $this->getAttribute('tipo_preco'),
            'nome' => $this->getAttribute('nome'),
            'quantidade' => $this->getAttribute('quantidade'),
            'preco_unitario' => $this->getAttribute('preco_unitario'),
            'preco_original' => $this->getAttribute('preco_original'),
            'subtotal' => $this->getAttribute('subtotal'),
            'observacao' => $this->getAttribute('observacao'),
            'item_premio' => (bool) $this->getAttribute('item_premio'),
            'borda' => $this->whenLoaded('borda', fn () => $this->getAttribute('borda') ? [
                'nome' => $this->getAttribute('borda')->getAttribute('nome'),
                'preco' => $this->getAttribute('borda')->getAttribute('preco'),
            ] : null),
            'massa' => $this->whenLoaded('massa', fn () => $this->getAttribute('massa') ? [
                'nome' => $this->getAttribute('massa')->getAttribute('nome'),
                'preco' => $this->getAttribute('massa')->getAttribute('preco'),
            ] : null),
            'complementos' => $this->whenLoaded('complementos', fn () => $this->getAttribute('complementos')->map(fn ($c) => [
                'nome' => $c->getAttribute('nome'),
                'qtde' => $c->getAttribute('qtde'),
                'preco_unitario' => $c->getAttribute('preco_unitario'),
            ])),
            'sabores' => $this->whenLoaded('sabores', fn () => $this->getAttribute('sabores')->map(fn ($s) => [
                'nome' => $s->getAttribute('nome'),
                'qtde' => $s->getAttribute('qtde'),
                'preco_unitario' => $s->getAttribute('preco_unitario'),
            ])),
            'combo_itens' => $this->whenLoaded('comboItens', fn () => $this->getAttribute('comboItens')->map(fn ($ci) => [
                'tipo' => $ci->getAttribute('tipo'),
                'grupo_nome' => $ci->getAttribute('grupo_nome'),
                'item_nome' => $ci->getAttribute('item_nome'),
                'preco_unitario' => $ci->getAttribute('preco_unitario'),
                'qtde' => $ci->getAttribute('qtde'),
                'customizacoes' => $ci->relationLoaded('customizacoes') ? $ci->getAttribute('customizacoes')->map(fn ($cu) => [
                    'nome' => $cu->getAttribute('nome'),
                    'preco_unitario' => $cu->getAttribute('preco_unitario'),
                    'qtde' => $cu->getAttribute('qtde'),
                ]) : [],
            ])),
        ];
    }
}
