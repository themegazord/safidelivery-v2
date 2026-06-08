<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
  use HasFactory;
  protected $fillable = ['pedido_id'];
  public function mensagens()
  {
    return $this->hasMany(Mensagem::class);
  }
  public function pedido()
  {
    return $this->belongsTo(Pedido::class);
  }
}
