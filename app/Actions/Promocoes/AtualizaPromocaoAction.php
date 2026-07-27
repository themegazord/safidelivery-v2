<?php

namespace App\Actions\Promocoes;

use App\Models\Promocao;

class AtualizaPromocaoAction
{
    public function handle(Promocao $promocao, array $dados, string $status): Promocao
    {
        $promocao->update([
            'nome_cupom' => $dados['nome_cupom'],
            'descricao_cupom' => $dados['descricao_cupom'],
            'valido_cliente_novo' => $dados['valido_cliente_novo'],
            'onde_afetara' => $dados['onde_afetara'],
            'tipo_cupom' => $dados['tipo_cupom'],
            'valor_desconto' => $dados['valor_desconto'],
            'valor_minimo_pedido' => $dados['valor_minimo_pedido'],
            'valor_maximo_desconto' => $dados['valor_maximo_desconto'],
            'qtde_clientes_usabilidade' => $dados['qtde_clientes_usabilidade'],
            'qtde_clientes' => $dados['qtde_clientes'],
            'qtde_usos' => $dados['qtde_usos'],
            'uso_unico' => $dados['uso_unico'],
            'data_vencimento' => $dados['data_vencimento'],
            'dias_disponiveis' => json_encode($dados['dias_disponiveis']),
            'cupom_visivel' => $dados['cupom_visivel'],
        ]);

        if ($status === 'ativo') {
            $promocao->restore();
        } else {
            $promocao->delete();
        }

        return $promocao;
    }
}
