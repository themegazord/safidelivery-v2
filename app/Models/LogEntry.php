<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;

class LogEntry extends Model
{
    use MassPrunable, HasUuids;

    protected $table = 'logs';

    protected $primaryKey = 'uuid';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'message',
        'cnpj',
        'context',
        'datetime',
        'extra',
        'level',
        'level_name',
    ];

    protected $casts = [
        'context' => 'array',
        'extra' => 'array',
        'datetime' => 'datetime'
    ];

    public function prunable()
    {
        return static::where('created_at', '<=', now()->subDays(30));
    }
}
