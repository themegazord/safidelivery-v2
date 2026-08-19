<?php

namespace App\Http\Resources\Pedidos;

use App\Models\StatusFinanceiroPedidoApi;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Pedido
 */
class PedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'ifood_display_id' => $this->getAttribute('ifood_display_id'),
            'pedido_ifood_id' => $this->getAttribute('pedido_ifood_id'),
            'tipo' => $this->getAttribute('tipo'),
            'status' => $this->getAttribute('status'),
            'prioridade' => $this->ehPrioridade(),
            'observacao' => $this->getAttribute('observacao'),
            'codigo_coleta' => $this->getAttribute('codigo_coleta'),
            'valor_frete' => $this->getAttribute('valor_frete'),
            'nome' => $this->getAttribute('nome'),
            'telefone' => $this->getAttribute('telefone'),
            'cpf_cnpj_ifood' => $this->getAttribute('cpf_cnpj_ifood'),
            'mesa' => $this->getAttribute('mesa'),
            'comanda' => $this->getAttribute('comanda'),
            'eh_agendado' => (bool) $this->getAttribute('eh_agendado'),
            'data_agendamento_inicio' => $this->getAttribute('data_agendamento_inicio'),
            'data_agendamento_fim' => $this->getAttribute('data_agendamento_fim'),
            'data_inicio_preparo' => $this->getAttribute('data_inicio_preparo'),
            'fidelidade_recompensa_aplicada' => $this->getAttribute('fidelidade_recompensa_aplicada'),
            'fidelidade_desconto' => $this->getAttribute('fidelidade_desconto'),
            'fidelidade_percentual' => $this->getAttribute('fidelidade_percentual'),
            'fidelidade_base_calculo' => $this->getAttribute('fidelidade_base_calculo'),
            'frete_original' => $this->getAttribute('frete_original'),
            'created_at' => $this->getAttribute('created_at'),
            'empresa' => $this->whenLoaded('empresa', fn () => $this->getAttribute('empresa') ? [
                'nome_fantasia' => $this->getAttribute('empresa')->getAttribute('nome_fantasia'),
                'interacao_id' => $this->getAttribute('empresa')->getAttribute('interacao_id'),
            ] : null),
            'timezone' => $this->whenLoaded('empresa', fn () => $this->getAttribute('empresa')?->resolveTimezone() ?? config('app.timezone')),
            'cliente' => $this->whenLoaded('cliente', fn () => $this->getAttribute('cliente') ? [
                'id' => $this->getAttribute('cliente')->getAttribute('id'),
                'nome' => $this->getAttribute('cliente')->getAttribute('nome'),
                'telefone' => $this->getAttribute('cliente')->getAttribute('telefone'),
                'cpf_cnpj' => $this->getAttribute('cliente')->getAttribute('cpf_cnpj'),
                'data_nascimento' => $this->getAttribute('cliente')->getAttribute('data_nascimento'),
            ] : null),
            'financeiro' => $this->whenLoaded('financeiro', fn () => $this->getAttribute('financeiro') ? [
                'total' => $this->getAttribute('financeiro')->getAttribute('total'),
                'subtotal_itens' => $this->getAttribute('financeiro')->getAttribute('subtotal_itens'),
                'subtotal_itens_ifood' => $this->getAttribute('financeiro')->getAttribute('subtotal_itens_ifood'),
                'adicional' => $this->getAttribute('financeiro')->getAttribute('adicional'),
                'valor_desconto' => $this->getAttribute('financeiro')->getAttribute('valor_desconto'),
                'cashback_utilizado' => $this->getAttribute('financeiro')->getAttribute('cashback_utilizado'),
                'troco_para' => $this->getAttribute('financeiro')->getAttribute('troco_para'),
                'valor_troco' => $this->getAttribute('financeiro')->getAttribute('valor_troco'),
                'forma_pagamento' => $this->getAttribute('financeiro')->getAttribute('forma_pagamento'),
                'forma_pagamento_label' => $this->getAttribute('financeiro')->defineFormaPagamento(),
                'pagamentos' => $this->getAttribute('financeiro')->relationLoaded('pagamentos') ? $this->getAttribute('financeiro')->getAttribute('pagamentos')->map(fn ($p) => [
                    'forma_pagamento' => $p->getAttribute('forma_pagamento'),
                    'valor' => $p->getAttribute('valor'),
                    'label' => $p->defineFormaPagamento(),
                ]) : [],
                'pix' => $this->getAttribute('financeiro')->relationLoaded('status_financeiro_api') && $this->getAttribute('financeiro')->getAttribute('status_financeiro_api')
                    ? [
                        'copia_cola' => $this->getAttribute('financeiro')->getAttribute('status_financeiro_api')->getAttribute('copia_cola_pix'),
                        'url_qrcode' => $this->getAttribute('financeiro')->getAttribute('status_financeiro_api')->getAttribute('url_qrcode_pix'),
                        'status' => $this->getAttribute('financeiro')->getAttribute('status_financeiro_api')->getAttribute('status'),
                        'expira_em' => $this->getAttribute('financeiro')->getAttribute('status_financeiro_api')->getAttribute('created_at')
                            ?->copy()->addMinutes(StatusFinanceiroPedidoApi::EXPIRACAO_MINUTOS),
                    ]
                    : null,
            ] : null),
            'itens' => $this->whenLoaded('itens', fn () => PedidoItemResource::collection($this->getAttribute('itens'))->resolve()),
            'endereco_entrega' => $this->whenLoaded('enderecoEntrega', fn () => $this->getAttribute('enderecoEntrega') ? [
                'logradouro' => $this->getAttribute('enderecoEntrega')->getAttribute('logradouro'),
                'numero' => $this->getAttribute('enderecoEntrega')->getAttribute('numero'),
                'bairro' => $this->getAttribute('enderecoEntrega')->getAttribute('bairro'),
                'cidade' => $this->getAttribute('enderecoEntrega')->getAttribute('cidade'),
            ] : null),
            'endereco_entrega_ifood' => $this->whenLoaded('enderecoEntregaIfood', fn () => $this->getAttribute('enderecoEntregaIfood') ? [
                'logradouro' => $this->getAttribute('enderecoEntregaIfood')->getAttribute('logradouro'),
                'numero' => $this->getAttribute('enderecoEntregaIfood')->getAttribute('numero'),
                'bairro' => $this->getAttribute('enderecoEntregaIfood')->getAttribute('bairro'),
                'cidade' => $this->getAttribute('enderecoEntregaIfood')->getAttribute('cidade'),
            ] : null),
            'dados_retirada_pedido' => $this->whenLoaded('dadosRetiradaPedido', fn () => $this->getAttribute('dadosRetiradaPedido') !== null),
            'cupom_usado_no_pedido' => $this->whenLoaded('cupomUsadoNoPedido', function () {
                $cupom = $this->getAttribute('cupomUsadoNoPedido')->first();
                return $cupom ? [
                    'id' => $cupom->getAttribute('id'),
                    'nome_cupom' => $cupom->getAttribute('nome_cupom'),
                    'tipo_cupom' => $cupom->getAttribute('tipo_cupom'),
                    'valor_desconto' => $cupom->getAttribute('valor_desconto'),
                    'onde_afetara' => $cupom->getAttribute('onde_afetara'),
                    'valor_maximo_desconto' => $cupom->getAttribute('valor_maximo_desconto'),
                ] : null;
            }),
            'cupons_usado_no_ifood' => $this->whenLoaded('cuponsUsadoNoIfood', fn () => $this->getAttribute('cuponsUsadoNoIfood')->map(fn ($c) => [
                'valor' => $c->getAttribute('valor'),
                'alvo_desconto' => $c->getAttribute('alvo_desconto')?->value,
                'alvo_desconto_eh_frete' => $c->getAttribute('alvo_desconto')?->ehDescontoNoFrete() ?? false,
                'responsavel_desconto' => $c->getAttribute('responsavel_desconto')?->value,
                'responsavel_desconto_label' => $c->getAttribute('responsavel_desconto')?->descricao(),
            ])),
            'cashback' => $this->whenLoaded('cashback', fn () => $this->getAttribute('cashback') ? [
                'credito_gerado' => $this->getAttribute('cashback')->getAttribute('credito_gerado'),
            ] : null),
            'justificativa_cancelamento' => $this->whenLoaded('justificativaCancelamento', fn () => $this->getAttribute('justificativaCancelamento') ? [
                'motivo' => $this->getAttribute('justificativaCancelamento')->getAttribute('motivo'),
            ] : null),
        ];
    }
}
