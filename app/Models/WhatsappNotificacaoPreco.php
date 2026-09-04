<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;

class WhatsappNotificacaoPreco extends Model
{
    protected $table = 'whatsapp_notificacao_precos';

    protected $fillable = ['preco_usd', 'vigente_a_partir_de', 'observacao'];

    protected $casts = [
        'vigente_a_partir_de' => 'date',
        'preco_usd' => 'decimal:4',
    ];

    public static function vigenteEm(CarbonInterface $data): ?self
    {
        return static::query()
            ->where('vigente_a_partir_de', '<=', $data->toDateString())
            ->orderByDesc('vigente_a_partir_de')
            ->orderByDesc('id')
            ->first();
    }
}
