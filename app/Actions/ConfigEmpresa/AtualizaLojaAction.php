<?php

namespace App\Actions\ConfigEmpresa;

use App\Models\Empresa;
use App\Models\Endereco;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AtualizaLojaAction
{
    public function handle(
        Empresa $empresa,
        array $dadosEmpresa,
        array $dadosEndereco,
        ?UploadedFile $logo,
        ?UploadedFile $capa,
    ): Empresa {
        return DB::transaction(function () use ($empresa, $dadosEmpresa, $dadosEndereco, $logo, $capa) {
            if ($logo) {
                $this->removeArquivoAntigo($empresa->getAttribute('logo'));
                $dadosEmpresa['logo'] = $logo->store('empresas/logo', 'public');
            }

            if ($capa) {
                $this->removeArquivoAntigo($empresa->getAttribute('capa'));
                $dadosEmpresa['capa'] = $capa->store('empresas/capa', 'public');
            }

            if ($empresa->endereco) {
                $empresa->endereco->update($dadosEndereco);
            } else {
                $endereco = Endereco::create($dadosEndereco);
                $dadosEmpresa['endereco_id'] = $endereco->getAttribute('id');
            }

            $empresa->update($dadosEmpresa);

            return $empresa;
        });
    }

    private function removeArquivoAntigo(?string $caminho): void
    {
        if ($caminho && !str_starts_with($caminho, 'http://') && !str_starts_with($caminho, 'https://')) {
            Storage::disk('public')->delete($caminho);
        }
    }
}
