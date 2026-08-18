<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
  <style>
    @page {
      margin: 0;
      padding: 0;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      font-weight: bold;
      margin: 0;
      padding: 0;
      background: #1a1a1a;
      color: #f0e68c;
    }

    .ticket {
      width: 300px;
      margin: 0 auto;
      padding: 10px 8px;
    }

    .dashed {
      border: none;
      border-top: 1px dashed #f0e68c;
      margin: 6px 0;
    }

    .dotted {
      border: none;
      border-top: 1px dotted #f0e68c;
      margin: 4px 0;
    }

    .title-pedido {
      text-align: center;
      font-size: 13px;
      font-weight: bold;
      margin: 4px 0 2px;
    }

    .subtitle-tipo {
      text-align: center;
      font-size: 11px;
      margin: 0 0 6px;
    }

    .merchant-name {
      text-align: center;
      font-weight: bold;
      font-size: 12px;
      margin: 4px 0;
    }

    p {
      margin: 1px 0;
    }

    .section-title {
      text-align: center;
      font-weight: bold;
      font-size: 11px;
      margin: 6px 0 4px;
    }

    .item-header {
      font-weight: bold;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
    }

    .item-row .nome {
      flex: 1;
    }

    .item-row .preco {
      white-space: nowrap;
      padding-left: 6px;
    }

    .complement {
      padding-left: 12px;
    }

    .obs {
      font-style: italic;
      margin: 1px 0 2px;
    }

    .item-total {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      margin: 2px 0 4px;
    }

    .totais-box {
      border: 1px solid #f0e68c;
      padding: 4px 6px;
      margin: 4px 0;
    }

    .totais-row {
      display: flex;
      justify-content: space-between;
      margin: 1px 0;
    }

    .totais-row.valor-total {
      font-weight: bold;
      border-top: 1px solid #f0e68c;
      margin-top: 4px;
      padding-top: 2px;
    }

    .pagamento-box {
      border: 1px solid #f0e68c;
      padding: 4px 6px;
      margin: 4px 0;
    }

    .pag-row {
      display: flex;
      justify-content: space-between;
      margin: 1px 0;
    }

    .footer-msg {
      text-align: center;
      margin-top: 8px;
      font-size: 10px;
    }

    @media print {
      body {
        background: white;
        color: black;
      }

      .dashed {
        border-top-color: black;
      }

      .dotted {
        border-top-color: black;
      }

      .totais-box,
      .pagamento-box {
        border-color: black;
      }

      .totais-row.valor-total {
        border-top-color: black;
      }
    }
  </style>
</head>

<body>
  <div class="ticket">

    <p class="title-pedido">**** PEDIDO #{{ $pedido->id }} ****</p>
    @if ($pedido->pedido_ifood_id)
      <p class="title-pedido">**** PEDIDO IFOOD #{{ $pedido->ifood_display_id }} ****</p>
      @if (!empty($pedido->codigo_coleta))
        <p class="title-pedido">COLETA: {{ $pedido->codigo_coleta }}</p>
      @endif
    @endif
    <p class="subtitle-tipo">{{ $pedido->defineTipoPedido() }}</p>
    <p class="merchant-name">{{ $pedido->empresa->nome_fantasia }}</p>

    <hr class="dashed">

    <p>Data do Pedido: {{ \Carbon\Carbon::parse($pedido->created_at)->format('d/m/Y H:i:s') }}</p>
    <p>Cliente: {{ $pedido->cliente_id !== null ? $pedido->cliente->nome : $pedido->nome }}</p>
    <p>Telefone: {{ $pedido->cliente_id !== null ? $pedido->cliente->telefone ?? '' : $pedido->telefone ?? '' }}</p>
    @if (!is_null($pedido->mesa) && !is_null($pedido->comanda))
      <p>Mesa: #{{ $pedido->mesa }} | Comanda: #{{ $pedido->comanda }}</p>
    @endif
    @if (!empty($pedido->observacao))
      <p class="obs">Obs: {{ $pedido->observacao }}</p>
    @endif

    <hr class="dashed">

    <p class="section-title">ITENS DO PEDIDO</p>

    @foreach ($pedido->itens as $item)
      @php
        $subtotalPizza = $item->tipo === 'P' ? $item->sabores->sum('preco_unitario') : 0;
        $subtotalComplemento = $item->tipo === 'I' ? $item->complementos->sum('preco_unitario') : 0;
        $temSubitens = ($item->tipo === 'P' && !$item->sabores->isEmpty()) || ($item->tipo === 'I' && !$item->complementos->isEmpty()) || ($item->tipo === 'C' && !$item->comboItens->isEmpty());
      @endphp

      <div class="item-row item-header">
        <span class="nome">{{ $item->quantidade }} UN {{ $item->nome }}</span>
        @if ($item->item_premio)
          <span class="preco">GRÁTIS</span>
        @elseif ($item->tipo === 'I')
          <span class="preco">R$ {{ number_format(floatval($item->preco_unitario), 2, ',', '.') }}</span>
        @elseif ($item->tipo === 'C')
          <span class="preco">R$ {{ number_format(floatval($item->subtotal), 2, ',', '.') }}</span>
        @else
          <span class="preco">#####</span>
        @endif
      </div>

      @if ($item->tipo === 'P')
        <div class="item-row complement">
          <span class="nome">Borda: {{ $item->borda->nome }}</span>
          @if (!$item->item_premio)
            <span class="preco">R$ {{ number_format(floatval($item->borda->preco), 2, ',', '.') }}</span>
          @endif
        </div>
        <div class="item-row complement">
          <span class="nome">Massa: {{ $item->massa->nome }}</span>
          @if (!$item->item_premio)
            <span class="preco">R$ {{ number_format(floatval($item->massa->preco), 2, ',', '.') }}</span>
          @endif
        </div>
        @foreach ($item->sabores as $sabor)
          <div class="item-row complement">
            <span class="nome">+{{ $sabor->qtde }}x {{ $sabor->nome }}</span>
            @if (!$item->item_premio)
              <span class="preco">R$ {{ number_format(floatval($sabor->preco_unitario), 2, ',', '.') }}</span>
            @endif
          </div>
        @endforeach
      @endif

      @if ($item->tipo === 'I' && !$item->complementos->isEmpty())
        @foreach ($item->complementos as $complemento)
          <div class="item-row complement">
            <span class="nome">{{ $complemento->qtde }} UN {{ $complemento->nome }}</span>
            @if (!$item->item_premio)
              <span class="preco">R$ {{ number_format(floatval($complemento->preco_unitario), 2, ',', '.') }}</span>
            @endif
          </div>
        @endforeach
      @endif

      @if ($item->tipo === 'C')
        @php
          $mostraPrecoComboItemPdf = !$item->item_premio && ($item->tipo_preco ?? 'preco_combo') === 'preco_itens';
        @endphp
        @foreach ($item->comboItens->groupBy('grupo_nome') as $grupoNome => $itensGrupo)
          <div class="item-row complement" style="font-weight:bold;">
            <span class="nome">{{ $grupoNome }}</span>
          </div>
          @foreach ($itensGrupo as $comboItem)
            <div class="item-row complement">
              <span class="nome">{{ $comboItem->qtde }}x {{ $comboItem->item_nome }}</span>
              @if (!$item->item_premio && $comboItem->tipo === 'complemento' && $comboItem->preco_unitario > 0)
                <span class="preco">+ R$ {{ number_format(floatval($comboItem->preco_unitario * $comboItem->qtde), 2, ',', '.') }}</span>
              @elseif ($mostraPrecoComboItemPdf && $comboItem->tipo === 'item' && $comboItem->preco_unitario > 0)
                <span class="preco">+ R$ {{ number_format(floatval($comboItem->preco_unitario * $comboItem->qtde), 2, ',', '.') }}</span>
              @elseif (!$item->item_premio && !$mostraPrecoComboItemPdf && $comboItem->tipo === 'item' && $comboItem->preco_unitario > 0)
                <span class="preco">+ R$ {{ number_format(floatval($comboItem->preco_unitario * $comboItem->qtde), 2, ',', '.') }}</span>
              @endif
            </div>
            @foreach ($comboItem->customizacoes as $customizacao)
              <div class="item-row complement" style="padding-left:2em;">
                <span class="nome">{{ $customizacao->qtde }}x {{ $customizacao->nome }}</span>
                @if (!$item->item_premio && $customizacao->preco_unitario > 0)
                  <span class="preco">+ R$ {{ number_format(floatval($customizacao->preco_unitario * $customizacao->qtde), 2, ',', '.') }}</span>
                @endif
              </div>
            @endforeach
          @endforeach
        @endforeach
      @endif

      @if (!empty($item->observacao))
        <p class="obs">Obs: {{ $item->observacao }}</p>
      @endif

      @if ($temSubitens && !$item->item_premio)
        @if ($item->tipo === 'P')
          <div class="item-total">
            <span>Total do item</span>
            <span>R$ {{ number_format(floatval($subtotalPizza + $item->borda->preco + $item->massa->preco), 2, ',', '.') }}</span>
          </div>
        @elseif ($item->tipo === 'C')
          <div class="item-total">
            <span>Total do combo</span>
            <span>R$ {{ number_format(floatval($item->subtotal), 2, ',', '.') }}</span>
          </div>
        @else
          <div class="item-total">
            <span>Total dos itens e complementos</span>
            <span>R$ {{ number_format(floatval($subtotalComplemento + $item->preco_unitario), 2, ',', '.') }}</span>
          </div>
        @endif
      @endif

      <hr class="dotted">
    @endforeach

    <p class="section-title">TOTAL</p>
    <div class="totais-box">
      <div class="totais-row">
        <span>Sub-Total</span>
        <span>R$ {{ number_format(floatval($pedido->financeiro->subtotal_itens ?? 0), 2, ',', '.') }}</span>
      </div>
      @if (floatval($pedido->valor_frete ?? 0) > 0)
        <div class="totais-row">
          <span>Taxa de Entrega</span>
          <span>+ R$ {{ number_format(floatval($pedido->valor_frete), 2, ',', '.') }}</span>
        </div>
      @endif
      @if (floatval($pedido->financeiro->adicional ?? 0) > 0)
        <div class="totais-row">
          <span>Taxa Adicional</span>
          <span>+ R$ {{ number_format(floatval($pedido->financeiro->adicional), 2, ',', '.') }}</span>
        </div>
      @endif
      @if (floatval($pedido->financeiro->valor_desconto ?? 0) > 0)
        <div class="totais-row">
          <span>Desconto</span>
          <span>- R$ {{ number_format(floatval($pedido->financeiro->valor_desconto), 2, ',', '.') }}</span>
        </div>
      @endif
      <div class="totais-row valor-total">
        <span>VALOR TOTAL</span>
        <span>R$ {{ number_format(floatval($pedido->financeiro->total), 2, ',', '.') }}</span>
      </div>
    </div>

    <hr class="dashed">
    <p class="section-title">FORMAS DE PAGAMENTO</p>
    <div class="pagamento-box">
      @php
        $pagamentosMultiplos = $pedido->financeiro->pagamentos ?? collect();
      @endphp
      @if ($pagamentosMultiplos->isNotEmpty())
        @foreach ($pagamentosMultiplos as $pag)
          <div class="pag-row">
            <span>{{ ($pag->forma_pagamento ?? null) === 'cashback' ? 'Cashback' : $pag->defineFormaPagamento() }}</span>
            <span>R$ {{ number_format(floatval($pag->valor), 2, ',', '.') }}</span>
          </div>
          @if (floatval($pag->valor_troco ?? 0) > 0)
            <div class="pag-row">
              <span>Troco para R$ {{ number_format(floatval($pag->troco_para), 2, ',', '.') }}</span>
              <span>R$ {{ number_format(floatval($pag->valor_troco), 2, ',', '.') }}</span>
            </div>
          @endif
        @endforeach
      @else
        <div class="pag-row">
          <span>{{ $pedido->financeiro->defineFormaPagamento() }}</span>
        </div>
        @if (floatval($pedido->financeiro->valor_troco ?? 0) > 0)
          <div class="pag-row">
            <span>Troco para R$ {{ number_format(floatval($pedido->financeiro->troco_para), 2, ',', '.') }}</span>
            <span>R$ {{ number_format(floatval($pedido->financeiro->valor_troco), 2, ',', '.') }}</span>
          </div>
        @endif
      @endif
    </div>

    @if (($pedido->tipo ?? '') === 'D')
      <hr class="dashed">
      <p class="section-title">ENTREGA PEDIDO #{{ $pedido->id }}</p>
      <p>Entregue por: {{ $pedido->ifood_entregue_por ?? 'LOJA / PARCEIRO IFOOD' }}</p>
      <p>Cliente: {{ $pedido->cliente_id !== null ? $pedido->cliente->nome : $pedido->nome }}</p>

      @if ($pedido->pedido_ifood_id)
        <p>Endereço: {{ $pedido->enderecoEntregaIfood->logradouro }}, {{ $pedido->enderecoEntregaIfood->numero }}</p>
        @if (!empty($pedido->enderecoEntregaIfood->complemento))
          <p>Comp: {{ $pedido->enderecoEntregaIfood->complemento }}</p>
        @endif
        <p>Bairro: {{ $pedido->enderecoEntregaIfood->bairro }}</p>
        <p>Cidade: {{ $pedido->enderecoEntregaIfood->cidade }} - {{ $pedido->enderecoEntregaIfood->uf }}</p>
        <p>CEP: {{ preg_replace('/(\d{5})(\d{3})/', '$1-$2', $pedido->enderecoEntregaIfood->cep) }}</p>
      @else
        <p>Endereço: {{ $pedido->enderecoDeEntrega->logradouro }}, {{ $pedido->enderecoDeEntrega->numero }}</p>
        @if (!empty($pedido->enderecoDeEntrega->complemento))
          <p>Comp: {{ $pedido->enderecoDeEntrega->complemento }}</p>
        @endif
        <p>Bairro: {{ $pedido->enderecoDeEntrega->bairro }}</p>
        <p>Cidade: {{ $pedido->enderecoDeEntrega->cidade }} - {{ $pedido->enderecoDeEntrega->uf }}</p>
        <p>CEP: {{ preg_replace('/(\d{5})(\d{3})/', '$1-$2', $pedido->enderecoDeEntrega->cep) }}</p>
      @endif
    @endif

    <hr class="dashed">
    <div class="footer-msg">
      <p>Impresso por:</p>
      <p>{{ $pedido->empresa->nome_fantasia }} (v1.0) - SAFI Delivery</p>
    </div>

  </div>
</body>

</html>
