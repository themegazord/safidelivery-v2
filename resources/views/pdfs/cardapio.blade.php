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
      color: #1f2937;
      background: white;
      font-size: 12pt;
    }

    .page {
      padding: 20mm;
      background: white;
    }

    @page {
      margin: 0;
      size: A4;
    }
  </style>
</head>

<body>
  <div class="page">
    <!-- Cabeçalho -->
    @foreach ($cardapioAtual->categorias()->orderBy('ordem', 'asc')->get() as $categoria)
      <div style="margin-bottom: 40px; page-break-inside: avoid;">
        <!-- Título da Categoria -->
        <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 20px 0; padding: 20px; background: white; border-radius: 8px;">
          {{ $categoria->nome }}
        </h2>

        @if ($categoria->tipo === 'I')
          <!-- TABLE para layout em 2 colunas -->
          <table style="width: 100%; border-collapse: collapse;">
            @php $count = 0; @endphp

            @forelse ($categoria->itens as $item)
              @if ($count % 2 == 0)
                <tr>
              @endif

              <td style="width: 48%; padding: 8px; vertical-align: top;">
                <div style="padding: 16px; border: 1px solid #22c55e; border-radius: 8px; background: white; min-height: 180px;">

                  <!-- Imagem centralizada no topo -->
                  <div style="text-align: center; margin-bottom: 12px;">
                    <img src=""
                      alt="{{ $item->nome }}"
                      style="width: 144px; height: 144px; object-fit: cover; border: 1px solid #22c55e; border-radius: 6px; display: inline-block;">
                  </div>

                  <!-- Informações abaixo da imagem -->
                  <div style="width: 100%;">
                    <!-- Nome -->
                    <p style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #1f2937; line-height: 1.3;">
                      {{ $item->nome }}
                    </p>

                    <!-- Descrição -->
                    @if ($item->descricao)
                      <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.4; word-wrap: break-word;">
                        {{ $item->descricao }}
                      </p>
                    @endif

                    <!-- Classificações -->
                    @if ($item->getClassificacoesAtivas())
                      <div style="margin-bottom: 8px;">
                        @foreach ($item->getClassificacoesAtivas() as $chave => $classificacao)
                          <span style="display: inline-block; padding: 3px 6px; border-radius: 8px; font-size: 10px; margin-right: 4px; margin-bottom: 4px; background-color: #e5e7eb; color: #374151; white-space: nowrap;">
                            {{ $classificacao['icone'] }} {{ $classificacao['label'] }}
                          </span>
                        @endforeach
                      </div>
                    @endif

                    <!-- Gramagem -->
                    @if ($item->peso)
                      <p style="font-size: 12px; color: #4b5563; margin: 0 0 6px 0;">
                        <strong>📊 {{ $item->peso }}g</strong>
                      </p>
                    @endif

                    <!-- Quantidade de Pessoas -->
                    @if ($item->qtde_pessoas)
                      <p style="font-size: 13px; font-weight: bold; color: #374151; margin: 0 0 8px 0;">
                        👤 Serve {{ $item->qtde_pessoas }} {{ $item->qtde_pessoas <= 1 ? 'pessoa' : 'pessoas' }}
                      </p>
                    @endif

                    <!-- Preço -->
                    @if (!$item->desconto)
                      <p style="font-weight: bold; color: #16a34a; margin: 0; font-size: 18px;">
                        R$ {{ number_format((float) $item->preco, 2, ',', '.') }}
                      </p>
                    @else
                      <p style="margin: 0;">
                        <span style="font-weight: bold; color: #16a34a; font-size: 18px; margin-right: 8px;">
                          R$ {{ number_format((float) $item->valor_desconto, 2, ',', '.') }}
                        </span>
                        <span style="color: #9ca3af; text-decoration: line-through; font-size: 14px;">
                          R$ {{ number_format((float) $item->preco, 2, ',', '.') }}
                        </span>
                      </p>
                    @endif
                  </div>
                </div>
              </td>

              @php $count++; @endphp

              @if ($count % 2 == 0 || $loop->last)
                @if ($loop->last && $count % 2 != 0)
                  <td style="width: 48%;"></td>
                @endif
                </tr>
              @endif
            @empty
              <tr>
                <td colspan="2" style="padding: 20px; text-align: center; color: #6b7280;">
                  Nenhum item encontrado
                </td>
              </tr>
            @endforelse
          </table>
        @endif

        @if ($categoria->tipo === 'P')
          @if (empty($pesquisa))
            <table style="width: 100%; border-collapse: collapse;">
              @php $countPizza = 0; @endphp

              @foreach ($categoria->tamanhos as $tamanho)
                @php
                  $itensAtivos = collect();
                  foreach ($tamanho->precosPorTamanho->filter(fn($preco) => $preco->status) as $item) {
                      $itensAtivos->push($item);
                  }
                  $menorValorTamanho = $itensAtivos->sortBy('preco')->first()->preco;
                @endphp

                @foreach ($tamanho->qtde_sabores as $qtde)
                  @if ($countPizza % 2 == 0)
                    <tr>
                  @endif

                  <td style="width: 48%; padding: 8px; vertical-align: top;">
                    <div style="padding: 16px; border: 1px solid #22c55e; border-radius: 8px; background: white; min-height: 180px;">

                      <!-- Imagem centralizada no topo -->
                      <div style="text-align: center; margin-bottom: 12px;">
                        <img src=""
                          alt="{{ $tamanho->nome }}"
                          style="width: 144px; height: 144px; object-fit: cover; border: 1px solid #22c55e; border-radius: 6px; display: inline-block;">
                      </div>

                      <!-- Informações -->
                      <div style="width: 100%;">
                        <p style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; line-height: 1.3;">
                          {{ $tamanho->nome }} {{ $qtde > 1 ? "$qtde SABORES" : '' }} ({{ $tamanho->qtde_pedacos }} PEDAÇOS)
                        </p>
                        <p style="font-size: 14px; color: #4b5563; margin: 0;">
                          À partir de <strong style="color: #16a34a; font-size: 16px;">R$ {{ number_format((float) $menorValorTamanho, 2, ',', '.') }}</strong>
                        </p>
                      </div>
                    </div>
                  </td>

                  @php $countPizza++; @endphp

                  @if ($countPizza % 2 == 0 || ($loop->parent->last && $loop->last))
                    @if ($loop->parent->last && $loop->last && $countPizza % 2 != 0)
                      <td style="width: 48%;"></td>
                    @endif
                    </tr>
                  @endif
                @endforeach
              @endforeach
            </table>
          @endif
        @endif
      </div>
    @endforeach
  </div>
</body>

</html>