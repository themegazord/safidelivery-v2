<?php

namespace App\Http\Requests\ConfigEntrega;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SalvaTaxasEntregaRequest extends FormRequest
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
            'taxas' => ['present', 'array'],
            'taxas.*.tipo' => ['required', Rule::in(['raio', 'poligono'])],
            'taxas.*.raio' => ['nullable', 'numeric', 'min:0'],
            'taxas.*.tempo' => ['required', 'numeric', 'min:0'],
            'taxas.*.taxa' => ['required', 'numeric', 'min:0'],
            'taxas.*.corCirculo' => ['required', 'string'],
            'taxas.*.corPreenchimento' => ['required', 'string'],
            'taxas.*.coordenadas' => ['nullable', 'array'],
            'taxas.*.coordenadas.*.lat' => ['required', 'numeric'],
            'taxas.*.coordenadas.*.lng' => ['required', 'numeric'],
        ];
    }
}
