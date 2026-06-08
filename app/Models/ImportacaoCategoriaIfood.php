<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportacaoCategoriaIfood extends Model
{
  protected $table = 'importacao_categoria_ifood';

	protected $fillable = [
		'categoria_id',
		'category_id'
	];

	public function categoria(): BelongsTo {
		return $this->belongsTo(Categoria::class);
	}
}
