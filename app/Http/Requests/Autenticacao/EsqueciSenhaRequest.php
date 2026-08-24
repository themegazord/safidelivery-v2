<?php

namespace App\Http\Requests\Autenticacao;

use App\Rules\RecaptchaValido;
use Illuminate\Foundation\Http\FormRequest;

class EsqueciSenhaRequest extends FormRequest
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
            'email' => ['required', 'email'],
            'g-recaptcha-response' => ['required', new RecaptchaValido('esqueci_senha')],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'Campo obrigatório',
            'email.email' => 'O :attribute é inválido',
        ];
    }

    public function attributes(): array
    {
        return [
            'email' => 'e-mail',
        ];
    }
}
