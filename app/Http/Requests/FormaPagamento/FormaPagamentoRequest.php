<?php

namespace App\Http\Requests\FormaPagamento;

use App\Models\FormaPagamento;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FormaPagamentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'descricao' => ['required', 'string', 'max:100'],
            'tipo' => ['required', Rule::in(array_column(FormaPagamento::tiposOpcoes(), 'id'))],
            'codigo_pdv' => ['nullable', 'integer'],
            'interno' => ['required', 'boolean'],
        ];
    }
}
