<?php

namespace App\Http\Requests\ConfigEmpresa;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AtualizaIntegracaoRequest extends FormRequest
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
            'cnpj' => ['required', 'string'],
            'integracao' => ['required', 'array'],
            'integracao.tipo' => ['required', 'string', Rule::in(['safi', 'pagarme', 'ifood', 'anotaai'])],
            'integracao.companyToken' => ['nullable', 'string'],
            'integracao.chavesecreta_pagarme' => ['nullable', 'string'],
            'integracao.clientId' => ['nullable', 'string'],
            'integracao.clientSecret' => ['nullable', 'string'],
            'integracao.merchantId' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O :attribute é obrigatório',
            'integracao.tipo.in' => 'O :attribute informado é inválido',
        ];
    }

    public function attributes(): array
    {
        return [
            'cnpj' => 'CNPJ',
            'integracao' => 'integração',
            'integracao.tipo' => 'tipo de integração',
            'integracao.companyToken' => 'Company Token',
            'integracao.chavesecreta_pagarme' => 'chave secreta do Pagar.me',
            'integracao.clientId' => 'Client ID',
            'integracao.clientSecret' => 'Client Secret',
            'integracao.merchantId' => 'Merchant ID',
        ];
    }
}
