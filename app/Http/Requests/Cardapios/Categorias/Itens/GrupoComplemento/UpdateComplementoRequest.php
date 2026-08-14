<?php

namespace App\Http\Requests\Cardapios\Categorias\Itens\GrupoComplemento;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateComplementoRequest extends FormRequest
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
            'nome' => ['required'],
            'imagem' => ['nullable'],
            'external_id' => ['nullable'],
            'descricao' => ['nullable'],
            'preco' => ['required'],
            'status' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O :attribute é obrigatório',
            'boolean' => 'O :attribute deve ser verdadeiro ou falso',
        ];
    }

    public function attributes(): array
    {
        return [
            'nome' => 'nome do complemento',
            'imagem' => 'imagem do complemento',
            'external_id' => 'código PDV do complemento',
            'descricao' => 'descrição do complemento',
            'preco' => 'preço do complemento',
            'status' => 'status do complemento',
        ];
    }
}
