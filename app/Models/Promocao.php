<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Promocao extends Model
{
  use SoftDeletes;
  protected $table = 'promocao';

  protected $fillable = [
    'empresa_id',
    'nome_cupom',
    'descricao_cupom',
    'valido_cliente_novo',
    'onde_afetara',
    'tipo_cupom',
    'valor_desconto',
    'valor_minimo_pedido',
    'valor_maximo_desconto',
    'qtde_clientes_usabilidade',
    'qtde_clientes',
    'qtde_usos',
    'uso_unico',
    'data_vencimento',
    'dias_disponiveis',
    'cupom_visivel',
  ];

  public function empresa(): BelongsTo {
    return $this->belongsTo(Empresa::class, 'empresa_id');
  }

  public function clientesQueUsaramCupom(): BelongsToMany {
    return $this->belongsToMany(Cliente::class, 'promocao_usada', 'promocao_id', 'cliente_id');
  }

  public function pedidosQueForamUsadosCupom(): BelongsToMany {
    return $this->belongsToMany(Pedido::class, 'promocao_usada', 'promocao_id', 'pedido_id');
  }
}
