<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\ComboMeta;

class Item extends Model
{
  /** @use HasFactory<\Database\Factories\ItemFactory> */
  use HasFactory, SoftDeletes;

  protected $table = 'itens';
  protected $fillable = [
    'external_id',
    'categoria_id',
    'tipo',
    'nome',
    'tipo_preco',
    'preco',
    'desconto',
    'valor_desconto',
    'porcentagem_desconto',
    'descricao',
    'qtde_pessoas',
    'peso',
    'gramagem',
    'eh_bebida',
    'classificacao',
    'imagem',
		'dias_funcionamento'
  ];

  protected $casts = [
    'classificacao' => 'array',
    'dias_funcionamento' => 'array',
  ];

  public function categoria(): \Illuminate\Database\Eloquent\Relations\BelongsTo
  {
    return $this->belongsTo(Categoria::class, 'categoria_id')->withTrashed();
  }

  public function precosItemPizza(): \Illuminate\Database\Eloquent\Relations\HasMany
  {
    return $this->hasMany(ItemPreco::class, 'item_id');
  }

  public function grupo_complemento(): HasMany
  {
    return $this->hasMany(GrupoComplemento::class, 'item_id');
  }

  public function itemIfood(): HasOne
  {
    return $this->hasOne(ImportacaoItemIfood::class);
  }

  public function meta(): HasOne
  {
    return $this->hasOne(ComboMeta::class, 'combo_id');
  }

  public function getClassificacoesAtivas(): array
  {
    if (!is_array($this->classificacao)) {
      return [];
    }

    $mapeamento = [
      'vegetariano' => ['icone' => '🥬', 'label' => 'Vegetariano', 'cor' => 'badge-success'],
      'vegano' => ['icone' => '🌱', 'label' => 'Vegano', 'cor' => 'badge-success'],
      'organico' => ['icone' => '🌿', 'label' => 'Orgânico', 'cor' => 'badge-info'],
      'sem_acucar' => ['icone' => '🍬', 'label' => 'Sem Açúcar', 'cor' => 'badge-warning'],
      'zero_lactose' => ['icone' => '🥛', 'label' => 'Zero Lactose', 'cor' => 'badge-info'],
      'bebida_gelada' => ['icone' => '🧊', 'label' => 'Gelada', 'cor' => 'badge-primary'],
      'bebida_alcoolica' => ['icone' => '🍷', 'label' => 'Alcoólica', 'cor' => 'badge-error'],
      'bebida_natural' => ['icone' => '🥤', 'label' => 'Natural', 'cor' => 'badge-success'],
      'bebida_zero_lactose' => ['icone' => '🥛', 'label' => 'Zero Lactose', 'cor' => 'badge-info'],
      'bebida_diet_zero' => ['icone' => '☑️', 'label' => 'Diet/Zero', 'cor' => 'badge-warning'],
    ];

    $ativas = [];
    foreach ($this->classificacao as $chave => $valor) {
      if (isset($mapeamento[$valor])) {
        $ativas[$chave] = $mapeamento[$valor];
      }
    }

    return $ativas;
  }
}
