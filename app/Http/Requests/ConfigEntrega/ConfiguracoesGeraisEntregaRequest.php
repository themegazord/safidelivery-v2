<?php

namespace App\Http\Requests\ConfigEntrega;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConfiguracoesGeraisEntregaRequest extends FormRequest
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
            'taxa_fixa' => ['nullable', 'numeric', 'min:0'],
            'valor_minimo_pedido' => ['nullable', 'numeric', 'min:0'],
            'frete_gratis_acima' => ['nullable', 'numeric', 'min:0'],
            'prioridade_zona_sobreposicao' => ['required', Rule::in(['poligono', 'raio'])],
        ];
    }
}
