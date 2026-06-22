<?php

namespace App\Http\Requests\Autenticacao;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LoginClienteRequest extends FormRequest
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
            'nome' => 'required',
            'telefone' => 'required',
            'tipo_funcionamento' => [Rule::in(['delivery', 'mesa']), 'required'],
            'modo_atendente' => ['required', 'boolean']
        ];
    }

    public function messages(): array {
        return [
            'required' => 'Campo obrigatório',
            'modo_atendente' => 'Modo atendente deve ser ligado ou desligado na configuração',
            'tipo_funcionamento.in' => 'O :attribute deve ser :values'
        ];
    }

    public function attributes(): array {
        return [
            'tipo_funcionamento' => 'tipo de funcionamento'
        ];
    }
}
