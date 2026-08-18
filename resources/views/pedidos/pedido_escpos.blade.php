@php
    $linha = function (string $esquerda, string $direita, int $largura = 32): string {
        if ($direita === '') {
            return $esquerda;
        }
        $espacos = $largura - mb_strlen($esquerda) - mb_strlen($direita);
        return $esquerda . str_repeat(' ', max(1, $espacos)) . $direita;
    };
@endphp
**** PEDIDO #{{ $pedido->id }} ****
@if ($pedido->pedido_ifood_id)
**** PEDIDO IFOOD #{{ $pedido->ifood_display_id }} ****
@if (!empty($pedido->codigo_coleta))
COLETA: {{ $pedido->codigo_coleta }}
@endif
@endif
{{ $pedido->defineTipoPedido() }}
{{ $pedido->empresa->nome_fantasia }}
--------------------------------
Data do Pedido: {{ \Carbon\Carbon::parse($pedido->created_at)->format('d/m/Y H:i:s') }}
Cliente: {{ $pedido->cliente_id !== null ? $pedido->cliente->nome : $pedido->nome }}
Telefone: {{ $pedido->cliente_id !== null ? $pedido->cliente->telefone ?? '' : $pedido->telefone ?? '' }}
@if (!is_null($pedido->mesa) && !is_null($pedido->comanda))
Mesa: #{{ $pedido->mesa }} | Comanda: #{{ $pedido->comanda }}
@endif
@if ($pedido->eh_agendado)
*** PEDIDO AGENDADO ***
@if ($pedido->data_agendamento_inicio)
Entrega a partir de: {{ \Carbon\Carbon::parse($pedido->data_agendamento_inicio, 'UTC')->timezone('America/Sao_Paulo')->format('d/m/Y H:i') }}
@endif
@if ($pedido->data_agendamento_fim)
Entrega ate: {{ \Carbon\Carbon::parse($pedido->data_agendamento_fim, 'UTC')->timezone('America/Sao_Paulo')->format('d/m/Y H:i') }}
@endif
@endif
@if (!empty($pedido->observacao))
Obs entrega: {{ $pedido->observacao }}
@endif
--------------------------------
ITENS DO PEDIDO
@foreach ($pedido->itens as $item)
@php
    $subtotalPizza = $item->tipo === 'P' ? $item->sabores->sum('preco_unitario') : 0;
    $subtotalComplemento = $item->tipo === 'I' ? $item->complementos->sum('preco_unitario') : 0;
    $temSubitens = ($item->tipo === 'P' && !$item->sabores->isEmpty()) || ($item->tipo === 'I' && !$item->complementos->isEmpty()) || ($item->tipo === 'C' && !$item->comboItens->isEmpty());
@endphp
@if ($item->item_premio)
{{ $linha($item->quantidade . ' UN ' . $item->nome, 'GRATIS') }}
@elseif ($item->tipo === 'I')
{{ $linha($item->quantidade . ' UN ' . $item->nome, 'R$ ' . number_format(floatval($item->preco_unitario), 2, ',', '.')) }}
@elseif ($item->tipo === 'C')
{{ $linha($item->quantidade . ' UN ' . $item->nome, 'R$ ' . number_format(floatval($item->subtotal), 2, ',', '.')) }}
@else
{{ $item->quantidade }} UN {{ $item->nome }}
@endif
@if ($item->tipo === 'P')
{{ $linha('  Borda: ' . $item->borda->nome, $item->item_premio ? '' : 'R$ ' . number_format(floatval($item->borda->preco), 2, ',', '.')) }}
{{ $linha('  Massa: ' . $item->massa->nome, $item->item_premio ? '' : 'R$ ' . number_format(floatval($item->massa->preco), 2, ',', '.')) }}
@foreach ($item->sabores as $sabor)
{{ $linha('  +' . $sabor->qtde . 'x ' . $sabor->nome, $item->item_premio ? '' : 'R$ ' . number_format(floatval($sabor->preco_unitario), 2, ',', '.')) }}
@endforeach
@endif
@if ($item->tipo === 'I' && !$item->complementos->isEmpty())
@foreach ($item->complementos as $complemento)
{{ $linha('  ' . $complemento->qtde . ' UN ' . $complemento->nome, $item->item_premio ? '' : 'R$ ' . number_format(floatval($complemento->preco_unitario), 2, ',', '.')) }}
@endforeach
@endif
@if ($item->tipo === 'C')
@php $comboPrecificacaoTxt = $item->tipo_preco ?? 'preco_combo'; @endphp
@foreach ($item->comboItens->groupBy('grupo_nome') as $grupoNome => $itensGrupo)
  [{{ $grupoNome }}]
@foreach ($itensGrupo as $comboItem)
@if (!$item->item_premio && $comboItem->tipo === 'complemento' && $comboItem->preco_unitario > 0)
{{ $linha('    ' . $comboItem->qtde . 'x ' . $comboItem->item_nome, '+R$ ' . number_format(floatval($comboItem->preco_unitario * $comboItem->qtde), 2, ',', '.')) }}
@elseif (!$item->item_premio && $comboItem->tipo === 'item' && $comboPrecificacaoTxt === 'preco_itens' && $comboItem->preco_unitario > 0)
{{ $linha('    ' . $comboItem->qtde . 'x ' . $comboItem->item_nome, '+R$ ' . number_format(floatval($comboItem->preco_unitario * $comboItem->qtde), 2, ',', '.')) }}
@elseif (!$item->item_premio && $comboItem->tipo === 'item' && $comboPrecificacaoTxt === 'preco_combo' && $comboItem->preco_unitario > 0)
{{ $linha('    ' . $comboItem->qtde . 'x ' . $comboItem->item_nome, '+R$ ' . number_format(floatval($comboItem->preco_unitario * $comboItem->qtde), 2, ',', '.')) }}
@else
    {{ $comboItem->qtde }}x {{ $comboItem->item_nome }}
@endif
@foreach ($comboItem->customizacoes as $customizacao)
@if (!$item->item_premio && $customizacao->preco_unitario > 0)
{{ $linha('      ' . $customizacao->qtde . 'x ' . $customizacao->nome, '+R$ ' . number_format(floatval($customizacao->preco_unitario * $customizacao->qtde), 2, ',', '.')) }}
@else
      {{ $customizacao->qtde }}x {{ $customizacao->nome }}
@endif
@endforeach
@endforeach
@endforeach
@endif
@if (!empty($item->observacao))
  Obs: {{ $item->observacao }}
@endif
@if ($temSubitens && !$item->item_premio)
@if ($item->tipo === 'P')
{{ $linha('  Total do item', 'R$ ' . number_format(floatval($subtotalPizza + $item->borda->preco + $item->massa->preco), 2, ',', '.')) }}
@elseif ($item->tipo === 'C')
{{ $linha('  Total do combo', 'R$ ' . number_format(floatval($item->subtotal), 2, ',', '.')) }}
@else
{{ $linha('  Total c/ complementos', 'R$ ' . number_format(floatval($subtotalComplemento + $item->preco_unitario), 2, ',', '.')) }}
@endif
@endif
................................
@endforeach
--------------------------------
TOTAL
{{ $linha('Sub-Total', 'R$ ' . number_format(floatval($pedido->financeiro->subtotal_itens ?? 0), 2, ',', '.')) }}
@if (floatval($pedido->valor_frete ?? 0) > 0)
{{ $linha('Taxa de Entrega +', 'R$ ' . number_format(floatval($pedido->valor_frete), 2, ',', '.')) }}
@endif
@if (floatval($pedido->financeiro->adicional ?? 0) > 0)
{{ $linha('Taxa Adicional +', 'R$ ' . number_format(floatval($pedido->financeiro->adicional), 2, ',', '.')) }}
@endif
@if (floatval($pedido->financeiro->valor_desconto ?? 0) > 0)
{{ $linha('Desconto -', 'R$ ' . number_format(floatval($pedido->financeiro->valor_desconto), 2, ',', '.')) }}
@endif
{{ $linha('VALOR TOTAL', 'R$ ' . number_format(floatval($pedido->financeiro->total), 2, ',', '.')) }}
@if ($pedido->cuponsUsadoNoIfood->isNotEmpty())
--------------------------------
DESCONTOS
@foreach ($pedido->cuponsUsadoNoIfood as $cupom)
{{ $linha($cupom->responsavel_desconto?->ePagamento() ? 'iFood' : 'Loja', 'R$ ' . number_format(floatval($cupom->valor), 2, ',', '.')) }}
@endforeach
@endif
--------------------------------
FORMAS DE PAGAMENTO
@php $pagamentosMultiplos = $pedido->financeiro->pagamentos ?? collect(); @endphp
@if ($pagamentosMultiplos->isNotEmpty())
@foreach ($pagamentosMultiplos as $pag)
{{ $linha(($pag->forma_pagamento ?? null) === 'cashback' ? 'Cashback' : $pag->defineFormaPagamento(), 'R$ ' . number_format(floatval($pag->valor), 2, ',', '.')) }}
@if (floatval($pag->valor_troco ?? 0) > 0)
{{ $linha('  Troco p/ R$ ' . number_format(floatval($pag->troco_para), 2, ',', '.'), 'R$ ' . number_format(floatval($pag->valor_troco), 2, ',', '.')) }}
@endif
@endforeach
@else
{{ $pedido->financeiro->defineFormaPagamento() }}
@if (floatval($pedido->financeiro->valor_troco ?? 0) > 0)
{{ $linha('  Troco p/ R$ ' . number_format(floatval($pedido->financeiro->troco_para), 2, ',', '.'), 'R$ ' . number_format(floatval($pedido->financeiro->valor_troco), 2, ',', '.')) }}
@endif
@endif
@php $cpfDoc = $pedido->cpf_cnpj_ifood ?? ($pedido->cliente->cpf_cnpj ?? null); @endphp
@if (!empty($cpfDoc))
--------------------------------
Informacoes Adicionais
CPF/CNPJ: {{ $cpfDoc }}
@endif
@if (($pedido->tipo ?? '') === 'D')
--------------------------------
ENTREGA PEDIDO #{{ $pedido->id }}
Entregue por: {{ $pedido->ifood_entregue_por ?? 'LOJA / PARCEIRO IFOOD' }}
Cliente: {{ $pedido->cliente_id !== null ? $pedido->cliente->nome : $pedido->nome }}
@if ($pedido->pedido_ifood_id)
Endereco: {{ $pedido->enderecoEntregaIfood->logradouro }}, {{ $pedido->enderecoEntregaIfood->numero }}
@if (!empty($pedido->enderecoEntregaIfood->complemento))
  Comp: {{ $pedido->enderecoEntregaIfood->complemento }}
@endif
Bairro: {{ $pedido->enderecoEntregaIfood->bairro }}
Cidade: {{ $pedido->enderecoEntregaIfood->cidade }} - {{ $pedido->enderecoEntregaIfood->uf }}
CEP: {{ preg_replace('/(\d{5})(\d{3})/', '$1-$2', $pedido->enderecoEntregaIfood->cep) }}
@else
Endereco: {{ $pedido->enderecoDeEntrega->logradouro }}, {{ $pedido->enderecoDeEntrega->numero }}
@if (!empty($pedido->enderecoDeEntrega->complemento))
  Comp: {{ $pedido->enderecoDeEntrega->complemento }}
@endif
Bairro: {{ $pedido->enderecoDeEntrega->bairro }}
Cidade: {{ $pedido->enderecoDeEntrega->cidade }} - {{ $pedido->enderecoDeEntrega->uf }}
CEP: {{ preg_replace('/(\d{5})(\d{3})/', '$1-$2', $pedido->enderecoDeEntrega->cep) }}
@endif
@endif
================================
Impresso por:
{{ $pedido->empresa->nome_fantasia }} - SAFI Delivery
