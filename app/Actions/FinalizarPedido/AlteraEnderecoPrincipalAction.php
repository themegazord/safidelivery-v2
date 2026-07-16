<?php

namespace App\Actions\FinalizarPedido;

use App\Models\Cliente;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class AlteraEnderecoPrincipalAction {
  public function handle(int $cliente_id, int $endereco_id): void {
    $cliente = Cliente::query()->findOrFail($cliente_id);

    $enderecosIdsCliente = $cliente->enderecos()->pluck('enderecos.id')->all();

    if (!in_array($endereco_id, $enderecosIdsCliente)) {
      throw new Exception('Esse endereço não condiz com os endereços cadastrados para esse cadastro!', Response::HTTP_NOT_FOUND);
    }

    DB::transaction(function () use ($cliente, $endereco_id, $enderecosIdsCliente) {
      $cliente->enderecos()->updateExistingPivot($enderecosIdsCliente, ['principal' => false]);

      $cliente->enderecos()->updateExistingPivot($endereco_id, ['principal' => true]);
    });
  }
}