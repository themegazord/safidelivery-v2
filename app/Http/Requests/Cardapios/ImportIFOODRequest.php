<?php

namespace App\Http\Requests\Cardapios;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ImportIFOODRequest extends FormRequest
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
            'nome' => ['required', 'max:50'],
            'descricao' => ['required', 'max:255'],
            'dias_funcionamento' => ['required', 'array', 'min:1'],
            'tipo_funcionamento' => ['required'],
            'importar_item' => ['required', 'boolean'],
            'importar_complementos' => ['required', 'boolean'],
            'importar_imagem' => ['required', 'boolean'],
            'importar_preco' => ['required', 'boolean'],
        ];
    }

    public function messages(): array {
        return [
            'required' => "O campo ':attribute' é obrigatório.",
            'max' => ":attribute deve ter :max caracteres.",
            'array' => ":attribute deve ser uma lista.",
            'min' => ":attribute deve ter ao menos :min item.",
            'boolean' => ":attribute deve ser verdadeiro ou falso.",
        ];
    }

    public function attributes(): array {
        return [
            'descricao' => 'descrição',
            'dias_funcionamento' => 'dias de funcionamento',
            'tipo_funcionamento' => 'tipo de funcionamento',
            'importar_item' => 'importar itens',
            'importar_complementos' => 'importar complementos',
            'importar_imagem' => 'importar imagens',
            'importar_preco' => 'importar preços',
        ];
    }
}
