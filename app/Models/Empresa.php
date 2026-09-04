<?php

namespace App\Models;

use App\Models\Pedido;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;

class Empresa extends Model
{
	use HasFactory, Notifiable;

  protected $fillable = [
    'interacao_id',
    "endereco_id",
    "razao_social",
    "nome_fantasia",
    "cnpj",
    "chave_pix",
    "email",
    'telefone_comercial',
    'telefone_contato',
    'telefone_whatsapp',
    'logo',
    'capa',
    'tokenIfood',
    'lifetimeTokenIfood',
    'esta_recebendo_pedidos_ifood'
  ];

  // Nunca vazar essas credenciais se a empresa for serializada inteira (props do Inertia,
  // contexto de Log::error com $empresa->toArray(), etc).
  protected $hidden = [
    'chave_pix',
    'tokenIfood',
    'lifetimeTokenIfood',
  ];

  public function fusosHorarios(): array
  {
    return [
      ['id' => 1, 'name' => 'America/Araguaina'],
      ['id' => 2, 'name' => 'America/Bahia'],
      ['id' => 3, 'name' => 'America/Belem'],
      ['id' => 4, 'name' => 'America/Boa_Vista'],
      ['id' => 5, 'name' => 'America/Campo_Grande'],
      ['id' => 6, 'name' => 'America/Cuiaba'],
      ['id' => 7, 'name' => 'America/Eirunepe'],
      ['id' => 8, 'name' => 'America/Fortaleza'],
      ['id' => 9, 'name' => 'America/Maceio'],
      ['id' => 10, 'name' => 'America/Manaus'],
      ['id' => 11, 'name' => 'America/Noronha'],
      ['id' => 12, 'name' => 'America/Porto_Velho'],
      ['id' => 13, 'name' => 'America/Recife'],
      ['id' => 14, 'name' => 'America/Rio_Branco'],
      ['id' => 15, 'name' => 'America/Santarem'],
      ['id' => 16, 'name' => 'America/Sao_Paulo'],
    ];
  }

  public function fusoHorarioPorId(int $id): ?string
  {
    return match ($id) {
      1  => 'America/Araguaina',
      2  => 'America/Bahia',
      3  => 'America/Belem',
      4  => 'America/Boa_Vista',
      5  => 'America/Campo_Grande',
      6  => 'America/Cuiaba',
      7  => 'America/Eirunepe',
      8  => 'America/Fortaleza',
      9  => 'America/Maceio',
      10 => 'America/Manaus',
      11 => 'America/Noronha',
      12 => 'America/Porto_Velho',
      13 => 'America/Recife',
      14 => 'America/Rio_Branco',
      15 => 'America/Santarem',
      16 => 'America/Sao_Paulo',
      default => null, // retorna null se não encontrar
    };
  }

  public function resolveTimezone(): string
  {
    return Cache::remember("empresa:{$this->id}:timezone", 3600, function () {
      $valor = $this->configuracoes()
        ->where('configuracao', 'fuso_horario')
        ->value('valor');

      $id = is_numeric($valor) ? (int) $valor : null;
      $tz = $id ? $this->fusoHorarioPorId($id) : null;

      if (! $tz || ! in_array($tz, timezone_identifiers_list(), true)) {
        return config('app.timezone');
      }

      return $tz;
    });
  }

  public function endereco(): \Illuminate\Database\Eloquent\Relations\BelongsTo
  {
    return $this->belongsTo(Endereco::class, 'endereco_id');
  }

  public function cardapios(): \Illuminate\Database\Eloquent\Relations\HasMany
  {
    return $this->hasMany(Cardapio::class, 'empresa_id');
  }

  public function pedidos(): \Illuminate\Database\Eloquent\Relations\HasMany
  {
    return $this->hasMany(Pedido::class, 'empresa_id');
  }

  public function taxas_entrega(): \Illuminate\Database\Eloquent\Relations\HasMany
  {
    return $this->hasMany(TaxaEntrega::class, 'empresa_id');
  }

  public function integracoes(): HasMany
  {
    return $this->hasMany(Integracao::class, 'empresa_id');
  }

  public function configuracoes(): HasMany
  {
    return $this->hasMany(Configuracao::class, 'empresa_id');
  }

  public function promocoes(): HasMany
  {
    return $this->hasMany(Promocao::class, 'empresa_id');
  }

  public function mesa(): HasMany
  {
    return $this->hasMany(Mesa::class);
  }

  public function horarios_indisponibilidade(): HasMany
  {
    return $this->hasMany(HorarioFuncionamento::class);
  }

  public function horarios_indisponibilidades(): HasMany {
    return $this->hasMany(HorarioIndisponibilidade::class);
  }

  public function notificacoes(): HasMany {
    return $this->hasMany(Notificacao::class);
  }

  public function issues(): HasMany {
    return $this->hasMany(BugReport::class);
  }

	public function cashbackConfig(): HasOne {
		return $this->hasOne(CashbackConfig::class);
	}

	public function cashbacks(): HasMany {
		return $this->hasMany(CashbackCredito::class);
	}

	public function fidelidadeConfig(): HasOne {
		return $this->hasOne(FidelidadeConfig::class);
	}

	public function whatsappNotificacoesPedido(): HasMany {
		return $this->hasMany(WhatsappNotificacaoPedido::class);
	}
}
