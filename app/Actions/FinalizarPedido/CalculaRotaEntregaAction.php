<?php

namespace App\Actions\FinalizarPedido;

use App\Exceptions\EnderecoForaAreaEntregaException;
use App\Models\Configuracao;
use App\Models\Empresa;
use App\Services\Google\GoogleMapService;
use Illuminate\Support\Facades\Auth;

class CalculaRotaEntregaAction
{
  public Empresa $empresa;
  public array $configuracoes = [];
  public float $subtotalPedido = 0.0;
  public bool $foraAreaEntrega = false;

  public function handle(string $enderecoFormatadoEmpresa, string $interacao_id, array $configuracoes, float $subtotalPedido): array
  {
    $this->subtotalPedido = $subtotalPedido;
    $this->configuracoes = $configuracoes;
    $this->empresa = Empresa::query()->where('interacao_id', $interacao_id)->first();
    $dadosDistanciaRota = [];
    $service = app(GoogleMapService::class);
    $enderecoFormatadoCliente = Auth::user()->cliente->endereco->enderecoSemComplementoFormatado();

    $latlgnCliente = $service->handleGeocoding($enderecoFormatadoCliente);
    $latlgnEmpresa = $service->handleGeocoding($enderecoFormatadoEmpresa);

    $totais = $service->handleDistanceMatrix($enderecoFormatadoCliente, $enderecoFormatadoEmpresa, $latlgnCliente, $latlgnEmpresa);

    $distanciaKm = $totais['distancia_km'];

    $dadosDistanciaRota['latCliente'] = $latlgnCliente['latitude'];
    $dadosDistanciaRota['lngCliente'] = $latlgnCliente['longitude'];
    $dadosDistanciaRota['taxaFrete'] = $this->defineTaxaEntrega($distanciaKm);
    $dadosDistanciaRota['duracao'] = $service->segundosParaTempoLegivel($this->calculaDuracaoEntrega($totais['duracao'], $distanciaKm));
    $dadosDistanciaRota['valorMaximoDesconto'] = false;

    return [
      'dadosDistanciaRota' => $dadosDistanciaRota,
      'foraAreaEntrega' => $this->foraAreaEntrega
    ];
  }

  private function defineTaxaEntrega(float $distancia_km): float
  {
    $this->foraAreaEntrega = false;
    // Frete grátis condicional — verifica subtotal antes de calcular taxa
    $freteGratisAcima = floatval($this->configuracoes['frete_gratis_acima'] ?? 0);
    if ($freteGratisAcima > 0 && $this->subtotalPedido >= $freteGratisAcima) {
      $this->foraAreaEntrega = false;

      return 0.0;
    }

    // Taxa fixa — ignora raios
    $taxaFixa = floatval($this->configuracoes['taxa_fixa'] ?? 0);
    if ($taxaFixa > 0) {
      $this->foraAreaEntrega = false;

      return $taxaFixa;
    }

    $prioridade = $this->configuracoes['prioridade_zona_sobreposicao'] ?? 'poligono';
    $latCliente = $this->dadosDistanciaRota['latCliente'] ?? null;
    $lngCliente = $this->dadosDistanciaRota['lngCliente'] ?? null;

    // Verifica se o cliente está dentro de algum polígono
    $taxaPoligono = null;
    if ($latCliente !== null && $lngCliente !== null) {
      foreach ($this->empresa->taxas_entrega()->where('tipo', 'poligono')->get() as $zona) {
        if (! empty($zona->coordenadas) && $this->pontoNoPoligono((float) $latCliente, (float) $lngCliente, $zona->coordenadas)) {
          $taxaPoligono = $zona;
          break;
        }
      }
    }

    // Verifica se o cliente está dentro de algum raio.
    // Raio=0 é tratado como zona mais interna: cobre distâncias de 0 até o menor raio positivo cadastrado.
    $raioZeroZona = $this->empresa->taxas_entrega()->where('tipo', 'raio')->where('raio', 0)->first();

    if ($raioZeroZona) {
      $menorRaioPositivo = $this->empresa->taxas_entrega()
        ->where('tipo', 'raio')->where('raio', '>', 0)->orderBy('raio')->value('raio');

      if ($menorRaioPositivo === null || $distancia_km < $menorRaioPositivo) {
        $taxaRaio = $raioZeroZona;
      } else {
        $taxaRaio = $this->empresa->taxas_entrega()
          ->where('tipo', 'raio')->where('raio', '>', 0)
          ->where('raio', '>=', $distancia_km)->orderBy('raio')->first();
      }
    } else {
      $taxaRaio = $this->empresa->taxas_entrega()
        ->where('tipo', 'raio')->where('raio', '>=', $distancia_km)->orderBy('raio')->first();
    }

    // Aplica prioridade quando cliente está coberto por ambos
    $zonaEscolhida = $prioridade === 'raio'
      ? ($taxaRaio ?? $taxaPoligono)
      : ($taxaPoligono ?? $taxaRaio);

    if ($zonaEscolhida) {
      $this->foraAreaEntrega = false;

      return $zonaEscolhida->taxa;
    }

    // Nenhuma zona cobre o endereço
    $foraAreaConfig = Configuracao::whereEmpresaId($this->empresa->id)
      ->where('configuracao', 'fora_area_entrega')
      ->value('valor') ?? 'bloquear';

    if ($foraAreaConfig === 'bloquear') {
      $this->foraAreaEntrega = true;

      throw new EnderecoForaAreaEntregaException();
    }

    // Fora de todas as zonas mas permitido — cobra a maior taxa cadastrada (raio ou polígono)
    $this->foraAreaEntrega = false;

    $taxaMaiorRaio = $this->empresa->taxas_entrega()->where('tipo', 'raio')->orderBy('raio', 'desc')->first()?->taxa;
    $taxaMaiorPoligono = $this->empresa->taxas_entrega()->where('tipo', 'poligono')->orderBy('taxa', 'desc')->first()?->taxa;

    return $taxaMaiorRaio ?? $taxaMaiorPoligono ?? 0.0;
  }

  private function pontoNoPoligono(float $lat, float $lng, array $coordenadas): bool
  {
    $vertices = count($coordenadas);
    $inside = false;
    $j = $vertices - 1;

    for ($i = 0; $i < $vertices; $i++) {
      $latI = floatval($coordenadas[$i]['lat']);
      $lngI = floatval($coordenadas[$i]['lng']);
      $latJ = floatval($coordenadas[$j]['lat']);
      $lngJ = floatval($coordenadas[$j]['lng']);

      if ((($lngI > $lng) !== ($lngJ > $lng)) &&
        ($lat < ($latJ - $latI) * ($lng - $lngI) / ($lngJ - $lngI) + $latI)
      ) {
        $inside = ! $inside;
      }

      $j = $i;
    }

    return $inside;
  }

  private function calculaDuracaoEntrega(int $duracaoGoogle, float $distanciaKm): float
  {
    // Busca o modo de cálculo configurado
    $modoCalculoConfig = $this->empresa->configuracoes
      ->where('configuracao', 'modo_calculo_frete')
      ->first();

    if (! $modoCalculoConfig) {
      return $duracaoGoogle; // Fallback para tempo do Google
    }

    $modoCalculo = \App\Enums\ModoCalculoFrete::tryFrom($modoCalculoConfig->valor);

    if (! $modoCalculo) {
      return $duracaoGoogle; // Fallback se enum inválido
    }

    // Busca tempo configurado por raio (em minutos no banco)
    $taxaEntrega = $this->empresa->taxas_entrega()
      ->where('raio', '<=', $distanciaKm)
      ->orderBy('raio', 'desc')
      ->first();

    $tempoConfigMinutos = $taxaEntrega?->tempo ?? 0;
    $tempoConfig = $tempoConfigMinutos * 60; // Converte minutos para segundos

    // Busca tempo médio de preparo (formato HH:MM no banco)
    $tempoPreparoConfig = $this->empresa->configuracoes
      ->where('configuracao', 'media_tempo_preparo')
      ->first();

    $tempoPreparo = $this->converteTempoParaSegundos($tempoPreparoConfig?->valor ?? '00:00');

    // Calcula baseado no modo selecionado
    return $modoCalculo->calculoBaseadoNaOpcao(
      tempoGoogle: $duracaoGoogle,
      tempoConfig: $tempoConfig,
      tempoPreparo: $tempoPreparo
    );
  }

  private function converteTempoParaSegundos(string $tempo): int
  {
    $partes = explode(':', $tempo);
    $count = count($partes);

    // Aceita tanto HH:MM quanto HH:MM:SS
    if ($count < 2 || $count > 3) {
      return 0; // Retorna 0 se formato inválido
    }

    $horas = (int) $partes[0];
    $minutos = (int) $partes[1];
    $segundos = $count === 3 ? (int) $partes[2] : 0;

    return ($horas * 3600) + ($minutos * 60) + $segundos;
  }
}
