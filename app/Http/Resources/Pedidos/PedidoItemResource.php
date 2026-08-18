<?php

namespace App\Http\Resources\Pedidos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PedidoItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tipo' => $this->tipo,
            'tipo_preco' => $this->tipo_preco,
            'nome' => $this->nome,
            'quantidade' => $this->quantidade,
            'preco_unitario' => $this->preco_unitario,
            'preco_original' => $this->preco_original,
            'subtotal' => $this->subtotal,
            'observacao' => $this->observacao,
            'item_premio' => (bool) $this->item_premio,
            'borda' => $this->whenLoaded('borda', fn () => $this->borda ? [
                'nome' => $this->borda->nome,
                'preco' => $this->borda->preco,
            ] : null),
            'massa' => $this->whenLoaded('massa', fn () => $this->massa ? [
                'nome' => $this->massa->nome,
                'preco' => $this->massa->preco,
            ] : null),
            'complementos' => $this->whenLoaded('complementos', fn () => $this->complementos->map(fn ($c) => [
                'nome' => $c->nome,
                'qtde' => $c->qtde,
                'preco_unitario' => $c->preco_unitario,
            ])),
            'sabores' => $this->whenLoaded('sabores', fn () => $this->sabores->map(fn ($s) => [
                'nome' => $s->nome,
                'qtde' => $s->qtde,
                'preco_unitario' => $s->preco_unitario,
            ])),
            'combo_itens' => $this->whenLoaded('comboItens', fn () => $this->comboItens->map(fn ($ci) => [
                'tipo' => $ci->tipo,
                'grupo_nome' => $ci->grupo_nome,
                'item_nome' => $ci->item_nome,
                'preco_unitario' => $ci->preco_unitario,
                'qtde' => $ci->qtde,
                'customizacoes' => $ci->relationLoaded('customizacoes') ? $ci->customizacoes->map(fn ($cu) => [
                    'nome' => $cu->nome,
                    'preco_unitario' => $cu->preco_unitario,
                    'qtde' => $cu->qtde,
                ]) : [],
            ])),
        ];
    }
}
