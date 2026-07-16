<?php

namespace App\Actions\FinalizarPedido;

use App\Models\Endereco;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CadastraEnderecoNovoAction {
  public function handle(array $endereco_novo): Endereco {
    $cliente = Auth::user()->cliente;

    return DB::transaction(
        fn () => $cliente->enderecos()->create($endereco_novo)
    );
  }
}