<?php

namespace App\Http\Requests\Endereco;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Override;

class CadastroEnderecoRequest extends FormRequest
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
            'cep' => ['required', 'size:8'],
            'logradouro' => ['required'],
            'numero' => ['required'],
            'bairro' => ['required'],
            'cidade' => ['required'],
            'uf' => ['required'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O :attribute é obrigatório',
            'cep.size' => 'O :attribute deve conter :size números'
        ];
    }

    public function attributes(): array {
        return [
            'cep' => 'CEP',
            'numero' => 'número',
            'uf' => 'UF'
        ];
    }
}
