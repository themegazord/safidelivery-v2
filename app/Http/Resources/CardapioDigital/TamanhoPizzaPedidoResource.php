<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\CategoriaTamanho
 */
class TamanhoPizzaPedidoResource extends JsonResource
{
    public function __construct($resource, private readonly int $qtdeSabor, private readonly int $menorValorTamanho)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $saboresDisponiveis = $this->getAttribute('precosPorTamanho')->filter(
            fn ($sabor) => $sabor->getAttribute('item') !== null
                && in_array(now()->dayOfWeek, array_map('intval', $sabor->getAttribute('dias_funcionamento') ?? []))
        );

        return [
            'id' => $this->getAttribute('id'),
            'categoria_id' => $this->getAttribute('categoria_id'),
            'nome' => $this->getAttribute('nome'),
            'qtde_pedacos' => $this->getAttribute('qtde_pedacos'),
            'qtde_sabores' => $this->getAttribute('qtde_sabores'),
            'menorValorTamanho' => $this->menorValorTamanho,
            'quantidade_sabores_selecionadas' => 0,
            'quantidade_sabor' => $this->qtdeSabor,
            'quantidade' => 1,
            'observacao' => '',
            'total' => 0,
            'categoria' => $this->whenLoaded('categoria', fn () => [
                'id' => $this->getAttribute('categoria_id'),
                'nome' => $this->getAttribute('categoria')->getAttribute('nome'),
            ]),
            'massas' => $this->whenLoaded('categoria', fn () => OpcaoPizzaResource::collection($this->getAttribute('categoria')->getAttribute('massas'))),
            'massaSelecionada' => null,
            'bordas' => $this->whenLoaded('categoria', fn () => OpcaoPizzaResource::collection($this->getAttribute('categoria')->getAttribute('bordas'))),
            'bordaSelecionada' => null,
            'sabores' => $saboresDisponiveis->map(fn ($sabor) => new SaborPizzaResource($sabor, $this->qtdeSabor))->values(),
        ];
    }
}
