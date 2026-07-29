<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cardápio</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'DejaVu Sans', sans-serif;
      line-height: 1.4;
      color: #2b2620;
      background: #faf7f0;
      font-size: 12pt;
    }

    .page {
      padding: 16mm 18mm;
      background: #faf7f0;
    }

    @page {
      margin: 0;
      size: A4;
    }

    /* ===== Capa ===== */
    .capa {
      text-align: center;
      padding-bottom: 18px;
      margin-bottom: 30px;
      border-bottom: 3px double #8a6d2f;
    }

    .capa .selo {
      font-size: 11px;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #8a6d2f;
      margin-bottom: 6px;
    }

    .capa h1 {
      font-family: 'DejaVu Sans', sans-serif;
      font-size: 34px;
      font-weight: bold;
      color: #1f1b14;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }

    .capa .subtitulo {
      font-size: 12px;
      color: #6b6255;
      font-style: italic;
    }

    /* ===== Categoria ===== */
    .categoria {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .categoria-titulo {
      text-align: center;
      margin: 0 0 18px 0;
    }

    .categoria-titulo .linha {
      display: block;
      border-top: 1px solid #c9b98a;
      margin: 0 auto 10px auto;
      width: 60%;
    }

    .categoria-titulo h2 {
      font-family: 'DejaVu Sans', sans-serif;
      font-size: 22px;
      font-weight: bold;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #1f1b14;
      display: inline-block;
      padding: 0 14px;
    }

    .categoria-titulo .ornamento {
      color: #8a6d2f;
      font-size: 13px;
      letter-spacing: 6px;
    }

    /* ===== Lista de itens ===== */
    .lista-itens {
      width: 100%;
      border-collapse: collapse;
    }

    .lista-itens tr.item-linha td {
      padding: 12px 0;
      border-bottom: 1px solid #e6ddc8;
      vertical-align: top;
    }

    .item-thumb-cel {
      width: 62px;
      padding-right: 12px !important;
    }

    .item-thumb {
      width: 56px;
      height: 56px;
      object-fit: cover;
      border: 1px solid #d9cba4;
    }

    .item-conteudo-cel {
      width: 100%;
    }

    /* linha nome ......... preço */
    .item-cabecalho {
      width: 100%;
      border-collapse: collapse;
    }

    .item-cabecalho td {
      padding: 0;
      border-bottom: none;
      vertical-align: bottom;
    }

    .item-nome {
      font-family: 'DejaVu Sans', sans-serif;
      font-size: 14px;
      font-weight: bold;
      color: #1f1b14;
      white-space: nowrap;
    }

    .item-pontilhado {
      border-bottom: 1px dotted #b3a684;
      font-size: 1px;
      line-height: 1px;
    }

    .item-preco {
      font-family: 'DejaVu Sans', sans-serif;
      font-weight: bold;
      color: #6b7a3f;
      font-size: 14px;
      text-align: right;
      white-space: nowrap;
      padding-left: 8px !important;
    }

    .item-preco .de {
      color: #a39a89;
      text-decoration: line-through;
      font-size: 11px;
      font-family: 'DejaVu Sans', sans-serif;
      font-weight: normal;
      margin-right: 6px;
    }

    .item-descricao {
      font-size: 11px;
      color: #6b6255;
      font-style: italic;
      margin: 4px 0 4px 0;
      line-height: 1.4;
    }

    .item-tag {
      display: inline-block;
      padding: 1px 6px;
      border: 1px solid #c9b98a;
      font-size: 9px;
      margin-right: 4px;
      margin-top: 2px;
      color: #6b6255;
      background: #f4ecd8;
      white-space: nowrap;
    }

    .item-meta {
      font-size: 10px;
      color: #4b4438;
      margin-top: 3px;
    }

    /* ===== Rodapé ===== */
    .rodape-nota {
      text-align: center;
      font-size: 9px;
      color: #a39a89;
      margin-top: 6px;
      letter-spacing: 1px;
    }
  </style>
</head>

<body>
  <div class="page">

    <div class="capa">
      <div class="selo">{{ $cardapioAtual->nome ?? 'Nosso Cardápio' }}</div>
      <h1>Cardápio</h1>
      <div class="subtitulo">Feito com dedicação, servido com carinho</div>
    </div>

    @foreach ($cardapioAtual->categorias()->orderBy('ordem', 'asc')->get() as $categoria)
      <div class="categoria">

        <div class="categoria-titulo">
          <span class="linha"></span>
          <span class="ornamento">❦</span>
          <h2>{{ $categoria->nome }}</h2>
          <span class="ornamento">❦</span>
        </div>

        @if ($categoria->tipo === 'I')
          <table class="lista-itens">
            @forelse ($categoria->itens as $item)
              <tr class="item-linha">
                <td class="item-thumb-cel">
                  <img class="item-thumb" src="" alt="{{ $item->nome }}">
                </td>
                <td class="item-conteudo-cel">

                  <table class="item-cabecalho">
                    <tr>
                      <td class="item-nome">{{ $item->nome }}</td>
                      <td class="item-pontilhado">&nbsp;</td>
                      <td class="item-preco">
                        @if (!$item->desconto)
                          R$ {{ number_format((float) $item->preco, 2, ',', '.') }}
                        @else
                          <span class="de">R$ {{ number_format((float) $item->preco, 2, ',', '.') }}</span>
                          R$ {{ number_format((float) $item->valor_desconto, 2, ',', '.') }}
                        @endif
                      </td>
                    </tr>
                  </table>

                  @if ($item->descricao)
                    <p class="item-descricao">{{ $item->descricao }}</p>
                  @endif

                  @if ($item->getClassificacoesAtivas())
                    <div>
                      @foreach ($item->getClassificacoesAtivas() as $chave => $classificacao)
                        <span class="item-tag">{{ $classificacao['icone'] }} {{ $classificacao['label'] }}</span>
                      @endforeach
                    </div>
                  @endif

                  @if ($item->peso || $item->qtde_pessoas)
                    <p class="item-meta">
                      @if ($item->peso)
                        📊 {{ $item->peso }}g
                      @endif
                      @if ($item->peso && $item->qtde_pessoas)
                        &nbsp;·&nbsp;
                      @endif
                      @if ($item->qtde_pessoas)
                        👤 Serve {{ $item->qtde_pessoas }} {{ $item->qtde_pessoas <= 1 ? 'pessoa' : 'pessoas' }}
                      @endif
                    </p>
                  @endif

                </td>
              </tr>
            @empty
              <tr>
                <td style="padding: 20px; text-align: center; color: #6b6255;">
                  Nenhum item encontrado
                </td>
              </tr>
            @endforelse
          </table>
        @endif

        @if ($categoria->tipo === 'P')
          @if (empty($pesquisa))
            <table class="lista-itens">
              @foreach ($categoria->tamanhos as $tamanho)
                @php
                  $itensAtivos = collect();
                  foreach ($tamanho->precosPorTamanho->filter(fn($preco) => $preco->status) as $item) {
                      $itensAtivos->push($item);
                  }
                  $menorValorTamanho = $itensAtivos->sortBy('preco')->first()->preco;
                @endphp

                @foreach ($tamanho->qtde_sabores as $qtde)
                  <tr class="item-linha">
                    <td class="item-thumb-cel">
                      <img class="item-thumb" src="" alt="{{ $tamanho->nome }}">
                    </td>
                    <td class="item-conteudo-cel">
                      <table class="item-cabecalho">
                        <tr>
                          <td class="item-nome" style="text-transform: uppercase;">
                            {{ $tamanho->nome }} {{ $qtde > 1 ? "$qtde SABORES" : '' }} ({{ $tamanho->qtde_pedacos }} PEDAÇOS)
                          </td>
                          <td class="item-pontilhado">&nbsp;</td>
                          <td class="item-preco">R$ {{ number_format((float) $menorValorTamanho, 2, ',', '.') }}</td>
                        </tr>
                      </table>
                      <p class="item-meta">À partir de, conforme tamanho e sabores escolhidos</p>
                    </td>
                  </tr>
                @endforeach
              @endforeach
            </table>
          @endif
        @endif

        <div class="rodape-nota">— {{ $loop->iteration }} de {{ $cardapioAtual->categorias()->count() }} —</div>
      </div>
    @endforeach
  </div>
</body>

</html>
