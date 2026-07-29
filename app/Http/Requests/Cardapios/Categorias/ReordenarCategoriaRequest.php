<?php

namespace App\Http\Requests\Cardapios\Categorias;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReordenarCategoriaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ordem' => ['required', 'array', 'min:1'],
            'ordem.*.id' => ['required', 'integer', 'distinct', 'exists:categorias,id'],
            'ordem.*.ordem' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => "O campo ':attribute' é obrigatório.",
            'ordem.*.id.exists' => 'Uma ou mais categorias informadas não existem.',
            'ordem.*.id.distinct' => 'Existem categorias duplicadas na lista de ordenação.',
        ];
    }

    public function attributes(): array
    {
        return [
            'ordem' => 'ordenação',
            'ordem.*.id' => 'categoria',
            'ordem.*.ordem' => 'posição',
        ];
    }
}
