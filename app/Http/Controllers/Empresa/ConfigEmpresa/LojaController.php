<?php

namespace App\Http\Controllers\Empresa\ConfigEmpresa;

use App\Actions\ConfigEmpresa\AtualizaLojaAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\ConfigEmpresa\AtualizaLojaRequest;
use App\Models\Empresa;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LojaController extends Controller
{
    public Empresa $empresa;

    public function __construct()
    {
        $this->empresa = Empresa::with('endereco')->where('cnpj', request('cnpj'))->firstOrFail();
    }

    public function index()
    {
        return Inertia::render('Empresa/SuaLoja/Loja', [
            'loja' => [
                'razao_social' => $this->empresa->getAttribute('razao_social'),
                'nome_fantasia' => $this->empresa->getAttribute('nome_fantasia'),
                'cnpj' => $this->empresa->getAttribute('cnpj'),
                'email' => $this->empresa->getAttribute('email'),
                'logo' => $this->resolveUrlImagem($this->empresa->getAttribute('logo')),
                'capa' => $this->resolveUrlImagem($this->empresa->getAttribute('capa')),
                'cep' => $this->empresa->endereco?->getAttribute('cep') ?? '',
                'logradouro' => $this->empresa->endereco?->getAttribute('logradouro') ?? '',
                'numero' => $this->empresa->endereco?->getAttribute('numero') ?? '',
                'complemento' => $this->empresa->endereco?->getAttribute('complemento') ?? '',
                'bairro' => $this->empresa->endereco?->getAttribute('bairro') ?? '',
                'cidade' => $this->empresa->endereco?->getAttribute('cidade') ?? '',
                'uf' => $this->empresa->endereco?->getAttribute('uf') ?? '',
            ],
        ]);
    }

    public function update(AtualizaLojaRequest $request)
    {
        $dados = $request->safe()->only(['razao_social', 'nome_fantasia', 'cnpj', 'email']);
        $enderecoDados = $request->safe()->only(['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf']);

        $action = new AtualizaLojaAction();
        $empresa = $action->handle(
            $this->empresa,
            $dados,
            $enderecoDados,
            $request->file('logo'),
            $request->file('capa'),
        );

        return to_route('aplicacao.empresa.configempresa.loja', ['cnpj' => $empresa->getAttribute('cnpj')]);
    }

    private function resolveUrlImagem(?string $caminho): ?string
    {
        if (!$caminho) {
            return null;
        }

        return str_starts_with($caminho, 'http://') || str_starts_with($caminho, 'https://')
            ? $caminho
            : Storage::url($caminho);
    }
}
