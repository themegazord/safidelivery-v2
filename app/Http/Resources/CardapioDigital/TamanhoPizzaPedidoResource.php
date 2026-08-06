<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TamanhoPizzaPedidoResource extends JsonResource
{
    public function __construct($resource, private readonly int $qtdeSabor, private readonly int $menorValorTamanho)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $saboresDisponiveis = $this->precosPorTamanho->filter(
            fn ($sabor) => $sabor->item !== null
                && in_array(now()->dayOfWeek, array_map('intval', $sabor->dias_funcionamento ?? []))
        );

        return [
            'id' => $this->id,
            'categoria_id' => $this->categoria_id,
            'nome' => $this->nome,
            'qtde_pedacos' => $this->qtde_pedacos,
            'qtde_sabores' => $this->qtde_sabores,
            'menorValorTamanho' => $this->menorValorTamanho,
            'quantidade_sabores_selecionadas' => 0,
            'quantidade_sabor' => $this->qtdeSabor,
            'quantidade' => 1,
            'observacao' => '',
            'total' => 0,
            'categoria' => $this->whenLoaded('categoria', fn () => [
                'id' => $this->categoria_id,
                'nome' => $this->categoria->nome,
            ]),
            'massas' => $this->whenLoaded('categoria', fn () => OpcaoPizzaResource::collection($this->categoria->massas)),
            'massaSelecionada' => null,
            'bordas' => $this->whenLoaded('categoria', fn () => OpcaoPizzaResource::collection($this->categoria->bordas)),
            'bordaSelecionada' => null,
            'sabores' => $saboresDisponiveis->map(fn ($sabor) => new SaborPizzaResource($sabor, $this->qtdeSabor))->values(),
        ];
    }
}
