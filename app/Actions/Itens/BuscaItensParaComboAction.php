<?php

namespace App\Actions\Itens;

use App\Models\Cardapio;
use App\Models\Item;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class BuscaItensParaComboAction
{
    public function handle(Cardapio $cardapio, ?string $busca, int $porPagina = 5): LengthAwarePaginator
    {
        $ids = DB::table('itens')
            ->select('itens.id')
            ->join('categorias', 'categorias.id', '=', 'itens.categoria_id')
            ->where('categorias.cardapio_id', $cardapio->getAttribute('id'))
            ->where('itens.tipo', '!=', 'CON')
            ->whereNull('itens.deleted_at')
            ->whereNull('categorias.deleted_at')
            ->when($busca, fn ($query) => $query->where('itens.nome', 'like', '%'.$busca.'%'));

        return Item::query()
            ->whereIn('id', $ids)
            ->with('categoria')
            ->orderBy('nome')
            ->paginate($porPagina)
            ->withQueryString()
            ->through(fn (Item $item) => [
                'id' => $item->getAttribute('id'),
                'nome' => $item->getAttribute('nome'),
                'descricao' => 'R$ '.number_format((float) $item->getAttribute('preco'), 2, ',', '.').' · '.$item->categoria?->getAttribute('nome'),
                'imagem' => $item->getAttribute('imagem'),
                'preco' => (float) $item->getAttribute('preco'),
            ]);
    }
}
