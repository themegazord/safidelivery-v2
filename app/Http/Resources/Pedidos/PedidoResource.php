<?php

namespace App\Http\Resources\Pedidos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ifood_display_id' => $this->ifood_display_id,
            'pedido_ifood_id' => $this->pedido_ifood_id,
            'tipo' => $this->tipo,
            'status' => $this->status,
            'prioridade' => $this->ehPrioridade(),
            'observacao' => $this->observacao,
            'codigo_coleta' => $this->codigo_coleta,
            'valor_frete' => $this->valor_frete,
            'nome' => $this->nome,
            'telefone' => $this->telefone,
            'cpf_cnpj_ifood' => $this->cpf_cnpj_ifood,
            'mesa' => $this->mesa,
            'comanda' => $this->comanda,
            'eh_agendado' => (bool) $this->eh_agendado,
            'data_agendamento_inicio' => $this->data_agendamento_inicio,
            'data_agendamento_fim' => $this->data_agendamento_fim,
            'data_inicio_preparo' => $this->data_inicio_preparo,
            'fidelidade_recompensa_aplicada' => $this->fidelidade_recompensa_aplicada,
            'fidelidade_desconto' => $this->fidelidade_desconto,
            'fidelidade_percentual' => $this->fidelidade_percentual,
            'fidelidade_base_calculo' => $this->fidelidade_base_calculo,
            'frete_original' => $this->frete_original,
            'created_at' => $this->created_at,
            'empresa' => $this->whenLoaded('empresa', fn () => $this->empresa ? [
                'nome_fantasia' => $this->empresa->nome_fantasia,
                'interacao_id' => $this->empresa->interacao_id,
            ] : null),
            'timezone' => $this->whenLoaded('empresa', fn () => $this->empresa?->resolveTimezone() ?? config('app.timezone')),
            'cliente' => $this->whenLoaded('cliente', fn () => $this->cliente ? [
                'id' => $this->cliente->id,
                'nome' => $this->cliente->nome,
                'telefone' => $this->cliente->telefone,
                'cpf_cnpj' => $this->cliente->cpf_cnpj,
                'data_nascimento' => $this->cliente->data_nascimento,
            ] : null),
            'financeiro' => $this->whenLoaded('financeiro', fn () => $this->financeiro ? [
                'total' => $this->financeiro->total,
                'subtotal_itens' => $this->financeiro->subtotal_itens,
                'subtotal_itens_ifood' => $this->financeiro->subtotal_itens_ifood,
                'adicional' => $this->financeiro->adicional,
                'cashback_utilizado' => $this->financeiro->cashback_utilizado,
                'troco_para' => $this->financeiro->troco_para,
                'valor_troco' => $this->financeiro->valor_troco,
                'forma_pagamento' => $this->financeiro->forma_pagamento,
                'forma_pagamento_label' => $this->financeiro->defineFormaPagamento(),
                'pagamentos' => $this->financeiro->relationLoaded('pagamentos') ? $this->financeiro->pagamentos->map(fn ($p) => [
                    'forma_pagamento' => $p->forma_pagamento,
                    'valor' => $p->valor,
                    'label' => $p->defineFormaPagamento(),
                ]) : [],
            ] : null),
            'itens' => $this->whenLoaded('itens', fn () => PedidoItemResource::collection($this->itens)->resolve()),
            'endereco_entrega' => $this->whenLoaded('enderecoEntrega', fn () => $this->enderecoEntrega ? [
                'logradouro' => $this->enderecoEntrega->logradouro,
                'numero' => $this->enderecoEntrega->numero,
                'bairro' => $this->enderecoEntrega->bairro,
                'cidade' => $this->enderecoEntrega->cidade,
            ] : null),
            'endereco_entrega_ifood' => $this->whenLoaded('enderecoEntregaIfood', fn () => $this->enderecoEntregaIfood ? [
                'logradouro' => $this->enderecoEntregaIfood->logradouro,
                'numero' => $this->enderecoEntregaIfood->numero,
                'bairro' => $this->enderecoEntregaIfood->bairro,
                'cidade' => $this->enderecoEntregaIfood->cidade,
            ] : null),
            'dados_retirada_pedido' => $this->whenLoaded('dadosRetiradaPedido', fn () => $this->dadosRetiradaPedido !== null),
            'cupom_usado_no_pedido' => $this->whenLoaded('cupomUsadoNoPedido', function () {
                $cupom = $this->cupomUsadoNoPedido->first();
                return $cupom ? [
                    'id' => $cupom->id,
                    'nome_cupom' => $cupom->nome_cupom,
                    'tipo_cupom' => $cupom->tipo_cupom,
                    'valor_desconto' => $cupom->valor_desconto,
                    'onde_afetara' => $cupom->onde_afetara,
                    'valor_maximo_desconto' => $cupom->valor_maximo_desconto,
                ] : null;
            }),
            'cupons_usado_no_ifood' => $this->whenLoaded('cuponsUsadoNoIfood', fn () => $this->cuponsUsadoNoIfood->map(fn ($c) => [
                'valor' => $c->valor,
                'alvo_desconto' => $c->alvo_desconto?->value,
                'alvo_desconto_eh_frete' => $c->alvo_desconto?->ehDescontoNoFrete() ?? false,
                'responsavel_desconto' => $c->responsavel_desconto?->value,
                'responsavel_desconto_label' => $c->responsavel_desconto?->descricao(),
            ])),
            'cashback' => $this->whenLoaded('cashback', fn () => $this->cashback ? [
                'credito_gerado' => $this->cashback->credito_gerado,
            ] : null),
            'justificativa_cancelamento' => $this->whenLoaded('justificativaCancelamento', fn () => $this->justificativaCancelamento ? [
                'motivo' => $this->justificativaCancelamento->motivo,
            ] : null),
        ];
    }
}
