<?php

namespace App\Console\Commands;

use App\Models\ImagemTemporaria;
use App\Traits\TrataMGCObjectStore;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class LimparImagensTemporariasCommand extends Command
{
  use TrataMGCObjectStore;

  protected $signature = 'itens:limpar-imagens-temporarias {--horas=24}';

  protected $description = 'Remove do bucket MGC as imagens de itens enviadas e nunca vinculadas a um item (rede de segurança para quando o cliente fecha a página/aba antes de salvar).';

  public function handle(): int
  {
    $horas = (int) $this->option('horas');
    $bucket = config('services.mgc.bucket');

    $imagensOrfas = ImagemTemporaria::query()
      ->whereNull('item_id')
      ->where('created_at', '<=', now()->subHours($horas))
      ->get();

    $removidas = 0;
    foreach ($imagensOrfas as $imagem) {
      try {
        $this->removeImagem($bucket, $imagem->url);
        $imagem->delete();
        $removidas++;
      } catch (Throwable $e) {
        Log::error('Falha ao remover imagem temporária órfã do bucket', [
          'imagem_id' => $imagem->id,
          'url' => $imagem->url,
          'erro' => $e->getMessage(),
        ]);

        $this->error("Falha ao remover {$imagem->url}: {$e->getMessage()}");
      }
    }

    $this->info("{$removidas} imagem(ns) órfã(s) removida(s).");

    return self::SUCCESS;
  }
}
