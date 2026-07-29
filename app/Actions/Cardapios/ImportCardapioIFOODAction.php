<?php

namespace App\Actions\Cardapios;

use App\Models\Cardapio;
use App\Services\IFOOD\ApiExternalIfood;
use Illuminate\Support\Facades\DB;

class ImportCardapioIFOODAction
{
    public function handle(string $merchantId, array $dados, int $empresa_id)
    {
        $api = app(ApiExternalIfood::class);

        DB::transaction(function () use ($api, $merchantId, $dados, $empresa_id) {
            $cardapioCriado = Cardapio::query()->create([
                'tipo_importacao' => 'ifood',
                'empresa_id' => $empresa_id,
                'nome' => $dados['nome'],
                'descricao' => $dados['descricao'],
                'dias_funcionamento' => $dados['dias_funcionamento'],
                'tipo_funcionamento' => $dados['tipo_funcionamento']
            ]);

            $api->importarCatalogo(
                $empresa_id,
                $merchantId,
                $cardapioCriado,
                $dados['importar_item'],
                $dados['importar_complementos'],
                $dados['importar_imagem'],
                $dados['importar_preco'],
                $dados['dias_funcionamento']
            );
        });
    }
}
