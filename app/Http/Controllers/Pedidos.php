<?php

namespace App\Http\Controllers;

use App\Http\Requests\PedidoEntregue;
use App\Http\Requests\PedidosDiario;
use App\Models\Complemento;
use App\Models\Empresa;
use App\Models\FinanceiroPedido;
use App\Models\FormaPagamento;
use App\Models\Integracao;
use App\Models\Item;
use App\Models\Pedido;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;

class Pedidos extends Controller
{
  public function entregue(Request $request): JsonResponse
  {
    $companyToken = $request->header('companyToken');

    $request->validate([
      'data_hora' => ['date_format:Y-m-d H:i:s']
    ]);

    $data_hora = $request->get('data_hora');

    try {
      $empresa = Integracao::where('companyToken', $companyToken)->firstOrFail()->empresa;

      // Use o Query Builder diretamente para evitar cast automático
      $query = DB::table('pedidos')
        ->whereNull('deleted_at')
        ->where('empresa_id', $empresa->id)
        ->whereIn('status', ['pedido feito', 'sendo preparado', 'cancelado', 'entregue']);

      if ($data_hora) {
        $query->where('updated_at', '>', $data_hora);
      }

      $pedidos = $query->select('id', 'comanda', 'status', 'updated_at')->get();

      return response()->json(['pedidos' => $pedidos]);
    } catch (Exception $e) {
      return response()->json(['erro' => $e->getMessage()], $e->getCode() ?: 500);
    }
  }

  public function consultaPedidos(int $pedido_id, Request $request): JsonResponse
  {
		$fmt = fn (?float $v) => (float) number_format($v ?? 0, 2, '.', '');
    $companyToken = $request->headers->get('companyToken');
		$integracao = Integracao::where('companyToken', $companyToken)->first();
		$empresa = $integracao->empresa;
		$formaPagamentoModel = app(FormaPagamento::class);
    if (is_null($companyToken)) {
      return response()->json([
        'erro' => "Erro de autenticação",
        "mensagens" => [
          "companyToken" => "Company token não foi encaminhado",
        ]
      ], 401);
    }

    if (is_null($integracao)) {
      return response()->json([
        'erro' => "Erro de validação",
        "mensagens" => [
          "companyToken" => "Company token não existe",
        ]
      ], 422);
    }

    if (is_null($empresa->pedidos()->find($pedido_id))) {
      return response()->json([
        'erro' => "Erro de validação",
        "mensagens" => [
          "pedido_id" => "Pedido solicitado não condiz com a empresa",
        ]
      ], 422);
    }

		$configuracao = $empresa->configuracoes()
			->whereIn('configuracao', ['informa_mesa_comanda', 'modo_atendente'])
			->pluck('valor', 'configuracao')
			->toArray();

    $pedido = Pedido::find($pedido_id);
    $pedidoEnviado = [
      'pedido_id' => $pedido->id,
      'tipo' => $pedido->tipo,
      'eh_ifood' => $pedido->pedido_ifood_id === null ? false : true,
      'eh_prioridade' => $pedido->ehPrioridade(),
      'status' => $pedido->status,
      'realizado_em' => $pedido->created_at->format('Y-m-d H:i:s'),
      'valor_total_produtos' => $pedido->financeiro->subtotal_itens,
      'valor_frete' => $pedido->valor_frete,
			'comanda_manual' => $pedido->tipo === 'M' ? boolval($configuracao['informa_mesa_comanda']) : null,
      'mesa' => $pedido->mesa,
      'comanda' => $pedido->comanda,
			'observacao' => empty($pedido->observacao) ? null : $pedido->observacao,
      'cliente' => $pedido->cliente_id !== null ? [
        'nome' => $pedido->cliente->nome,
        'email' => $pedido->cliente->email,
        'cpf_cnpj' => $pedido->cliente->cpf_cnpj,
        'telefone' => $pedido->cliente->telefone,
        'endereco' => [
          'logradouro' => $pedido->cliente?->endereco?->logradouro,
          'numero' => $pedido->cliente?->endereco?->numero,
          'cep' => $pedido->cliente?->endereco?->cep,
          'bairro' => $pedido->cliente?->endereco?->bairro,
          'cidade' => $pedido->cliente?->endereco?->cidade,
          'uf' => $pedido->cliente?->endereco?->uf,
          'complemento' => $pedido->cliente?->endereco?->complemento,
        ]
      ] : [
        'nome' => $pedido->nome,
        'telefone' => $pedido->telefone,
        'email' => null,
        'cpf_cnpj' => null,
        'endereco' => [
          'logradouro' => $pedido?->enderecoEntregaIfood?->logradouro,
          'numero' => $pedido?->enderecoEntregaIfood?->numero,
          'cep' => $pedido?->enderecoEntregaIfood?->cep,
          'bairro' => $pedido?->enderecoEntregaIfood?->bairro,
          'cidade' => $pedido?->enderecoEntregaIfood?->cidade,
          'uf' => $pedido?->enderecoEntregaIfood?->uf,
          'complemento' => $pedido?->enderecoEntregaIfood?->complemento,
        ]
      ],
      'itens' => [],
      'financeiro' => (function () use ($pedido, $formaPagamentoModel, $fmt) {
        $financeiro = $pedido->financeiro;
        $cashbackUtilizado = $financeiro->cashback_utilizado > 0 ? $financeiro->cashback_utilizado : null;

        if ($financeiro->forma_pagamento === 'multiplo' || $financeiro->pagamentos->isNotEmpty()) {
          $pagamentos = $financeiro->pagamentos->map(fn ($p) => [
            'forma_pagamento' => $p->forma_pagamento_id
              ? $p->formaPagamento->descricao
              : $p->forma_pagamento,
            'tipo_pagamento' => $p->forma_pagamento_id
              ? $p->formaPagamento->tipo
              : ($p->forma_pagamento ? $formaPagamentoModel->defineTipoPagamento($p->forma_pagamento) : null),
	            'codigo_pdv' => $p->formaPagamento?->codigo_pdv,
            'valor' => $p->valor,
            'troco_para' => $p->troco_para,
            'valor_troco' => $p->valor_troco,
          ])->values()->toArray();
        } else {
          $fp = $financeiro->formaPagamento;
          $pagamentos = [[
            'forma_pagamento' => $fp ? $fp->descricao : $financeiro->forma_pagamento,
            'tipo_pagamento' => $fp ? $fp->tipo : ($financeiro->forma_pagamento ? $formaPagamentoModel->defineTipoPagamento($financeiro->forma_pagamento) : null),
            'codigo_pdv' => $fp?->codigo_pdv,
            'valor' => $financeiro->total,
            'troco_para' => $financeiro->troco_para,
            'valor_troco' => $financeiro->valor_troco,
          ]];
        }

        return [
          'uuid' => $financeiro->uuid,
          'total' => $fmt($financeiro->total),
          'valor_desconto' => $fmt($financeiro->valor_desconto ?? 0),
          'cashback_gerado' => $pedido->cashback ? $fmt($pedido->cashback->credito_gerado) : null,
          'data_vencimento_cashback' => $pedido->cashback?->credito_gerado ? $pedido->cashback?->data_vencimento->format('Y-m-d') : null,
          'cashback_utilizado' => $fmt($cashbackUtilizado),
          'pagamentos' => $pagamentos,
        ];
      })(),
    ];

    foreach ($pedido->itens as $chaveItem => $item) {
      if ($item->tipo === 'I') {
        $pedidoEnviado['itens'][$chaveItem] = [
          'item_id' => $item->id,
          'tipo' => 'I',
					'tipo_precificacao_combo' => null,
          'external_id' => $pedido->pedido_ifood_id === null ? $item->item?->external_id : $item->external_id,
          'uuid' => $item->uuid,
          'nome' => $item->nome,
          'quantidade' => $item->quantidade,
          'preco_unitario' => $fmt($item->preco_unitario),
          'preco_original' => $fmt($item->preco_original),
          'subtotal' => $fmt($item->subtotal),
          'item_premio' => (bool) $item->item_premio,
          'observacao' => empty($item->observacao) ? null : $item->observacao,
          'complementos' => []
        ];
        if (!$item->complementos->isEmpty()) {
          foreach ($item->complementos as $complemento) {
            $pedidoEnviado['itens'][$chaveItem]['complementos'][] = [
              'external_id' => $pedido->pedido_ifood_id === null ? $complemento->complemento?->external_id : $complemento->external_id,
              'complemento_id' => $complemento->complemento_id,
							'tipo_item_combo' => null,
              'uuid' => $complemento->uuid,
              'grupo_complemento' => $pedido->pedido_ifood_id === null ? $complemento->complemento?->grupos?->nome : null,
              'nome' => $complemento->nome,
              'quantidade' => $complemento->qtde,
              'preco_unitario' => $complemento->preco_unitario
            ];
          }
        }
      }

      if ($item->tipo === 'C') {
        $pedidoEnviado['itens'][$chaveItem] = [
          'item_id' => $item->id,
          'tipo' => 'C',
					'tipo_precificacao_combo' => $item->tipo_preco ?? 'preco_combo',
          'external_id' => $item->item?->external_id,
          'uuid' => $item->uuid,
          'nome' => $item->nome,
          'quantidade' => $item->quantidade,
          'preco_unitario' => $fmt($item->preco_unitario),
          'preco_original' => $fmt($item->preco_original),
          'subtotal' => $fmt($item->subtotal),
          'observacao' => empty($item->observacao) ? null : $item->observacao,
          'complementos' => [],
        ];
        foreach ($item->comboItens as $comboItem) {
          $externalId = $comboItem->tipo === 'item'
            ? Item::find($comboItem->referencia_id)?->external_id
            : Complemento::find($comboItem->referencia_id)?->external_id;
					$dados = [
            'external_id' => $externalId,
            'complemento_id' => null,
						'tipo_item_combo' => $comboItem->tipo,
            'uuid' => $comboItem->uuid,
            'grupo_complemento' => $comboItem->grupo_nome,
            'nome' => $comboItem->item_nome,
            'quantidade' => $comboItem->qtde,
            'preco_unitario' => $item->tipo_preco === 'preco_itens'
							? $fmt($comboItem->preco_unitario)
							: ($comboItem->tipo === 'complemento' ? $fmt($comboItem->preco_unitario) : 0),
          ];

					if ($pedido->pedido_ifood_id !== null && $comboItem->customizacoes->isNotEmpty()) {
						foreach ($comboItem->customizacoes as $customizacao) {
							$dados['customizacoes'][] = [
								'external_id' => $customizacao->external_id,
								'uuid' => $customizacao->uuid,
								'grupo_complemento' => $customizacao->grupo_nome,
								'nome' => $customizacao->nome,
								'preco_unitario' => $customizacao->preco_unitario,
								'qtde' => $customizacao->qtde
							];
						}
					}

          $pedidoEnviado['itens'][$chaveItem]['complementos'][] = $dados;
        }
      }

      if ($item->tipo === 'P') {
        $pedidoEnviado['itens'][$chaveItem] = [
          'item_id' => $item->id,
          'tipo' => 'P',
					'tipo_precificacao_combo' => null,
          'nome' => $item->nome,
          'uuid' => $item->uuid,
          'borda' => null,
          'massa' => null,
          'external_id' => $pedido->pedido_ifood_id === null ? $item->tamanho->external_id : $item->external_id,
          'quantidade' => $item->quantidade,
          'preco_unitario' => $fmt($item->preco_unitario),
          'preco_original' => $fmt($item->preco_original),
          'subtotal' => $fmt($item->subtotal),
          'item_premio' => (bool) $item->item_premio,
          'observacao' => $item->observacao,
        ];

        $pedidoEnviado['itens'][$chaveItem]['sabores'] = [];

        if (!is_null($item->borda_id)) {
          $pedidoEnviado['itens'][$chaveItem]['borda'] = [
            'external_id' => $item->borda->external_id,
            'nome' => $item->borda->nome,
            'preco' => $item->borda->preco
          ];
        }

        if (!is_null($item->massa_id)) {
          $pedidoEnviado['itens'][$chaveItem]['massa'] = [
            'external_id' => $item->massa->external_id,
            'nome' => $item->massa->nome,
            'preco' => $item->massa->preco
          ];
        }

        if ($pedido->pedido_ifood_id === null) {
          foreach ($item->sabores as $sabor) {
            array_push($pedidoEnviado['itens'][$chaveItem]['sabores'], [
              'id' => $sabor->id,
              'external_id' => $sabor->sabor->external_id,
              'uuid' => $sabor->uuid,
              'nome' => $sabor->nome,
              'quantidade' => $sabor->qtde,
              'quantidade_fracionada' => $sabor->qtde_fracionada,
              'preco_unitario' => $sabor->preco_unitario
            ]);
          }
        } else {
          foreach ($item->complementos as $complemento) {
            array_push($pedidoEnviado['itens'][$chaveItem]['sabores'], [
              'external_id' => $pedido->pedido_ifood_id === null ? $complemento->complemento->external_id : $complemento->external_id,
              'uuid' => $complemento->uuid,
              'nome' => $complemento->nome,
              'quantidade' => $complemento->qtde,
              'quantidade_fracionada' => $this->defineQuantidadeDecimal($complemento->nome),
              'preco_unitario' => $complemento->preco_unitario
            ]);
          }
        }
      }
    }
    $pedidoEnviado['url_impressao_txt'] = URL::signedRoute('pedido.imprimir.escpos', ['pedido_id' => $pedido_id]);

    return response()->json(['pedido' => $pedidoEnviado]);
  }

  public function diario(Request $request): JsonResponse
  {
    $companyToken = $request->headers->get('companyToken');
    return response()->json(['pedidos' => Integracao::where('companyToken', $companyToken)->first()->empresa->pedidos()->whereIn('status', ['cancelado', 'entregue'])->whereDate('created_at', date('Y-m-d', strtotime('now')))->get(['id', 'status', 'created_at'])]);
  }

  private function defineQuantidadeDecimal(string $nome): float|int
  {
    return match (substr($nome, 0, 3)) {
      '1/2' => .5,
      '1/3' => .3,
      '1/4' => .25,
      default => 1
    };
  }
}
