<?php

namespace App\Http\Controllers\Empresa\FormaPagamento;

use App\Actions\FormaPagamento\AtualizaFormaPagamentoAction;
use App\Actions\FormaPagamento\CriaFormaPagamentoAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\FormaPagamento\FormaPagamentoRequest;
use App\Models\Empresa;
use App\Models\FormaPagamento;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class FormaPagamentoController extends Controller
{
    public Empresa $empresa;

    public function __construct()
    {
        $this->empresa = Empresa::where('cnpj', request('cnpj'))->firstOrFail();
    }

    public function index()
    {
        $formasPagamento = FormaPagamento::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->orderBy('tipo')
            ->orderBy('descricao')
            ->get()
            ->map(fn (FormaPagamento $forma) => $this->formataFormaPagamento($forma));

        return Inertia::render('Empresa/FormaPagamento/FormaPagamento', [
            'formasPagamento' => $formasPagamento,
            'tiposOpcoes' => FormaPagamento::tiposOpcoes(),
        ]);
    }

    private function formataFormaPagamento(FormaPagamento $forma): array
    {
        return [
            'id' => $forma->getAttribute('id'),
            'descricao' => $forma->getAttribute('descricao'),
            'tipo' => $forma->getAttribute('tipo'),
            'codigo_pdv' => $forma->getAttribute('codigo_pdv'),
            'interno' => (bool) $forma->getAttribute('interno'),
        ];
    }

    public function store(FormaPagamentoRequest $request, CriaFormaPagamentoAction $action): JsonResponse
    {
        $formaPagamento = $action->handle($this->empresa, $request->validated());

        return response()->json([
            'mensagem' => 'Forma de pagamento cadastrada com sucesso',
            'formaPagamento' => $this->formataFormaPagamento($formaPagamento),
        ]);
    }

    public function update(FormaPagamentoRequest $request, AtualizaFormaPagamentoAction $action, string $forma_pagamento_id): JsonResponse
    {
        $formaPagamento = FormaPagamento::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->findOrFail($forma_pagamento_id);

        $action->handle($formaPagamento, $request->validated());

        return response()->json([
            'mensagem' => 'Forma de pagamento atualizada com sucesso',
            'formaPagamento' => $this->formataFormaPagamento($formaPagamento->refresh()),
        ]);
    }

    public function destroy(string $cnpj, string $forma_pagamento_id): JsonResponse
    {
        $formaPagamento = FormaPagamento::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->findOrFail($forma_pagamento_id);

        $formaPagamento->delete();

        return response()->json(['mensagem' => 'Forma de pagamento removida com sucesso']);
    }
}
