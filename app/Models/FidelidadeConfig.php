<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FidelidadeConfig extends Model
{
    protected $fillable = [
        'empresa_id',
        'ativo',
        'tipo_gatilho',
        'valor_gatilho',
        'tipo_recompensa',
        'valor_recompensa',
        'base_calculo_desconto',
        'valor_max_premio',
        'categorias_bloqueadas',
        'validade_dias',
        'tipos_funcionamento',
    ];

    protected $casts = [
        'ativo' => 'boolean',
        'categorias_bloqueadas' => 'array',
        'tipos_funcionamento' => 'array',
        'valor_gatilho' => 'float',
        'valor_recompensa' => 'float',
        'valor_max_premio' => 'float',
    ];

    public function getTiposFuncionamentoEfetivosAttribute(): array
    {
        return $this->tipos_funcionamento ?? ['delivery', 'retirada', 'mesa'];
    }

    public function scopeAtivo($query)
    {
        return $query->where('ativo', true);
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }
}
