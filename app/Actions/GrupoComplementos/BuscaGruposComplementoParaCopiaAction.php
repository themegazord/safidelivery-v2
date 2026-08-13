<?php

namespace App\Actions\GrupoComplementos;

use App\Models\Cardapio;
use App\Models\GrupoComplemento;
use App\Models\Item;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class BuscaGruposComplementoParaCopiaAction
{
    public function handle(Cardapio $cardapio, ?string $busca, int $porPagina = 5, ?Item $itemAtual = null): LengthAwarePaginator
    {
        $nomesGruposDoItemAtual = $itemAtual
            ? GrupoComplemento::query()->where('item_id', $itemAtual->getAttribute('id'))->pluck('nome')
            : collect();

        $idsUnicosPorNome = DB::table('grupo_complemento')
            ->selectRaw('MIN(grupo_complemento.id) as id')
            ->join('itens', 'itens.id', '=', 'grupo_complemento.item_id')
            ->join('categorias', 'categorias.id', '=', 'itens.categoria_id')
            ->where('categorias.cardapio_id', $cardapio->getAttribute('id'))
            ->whereNull('grupo_complemento.deleted_at')
            ->whereNull('itens.deleted_at')
            ->whereNull('categorias.deleted_at')
            ->when($busca, fn ($query) => $query->where('grupo_complemento.nome', 'like', '%'.$busca.'%'))
            ->groupBy('grupo_complemento.nome');

        return GrupoComplemento::query()
            ->whereIn('id', $idsUnicosPorNome)
            ->withCount('complementos')
            ->with('item')
            ->orderBy('nome')
            ->paginate($porPagina)
            ->withQueryString()
            ->through(fn (GrupoComplemento $grupo) => [
                'id' => $grupo->getAttribute('id'),
                'nome' => $grupo->getAttribute('nome'),
                'descricao' => $grupo->getAttribute('complementos_count').' complemento'.($grupo->getAttribute('complementos_count') === 1 ? '' : 's').' · '.$grupo->item?->getAttribute('nome'),
                'imagem' => null,
                'obrigatoriedade' => $grupo->getAttribute('obrigatoriedade'),
                'qtd_minima' => $grupo->getAttribute('qtd_minima'),
                'qtd_maxima' => $grupo->getAttribute('qtd_maxima'),
                'ja_adicionado' => $nomesGruposDoItemAtual->contains($grupo->getAttribute('nome')),
            ]);
    }
}
