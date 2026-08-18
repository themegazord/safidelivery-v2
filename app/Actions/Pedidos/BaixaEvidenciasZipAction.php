<?php

namespace App\Actions\Pedidos;

use App\Models\Empresa;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class BaixaEvidenciasZipAction
{
    public function handle(Empresa $empresa, array $evidencias): string
    {
        $tmpDir = storage_path('app/tmp_evidencias_'.uniqid());
        @mkdir($tmpDir, 0775, true);

        $arquivos = [];
        foreach ($evidencias as $i => $ev) {
            $resposta = Http::withToken($empresa->getAttribute('tokenIfood'))
                ->accept('image/*')
                ->withOptions(['stream' => true])
                ->get($ev['url']);

            if ($resposta->failed()) {
                Log::warning('Falha ao baixar evidência', ['idx' => $i, 'status' => $resposta->status()]);

                continue;
            }

            $psr = $resposta->toPsrResponse();
            $nomeArquivo = sprintf('evidencia-%s-.jpeg', $i + 1);
            $destino = $tmpDir.'/'.$nomeArquivo;

            $body = $psr->getBody();
            $fh = fopen($destino, 'wb');
            while (! $body->eof()) {
                fwrite($fh, $body->read(8192));
            }
            fclose($fh);

            $arquivos[] = $destino;
        }

        abort_if(empty($arquivos), 502, 'Não foi possível montar o ZIP');

        $zipPath = storage_path('app/evidencias-'.uniqid().'.zip');
        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            abort(500, 'Falha ao criar ZIP');
        }
        foreach ($arquivos as $path) {
            $zip->addFile($path, basename($path));
        }
        $zip->close();

        foreach ($arquivos as $path) {
            @unlink($path);
        }
        @rmdir($tmpDir);

        return $zipPath;
    }
}
