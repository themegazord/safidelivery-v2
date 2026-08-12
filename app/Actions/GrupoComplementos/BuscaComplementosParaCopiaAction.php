<?php

namespace App\Actions\GrupoComplementos;

use App\Models\Cardapio;
use App\Models\Complemento;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class BuscaComplementosParaCopiaAction
{
    public function handle(Cardapio $cardapio, ?string $busca, int $porPagina = 5): LengthAwarePaginator
    {
        $idsUnicosPorNome = DB::table('complementos')
            ->selectRaw('MIN(complementos.id) as id')
            ->join('grupo_complemento', 'grupo_complemento.id', '=', 'complementos.grupo_id')
            ->join('itens', 'itens.id', '=', 'grupo_complemento.item_id')
            ->join('categorias', 'categorias.id', '=', 'itens.categoria_id')
            ->where('categorias.cardapio_id', $cardapio->getAttribute('id'))
            ->whereNull('grupo_complemento.deleted_at')
            ->whereNull('itens.deleted_at')
            ->whereNull('categorias.deleted_at')
            ->when($busca, fn ($query) => $query->where('complementos.nome', 'like', '%'.$busca.'%'))
            ->groupBy('complementos.nome');

        return Complemento::query()
            ->whereIn('id', $idsUnicosPorNome)
            ->with('grupos.item')
            ->orderBy('nome')
            ->paginate($porPagina)
            ->withQueryString()
            ->through(fn (Complemento $complemento) => [
                'id' => $complemento->getAttribute('id'),
                'nome' => $complemento->getAttribute('nome'),
                'descricao' => $complemento->getAttribute('descricao'),
                'imagem' => $complemento->grupos?->item?->getAttribute('imagem'),
            ]);
    }
}
