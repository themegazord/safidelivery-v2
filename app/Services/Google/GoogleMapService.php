<?php

namespace App\Services\Google;

use App\Models\DistanciaCache;
use App\Models\GeocodingCache;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class GoogleMapService
{
  public function handleGeocoding(string $endereco_formatado): array
  {
    $enderecoFormatadoApi = str_replace(' ', '+', $endereco_formatado);
    $hashEndereco = md5($endereco_formatado);

    $geocodeCache = GeocodingCache::query()->where('hash_endereco', $hashEndereco)->first();

    if ($geocodeCache) {
      Log::info('Geocoding cache HIT - Retornando do cache', [
        'hash' => $hashEndereco,
        'endereco' => $endereco_formatado
      ]);

      return [
        'latitude' => $geocodeCache->latitude,
        'longitude' => $geocodeCache->longitude,
      ];
    }

    Log::info('Geocoding cache MISS - Chamando Google Geocoding API', [
      'hash' => $hashEndereco,
      'endereco' => $endereco_formatado
    ]);

    $response = Http::get(env('GOOGLE_GEOCODING_API'), [
      'address' => $enderecoFormatadoApi,
      'key' => env('GOOGLE_API_TOKEN')
    ]);

    if ($response->ok()) {
      $data = $response->json();

      if (!isset($data['results'][0])) {
        Log::warning('Google Geocoding sem resultados', [
          'status' => $data['status'] ?? 'unknown',
          'endereco' => $endereco_formatado
        ]);
        throw new Exception("Endereço não encontrado pela API do Google", Response::HTTP_NOT_FOUND);
      }

      $result = $data['results'][0];

      GeocodingCache::query()->create([
        'endereco_formatado' => $endereco_formatado,
        'endereco_formatado_google' => $result['formatted_address'],
        'hash_endereco' => $hashEndereco,
        'latitude' => $result['geometry']['location']['lat'],
        'longitude' => $result['geometry']['location']['lng'],
      ]);

      Log::info('Geocoding salvo no cache com sucesso', [
        'hash' => $hashEndereco,
        'endereco_google' => $result['formatted_address']
      ]);

      return [
        'latitude' => $result['geometry']['location']['lat'],
        'longitude' => $result['geometry']['location']['lng'],
      ];
    } else {
      Log::error('Google Geocoding API falhou', [
        'status' => $response->status(),
        'body' => $response->body(),
        'endereco' => $endereco_formatado
      ]);
      throw new Exception("Problema ao consultar latitude e longitude do endereço, por favor, recarregue a página ou entre em contato com o suporte!", Response::HTTP_BAD_REQUEST);
    }
  }

  public function handleDistanceMatrix(string $endereco_formatado_cliente, string $endereco_formatado_empresa, array $latlgnCliente, array $latlgnEmpresa): array
  {
    $hashEnderecoCliente = md5($endereco_formatado_cliente);
    $hashEnderecoEmpresa = md5($endereco_formatado_empresa);

    $distanciaCache = DistanciaCache::query()->where('hash_endereco_origem', $hashEnderecoEmpresa)->where('hash_endereco_entrega', $hashEnderecoCliente)->first();

    if ($distanciaCache) {
      Log::info('Distance Matrix cache HIT - Retornando do cache', [
        'hash_origem' => $hashEnderecoEmpresa,
        'hash_destino' => $hashEnderecoCliente,
        'distancia_km' => $distanciaCache->distancia_km,
        'duracao' => $distanciaCache->duracao_formatada
      ]);

      return [
        'distancia_km' => $distanciaCache->distancia_km,
        'duracao_formatada' => $distanciaCache->duracao_formatada,
        'duracao' => $distanciaCache->duracao
      ];
    }

    Log::info('Distance Matrix cache MISS - Chamando Google Distance Matrix API', [
      'hash_origem' => $hashEnderecoEmpresa,
      'hash_destino' => $hashEnderecoCliente,
      'endereco_empresa' => $endereco_formatado_empresa,
      'endereco_cliente' => $endereco_formatado_cliente
    ]);

    $response = Http::withHeaders([
      'Content-Type' => 'application/json',
      'X-Goog-Api-Key' => env('GOOGLE_API_TOKEN'),
      'X-Goog-FieldMask' => 'originIndex,destinationIndex,duration,distanceMeters,status,condition',
    ])->post(env('GOOGLE_DISTANCE_MATRIX_API'), [
      'origins' => [
        [
          'waypoint' => [
            'location' => [
              'latLng' => [
                'latitude' => $latlgnEmpresa['latitude'],
                'longitude' => $latlgnEmpresa['longitude'],
              ]
            ]
          ]
        ]
      ],
      'destinations' => [
        [
          'waypoint' => [
            'location' => [
              'latLng' => [
                'latitude' => $latlgnCliente['latitude'],
                'longitude' => $latlgnCliente['longitude'],
              ]
            ]
          ]
        ]
      ],
      "travelMode" => "DRIVE",
      "routingPreference" => "TRAFFIC_AWARE",
      "languageCode" => "pt_BR",
      "regionCode" => "BR"
    ]);

    if ($response->ok()) {
      $data = $response->json();

      if (!isset($data[0]['distanceMeters'])) {
        Log::warning('Google Distance Matrix sem resultados válidos', [
          'response_data' => $data
        ]);
        throw new Exception("Não foi possível calcular a distância entre os endereços", Response::HTTP_NOT_FOUND);
      }

      $distanciaKm = $data[0]['distanceMeters'] / 1000;
      $duracaoSegundos = $this->retornaApenasNumero($data[0]['duration']);
      $duracaoFormatada = $this->segundosParaTempoLegivel($duracaoSegundos);

      DistanciaCache::query()->create([
        'hash_endereco_origem' => $hashEnderecoEmpresa,
        'hash_endereco_entrega' => $hashEnderecoCliente,
        'distancia_km' => $distanciaKm,
        'duracao' => $duracaoSegundos,
        'duracao_formatada' => $duracaoFormatada
      ]);

      Log::info('Distance Matrix salvo no cache com sucesso', [
        'hash_origem' => $hashEnderecoEmpresa,
        'hash_destino' => $hashEnderecoCliente,
        'distancia_km' => $distanciaKm,
        'duracao' => $duracaoFormatada
      ]);

      return [
        'distancia_km' => $distanciaKm,
        'duracao_formatada' => $duracaoFormatada,
        'duracao' => $duracaoSegundos
      ];
    } else {
      Log::error('Google Distance Matrix API falhou', [
        'status' => $response->status(),
        'body' => $response->body(),
        'hash_origem' => $hashEnderecoEmpresa,
        'hash_destino' => $hashEnderecoCliente
      ]);
      throw new Exception("Erro ao calcular distância", Response::HTTP_BAD_REQUEST);
    }
  }

  private function retornaApenasNumero(string $valor): int
  {
    return (int) preg_replace('/\D/', '', $valor);
  }

  public function segundosParaTempoLegivel(int $segundos): string
  {
    $horas = floor($segundos / 3600);
    $minutos = floor(($segundos % 3600) / 60);

    if ($horas > 0) {
      return "{$horas}h {$minutos}min";
    }

    return "{$minutos} min";
  }
}
