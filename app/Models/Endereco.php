<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Endereco extends Model
{
  use HasFactory;
  protected $fillable = [
    'logradouro',
    'bairro',
    'cidade',
    'uf',
    'cep',
    'numero',
    'complemento'
  ];

  public function empresa(): \Illuminate\Database\Eloquent\Relations\HasOne
  {
    return $this->hasOne(Empresa::class, 'endereco_id');
  }

  public function cliente(): \Illuminate\Database\Eloquent\Relations\HasOne
  {
    return $this->hasOne(Cliente::class, 'endereco_id');
  }

  public function enderecoSemComplementoFormatado(): string
  {
    return sprintf(
      "%s, %s, %s, %s - %s, %s",
      $this->logradouro,
      $this->numero,
      $this->bairro,
      $this->cidade,
      $this->uf,
      $this->cepFormatado()
    );
  }

  public function enderecoComComplementoFormatado(): string
  {
    return sprintf(
      "%s, %s - %s, %s, %s - %s, %s",
      $this->logradouro,
      $this->numero,
      $this->complemento,
      $this->bairro,
      $this->cidade,
      $this->uf,
      $this->cepFormatado()
    );
  }

  private function cepFormatado(): string
  {
    return preg_replace('/(\d{5})(\d{3})/', '$1-$2', $this->cep);
  }
}
