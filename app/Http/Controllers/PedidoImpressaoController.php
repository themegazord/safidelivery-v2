<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use Illuminate\Http\Response;

class PedidoImpressaoController extends Controller
{
    private function carregaPedido(int $pedido_id): Pedido
    {
        return Pedido::withTrashed()->with([
            'empresa',
            'cliente',
            'itens.complementos',
            'itens.sabores',
            'itens.borda',
            'itens.massa',
            'itens.comboItens.customizacoes',
            'financeiro.pagamentos',
            'enderecoEntrega',
            'enderecoEntregaIfood',
            'cuponsUsadoNoIfood',
        ])->findOrFail($pedido_id);
    }

    public function pdf(int $pedido_id)
    {
        return view('pedidos.pedido', ['pedido' => $this->carregaPedido($pedido_id)]);
    }

    public function txt(int $pedido_id): Response
    {
        $conteudo = view('pedidos.pedido_txt', ['pedido' => $this->carregaPedido($pedido_id)])->render();

        return response($conteudo, 200)->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    public function escpos(int $pedido_id): Response
    {
        $conteudo = view('pedidos.pedido_escpos', ['pedido' => $this->carregaPedido($pedido_id)])->render();

        $linhas = array_map(
            fn (string $linha) => wordwrap($linha, 32, "\n", true),
            explode("\n", $conteudo),
        );

        return response(implode("\n", $linhas), 200)->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
