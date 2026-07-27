<?php

namespace App\Actions\FinalizarPedido;

use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ValidaCupomPedidoAction
{
  public function handle(?string $nome_cupom, int $empresa_id, float $subtotal, ?float $frete = null) {
    return $this->validaCupomDesconto($nome_cupom, $empresa_id, $subtotal, $frete);
  }

  private function validaCupomDesconto(?string $nome_cupom, int $empresa_id, float $subtotal, ?float $frete): object
  {
    $resposta = DB::transaction(function () use ($nome_cupom, $empresa_id, $subtotal, $frete) {
      $cupom = DB::table('promocao')
        ->where('nome_cupom', $nome_cupom)
        ->where('empresa_id', $empresa_id)
        ->lockForUpdate()
        ->first();

      if (is_null($cupom)) {
        throw new Exception('Cupom de desconto não existe', Response::HTTP_NOT_FOUND);
      }

      if ($cupom->uso_unico) {
        if (! Auth::check()) {
          throw new Exception('Este cupom requer identificação do cliente.', Response::HTTP_UNAUTHORIZED);
        }
        $clienteJaUsou = DB::table('promocao_usada')
          ->where('promocao_id', $cupom->id)
          ->where('cliente_id', Auth::user()->cliente->id)
          ->exists();

        if ($clienteJaUsou) {
          throw new Exception('Você já usou este cupom.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }
      } elseif ($cupom->qtde_clientes_usabilidade === 'limitado') {
        $clientesQueUsaram = DB::table('promocao_usada')
          ->where('promocao_id', $cupom->id)
          ->distinct('cliente_id')
          ->count('cliente_id');

        if ($clientesQueUsaram >= $cupom->qtde_clientes) {
          throw new Exception('O cupom está esgotado', Response::HTTP_UNPROCESSABLE_ENTITY);
        }
      }

      $usosRegistrados = DB::table('promocao_usada')
        ->where('promocao_id', $cupom->id)
        ->count();

      if ($usosRegistrados >= $cupom->qtde_usos) {
        throw new Exception('Cupom atingiu o limite total de usos', Response::HTTP_UNPROCESSABLE_ENTITY);
      }

      if (strtotime('now') > strtotime($cupom->data_vencimento)) {
        throw new Exception('Cupom expirado.', Response::HTTP_UNPROCESSABLE_ENTITY);
      }

      $diasDisponiveis = json_decode($cupom->dias_disponiveis, true);
      $diaHoje = (int) date('w');

      if (! in_array($diaHoje, $diasDisponiveis, true)) {
        throw new Exception('O cupom não está ativo hoje.', Response::HTTP_UNPROCESSABLE_ENTITY);
      }

      if ($cupom->valido_cliente_novo) {
        if (! Auth::check()) {
          throw new Exception('Este cupom requer identificação do cliente.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        if (Auth::user()->cliente->pedidos()->where('empresa_id', $empresa_id)->exists()) {
          throw new Exception('O cupom é válido apenas para primeiros clientes.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }
      }

      if ($cupom->valor_minimo_pedido > $subtotal) {
        throw new Exception('O pedido deve conter no minimo R$' . number_format($cupom->valor_minimo_pedido, 2, ',', '.'), Response::HTTP_UNPROCESSABLE_ENTITY);
      }

      $cupom->valor_desconto_calculado = (new CalculaDescontoCupomAction())->handle($cupom, $subtotal, $frete);

      return $cupom;
    });

    return $resposta;
  }
}
