<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class Cliente extends Model
{
	/** @use HasFactory<\Database\Factories\ClienteFactory> */
	use HasFactory, Notifiable;

	protected $fillable = [
		'user_id',
		'nome',
		'email',
		'cpf_cnpj',
		'telefone',
		'data_nascimento',
	];

	public function pedidos(): HasMany
	{
		return $this->hasMany(Pedido::class, 'cliente_id');
	}

	public function enderecos(): BelongsToMany
	{
		return $this->belongsToMany(Endereco::class, 'cliente_endereco', 'cliente_id', 'endereco_id');
	}

	public function getEnderecoAttribute(): ?Endereco
	{
		return $this->enderecos()->wherePivot('principal', true)->first()
			?? $this->enderecos()->first();
	}

	public function usuario(): BelongsTo
	{
		return $this->belongsTo(User::class, 'user_id');
	}

	public function cuponsUsadosPeloCliente(): BelongsToMany
	{
		return $this->belongsToMany(Promocao::class, 'promocao_usada', 'cliente_id', 'promocao_id');
	}

	public function cashbacks(): HasMany {
		return $this->hasMany(CashbackCredito::class);
	}

	public function fidelidadeProgressos(): HasMany {
		return $this->hasMany(FidelidadeProgresso::class);
	}
}
