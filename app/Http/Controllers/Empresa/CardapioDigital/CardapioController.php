<?php

namespace App\Http\Controllers\Empresa\CardapioDigital;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CardapioController extends Controller
{
    public Empresa $empresa;
    public function index(string $interacao_id, string $tipo_funcionamento) {
        $this->empresa = Empresa::query()->where('interacao_id', $interacao_id)->first();

        return Inertia::render('Empresa/CardapioDigital/Cardapio', [
            'interacao_id' => $interacao_id,
            'tipo_funcionamento' => $tipo_funcionamento,
            'capa' => $this->empresa->getAttribute('capa'),
            'logo' => $this->empresa->getAttribute('logo'),
            'nome_fantasia' => $this->empresa->getAttribute('nome_fantasia')
        ]);
    }
}
