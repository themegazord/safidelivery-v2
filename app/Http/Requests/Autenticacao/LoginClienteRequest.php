<?php

namespace App\Http\Requests\Autenticacao;

use App\Rules\RecaptchaValido;
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
            'interacao_id' => 'required',
            'tipo_funcionamento' => [Rule::in(['delivery', 'retirada', 'mesa']), 'required'],
            'modo_atendente' => ['required', 'boolean'],
            'informa_mesa_comanda' => ['required', 'boolean'],
            'g-recaptcha-response' => ['required', new RecaptchaValido('login_cliente')],
        ];
    }

    public function messages(): array {
        return [
            'required' => 'Campo obrigatório',
            'modo_atendente.boolean' => 'Modo atendente deve ser ligado ou desligado na configuração',
            'informa_mesa_comanda.boolean' => 'Modo atendente deve ser ligado ou desligado na configuração',
            'tipo_funcionamento.in' => 'O :attribute deve ser :values'
        ];
    }

    public function attributes(): array {
        return [
            'tipo_funcionamento' => 'tipo de funcionamento'
        ];
    }
}
