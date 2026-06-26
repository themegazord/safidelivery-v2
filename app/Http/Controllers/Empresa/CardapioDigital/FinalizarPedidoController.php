<?php

namespace App\Http\Controllers\Empresa\CardapioDigital;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinalizarPedidoController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Empresa/CardapioDigital/FinalizarPedido');
    }
}
