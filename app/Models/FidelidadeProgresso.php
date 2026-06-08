<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FidelidadeProgresso extends Model
{
    protected $fillable = [
        'cliente_id',
        'empresa_id',
        'contador_atual',
        'valor_acumulado',
        'recompensa_disponivel',
        'recompensa_tipo',
        'recompensa_valor',
        'recompensa_expira_em',
        'recompensa_usada_em',
    ];

    protected $casts = [
        'recompensa_disponivel' => 'boolean',
        'recompensa_expira_em' => 'date',
        'recompensa_usada_em' => 'datetime',
        'valor_acumulado' => 'float',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function percentualProgresso(float $valorGatilho, string $tipoGatilho): float
    {
        $atual = $tipoGatilho === 'qtd_pedidos' ? $this->contador_atual : $this->valor_acumulado;

        return min(100, round(($atual / $valorGatilho) * 100, 1));
    }
}
