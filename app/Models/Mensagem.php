<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mensagem extends Model
{
    use HasUuids;

    protected $table = 'mensagens';

    protected $primaryKey = 'uuid';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['uuid', 'chat_id', 'usuario_id', 'mensagem', 'visualizado_em'];

    protected function casts(): array
    {
        return [
            'visualizado_em' => 'datetime',
        ];
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * @return array<string, mixed>
     */
    public function paraArray(): array
    {
        return [
            'uuid' => $this->getAttribute('uuid'),
            'chat_id' => $this->getAttribute('chat_id'),
            'usuario_id' => $this->getAttribute('usuario_id'),
            'usuario_nome' => $this->usuario?->name,
            'mensagem' => $this->getAttribute('mensagem'),
            'visualizado_em' => $this->getAttribute('visualizado_em'),
            'created_at' => $this->getAttribute('created_at'),
        ];
    }
}
