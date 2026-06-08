<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FormaPagamento extends Model
{
    use SoftDeletes;

    protected $table = 'forma_pagamento';

    protected $fillable = [
        'empresa_id',
        'codigo_pdv',
        'descricao',
        'tipo',
        'interno',
    ];

    public static function tiposOpcoes(): array
    {
        return [
            ['id' => 'PIX', 'name' => 'Pix'],
            ['id' => 'DIN', 'name' => 'Dinheiro'],
            ['id' => 'CTD', 'name' => 'Cartão de Débito'],
            ['id' => 'CTC', 'name' => 'Cartão de Crédito'],
            ['id' => 'VRE', 'name' => 'Vale Refeição'],
        ];
    }

    public static function tipoLabel(string $tipo): string
    {
        return match ($tipo) {
            'PIX' => 'Pix',
            'DIN' => 'Dinheiro',
            'CTD' => 'Cartão de Débito',
            'CTC' => 'Cartão de Crédito',
            'VRE' => 'Vale Refeição',
            'VIR' => 'Virtual',
            default => $tipo,
        };
    }

    /**
     * Mantido para compatibilidade com pedidos históricos e iFood.
     */
    public static function formasPagamentoPadrao(): array
    {
        return [
            'pix'            => 'Pix',
            'dinheiro'       => 'Dinheiro',
            'master_debito'  => 'Mastercard - Débito',
            'master_credito' => 'Mastercard - Crédito',
            'elo_debito'     => 'Elo - Débito',
            'elo_credito'    => 'Elo - Crédito',
            'visa_credito'   => 'Visa - Crédito',
            'visa_debito'    => 'Visa - Débito',
            'amex_credito'   => 'Amex - Crédito',
            'vr_refeicao'    => 'VR Refeição',
            'alelo_refeicao' => 'Alelo',
            'outro_refeicao' => 'Outro ticket refeição',
        ];
    }

    /**
     * Mantido para compatibilidade com a API de pedidos (defineTipoPagamento).
     */
    public function defineTipoPagamento(string $forma_pagamento): string
    {
        return match ($forma_pagamento) {
            'pix'                                          => 'PIX',
            'dinheiro'                                     => 'DIN',
            'master_debito', 'elo_debito', 'visa_debito'  => 'CTD',
            'master_credito', 'elo_credito',
            'visa_credito', 'amex_credito'                 => 'CTC',
            'vr_refeicao', 'alelo_refeicao',
            'outro_refeicao'                               => 'VRE',
            'cashback'                                     => 'VIR',
            default                                        => $this->resolverTipoPorCodigo($forma_pagamento),
        };
    }

    private function resolverTipoPorCodigo(string $codigo): string
    {
        return static::withTrashed()
            ->where('codigo_pdv', $codigo)
            ->value('tipo') ?? 'DIN';
    }
}
