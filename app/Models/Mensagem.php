<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mensagem extends Model
{
  use HasFactory;

  protected $fillable = ['uuid', 'chat_id', 'usuario_id', 'mensagem', 'visualizado_em'];

  protected $table = 'mensagens';

  protected $primaryKey = 'uuid';

  public $incrementing = false;

  protected $keyType = 'string';

  public function chat()
  {
    return $this->belongsTo(Chat::class);
  }

  public function usuario()
  {
    return $this->belongsTo(User::class);
  }
}
