<?php

namespace App\Http\Controllers\Empresa;

use App\Http\Controllers\Controller;
use App\Jobs\Empresa\ConsultarPedidosIfoodJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConfiguracaoController extends Controller
{
    public function configuraRecebimentoPedidoIfood(Request $request) {
        $empresa = Auth::user()->empresa;
        $valor = $request->only('esta_recebendo_pedidos_ifood');

        $empresa->update([
            'esta_recebendo_pedidos_ifood' => $valor,
        ]);

        if ($valor) {
            dispatch(new ConsultarPedidosIfoodJob($empresa->getAttribute('id')));
        }
    }
}
