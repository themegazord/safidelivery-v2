<?php

namespace App\Http\Controllers\Empresa\CardapioDigital;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CardapioController extends Controller
{
    public function index(string $interacao_id, string $tipo_funcionamento) {
        return Inertia::render('Empresa/CardapioDigital/Cardapio', [
            'interacao_id' => $interacao_id,
            'tipo_funcionamento' => $tipo_funcionamento
        ]);
    }
}
