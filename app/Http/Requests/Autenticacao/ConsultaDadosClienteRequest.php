<?php

namespace App\Http\Requests\Autenticacao;

use App\Rules\RecaptchaValido;
use Illuminate\Foundation\Http\FormRequest;

class ConsultaDadosClienteRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'telefone' => ['required', 'string'],
            'g-recaptcha-response' => ['required', new RecaptchaValido('consulta_cliente')],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'Campo obrigatório',
        ];
    }

    public function attributes(): array
    {
        return [
            'telefone' => 'telefone',
        ];
    }
}
