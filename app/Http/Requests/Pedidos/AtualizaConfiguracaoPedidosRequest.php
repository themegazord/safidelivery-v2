<?php

namespace App\Http\Requests\Pedidos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AtualizaConfiguracaoPedidosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'chave' => ['required', Rule::in(['aceite_automatico', 'aceite_automatico_ifood'])],
            'valor' => ['required', 'boolean'],
        ];
    }
}
