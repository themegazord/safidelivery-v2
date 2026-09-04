<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappNotificacaoPedido extends Model
{
    protected $table = 'whatsapp_notificacoes_pedido';

    protected $fillable = [
        'empresa_id',
        'pedido_id',
        'cliente_id',
        'telefone_destino',
        'status_pedido',
        'mensagem',
        'twilio_message_sid',
        'status_twilio',
        'sucesso',
        'erro',
        'erro_codigo',
        'preco_usd',
        'enviado_em',
    ];

    protected $casts = [
        'sucesso' => 'boolean',
        'preco_usd' => 'decimal:4',
        'enviado_em' => 'datetime',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }

    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }
}
